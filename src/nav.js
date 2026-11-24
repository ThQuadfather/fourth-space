(function(root,factory){const a=factory();if(typeof module==='object'&&module.exports)module.exports=a;else root.SpaceNav=a;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const TAU=Math.PI*2;
 function heading(yaw){const h=((Math.round(yaw/(Math.PI/2))%4)+4)%4;return [[1,1],[0,1],[1,-1],[0,-1]][h];}
 function relative(yaw,dir){const [a,s]=heading(yaw);if(dir==='back')return [a,-s];if(dir==='left')return [1-a,a===0?s:-s];if(dir==='right')return [1-a,a===0?-s:s];return [a,s];}
 const world=p=>[p[0]*8,p[2]*8,p[1]*8];
 const ease=t=>t*t*(3-2*t);
 function blockedFeedback(axis,sign,oppositeAvailable){
  const name=['X','Y','Z','W'][axis],requested=name+(sign>0?'+':'−'),other=name+(sign>0?'−':'+');
  if(axis===3){if(oppositeAvailable)return `${requested} is closed here. ${other} is open: press ${sign>0?'Q':'E'} or click ${other}.`;return `No ${requested} passage here. This room has no W exits.`;}
  if(axis===2){if(oppositeAvailable)return `${requested} is closed here. ${other} is open: press ${sign>0?'F':'R'}.`;return 'No vertical passage here. Look for a violet hatch.';}
  return 'A wall blocks that direction. Turn, retrace, or try another axis.';
 }
 return {TAU,heading,relative,world,ease,blockedFeedback};
});
