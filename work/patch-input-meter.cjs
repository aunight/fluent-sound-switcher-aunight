const fs=require('fs');
module.exports=function(js){
 const replace=(a,b)=>{if(js.split(a).length!==2)throw Error('Input meter signature mismatch: '+a.slice(0,80));js=js.replace(a,b)};
 replace('function Ew({value:e,onChange:n,className:r="",...i}){return',fs.readFileSync('work/fss-input-meter.js','utf8')+'function Ew({value:e,onChange:n,className:r="",inputDeviceId, outputDeviceId, inputMuted=false,...i}){const fssInputRef=x.useRef(null);fssUseInputPeak(inputDeviceId||outputDeviceId,inputMuted,fssInputRef,inputDeviceId?"inputPeaks":"outputPeaks");return');
 replace('className:`fss-volume-control ${r}`,children:', 'ref:fssInputRef,"data-input-device":inputDeviceId,"data-output-device":outputDeviceId,className:`fss-volume-control ${r}`,children:');
 replace('z.jsx(Ew,{className:b.slider,min:0,max:100,value:J,','z.jsx(Ew,{outputDeviceId:e.direction==="output"?e.id:void 0,inputDeviceId:e.direction==="input"?e.id:void 0,inputMuted:!!f.muted,className:b.slider,min:0,max:100,value:J,');
 return js;
};
