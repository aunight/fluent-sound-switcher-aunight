const fs=require('fs'),vm=require('vm'),assert=require('assert');
const context=vm.createContext({Date,Map,Promise});vm.runInContext(fs.readFileSync('work/fss-session-policy.js','utf8'),context);
const run=expression=>JSON.parse(vm.runInContext('JSON.stringify('+expression+')',context));
vm.runInContext(`globalThis.now=10000;globalThis.raw=[
 {pid:1,deviceId:'a',name:'Dia',volume:.4},
 {pid:2,deviceId:'a',name:'LineCall',volume:.8,active:true},
 {pid:3,deviceId:'a',name:'LineMediaPlayer',volume:.2},
 {pid:4,deviceId:'a',name:'LineMediaPlayer',volume:.7},
 {pid:5,deviceId:'b',name:'Steam',volume:1},
 {pid:1,deviceId:'a',name:'Dia',volume:.4}];
globalThis.meter={timestamp:now,sessionStatus:{'1:a':{processName:'Dia',processPath:'dia.exe',state:0},'2:a':{processName:'LineCall',state:1,lastAudible:0},'3:a':{processName:'LineMediaPlayer',state:0,lastAudible:4000},'4:a':{processName:'LineMediaPlayer',state:1,lastAudible:9500}}};`,context);
let rows=run('fssNormalizeSessions(raw,meter,now)');assert.deepEqual(rows.map(r=>r.pid),[1,4,5]);
assert.equal(rows[0].name,'Dia');assert.equal(rows[1].name,'LINE 媒體');assert.equal(rows[1].volume,.7);
assert.equal(run('fssNormalizeSessions(raw,meter,now+4001)').some(r=>r.pid===4),false);
assert.equal(run('fssNormalizeSessions(raw,null,now)').some(r=>r.pid===2),false);
vm.runInContext("meter.sessionStatus['2:a'].lastAudible=now",context);assert(run('fssNormalizeSessions(raw,meter,now)').some(r=>r.pid===2));
vm.runInContext("raw.find(r=>r.pid===2).muted=true;meter.sessionStatus['2:a'].lastAudible=0",context);assert(run('fssNormalizeSessions(raw,meter,now)').some(r=>r.pid===2));
vm.runInContext("globalThis.rows=fssNormalizeSessions(raw,meter,now)",context);
assert.deepEqual(run("fssReorderSessions(rows.filter(r=>r.deviceId==='a'),4,1,true)").map(r=>r.pid),[4,1,2]);
assert.deepEqual(run("fssReorderSessions(rows.filter(r=>r.deviceId==='a'),1,4,false)").map(r=>r.pid),[2,4,1]);
assert.deepEqual(run("fssReorderSessions(rows.filter(r=>r.deviceId==='a'),1,null,false)").map(r=>r.pid),[2,4,1]);
assert.deepEqual(run("fssReorderSessions(rows,1,1,false)").map(r=>r.pid),run('rows').map(r=>r.pid));
assert.deepEqual(run("fssSortSessions([{pid:1,deviceId:'a',fssOrderKey:'one'},{pid:9,deviceId:'b',fssOrderKey:'nine'},{pid:2,deviceId:'a',fssOrderKey:'two'}],{a:['two','one']})").map(r=>r.pid),[2,1,9]);
console.log('PASS: silent/active LINE helpers, stale snapshots, reappearance, mute access, deduplication, browser identity, reorder both directions, device isolation');
assert.equal(run("fssSessionFallback({timestamp:now,sessionStatus:{sys:{pid:0,state:0,alive:true},dead:{pid:8,state:2}}},now)").length,1);
(async()=>{
 let written=null,saved=0;
 context.Mc={load:async()=>({reload:async()=>{throw Error('file not found')},get:async()=>null,set:async(key,value)=>{if(key==='orders')written=JSON.parse(JSON.stringify(value))},save:async()=>{saved++}})};
 await vm.runInContext("fssSaveOrder('a',rows.filter(r=>r.deviceId==='a'))",context);
 assert(written.a.length>0);assert.equal(saved,1);
 console.log('PASS: first-run missing order file is created; system-sound fallback survives stale entries');
 assert.deepEqual(run("fssSortSessions([{pid:1,deviceId:'a',fssOrderKey:'one'},{pid:2,deviceId:'a',fssOrderKey:'two'}],{a:['one','two']},{a:['two']})").map(r=>r.pid),[2,1]);
 await vm.runInContext("fssWritePreferences(prefs=>{prefs.ignored={...prefs.ignored,steam:'Steam'};prefs.pinned.a=['one']})",context);
 assert.equal(vm.runInContext('fssOrders.ignored.steam',context),'Steam');
 await vm.runInContext("fssWritePreferences(prefs=>{const ignored={...prefs.ignored};delete ignored.steam;prefs.ignored=ignored})",context);
 assert.equal(vm.runInContext('fssOrders.ignored.steam',context),undefined);
 console.log('PASS: pin priority and reversible ignore preferences');
})().catch(error=>{console.error(error);process.exitCode=1});
