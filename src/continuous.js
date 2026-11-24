/* Fixed 4D solids intersected with W = w. No animation, time or interpolation.
 * UMD API: SpaceContinuous.scenes, slice(id,w), contains(id,[x,y,z],w),
 * probe(id,[x,y,z],w), triangulate(faces), toWorld([x,y,z]).
 * Vertices are mathematical [X,Y,Z]; renderer coordinates are [X,Z,Y].
 * faces have outward mathematical winding (swap winding after toWorld).
 * Curved meshes are tessellations of the exact boundary, not exact curved faces.
 * metrics.volume is analytic 3D volume, not tessellation volume.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.SpaceContinuous=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const EPS=1e-10, R=2.7, H=1.65, ANGLE=Math.PI/6;
  const C=Math.cos(ANGLE), S=Math.sin(ANGLE), MAJOR=2, TUBE=.85;
  const scenes=Object.freeze([
    Object.freeze({id:'ball',name:'4D ball',range:Object.freeze([-3.1,3.1]),support:Object.freeze([-R,R]),equation:'x² + y² + z² + w² ≤ 2.7²',description:'One fixed four-dimensional ball. Its XYZ slices grow from a point to a sphere, then shrink.'}),
    Object.freeze({id:'tesseract',name:'Rotated tesseract',range:Object.freeze([-2.6,2.6]),support:Object.freeze([-H*(C+S),H*(C+S)]),equation:'|cx + sw| ≤ 1.65; |−sx + cw| ≤ 1.65; |y|, |z| ≤ 1.65',description:'A fixed 4D cube rotated 30° in XW. Here c = cos 30° and s = sin 30°. Its exact XYZ slices are boxes whose X bounds change.'}),
    Object.freeze({id:'torus',name:'Connected 4D ring',range:Object.freeze([-3.2,3.2]),support:Object.freeze([-MAJOR-TUBE,MAJOR+TUBE]),equation:'(√(x² + w²) − 2)² + y² + z² ≤ 0.85²',description:'One connected solid tube around a circle in XW. A slice can have two separate volumes that meet and join as W changes.'})
  ]);
  function scene(id){const d=scenes.find(s=>s.id===id);if(!d)throw new RangeError('Unknown continuous scene: '+id);return d;}
  function validate(w){if(!Number.isFinite(w))throw new TypeError('W must be finite');}
  function signedValue(id,p,w){
    scene(id);validate(w);
    if(!Array.isArray(p)||p.length!==3||p.some(v=>!Number.isFinite(v)))throw new TypeError('Probe must be three finite XYZ coordinates');
    const [x,y,z]=p;
    if(id==='ball')return x*x+y*y+z*z+w*w-R*R;
    if(id==='tesseract')return Math.max(Math.abs(C*x+S*w),Math.abs(-S*x+C*w),Math.abs(y),Math.abs(z))-H;
    return (Math.hypot(x,w)-MAJOR)**2+y*y+z*z-TUBE*TUBE;
  }
  function contains(id,p,w){return signedValue(id,p,w)<=EPS;}
  function probe(id,p,w){const value=signedValue(id,p,w);return {xyz:p.slice(),w,inside:value<=EPS,onBoundary:Math.abs(value)<=EPS,value,equation:scene(id).equation};}
  function triangulate(faces){const triangles=[];for(const f of faces)for(let i=1;i<f.length-1;i++)triangles.push([f[0],f[i],f[i+1]]);return triangles;}
  function toWorld(p){return [p[0],p[2],p[1]];}
  // Surface of revolution about X. Endpoint poles are single vertices, no degenerate quads.
  function revolution(mesh,lo,hi,radius,steps=48,sides=40){
    let previous=null;
    for(let j=0;j<=steps;j++){
      // Cosine samples resolve tips well and place x=0 at the center of symmetric intervals.
      const x=j===0?lo:j===steps?hi:lo+(hi-lo)*(1-Math.cos(Math.PI*j/steps))/2;
      const r=radius(x),ring=[];
      if(r<1e-7){
        let index=mesh.vertices.findIndex(p=>Math.abs(p[0]-x)<EPS&&p[1]===0&&p[2]===0);
        if(index<0){index=mesh.vertices.length;mesh.vertices.push([x,0,0]);}ring.push(index);
      }else for(let k=0;k<sides;k++){ring.push(mesh.vertices.length);const a=2*Math.PI*k/sides;mesh.vertices.push([x,r*Math.cos(a),r*Math.sin(a)]);}
      if(previous){
        for(let k=0;k<sides;k++){
          const n=(k+1)%sides;
          if(previous.length===1&&ring.length>1)mesh.faces.push([previous[0],ring[n],ring[k]]);
          else if(ring.length===1&&previous.length>1)mesh.faces.push([previous[k],previous[n],ring[0]]);
          else if(previous.length>1&&ring.length>1)mesh.faces.push([previous[k],previous[n],ring[n],ring[k]]);
        }
      }
      previous=ring;
    }
  }
  function box(mesh,lo,hi){
    mesh.vertices=[[lo,-H,-H],[hi,-H,-H],[hi,H,-H],[lo,H,-H],[lo,-H,H],[hi,-H,H],[hi,H,H],[lo,H,H]];
    mesh.faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]];
  }
  function torusIntegral(x,w){
    const a=Math.abs(w);
    const radial=a<EPS?x*Math.abs(x):x*Math.hypot(x,w)+w*w*Math.asinh(x/a);
    return (TUBE*TUBE-MAJOR*MAJOR-w*w)*x-x*x*x/3+MAJOR*radial;
  }
  function slice(id,w){
    const definition=scene(id);validate(w);
    const out={sceneId:id,w,status:'absent',dimension:-1,vertices:[],faces:[],equation:definition.equation,summary:'No intersection at this W.',metrics:{components:0,volume:0,bounds:null,volumeMethod:'analytic',surfaceApproximation:id!=='tesseract'}};
    if(id==='ball'){
      const r2=R*R-w*w;if(r2 < -EPS)return out;
      const radius=Math.sqrt(r2<=EPS?0:r2);out.metrics.radius=radius;
      out.metrics.bounds={min:[-radius,-radius,-radius],max:[radius,radius,radius]};
      out.metrics.components=1;out.dimension=radius<EPS?0:3;out.status=out.dimension===0?'tangent':'volume';
      out.metrics.volume=4*Math.PI*radius**3/3;
      if(out.dimension===0)out.vertices=[[0,0,0]];
      else revolution(out,-radius,radius,x=>Math.sqrt(Math.max(0,r2-x*x)));
      out.summary=out.status==='tangent'?'The slice touches the 4D ball at one point.':'One spherical volume. XYZ radius = √(2.7² − w²).';
    }else if(id==='tesseract'){
      const lo=Math.max((-H-S*w)/C,(C*w-H)/S),hi=Math.min((H-S*w)/C,(C*w+H)/S);
      if(hi<lo-EPS)return out;
      const width=hi-lo<=EPS?0:hi-lo;
      out.metrics.bounds={min:[lo,-H,-H],max:[width===0?lo:hi,H,H]};out.metrics.components=1;out.metrics.xBounds=[lo,Math.max(lo,hi)];out.metrics.width=width;
      out.metrics.volume=width*4*H*H;out.dimension=width<EPS?2:3;out.status=out.dimension===2?'tangent':'volume';
      if(out.dimension===2){out.vertices=[[lo,-H,-H],[lo,H,-H],[lo,H,H],[lo,-H,H]];out.faces=[[0,1,2,3]];}
      else box(out,lo,hi);
      out.summary=out.dimension===2?'At the extreme W, only a square remains (zero 3D volume).':'An exact box: fixed Y/Z bounds; X bounds come from both rotated cube inequalities.';
    }else{
      const outer=(MAJOR+TUBE)**2-w*w;if(outer < -EPS)return out;
      const high=Math.sqrt(outer<=EPS?0:outer),inner=(MAJOR-TUBE)**2-w*w;
      const low=Math.sqrt(inner<=EPS?0:inner);
      const maxRadius=high===0?0:Math.abs(w)<=MAJOR?TUBE:Math.sqrt(Math.max(0,TUBE*TUBE-(Math.abs(w)-MAJOR)**2));
      out.metrics.bounds={min:[-high,-maxRadius,-maxRadius],max:[high,maxRadius,maxRadius]};
      out.metrics.components=inner>EPS?2:1;out.metrics.touching=Math.abs(inner)<=EPS;out.metrics.neckRadius=Math.sqrt(Math.max(0,TUBE*TUBE-(Math.abs(w)-MAJOR)**2));
      out.metrics.xIntervals=inner>EPS?[[-high,-low],[low,high]]:[[-high,high]];
      out.dimension=high<EPS?0:3;out.status=out.dimension===0?'tangent':'volume';
      out.metrics.volume=Math.max(0,2*Math.PI*(torusIntegral(high,w)-torusIntegral(low,w)));
      if(out.dimension===0)out.vertices=[[0,0,0]];
      else{
        const radius=x=>Math.sqrt(Math.max(0,TUBE*TUBE-(Math.hypot(x,w)-MAJOR)**2));
        // At the merger, two surfaces share their single origin vertex.
        const intervals=inner>=-EPS?[[-high,-low],[low,high]]:[[-high,high]];
        for(const [a,b] of intervals)revolution(out,a,b,radius);
      }
      out.summary=out.status==='tangent'?'The slice touches the ring at one point.':out.metrics.touching?'The two lobes meet at one point: one connected slice, zero-width neck.':out.metrics.components===2?'Two separate XYZ volumes belong to one connected 4D solid.':'The lobes are joined in this XYZ slice.';
    }
    return out;
  }
  return Object.freeze({scenes,slice,contains,probe,triangulate,toWorld});
});
