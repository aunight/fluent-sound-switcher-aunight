module.exports=function(js){
 const start=js.indexOf('function MO('),end=js.indexOf('function FO(',start);
 if(start<0||end<0)throw Error('Mixer boundary missing');
 let part=js.slice(start,end),at=part.lastIndexOf(']})}');
 if(at<0)throw Error('Mixer children end missing');
 part=part.slice(0,at)+',z.jsx(FssAsioSummary,{})'+part.slice(at);
 return js.slice(0,start)+part+js.slice(end)+`
function FssAsioSummary(){const {i18n}=Tt(),zh=i18n.language.startsWith("zh"),[data,setData]=x.useState(null);x.useEffect(()=>{let live=true;async function read(){try{const s=await Mc.load("asio-status.json",{autoSave:false});await s.reload();const timestamp=await s.get("timestamp"),apps=await s.get("apps");if(live)setData(Date.now()-timestamp<30000?apps:null)}catch{}}read();const timer=setInterval(read,1500);return()=>{live=false;clearInterval(timer)}},[]);if(!data?.length)return null;return z.jsxs("section",{className:"fss-asio-summary",children:[z.jsx("h3",{children:zh?"ASIO 驅動偵測":"ASIO drivers"}),...data.map(app=>z.jsxs("div",{className:"fss-asio-item",children:[z.jsx("strong",{children:app.name}),z.jsx("span",{children:app.loaded.join(" · ")}),z.jsx("small",{children:app.windowsVolume?(zh?"有 Windows 音量控制；ASIO 使用狀態未確認":"Windows volume available; ASIO use unconfirmed"):(zh?"無 Windows 音量控制 · 請在程式內調整":"No Windows volume control · adjust in app")})]},app.pid))]})}
`;
};
