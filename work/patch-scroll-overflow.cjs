module.exports=function(js){
 const replace=(a,b)=>{if(js.split(a).length!==2)throw Error('Scroll signature mismatch: '+a.slice(0,80));js=js.replace(a,b)};
 const helper='function fssWheelScrollsList(event){if(event.altKey)return false;let el=event.target instanceof Element?event.target:null;for(;el;el=el.parentElement){if(el.scrollHeight>el.clientHeight+1&&/^(auto|scroll|overlay)$/.test(getComputedStyle(el).overflowY))return true}return false}';
 replace('function Tw(e,n,r){',helper+'function Tw(e,n,r){');
 replace('const V=X=>{if(X.deltaY===0)return;X.preventDefault(),X.stopPropagation();','const V=X=>{if(X.deltaY===0||fssWheelScrollsList(X))return;X.preventDefault(),X.stopPropagation();');
 replace('const V=X=>{if(!(X.target instanceof Element)||X.deltaY===0)return;','const V=X=>{if(!(X.target instanceof Element)||X.deltaY===0||fssWheelScrollsList(X))return;');
 return js;
};
