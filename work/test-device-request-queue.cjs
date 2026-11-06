const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('work/fss-device-settings.js','utf8');
const request=src.slice(src.indexOf(' function request('),src.indexOf(' async function sendRequest('));
let active=0,max=0;const calls=[];
const context={fssDeviceQueue:Promise.resolve(),sendRequest:async(name)=>{active++;max=Math.max(max,active);calls.push(name);await new Promise(r=>setTimeout(r,10));active--;if(name==='error')throw Error('driver error');return name}};
vm.createContext(context);vm.runInContext(request,context);
(async()=>{const results=await Promise.allSettled(['list','error','read'].map(n=>context.request(n)));assert.equal(max,1);assert.deepEqual(calls,['list','error','read']);assert.equal(results[2].value,'read');console.log('PASS: page requests are serialized and a failed scan does not block later device reads');})();
