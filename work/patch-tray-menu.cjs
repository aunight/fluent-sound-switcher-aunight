module.exports = function(js) {
  // 1. Inject legacy_sound_panel item after sound_panel
  const oldGD = 'function GD(){return te("get_tray_menu_items")}';
  const newGD = 'async function GD(){const t=await te("get_tray_menu_items");if(!Array.isArray(t))return t;const idx=t.findIndex(x=>x.id==="sound_panel"),item={id:"legacy_sound_panel",label:"舊版音效設定",group:2};if(idx!==-1)t.splice(idx+1,0,item);else t.push(item);return t}';
  if (js.includes(oldGD)) {
    js = js.replace(oldGD, newGD);
  }

  // 2. Add icon mapping to LO
  const oldLO = 'LO={quick_panel:xr,refresh_devices:gh,toggle_mute:ta,showAppNames:F6,compactFlyout:Y6,slidersInFlyout:M6,show:j6,settings:dh,sound_panel:xr,quit:Ag}';
  const newLO = 'LO={quick_panel:xr,refresh_devices:gh,toggle_mute:ta,showAppNames:F6,compactFlyout:Y6,slidersInFlyout:M6,show:j6,settings:dh,sound_panel:xr,legacy_sound_panel:xr,quit:Ag}';
  if (js.includes(oldLO)) {
    js = js.replace(oldLO, newLO);
  }

  // 3. Handle click on legacy_sound_panel: save action to app-meter-action.json and close flyout
  const oldK = ',k=async b=>{f(b),m(!1);try{await XD(b)}catch{m(!0)}finally{f(null)}};';
  const newK = ',k=async b=>{if(b==="legacy_sound_panel"){try{const K=await Mc.load("app-meter-action.json",{autoSave:!1});await K.set("action","legacy_sound");await K.save()}catch(ee){console.error(ee)}vj();return}f(b),m(!1);try{await XD(b)}catch{m(!0)}finally{f(null)}};';
  if (js.includes(oldK)) {
    js = js.replace(oldK, newK);
  }

  return js;
};
