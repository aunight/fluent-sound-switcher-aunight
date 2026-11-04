module.exports=function(js){
 const replace=(a,b)=>{if(js.split(a).length!==2)throw Error('Caption control signature mismatch');js=js.replace(a,b)};
 replace('className:n.buttons,children:[','className:n.buttons,"data-fss-caption-controls":true,onPointerDown:event=>event.stopPropagation(),onDoubleClick:event=>event.stopPropagation(),children:[');

 replace('onClick:()=>void c.close().catch(u=>console.error("could not close the window",u))','onClick:()=>void Mc.load("app-meter-action.json",{autoSave:false}).then(async store=>{await store.set("action","hide_main");await store.save()}).catch(error=>console.error("could not close the window",error))');
 const hook='function fssUseMainRestore(){x.useEffect(()=>{let stopped=false,busy=false,store;const tick=async()=>{if(stopped||busy)return;busy=true;try{store??=await Mc.load("main-window-control.json",{autoSave:false});await store.reload();if(stopped||await store.get("action")!=="show")return;const id=await store.get("requestId");await XD("show");await store.reload();if(await store.get("requestId")===id){await store.set("action","");await store.save()}}catch(error){console.error("could not restore main window",error)}finally{busy=false}};tick();const timer=setInterval(tick,750);return()=>{stopped=true;clearInterval(timer)}},[])}';
 replace('function eD({children:e}){','function eD({children:e}){fssUseMainRestore();');
 replace('function XD(e){return te("tray_menu_action",{action:e})}', 'async function XD(e){if(e!=="show"&&e!=="settings")return te("tray_menu_action",{action:e});await te("tray_menu_action",{action:e});const store=await Mc.load("app-meter-action.json",{autoSave:false});await store.set("action","show_main");await store.save()}');
 return hook+js;
};
