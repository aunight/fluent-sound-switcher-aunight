module.exports=function(js){
 const oldRy='function ry(e,n){return te("set_flyout_size",{height:Math.ceil(e*(window.devicePixelRatio||1)),readyMode:n})}';
 const prevRy='function ry(e,n){const w=document.querySelector(".fss-flyout-glass")?.dataset.density==="compact"?360:440,s=window.innerWidth>=200?w/window.innerWidth:window.devicePixelRatio||1;return te("set_flyout_size",{height:Math.ceil(e*s),readyMode:n})}';
 const newRy='function ry(e,n){const el=document.querySelector(".fss-flyout-glass"),w=(el?.dataset.mode==="menu"||el?.dataset.density==="compact")?360:440,s=window.innerWidth>=200?w/window.innerWidth:window.devicePixelRatio||1;return te("set_flyout_size",{height:Math.ceil(e*s),readyMode:n})}';
 if(js.includes(prevRy))js=js.replace(prevRy,newRy);
 else if(js.includes(oldRy))js=js.replace(oldRy,newRy);
 const peaks='fssUseAppPeaks(v,S);';
 const oldWarm='fssUseAppPeaks(v,S);x.useEffect(()=>{R()},[]);/* fss-preload-mixer */';
 const warm='fssUseAppPeaks(v,S);x.useEffect(()=>{R();if(v)return;const id=window.setInterval(R,2500);return()=>window.clearInterval(id)},[R,v]);/* fss-preload-mixer */';
 if(js.includes(oldWarm)){
  js=js.replace(oldWarm,warm);
 }else if(!js.includes('/* fss-preload-mixer */')){
  if(js.split(peaks).length!==2)throw Error('Mixer preload signature mismatch');
  js=js.replace(peaks,warm);
 }
 const resize='const X=()=>void ry(V.offsetHeight+2,!E.current||A.current?E.current:void 0);X();const j=new ResizeObserver(X);';
 const oldDedup1='let lastHeight=-1,lastMode;const X=()=>{const height=V.offsetHeight+2,mode=!E.current||A.current?E.current:void 0;if(height===lastHeight&&mode===lastMode)return;lastHeight=height;lastMode=mode;void ry(height,mode)};X();const j=new ResizeObserver(X);';
 const oldDedup2='let lastHeight=-1,lastMode;const X=()=>{if(!E.current&&window.innerWidth<300)return;const height=V.offsetHeight+2,mode=!E.current||A.current?E.current:void 0;if(height===lastHeight&&mode===lastMode)return;lastHeight=height;lastMode=mode;void ry(height,mode)};X();const j=new ResizeObserver(X);';
 const oldDedup3='let lastHeight=-1,lastMode,verifyTimer=0;const X=()=>{const height=V.offsetHeight+2,mode=!E.current||A.current?E.current:void 0;if(height===lastHeight&&mode===lastMode&&Math.abs(window.innerHeight-height)<=2)return;lastHeight=height;lastMode=mode;void ry(height,mode);window.clearTimeout(verifyTimer);verifyTimer=window.setTimeout(()=>{if(Math.abs(window.innerHeight-(V.offsetHeight+2))>2){lastHeight=-1;X()}},230)};X();const j=new ResizeObserver(X);';
  const oldDedup4='let lastHeight=-1,lastMode,verifyTimer=0;const X=()=>{if(!E.current&&window.innerWidth<200)return;const height=V.offsetHeight+2,mode=!E.current||A.current?E.current:void 0;if(height===lastHeight&&mode===lastMode&&Math.abs(window.innerHeight-height)<=2)return;lastHeight=height;lastMode=mode;void ry(height,mode);window.clearTimeout(verifyTimer);verifyTimer=window.setTimeout(()=>{if(Math.abs(window.innerHeight-(V.offsetHeight+2))>2){lastHeight=-1;X()}},230)};X();const j=new ResizeObserver(X);';
 const dedup='let lastHeight=-1,lastMode,lastWidth=-1;const X=()=>{if(!E.current&&window.innerWidth<200)return;const height=V.offsetHeight+2,mode=!E.current||A.current?E.current:void 0,width=window.innerWidth;if(height===lastHeight&&mode===lastMode&&width===lastWidth)return;lastHeight=height;lastMode=mode;lastWidth=width;void ry(height,mode)};X();const j=new ResizeObserver(X);';
 for(const target of [resize,oldDedup1,oldDedup2,oldDedup3,oldDedup4]){
  if(js.includes(target))js=js.replace(target,dedup);
 }
 return js;
};
