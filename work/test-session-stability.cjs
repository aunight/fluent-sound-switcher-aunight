const fs=require('fs'),vm=require('vm'),assert=require('assert');const c=vm.createContext({Date,Map,Promise});vm.runInContext(fs.readFileSync('work/fss-session-policy.js','utf8'),c);
vm.runInContext(`var native=[{pid:5,deviceId:'old',name:'Discord'},{pid:5,deviceId:'new',name:'Discord'}];var meter={timestamp:Date.now(),sessionStatus:{'5:new':{pid:5,deviceId:'new',state:1}}};`,c);
assert.equal(vm.runInContext('fssNormalizeSessions(native,meter).length',c),1);
vm.runInContext("meter.sessionStatus['5:old']={pid:5,deviceId:'old',state:1}",c);assert.equal(vm.runInContext('fssNormalizeSessions(native,meter).length',c),2);
vm.runInContext(`fssLoadOrders=async()=>({});fssOriginalSessions=async()=>native;fssReadSessionTelemetry=async()=>meter;native=[{pid:0,deviceId:'new',name:'System Sounds',volume:0,muted:true}];`,c);
(async()=>{assert.equal((await c.oy()).length,1);vm.runInContext('native=[];meter=null',c);assert.equal((await c.oy()).length,1);assert.equal((await c.oy()).length,1);console.log('PASS: retain system sounds through missing snapshots; remove stale cross-device app sessions and retain real multi-device sessions')})().catch(e=>{console.error(e);process.exitCode=1});
