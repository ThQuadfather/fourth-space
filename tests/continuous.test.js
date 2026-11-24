const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../src/continuous.js');
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
function meshVolume(s){return Math.abs(G.triangulate(s.faces).reduce((v,[i,j,k])=>{const a=s.vertices[i],b=s.vertices[j],c=s.vertices[k];return v+(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;},0));}
test('4D ball slices have exact sphere radii and analytic volumes',()=>{
  for(const w of [-2.69,-1,0,1,2.69]){const s=G.slice('ball',w);near(s.metrics.radius,Math.sqrt(2.7**2-w*w));near(s.metrics.volume,4*Math.PI*s.metrics.radius**3/3);assert.equal(s.dimension,3);for(const p of s.vertices)near(p.reduce((n,x)=>n+x*x,0)+w*w,2.7**2);}
});
test('tangencies preserve the true dimensions; out-of-support slices are empty',()=>{
  for(const scene of G.scenes){for(const w of scene.support){const s=G.slice(scene.id,w);assert.equal(s.status,'tangent');assert.equal(s.dimension,scene.id==='tesseract'?2:0);assert.equal(s.metrics.components,1);near(s.metrics.volume,0);assert.ok(s.vertices.length);}
    for(const w of scene.range){const s=G.slice(scene.id,w);assert.equal(s.status,'absent');assert.equal(s.metrics.components,0);assert.equal(s.metrics.bounds,null);assert.deepEqual(s.vertices,[]);}}
});
test('rotated tesseract slices satisfy all fixed four-dimensional inequalities',()=>{
  for(const w of [-2.2,-1,0,.5,2.2]){const s=G.slice('tesseract',w);assert.equal(s.vertices.length,8);assert.equal(s.faces.length,6);for(const p of s.vertices){assert.ok(G.contains('tesseract',p,w));assert.ok(G.probe('tesseract',p,w).onBoundary);}near(meshVolume(s),s.metrics.volume);}
  const a=G.slice('tesseract',-1),b=G.slice('tesseract',1);near(a.metrics.xBounds[0],-b.metrics.xBounds[1]);
});
test('one fixed 4D torus has two lobes, touching merger, then one lobe',()=>{
  assert.equal(G.slice('torus',0).metrics.components,2);
  assert.equal(G.slice('torus',1).metrics.components,2);
  const touch=G.slice('torus',1.15);assert.equal(touch.metrics.components,1);assert.equal(touch.metrics.touching,true);near(touch.metrics.neckRadius,0);
  assert.equal(G.slice('torus',1.4).metrics.components,1);
  assert.equal(G.contains('torus',[0,0,0],1),false);assert.equal(G.contains('torus',[0,0,0],1.15),true);assert.equal(G.contains('torus',[0,0,0],2),true);
  for(const w of [0,.8,1.15,1.4,2,2.8]){const s=G.slice('torus',w);for(const p of s.vertices)near((Math.hypot(p[0],w)-2)**2+p[1]**2+p[2]**2,.85**2);assert.ok(Math.abs(meshVolume(s)/s.metrics.volume-1)<.015);}
});
test('torus volume agrees with independent disk integration and two balls at W=0',()=>{
  near(G.slice('torus',0).metrics.volume,2*4*Math.PI*.85**3/3);
  for(const w of [.5,1.15,1.5,2.5]){const s=G.slice('torus',w),n=20000,lo=s.metrics.bounds.min[0],hi=s.metrics.bounds.max[0],dx=(hi-lo)/n;let volume=0;for(let i=0;i<n;i++){const x=lo+(i+.5)*dx;volume+=Math.PI*Math.max(0,.85**2-(Math.hypot(x,w)-2)**2)*dx;}near(volume,s.metrics.volume,1e-6);}
});
test('fixed XYZ probes genuinely change membership with W and are never mutated',()=>{
  const p=[1,0,0],before=p.slice();assert.equal(G.probe('ball',p,0).inside,true);assert.equal(G.probe('ball',p,2.6).inside,false);assert.deepEqual(p,before);
  assert.deepEqual(G.toWorld([1,2,3]),[1,3,2]);
});
test('all surface triangles are finite, valid and nondegenerate away from merger',()=>{
  for(const id of ['ball','tesseract','torus'])for(const w of [0,.5,1.4,2]){const s=G.slice(id,w);for(const [i,j,k] of G.triangulate(s.faces)){assert.ok(i!==j&&i!==k&&j!==k);const [a,b,c]=[i,j,k].map(n=>s.vertices[n]);assert.ok(a.concat(b,c).every(Number.isFinite));const u=b.map((x,n)=>x-a[n]),v=c.map((x,n)=>x-a[n]);const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];assert.ok(Math.hypot(...cross)>1e-12);}}
});
test('the engine is deterministic, reversible and rejects invalid input',()=>{
  const first=G.slice('torus',1.4);G.slice('torus',-.6);assert.deepEqual(G.slice('torus',1.4),first);
  assert.throws(()=>G.slice('unknown',0),RangeError);assert.throws(()=>G.slice('ball',NaN),TypeError);assert.throws(()=>G.contains('ball',[0,0],0),TypeError);
});
