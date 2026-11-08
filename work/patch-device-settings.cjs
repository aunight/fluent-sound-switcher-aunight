const fs=require('fs');
module.exports=function(js){
 if(js.includes('function FssDeviceSettings()'))return js;
 for(const [a,b] of [
  ['wO=["general","hotkeys","volume","mute","notifications","support"]','wO=["general","devices","hotkeys","volume","mute","notifications","support"]'],
  ['children:r(`settings.tabs.${i}`)','children:i==="devices"?FssDeviceTitle():r(`settings.tabs.${i}`)'],
  ['children:r(`settings.tabs.${c}`)','children:c==="devices"?FssDeviceTitle():r(`settings.tabs.${c}`)'],
  ['i==="general"&&z.jsx(oO,','i==="devices"&&z.jsx(FssDeviceSettings,{}),i==="general"&&z.jsx(oO,'],
  ['general:"\\uE713",hotkeys:','devices:"\\uE7F4",general:"\\uE713",hotkeys:']
 ]){if(!js.includes(a))throw Error('Device settings anchor missing: '+a);js=js.replace(a,b)}
 return js+'\n'+fs.readFileSync('work/fss-device-settings.js','utf8');
};
