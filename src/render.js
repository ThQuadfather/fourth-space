/* A tiny dependency-free WebGL renderer. No remote scripts, assets or shaders. */
class SpaceRenderer {
 constructor(canvas){
  this.canvas=canvas;const gl=this.gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'high-performance'});if(!gl){this.ctx=canvas.getContext('2d',{alpha:false});if(!this.ctx)throw Error('Canvas unavailable');this.count=0;return;}
  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const vs=compile(gl.VERTEX_SHADER,`attribute vec3 aPos;attribute vec3 aColor;uniform vec3 uEye;uniform float uYaw;uniform float uPitch;uniform float uAspect;varying mediump vec3 vColor;varying mediump float vDist;void main(){vec3 d=aPos-uEye;float x=cos(uYaw)*d.x-sin(uYaw)*d.z;float f=sin(uYaw)*d.x+cos(uYaw)*d.z;float y=cos(uPitch)*d.y-sin(uPitch)*f;float z=-(sin(uPitch)*d.y+cos(uPitch)*f);float near=.08;float far=110.;gl_Position=vec4(x*1.35/uAspect,y*1.35,(far+near)/(near-far)*z+2.*far*near/(near-far),-z);vColor=aColor;vDist=length(d);}`);
  const fs=compile(gl.FRAGMENT_SHADER,`precision mediump float;varying mediump vec3 vColor;varying mediump float vDist;uniform vec3 uFog;uniform float uDim;void main(){float fog=1.-exp(-vDist*vDist*.00045);vec3 col=mix(vColor,uFog,clamp(fog,0.,.98));gl_FragColor=vec4(col*uDim,1.);}`);
  this.program=gl.createProgram();gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);
  this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);for(const [name,offset] of [['aPos',0],['aColor',12]]){const a=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,24,offset);}
  this.u={};for(const n of ['Eye','Yaw','Pitch','Aspect','Fog','Dim'])this.u[n]=gl.getUniformLocation(this.program,'u'+n);gl.enable(gl.DEPTH_TEST);this.count=0;
 }
 box(x,y,z,sx,sy,sz,col){
  const v=[[x-sx/2,y-sy/2,z-sz/2],[x+sx/2,y-sy/2,z-sz/2],[x+sx/2,y+sy/2,z-sz/2],[x-sx/2,y+sy/2,z-sz/2],[x-sx/2,y-sy/2,z+sz/2],[x+sx/2,y-sy/2,z+sz/2],[x+sx/2,y+sy/2,z+sz/2],[x-sx/2,y+sy/2,z+sz/2]];
  const faces=[[0,1,2,3,.65],[4,7,6,5,.85],[0,4,5,1,.48],[3,2,6,7,1],[0,3,7,4,.73],[1,5,6,2,.9]];
  for(const [a,b,c,d,l] of faces){this.faces.push({v:[v[a],v[b],v[c],v[d]],c:col.map(n=>n*l)});for(const i of [a,b,c,a,c,d])this.data.push(...v[i],...col.map(n=>n*l));}
 }
 build(g,w,visited,trail,hint){
  const F=FourthSpace;this.data=[];this.faces=[];const palette=[[.24,.55,.52],[.47,.35,.68],[.67,.45,.25]];this.accent=palette[w%palette.length];
  for(const p of g.cells.values()){
   if(p[3]!==w)continue;const [x,y,z]=SpaceNav.world(p);const seen=visited.has(F.key(p));const accent=this.accent;
   const slab=(yy,color,open)=>{if(!open)this.box(x,yy,z,8,.2,8,color);else{for(const s of [-1,1]){this.box(x+s*2.65,yy,z,2.7,.2,8,color);this.box(x,yy,z+s*2.65,2.6,.2,2.7,color);}}};
   slab(y-3.18,[.13,.19,.22],!!F.next(g,p,2,-1));slab(y+3.9,[.10,.15,.19],!!F.next(g,p,2,1));
   for(let i=-3;i<=3;i+=2){this.box(x+i,y-3.04,z,.025,.02,8,[.24,.31,.32]);this.box(x,y-3.04,z+i,8,.02,.025,[.24,.31,.32]);}
   // All six ordinary room faces match graph adjacency. Doors are real gaps.
   for(const axis of [0,1])for(const sign of [-1,1]){
    const open=!!F.next(g,p,axis,sign), wx=x+(axis===0?sign*4:0),wz=z+(axis===1?sign*4:0);
    const wall=(along,height,centerY,offset,color,thickness=.22)=>this.box(wx+(axis===1?offset:0),y+centerY,wz+(axis===0?offset:0),axis===0?thickness:along,height,axis===0?along:thickness,color);
    if(open){for(const side of [-1,1])wall(2.65,6.8,.4,side*2.675,[.19,.25,.29]);wall(2.7,2.3,2.65,0,[.18,.24,.28]);for(const side of [-1,1])wall(.07,4.5,-.75,side*1.37,accent.map(n=>n*1.6),.28);wall(2.8,.07,1.52,0,accent.map(n=>n*1.6),.28);}
    else{wall(8,6.8,.4,0,[.16,.22,.27]);wall(5,3.3,.15,0,[.20,.28,.32],.27);wall(5.1,.025,-1.55,0,accent,.29);wall(.025,3.5,.15,0,accent,.29);}
   }
   for(const a of [-3.8,3.8])for(const b of [-3.8,3.8])this.box(x+a,y+.3,z+b,.25,6.7,.25,[.25,.35,.36]);
   // Ambient ceiling luminaires and a small floor compass.
   this.box(x,y+3.77,z,1.9,.05,.38,[.74,.9,.83]);this.box(x,y-3.015,z,.06,.035,1.8,[.28,.48,.46]);this.box(x,y-3.015,z,1.8,.035,.06,[.28,.48,.46]);
   if(trail&&seen){this.box(x,y-2.99,z,.42,.045,.42,[.38,.72,.62]);}
   const wm=F.next(g,p,3,-1),wp=F.next(g,p,3,1);
   if(wm||wp){ // W is not a doorway in a wall. A central pad signals an orthogonal exit.
    this.box(x,y-2.96,z,1.35,.08,1.35,accent.map(n=>n*1.6));this.box(x,y-2.90,z,1.1,.055,1.1,[.06,.14,.18]);
    for(const s of [-1,1])this.box(x+s*.58,y-2.83,z,.04,.18,1.2,accent.map(n=>n*1.8));
   }
   for(const sign of [-1,1])if(F.next(g,p,2,sign)){
    const yy=y+(sign>0?3.74:-2.88);for(const o of [-1,1]){this.box(x+o*1.02,yy+.05,z,.05,.08,2.1,[.63,.66,.95]);this.box(x,yy+.05,z+o*1.02,2.1,.08,.05,[.63,.66,.95]);}
   }
   if(g.goal&&F.same(p,g.goal)){this.box(x,y-2.4,z,.85,1.2,.85,[.7,.48,.20]);this.box(x,y-.9,z,.55,.55,.55,[1,.76,.35]);this.box(x,y-2.98,z,2,.04,2,[.69,.49,.18]);}
   if(hint&&F.same(p,hint))this.box(x,y-1.6,z,.2,1.8,.2,[.75,1,.85]);
  }
  if(!this.gl)return;const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.data),gl.STATIC_DRAW);this.count=this.data.length/6;
 }
 buildSlice(slice,sceneId){
  this.data=[];this.faces=[];
  // The grid and axes are a stationary XYZ reference, not part of the 4D body.
  this.box(0,-3.15,0,18,.035,18,[.045,.085,.11]);
  for(let i=-8;i<=8;i++){
   this.box(i,-3.12,0,.012,.012,18,[.10,.18,.20]);
   this.box(0,-3.12,i,18,.012,.012,[.10,.18,.20]);
  }
  this.box(0,-3.09,0,8,.018,.025,[.48,.28,.23]);
  this.box(0,-3.09,0,.025,.018,8,[.24,.47,.43]);
  this.box(-4,-.8,-4,.025,4.6,.025,[.43,.36,.65]);
  const base={ball:[.40,.83,.72],tesseract:[.62,.57,.90],torus:[.93,.65,.32]}[sceneId];
  const vertices=slice.vertices.map(p=>[p[0],p[2],p[1]]);
  for(const face of slice.faces){
   const v=face.map(i=>vertices[i]);if(v.length<3)continue;
   const a=v[1].map((n,i)=>n-v[0][i]),b=v[2].map((n,i)=>n-v[0][i]);
   const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=Math.hypot(...n);
   if(len<1e-12)continue;
   // Coordinate permutation reverses winding; the minus restores the outward normal.
   const light=.57+.40*Math.max(0,-(n[0]*-.45+n[1]*.8+n[2]*-.4)/len);
   const color=base.map(c=>c*light);this.faces.push({v,c:color});
   for(let i=1;i<v.length-1;i++)for(const p of [v[0],v[i],v[i+1]])this.data.push(...p,...color);
  }
  if(this.gl){const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.data),gl.DYNAMIC_DRAW);this.count=this.data.length/6;}
 }
 draw(eye,yaw,pitch,dim=1){if(!this.gl){this.software(eye,yaw,pitch,dim);return;}const gl=this.gl;const ratio=Math.min(devicePixelRatio||1,1.7);const w=Math.round(innerWidth*ratio),h=Math.round(innerHeight*ratio);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(.025,.055,.078,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform3fv(this.u.Eye,eye);gl.uniform1f(this.u.Yaw,yaw);gl.uniform1f(this.u.Pitch,pitch);gl.uniform1f(this.u.Aspect,w/h);gl.uniform3f(this.u.Fog,.025,.055,.078);gl.uniform1f(this.u.Dim,dim);gl.drawArrays(gl.TRIANGLES,0,this.count);}
 software(eye,yaw,pitch,dim){
  const ctx=this.ctx,ratio=Math.min(devicePixelRatio||1,1.2),width=Math.round(innerWidth*ratio),height=Math.round(innerHeight*ratio);
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}ctx.fillStyle='#061419';ctx.fillRect(0,0,width,height);
  const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch),focal=height*.675,list=[];
  for(const face of this.faces){let points=face.v.map(v=>{const dx=v[0]-eye[0],dy=v[1]-eye[1],dz=v[2]-eye[2],f=sy*dx+cy*dz;return [cy*dx-sy*dz,cp*dy-sp*f,sp*dy+cp*f];});
   if(points.every(p=>p[2]<.08)||points.every(p=>p[2]>70))continue;
   const clipped=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(a[2]>=.08)clipped.push(a);if((a[2]>=.08)!==(b[2]>=.08)){const t=(.08-a[2])/(b[2]-a[2]);clipped.push(a.map((n,k)=>n+t*(b[k]-n)));}}points=clipped;if(points.length<3)continue;
   const depth=points.reduce((s,p)=>s+p[2],0)/points.length,screen=points.map(p=>[width/2+p[0]/p[2]*focal,height/2-p[1]/p[2]*focal]);if(screen.every(p=>p[0]<0)||screen.every(p=>p[0]>width)||screen.every(p=>p[1]<0)||screen.every(p=>p[1]>height))continue;
   list.push({screen,depth,c:face.c});
  }
  list.sort((a,b)=>b.depth-a.depth);
  for(const item of list){const fog=1-Math.exp(-item.depth*item.depth*.00045),c=item.c.map((n,i)=>Math.round(Math.min(1,(n*(1-fog)+[.025,.055,.078][i]*fog)*dim)*255));ctx.fillStyle=`rgb(${c.join(',')})`;ctx.beginPath();item.screen.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();}
 }
}
