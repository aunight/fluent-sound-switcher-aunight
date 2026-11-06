var fssDeviceQueue=Promise.resolve();
var fssDeviceCache={};
function FssDeviceSettings({direction}){
 const {i18n}=Tt(),zh=i18n.language.startsWith('zh'),t=(a,b)=>zh?a:b;
 const saved=fssDeviceCache[direction];
 const [driver,setDriver]=x.useState(''),[devices,setDevices]=x.useState(saved?.devices||[]),[id,setId]=x.useState(saved?.id||''),[data,setData]=x.useState(saved?.data||null),[busy,setBusy]=x.useState(false),[message,setMessage]=x.useState(''),[asio,setAsio]=x.useState(saved?.asio||null);
 const live=x.useRef(true),pending=x.useRef(false);
 function request(command,deviceId='',value=''){const next=fssDeviceQueue.catch(()=>{}).then(()=>sendRequest(command,deviceId,value));fssDeviceQueue=next;return next}
 async function sendRequest(command,deviceId='',value=''){
  const requestId=crypto.randomUUID(),store=await Mc.load('device-settings-request.json',{autoSave:false});
  for(const [k,v] of Object.entries({requestId,timestamp:Date.now(),command,deviceId,value}))await store.set(k,v);await store.save();
  const response=await Mc.load('device-settings-response.json',{autoSave:false});
  for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,200));await response.reload();if(await response.get('requestId')===requestId){if(!await response.get('ok'))throw Error(await response.get('error'));return await response.get('data')}}
  throw Error(t('音訊設定服務沒有回應，請重新整理。','Audio configuration timed out. Please refresh.'));
 }
 async function load(next){if(pending.current)return;let deviceList=devices;pending.current=true;setBusy(true);setMessage('');try{
  if(!next){const list=(await request('list')).filter(d=>d.input===(direction==='input'));if(!live.current)return;deviceList=list;setDevices(list);next=list.find(d=>d.id===id)?.id||list.find(d=>d.active)?.id||list[0]?.id||'';}
  setId(next);if(next){const state=await request('read',next);fssDeviceCache[direction]={devices:deviceList,id:next,data:state,asio};if(live.current)setData(state)}else{setData(null);fssDeviceCache[direction]={devices:deviceList,id:'',data:null,asio}}
 }catch(e){if(live.current)setMessage(String(e.message))}finally{pending.current=false;if(live.current)setBusy(false)}}
 async function change(command,value){if(pending.current)return;pending.current=true;setBusy(true);setMessage('');try{const state=await request(command,id,value);if(fssDeviceCache[direction])fssDeviceCache[direction].data=state;if(live.current){setData(state);setMessage(t('已套用並確認 Windows 設定。','Applied and verified with Windows.'))}}catch(e){if(live.current)setMessage(String(e.message));try{const state=await request('read',id);if(live.current)setData(state)}catch{}}finally{pending.current=false;if(live.current)setBusy(false)}}
 x.useEffect(()=>{live.current=true;if(!fssDeviceCache[direction])load();return()=>{live.current=false}},[]);
 Vt('device-changed',()=>{fssDeviceCache={};load()});
 async function loadAsio(){if(pending.current)return;pending.current=true;setBusy(true);try{const result=await request('asio');setAsio(result);if(fssDeviceCache[direction])fssDeviceCache[direction].asio=result}catch(e){setAsio({installed:[],apps:[],error:t('ASIO 掃描未完成，請重新掃描；裝置設定仍可使用。','ASIO scan did not complete. Retry; device settings remain available.')})}finally{pending.current=false;if(live.current)setBusy(false)}}
 async function openPanel(){setMessage('');try{await request('asio-panel','',driver)}catch{setMessage(t('驅動面板開啟失敗。','Driver panel failed.'))}}
 const el=z.jsx,els=z.jsxs;
 const row=(title,control,description)=>els('div',{className:'fss-device-row',children:[els('div',{children:[el('strong',{children:title}),description&&el('p',{children:description})]}),control]},title);
 const toggle=(key,title,value,description,disabled=false)=>row(title,el($t,{'aria-label':title,checked:value===true,disabled:busy||!data?.active||disabled,onChange:(e,d)=>change(key,d.checked?'1':'0')}),value==null?t('尚未設定；切換後會讀回確認。','Not explicitly set; changes are verified after applying.'):description);
 const select=(value,options,onChange,label,disabled=false)=>el(Wn,{className:'fss-device-select','aria-label':label,value:options.find(o=>o[0]===value)?.[1]||'',selectedOptions:[value],disabled:busy||disabled,listbox:{className:'fss-device-options'},onOptionSelect:(e,d)=>d.optionValue!==undefined&&onChange(d.optionValue),children:options.map(([v,label])=>el(Xn,{value:v,text:label,title:label,children:label},v))});
 const heading=(icon,a,b)=>els('h3',{children:[el(FssDeviceGlyph,{name:icon}),t(a,b)]});
 return els('section',{className:'fss-device-settings','aria-busy':busy,children:[
  heading('device','選擇裝置','Choose device'),
  row(t('音訊裝置','Audio device'),select(id,devices.map(d=>[d.id,d.name+(d.active?'':t('（未啟用）',' (inactive)'))]),load,t('音訊裝置','Audio device'))),
  el(Ht,{disabled:busy,icon:el(FssDeviceGlyph,{name:'refresh'}),onClick:()=>load(),children:t('重新整理裝置','Refresh devices')}),
  el('p',{role:'status',children:busy?t('正在讀取／套用…','Reading / applying…'):message}),
  els('details',{onToggle:e=>{if(e.currentTarget.open&&!asio&&!pending.current)loadAsio()},children:[el('summary',{children:t('ASIO 驅動偵測','ASIO driver detection')}),el(Ht,{disabled:busy,onClick:loadAsio,icon:el(FssDeviceGlyph,{name:'refresh'}),children:t('重新掃描 ASIO','Rescan ASIO')}),el('p',{children:asio?.error||(!asio?t('展開後讀取 ASIO 驅動…','Reading ASIO drivers…'):t('已安裝：','Installed: ')+asio.installed.join(' · '))}),asio?.installed?.length>0&&row(t('ASIO 驅動','ASIO driver'),select(driver,asio.installed.map(n=>[n,n]),setDriver,t('ASIO 驅動','ASIO driver'))),el(Ht,{disabled:busy||!driver,onClick:openPanel,children:t('開啟驅動控制面板','Open driver control panel')}),...(asio?.apps||[]).map(a=>els('div',{className:'fss-device-row',children:[els('div',{children:[el('strong',{children:a.name}),el('p',{children:a.current?t('目前使用：','Current: ')+a.current:t('目前使用未確認；已載入：','Current driver unconfirmed; loaded: ')+a.loaded.join(' · ')}),el('p',{children:a.windowsVolume?t('Windows 工作階段可調；ASIO 音量需在程式內調整。','Windows session available; adjust ASIO volume in the application.'):t('沒有 Windows 音量工作階段；請在程式、驅動或音訊介面本體調整音量。','No Windows volume session; use the application, driver or audio interface controls.')})]})]},a.pid)),el('p',{children:t('已載入不代表正在使用。','Loaded does not mean active.')})]}),data&&els(z.Fragment,{children:[
   !data.active&&el('p',{children:t('請先連接並啟用這個裝置。','Connect and enable this device first.')}),
   heading('format','預設格式','Default format'),
   row(t('取樣率與位元深度','Sample rate and bit depth'),select((data.format.match(/(\d+) bit, (\d+) Hz/)||[]).slice(1).join(':'),data.formats.map(f=>{const [bits,hz]=f.split(':');const channels=(data.format.match(/^(\d+)/)||[])[1]||'2';return [f,zh?channels+' 聲道，'+bits+' 位元，'+hz+' Hz':channels+' channel, '+bits+' bit, '+hz+' Hz']}),v=>change('format',v),t('預設格式','Default format'),!data.active)),
   el('p',{children:t('格式套用時會由驅動確認。ASIO 請在驅動面板調整，變更可能中斷播放。','Formats are validated when applying. Configure ASIO in its driver panel. Changes may interrupt playback.')}),
   heading('lock','獨佔模式','Exclusive mode'),
   toggle('exclusive',t('允許應用程式獨佔此裝置','Allow exclusive control'),data.exclusive),
   toggle('priority',t('給予獨佔模式應用程式優先權','Give exclusive applications priority'),data.priority,null,data.exclusive===false),
   heading('effects','音效增強','Audio enhancements'),
   data.enhancements==null?el('p',{children:t('驅動未提供音效增強開關。','The driver does not expose an enhancements switch.')}):toggle('enhancements',t('啟用音效增強','Enable audio enhancements'),data.enhancements),
   ...[['loudness','響度等化','Loudness equalization'],['headphone','耳機虛擬化','Headphone virtualization'],['surround','虛擬環繞','Virtual surround'],['voice','人聲消除','Voice cancellation']].filter(([key])=>data.effects[key]!=null).map(([key,a,b])=>toggle(key,t(a,b),data.effects[key],null,data.enhancements===false)),
   !data.input&&els(z.Fragment,{children:[heading('spatial','空間音效','Spatial sound'),row(t('空間音效格式','Spatial sound format'),select(data.spatial,[['',t('關閉','Off')],['{b53d940c-b846-4831-9f76-d102b9b725a0}','Windows Sonic for Headphones'],...(data.spatial&&data.spatial!=='{b53d940c-b846-4831-9f76-d102b9b725a0}'?[[data.spatial,t('目前的空間音效','Current spatial format')]]:[])],v=>change('spatial',v),t('空間音效格式','Spatial sound format'),!data.active),t('可用性取決於裝置與驅動；套用失敗會顯示原因。','Availability depends on the device and driver; failed changes show an error.'))]})
  ]})
 ]});
}
function FssDeviceGlyph({name}){return z.jsx('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true,children:z.jsx('path',{d:({device:'M4 5h16v12H4zM8 21h8M12 17v4',format:'M5 7h14M5 12h14M5 17h14M9 5v4M15 10v4M10 15v4',lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',effects:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',spatial:'M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0M3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18',download:'M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4',refresh:'M20 7a9 9 0 1 0 1 8M20 3v5h-5'})[name]})})}
