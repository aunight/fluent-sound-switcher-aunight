module.exports=function(js){
 const replace=(a,b)=>{if(js.split(a).length!==2)throw Error('Scroll signature mismatch: '+a.slice(0,80));js=js.replace(a,b)};
 const helper='function fssWheelScrollsList(event){return !(event.target instanceof Element&&event.target.closest(".fss-volume-control"))}';
 replace('function Tw(e,n,r){',helper+'function Tw(e,n,r){');
 replace('const V=X=>{if(X.deltaY===0)return;X.preventDefault(),X.stopPropagation();','const V=X=>{if(X.deltaY===0||fssWheelScrollsList(X))return;X.preventDefault(),X.stopPropagation();');
 replace('const V=X=>{if(!(X.target instanceof Element)||X.deltaY===0)return;','const V=X=>{if(!(X.target instanceof Element)||X.deltaY===0||fssWheelScrollsList(X))return;');
 const marker='height:"2px",backgroundColor:G.colorBrandForeground1,borderRadius:"2px",pointerEvents:"none"';
 if(js.split(marker).length!==3)throw Error('Device insertion marker signatures missing');
 js=js.split(marker).join(marker.replace('borderRadius:"2px"','borderRadius:0'));
 return js;
};
