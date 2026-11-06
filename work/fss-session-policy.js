function fssAppIdentity(session) {
  return String(session.appId || session.processName || session.name || session.pid).toLowerCase();
}
function fssSessionIdentity(session) { return session.pid + ':' + session.deviceId; }
function fssNormalizeSessions(list, telemetry, now = Date.now()) {
  const fresh = telemetry && Number.isFinite(telemetry.timestamp) &&
    now - telemetry.timestamp < 5000 && now - telemetry.timestamp >= -1000;
  const unique = new Map();
  for (const original of Array.isArray(list) ? list : []) {
    const key = fssSessionIdentity(original);
    const status = fresh ? telemetry.sessionStatus?.[key] : null;
    const process = String(status?.processName || original.name || '').replace(/\s/g, '');
    const auxiliary = /^(LineCall|LineMediaPlayer)(\.exe)?$/i.test(process);
    if (auxiliary && !original.muted && !(status?.lastAudible > 0 &&
        now - status.lastAudible <= 4000 && now - status.lastAudible >= -1000)) continue;
    if (original.pid!==0 && (status?.state === 2 || status?.alive === false)) continue;
    const session = {...original,
      icon: typeof status?.icon === 'string' && status.icon.startsWith('data:image/png;base64,') ? status.icon : original.icon,
      processName: status?.processName,
      appId: original.name || status?.processName || String(original.pid)};
    if (auxiliary) session.name = /^LineCall/i.test(process) ? 'LINE 通話' : 'LINE 媒體';
    const prior = unique.get(key);
    if (!prior || (session.active && !prior.active)) unique.set(key, session);
  }
  const sessions = [...unique.values()];
  const counts = new Map();
  for (const session of [...sessions].sort((a,b) => a.pid-b.pid)) {
    const base = session.deviceId + ':' + fssAppIdentity(session);
    const ordinal = counts.get(base) || 0;
    counts.set(base, ordinal + 1);
    session.fssOrderKey = fssAppIdentity(session) + (ordinal ? '#' + ordinal : '');
  }
  return sessions;
}
function fssSortSessions(sessions, orders, pinned = {}) {
  const devices = new Map();
  for (const session of sessions) if (!devices.has(session.deviceId)) devices.set(session.deviceId,devices.size);
  return sessions.map((session,index) => ({session,index})).sort((a,b) => {
    if (a.session.deviceId !== b.session.deviceId) return devices.get(a.session.deviceId)-devices.get(b.session.deviceId);
    const systemLast = Number(a.session.pid === 0) - Number(b.session.pid === 0);
    if (systemLast) return systemLast;
    const pins = pinned[a.session.deviceId] || [];
    const pinDifference = Number(pins.includes(b.session.fssOrderKey))-Number(pins.includes(a.session.fssOrderKey));
    if (pinDifference) return pinDifference;
    const order = orders?.[a.session.deviceId] || [];
    const position = session => { const i=order.indexOf(session.fssOrderKey); return i<0 ? Infinity : i; };
    return position(a.session)-position(b.session) || a.index-b.index;
  }).map(item => item.session);
}
function fssReorderSessions(rows, pid, targetPid, before) {
  const result = [...rows], index = result.findIndex(row => row.pid === pid);
  if (index < 0 || pid === targetPid) return result;
  const [source] = result.splice(index,1);
  let target = result.findIndex(row => row.pid === targetPid);
  if (target < 0) target = result.length;
  else if (!before) target++;
  result.splice(target,0,source);
  return result;
}
const fssOrders = {value:{},pinned:{},ignored:{},store:null,writing:Promise.resolve()};
async function fssLoadOrders() {
  fssOrders.store ||= await Mc.load('mixer-app-order.json',{autoSave:false});
  // The first load has no on-disk file yet. Save must still be allowed to create it.
  await fssOrders.store.reload().catch(()=>{});
  fssOrders.value = await fssOrders.store.get('orders') || fssOrders.value;
  fssOrders.pinned = await fssOrders.store.get('pinned') || {};
  fssOrders.ignored = await fssOrders.store.get('ignored') || {};
  return fssOrders.value;
}
function fssWritePreferences(change) {
  const write=fssOrders.writing.catch(()=>{}).then(async()=>{
    await fssLoadOrders(); change(fssOrders);
    const snapshot={orders:fssOrders.value,pinned:fssOrders.pinned,ignored:fssOrders.ignored};
    for(const [key,value] of Object.entries(snapshot)) await fssOrders.store.set(key,value);
    await fssOrders.store.save();
  });
  fssOrders.writing=write;return write;
}
function fssSaveOrder(device, rows) {
  const present = rows.map(row => row.fssOrderKey);
  return fssWritePreferences(prefs=>{prefs.value[device]=[...present,...(prefs.value[device]||[]).filter(key=>!present.includes(key))]});
}
async function fssReadSessionTelemetry() {
  const store = await Mc.load('app-meter.json',{autoSave:false});
  await store.reload();
  return {timestamp:await store.get('timestamp'),sessionStatus:await store.get('sessionStatus'),systemSounds:await store.get('systemSounds')};
}
function fssSessionFallback(telemetry,now=Date.now()) {
  if (!telemetry || !Number.isFinite(telemetry.timestamp) || now-telemetry.timestamp>5000) return [];
  return Object.values(telemetry.sessionStatus || {}).filter(session=>session.alive!==false && session.state!==2);
}
async function oy() {
  const [list,telemetry,orders] = await Promise.all([
    fssOriginalSessions().catch(()=>null),fssReadSessionTelemetry().catch(()=>null),fssLoadOrders().catch(()=>fssOrders.value)
  ]);
  const rows=[...(list || fssSessionFallback(telemetry))];
  if(telemetry&&Date.now()-telemetry.timestamp<5000)for(const [deviceId,sound]of Object.entries(telemetry.systemSounds||{}))if(!rows.some(row=>row.pid===0&&row.deviceId===deviceId))rows.push({...sound,pid:0,deviceId});
  const sessions=fssNormalizeSessions(rows,telemetry)
    .filter(session=>session.pid===0 || !fssOrders.ignored[fssAppIdentity(session)]);
  return fssSortSessions(sessions,orders,fssOrders.pinned);
}
function fssClearDropMark() {
  const previous = fssShowDropMark.current;
  if (previous) previous.classList.remove('fss-order-before','fss-order-after');
  fssShowDropMark.current = null;
}
function fssDropDetails(x,y) {
  const row = document.elementFromPoint(x,y)?.closest('[data-app-pid]');
  if (!row) return {targetPid:null,before:false};
  const rect = row.getBoundingClientRect();
  return {targetPid:Number(row.dataset.appPid),before:y < rect.top+rect.height/2};
}
function fssShowDropMark(x,y,sourceDevice,pid) {
  const row = document.elementFromPoint(x,y)?.closest('[data-app-pid]');
  if (!row || row.dataset.appDevice !== sourceDevice || Number(row.dataset.appPid) === pid) {
    fssClearDropMark(); return;
  }
  const rect = row.getBoundingClientRect(), before = y < rect.top+rect.height/2;
  const cls = before ? 'fss-order-before' : 'fss-order-after';
  if (fssShowDropMark.current === row && row.classList.contains(cls)) return;
  fssClearDropMark(); row.classList.add(cls); fssShowDropMark.current=row;
}
