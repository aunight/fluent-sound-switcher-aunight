module.exports=function(js){
 const rep=(a,b)=>{if(!js.includes(a))throw Error('Layout anchor missing '+a.slice(0,70));js=js.replace(a,b)};
 rep('wO=["general","devices","hotkeys","volume","mute","notifications","support"]','wO=["general","output","input","behavior","notifications","hotkeys","support"]');
 rep('i==="devices"?FssDeviceTitle():r(`settings.tabs.${i}`)','FssPageTitle(i)');
 rep('c==="devices"?FssDeviceTitle():r(`settings.tabs.${c}`)','FssPageTitle(c)');
 rep('i==="devices"&&z.jsx(FssDeviceSettings,{})','(i==="output"||i==="input")&&z.jsx(FssDeviceSettings,{direction:i})');
 rep('i==="general"&&z.jsx(oO,{','(i==="general"||i==="behavior")&&z.jsx(FssGeneralGroup,{section:i,');
 rep('i==="volume"&&z.jsx(yO,{osd:e.volumeOsd,onChange:e.onVolumeOsdChange})','(i==="general"||i==="notifications")&&z.jsx(FssVolumeGroup,{section:i,osd:e.volumeOsd,onChange:e.onVolumeOsdChange})');
 rep('i==="mute"&&z.jsx(gO,','i==="notifications"&&z.jsx(gO,');
 rep('devices:"\\uE7F4",general:"\\uE713",hotkeys:','output:"\\uE767",input:"\\uE720",behavior:"\\uE8AB",devices:"\\uE7F4",general:"\\uE790",hotkeys:');
 rep('support:"\\uE897"','support:"\\uE946"');
 return js+`
function FssPageTitle(k){const t={general:["外觀設定","Appearance"],output:["輸出裝置","Output devices"],input:["輸入裝置","Input devices"],behavior:["裝置行為","Device behavior"],notifications:["通知與指示器","Notifications & indicators"],hotkeys:["快捷鍵","Shortcuts"],support:["支援","Support"]};return t[k][kt.language.startsWith("zh")?0:1]}
function FssGeneralGroup(p){const tree=oO(p),keep=p.section==="general"?[0,1,2,3,4,7,11]:[5,6,8,9,10,12];return z.jsx(z.Fragment,{children:tree.props.children.filter((v,i)=>keep.includes(i))})}
function FssVolumeGroup(p){const tree=yO(p);return z.jsx(z.Fragment,{children:tree.props.children.filter((v,i)=>p.section==="general"?i>=2:i<2)})}
`;
};
