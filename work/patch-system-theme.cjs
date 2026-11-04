module.exports=function(js){
 const old='const n=await e.get(ey),r=Object.fromEntries(await e.entries())';
 if(!js.includes('/* fss-system-theme-v2 */')){
  if(!js.includes(old))throw Error('Theme migration anchor missing');
  js=js.replace(old,'/* fss-system-theme-v2 */if(await e.get("fssSystemThemeVersion")!==2){await e.set(Fw,"system");await e.set("fssSystemThemeVersion",2)}const n=await e.get(ey),r=Object.fromEntries(await e.entries())');
 }
 if(js.includes('/* fss-live-windows-theme-v1 */'))return js;
 const hook='function Ww(e,n){const[r,i]=x.useState(()=>window.matchMedia("(prefers-color-scheme: dark)").matches);';
 if(!js.includes(hook))throw Error('System theme hook missing');
 js=js.replace(hook,hook+`/* fss-live-windows-theme-v1 */x.useEffect(()=>{if(e!=="system")return;let stopped=false,timer,store;async function refresh(){try{store=store||await Mc.load("system-theme.json",{autoSave:!1});await store.reload();const dark=await store.get("dark");if(!stopped&&typeof dark==="boolean")i(dark)}catch{}finally{if(!stopped)timer=setTimeout(refresh,500)}}refresh();return()=>{stopped=true;clearTimeout(timer)}},[e]);`);
 return js;
};
