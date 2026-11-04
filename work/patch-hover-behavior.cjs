module.exports=function(js){
 if(js.includes('/* fss-hover-lifecycle-v2 */'))return js;
 const replace=(a,b)=>{if(js.split(a).length!==2)throw Error('Hover patch signature mismatch: '+a);js=js.replace(a,b)};
 replace('_({x:K.right+10,y:K.top,pid:M.pid,name:V,icon:M.icon??void 0})','_({x:K.right+10,y:K.top+K.height/2,centered:true,pid:M.pid,name:V,icon:M.icon??void 0})');
 replace('M.style.left=`${Math.max(12,Math.min(J.x,window.innerWidth-V-12))}px`,M.style.top=`${Math.max(12,Math.min(J.y,window.innerHeight-X-12))}px`','M.style.left=`${Math.max(12,Math.min(J.x,window.innerWidth-V-12))}px`,M.style.top=`${Math.max(12,Math.min(J.y-(J.centered?X/2:0),window.innerHeight-X-12))}px`');
 replace('M.onFocusChanged(j=>y(j.payload))','M.onFocusChanged(j=>{_(null);y(j.payload)})');
 replace('Vt("flyout-opened",()=>{y(!0),R()})','Vt("flyout-opened",()=>{_(null);y(!0);R()})');
 replace('fssUseAppPeaks(v,S);','fssUseAppPeaks(v,S);x.useEffect(()=>{if(!v)_(null)},[v]);x.useEffect(()=>{const clear=()=>_(null);document.addEventListener("visibilitychange",clear);window.addEventListener("pagehide",clear);return()=>{document.removeEventListener("visibilitychange",clear);window.removeEventListener("pagehide",clear)}},[]);');
 return js+'\n/* fss-hover-lifecycle-v2 */';
};
