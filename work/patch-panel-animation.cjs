const preserveLayout=require('./patch-preserve-layout.cjs');
module.exports=function(js){
 js=preserveLayout(js);
 const old='K.animate([{opacity:0,transform:"translateY(30px)"},{opacity:1,transform:"translateY(0)"}],{duration:340,easing:"cubic-bezier(.16, 1, .3, 1)"})';
 const prev='K.animate([{opacity:0},{opacity:1}],{duration:160,easing:"ease-out"})';
 const next='(void K,null)';
 if(js.includes(next))return js;
 if(js.includes(prev))return js.replace(prev,next);
 if(js.split(old).length!==2)throw Error('Original panel entrance signature mismatch');
 return js.replace(old,next);
};
