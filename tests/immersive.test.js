const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const F=require('../src/engine'),N=require('../src/nav');
test('view-relative movement stays on one spatial axis',()=>{for(let i=-32;i<=32;i++){const yaw=i*Math.PI/8;for(const d of ['forward','back','left','right']){const [axis,sign]=N.relative(yaw,d);assert.ok(axis===0||axis===1);assert.ok(sign===1||sign===-1);}const a=N.relative(yaw,'forward'),b=N.relative(yaw,'back');assert.equal(a[0],b[0]);assert.equal(a[1],-b[1]);}});
test('XYZ world mapping never encodes W as height',()=>{assert.deepEqual(N.world([1,2,3,0]),[8,24,16]);assert.deepEqual(N.world([1,2,3,0]),N.world([1,2,3,2]));});
test('camera interpolation is bounded and monotonic',()=>{let last=-1;for(let i=0;i<=100;i++){const v=N.ease(i/100);assert.ok(v>=last&&v>=0&&v<=1);last=v;}assert.equal(N.ease(0),0);assert.equal(N.ease(1),1);});
function renderer(){let draws=0;const context={fillRect(){},beginPath(){},closePath(){},fill(){draws++;},moveTo(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));},lineTo(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));}};const sandbox={FourthSpace:F,SpaceNav:N,devicePixelRatio:1,innerWidth:390,innerHeight:844};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require.resolve('../src/render.js'),'utf8')+'\nthis.Renderer=SpaceRenderer;',sandbox);const r=new sandbox.Renderer({width:0,height:0,getContext(t){return t==='webgl'?null:context;}});return {r,draws:()=>draws};}
test('software 3D fallback builds every slice with finite geometry',()=>{const {r,draws}=renderer();for(let id=0;id<4;id++){const g=F.level(id);for(let w=0;w<g.dims[3];w++){r.build(g,w,new Set(),true,null);assert.ok(r.faces.length>0);assert.ok(r.data.every(Number.isFinite));r.draw(N.world(g.start),Math.PI/2,0);}}assert.ok(draws()>0);});
test('near-plane clipping remains finite across rooms and camera angles',()=>{const {r}=renderer(),g=F.level(0);r.build(g,0,new Set(),true,null);for(const x of [-4,-.08,0,.08,3.99,4,4.01,8])for(const yaw of [0,.8,Math.PI/2,Math.PI,Math.PI*1.5])r.draw([x,0,8],yaw,.4);});
test('standalone sources have no network dependencies',()=>{const files=['engine.js','nav.js','render.js','app.js','index.html','styles.css','continuous.js','lab.js'];for(const f of files){const s=fs.readFileSync(require.resolve('../src/'+f),'utf8');assert.doesNotMatch(s,/\bfetch\s*\(|XMLHttpRequest|https?:\/\/|<script[^>]+src=/);}});

test('W round-trip preserves pad availability and explains blocked sign',()=>{
 const g=F.level(0),p=[1,1,0,0],q=F.next(g,p,3,1),back=F.next(g,q,3,-1);
 assert.deepEqual(back,p);assert.equal(F.next(g,back,3,-1),null);assert.deepEqual(F.next(g,back,3,1),q);
 assert.equal(N.blockedFeedback(3,-1,true),'W− is closed here. W+ is open: press E or click W+.');
 assert.equal(N.blockedFeedback(3,1,true),'W+ is closed here. W− is open: press Q or click W−.');
 const {r}=renderer();r.build(g,0,new Set([F.key(p),F.key(q)]),true,null);const before=r.data.slice();r.build(g,1,new Set(),true,null);r.build(g,0,new Set([F.key(p),F.key(q)]),true,null);assert.deepEqual(r.data,before);
});
test('missing W exits are distinguished from an available opposite exit',()=>{assert.match(N.blockedFeedback(3,1,false),/no W exits/);assert.match(N.blockedFeedback(2,1,true),/Z− is open: press F/);});

const C=require('../src/continuous');
test('continuous slice renderer stays finite for all specimens and boundary cases',()=>{const {r,draws}=renderer();for(const scene of C.scenes)for(const w of [scene.range[0],scene.support[0],-1.15,0,1.15,scene.support[1],scene.range[1]]){r.buildSlice(C.slice(scene.id,w),scene.id);assert.ok(r.data.every(Number.isFinite));for(const yaw of [0,.4,2])r.draw([0,3,-12],yaw,-.24,1);}assert.ok(draws()>0);});
