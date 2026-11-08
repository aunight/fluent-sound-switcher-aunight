const fs=require('fs'),vm=require('vm'),assert=require('assert');let effects=[];
const c=vm.createContext({Promise,Vt:()=>{},Tt:()=>({i18n:{language:'zh-TW'}}),x:{useState:v=>[v,()=>{}],useRef:v=>({current:v}),useEffect:f=>effects.push(f)},z:{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'},$t:'switch',Ht:'button',Wn:'dropdown',Xn:'option',setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('work/fss-device-settings.js','utf8'),c);
vm.runInContext(`fssAsioCache={installed:['MiniFuse ASIO Driver'],apps:[]};fssMiniCache={buffer:2048,safe:true,sizes:[2048]};fssDeviceCache={input:{devices:[],id:'i',data:{active:true,input:true,format:'2 channel, 24 bit, 48000 Hz',formats:[],effects:{}}},output:{devices:[],id:'o',data:{active:true,input:false,format:'2 channel, 24 bit, 48000 Hz',formats:[],effects:{}}}}`,c);
for(const direction of ['output','input','output']){effects=[];const queue=c.fssDeviceQueue;vm.runInContext(`FssDeviceSettings({direction:'${direction}'})`,c);effects.forEach(f=>f());assert.strictEqual(c.fssDeviceQueue,queue,`${direction} must reuse ASIO and MiniFuse settings`)}
console.log('PASS: output -> input -> output reuses ASIO scan and MiniFuse settings without helper requests');

