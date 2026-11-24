const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../src/engine.js');
function verify(g) {
  for(const [k,p] of g.cells) {
    assert.equal(p.length,4);assert.equal(k,F.key(p));
    p.forEach((v,i)=>assert.ok(Number.isInteger(v)&&v>=0&&v<g.dims[i]));
    for(const nk of g.edges.get(k)) {
      assert.ok(g.cells.has(nk)); assert.ok(g.edges.get(nk).has(k));
      const d=F.delta(p,g.cells.get(nk)); assert.ok(d);
      assert.deepEqual(F.next(g,p,d.axis,d.sign),g.cells.get(nk));
      g.cells.get(nk).forEach((v,i)=>{if(i!==d.axis)assert.equal(v,p[i]);});
    }
    for(let a=0;a<4;a++) for(const s of [-1,1]) {
      const q=[...p];q[a]+=s;
      assert.equal(!!F.next(g,p,a,s),g.edges.get(k).has(F.key(q)));
    }
  }
  const seen=new Set([F.key(g.start)]), queue=[F.key(g.start)];
  for(let i=0;i<queue.length;i++)for(const n of g.edges.get(queue[i]))if(!seen.has(n)){seen.add(n);queue.push(n);}
  assert.equal(seen.size,g.cells.size,'Every room is reachable');
}
test('all four experiences are bounded connected 4D graphs',()=>{for(let i=0;i<4;i++)verify(F.level(i));});
test('first lesson requires leaving W=0 and returning; six-step solution',()=>{const g=F.level(0),path=F.shortest(g,g.start,g.goal);assert.equal(path.length-1,6);assert.equal(g.start[3],g.goal[3]);assert.equal(F.shortest(g,g.start,g.goal,3),null);assert.ok(path.some(p=>p[3]===1));});
test('second lesson requires all four independent axes',()=>{const g=F.level(1),path=F.shortest(g,g.start,g.goal);assert.equal(path.length-1,11);for(let axis=0;axis<4;axis++)assert.equal(F.shortest(g,g.start,g.goal,axis),null);});
test('open space has eight legal directions at an interior point',()=>{const g=F.level(3);assert.equal(g.edges.get(F.key(g.start)).size,8);assert.equal(g.cells.size,81);for(let a=0;a<4;a++){const plus=F.next(g,g.start,a,1);assert.deepEqual(F.next(g,plus,a,-1),g.start);}});
test('W is independent: out-and-back preserves XYZ and all coordinate translations commute in open space',()=>{const g=F.level(3),p=[1,1,1,1];assert.deepEqual(F.next(g,p,3,1),[1,1,1,2]);for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){assert.deepEqual(F.next(g,F.next(g,p,a,1),b,1),F.next(g,F.next(g,p,b,1),a,1));}});
test('goals require exact match in all coordinates',()=>{assert.equal(F.same([1,2,0,0],[1,2,0,1]),false);assert.equal(F.same([1,2,0,0],[1,2,1,0]),false);});
test('blocked and out-of-range moves never wrap or mutate the current point',()=>{const g=F.level(0),p=[...g.start];assert.equal(F.next(g,p,0,-1),null);assert.deepEqual(p,g.start);assert.equal(F.next(g,p,4,1),null);assert.equal(F.next(g,p,0,2),null);assert.equal(F.next(g,p,3,-1),null);});
test('reject diagonal, long and out-of-bounds connections',()=>{const g=F.makeGraph([3,3,3,3]);assert.throws(()=>F.connect(g,[0,0,0,0],[1,1,0,0]));assert.throws(()=>F.connect(g,[0,0,0,0],[2,0,0,0]));assert.throws(()=>F.addCell(g,[3,0,0,0]));});
test('seeded generation deterministic; 100 seeds yield solvable perfect mazes requiring W and all axes',()=>{for(let seed=0;seed<100;seed++){const g=F.generated(seed);verify(g);assert.equal(g.cells.size,144);assert.equal([...g.edges.values()].reduce((n,e)=>n+e.size,0)/2,143);const path=F.shortest(g,g.start,g.goal);assert.ok(path.length>1);const axes=new Set(path.slice(1).map((q,i)=>F.delta(path[i],q).axis));assert.equal(axes.size,4);assert.equal(g.goal[3],0);assert.equal(F.shortest(g,g.start,g.goal,3),null);}const a=F.generated(42),b=F.generated(42);assert.deepEqual([...a.edges].map(([k,v])=>[k,[...v]]),[...b.edges].map(([k,v])=>[k,[...v]]));});
test('4D rotation preserves length and does not change source points',()=>{const p=[1,2,3,4],q=F.rotate4(p,0,3,.7);assert.deepEqual(p,[1,2,3,4]);assert.ok(Math.abs(q.reduce((n,v)=>n+v*v,0)-30)<1e-10);assert.equal(q[1],2);assert.equal(q[2],3);assert.deepEqual(F.rotate4(p,0,3,0),p);});
test('trail keys are undirected and never mark an untraveled side of a loop',()=>{const a=[1,1,1,1],b=[2,1,1,1],c=[2,2,1,1],d=[1,2,1,1];const trail=new Set([F.edgeKey(a,b),F.edgeKey(b,c),F.edgeKey(c,d)]);assert.ok(trail.has(F.edgeKey(b,a)));assert.equal(trail.has(F.edgeKey(d,a)),false);});
