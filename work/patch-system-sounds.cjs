const fs = require('fs');

module.exports = function(js) {
  let sysIcon = "";
  try {
    sysIcon = fs.readFileSync('work/audiosrv-32.b64', 'utf8').trim();
  } catch(e) {
    try {
      sysIcon = fs.readFileSync('audiosrv-32.b64', 'utf8').trim();
    } catch(e2) {}
  }
  const sysIconLiteral = JSON.stringify(sysIcon);

  // 1. Intercept oy() to inject system sounds from app-meter.json
  const s_oy = 'function oy(){return te("list_app_sessions")}';
  const r_oy = 'async function oy(){const [list,meter]=await Promise.all([te("list_app_sessions"),Mc.load("app-meter.json",{autoSave:!1}).then(async m=>{await m.reload();return await m.get("systemSounds")}).catch(()=>null)]);const sessions=Array.isArray(list)?[...list]:[];if(meter&&typeof meter==="object"){for(const devId of Object.keys(meter)){const s=meter[devId];if(s&&!sessions.some(x=>x.pid===0&&x.deviceId===devId)){sessions.unshift({pid:0,name:s.name||"系統音效",deviceId:devId,volume:typeof s.volume==="number"?s.volume:1,muted:!!s.muted,active:!0,icon:s.icon||' + sysIconLiteral + '})}}}return sessions}';
  if (js.includes(s_oy)) js = js.replace(s_oy, r_oy);

  // 2. Intercept ZD() to route volume adjustment for pid===0 to app-meter-control.json
  const s_zd = 'function ZD(e,n,r){return te("set_app_session_volume",{pid:e,deviceId:n,level:r})}';
  const r_zd = 'async function ZD(e,n,r){if(e===0){try{const c=await Mc.load("app-meter-action.json",{autoSave:!1});await c.set("set_system_sound_volume",r);await c.set("deviceId",n);await c.delete("command");await c.save()}catch(err){console.error(err)}return}return te("set_app_session_volume",{pid:e,deviceId:n,level:r})}';
  if (js.includes(s_zd)) js = js.replace(s_zd, r_zd);

  // 3. Intercept QD() to route mute toggle for pid===0 to app-meter-control.json
  const s_qd = 'function QD(e,n,r){return te("set_app_session_mute",{pid:e,deviceId:n,muted:r})}';
  const r_qd = 'async function QD(e,n,r){if(e===0){try{const c=await Mc.load("app-meter-action.json",{autoSave:!1});await c.set("set_system_sound_mute",r);await c.set("deviceId",n);await c.delete("command");await c.save()}catch(err){console.error(err)}return}return te("set_app_session_mute",{pid:e,deviceId:n,muted:r})}';
  if (js.includes(s_qd)) js = js.replace(s_qd, r_qd);

  // 4. Update ce to use native system sounds icon for pid===0 and disable drag on system sounds
  const s_ce = 'onPointerDown:j=>{_(null),H.begin(j,M.pid,V,M.icon??void 0)},onDragStart:j=>j.preventDefault(),children:[z.jsx("button",{type:"button",className:r.grip,"aria-label":i("mixer.dragApp",{name:V}),"aria-describedby":(B==null?void 0:B.pid)===M.pid?b:void 0,onPointerEnter:j=>{j.pointerType==="mouse"&&X(j.currentTarget)},onPointerLeave:()=>_(null),onFocus:j=>X(j.currentTarget),onBlur:()=>_(null),onDragStart:j=>j.preventDefault(),children:M.icon?z.jsx("img",{className:r.appIcon,src:M.icon,alt:"",draggable:!1}):z.jsx(o1,{className:r.appIcon})})';
  const r_ce = 'onPointerDown:j=>{_(null);if(M.pid!==0)H.begin(j,M.pid,V,M.icon??void 0)},onDragStart:j=>j.preventDefault(),children:[z.jsx("button",{type:"button",className:r.grip,style:M.pid===0?{cursor:"default"}:void 0,"aria-label":i("mixer.dragApp",{name:V}),"aria-describedby":(B==null?void 0:B.pid)===M.pid?b:void 0,onPointerEnter:j=>{if(M.pid!==0&&j.pointerType==="mouse")X(j.currentTarget)},onPointerLeave:()=>_(null),onFocus:j=>{if(M.pid!==0)X(j.currentTarget)},onBlur:()=>_(null),onDragStart:j=>j.preventDefault(),children:(M.icon||(M.pid===0?' + sysIconLiteral + ':null))?z.jsx("img",{className:r.appIcon,src:M.icon||(M.pid===0?' + sysIconLiteral + ':void 0),alt:"",draggable:!1}):z.jsx(o1,{className:r.appIcon})})';
  if (js.includes(s_ce)) js = js.replace(s_ce, r_ce);

  return js;
};
