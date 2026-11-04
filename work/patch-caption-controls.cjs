module.exports=function(js){
 const replace=(a,b)=>{if(js.split(a).length!==2)throw Error('Caption control signature mismatch');js=js.replace(a,b)};
 replace('className:n.buttons,children:[','className:n.buttons,"data-fss-caption-controls":true,onPointerDown:event=>event.stopPropagation(),onDoubleClick:event=>event.stopPropagation(),children:[');
 replace('onClick:()=>void c.close().catch(u=>console.error("could not close the window",u))','onClick:()=>void c.hide().catch(u=>console.error("could not hide the window",u))');
 return js;
};
