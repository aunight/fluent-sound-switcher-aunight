async function FssUpdateAction(action){const store=await Mc.load('app-meter-action.json',{autoSave:false});await store.set('action',action);await store.save()}
function FssSupportUpdates(){
 const {i18n}=Tt(),zh=i18n.language.startsWith('zh'),t=(a,b)=>zh?a:b;
 const [status,setStatus]=x.useState(null),[auto,setAuto]=x.useState(false),[waiting,setWaiting]=x.useState(false),[error,setError]=x.useState('');
 const requested=x.useRef(0),notes=x.useRef(false),live=x.useRef(true);
 x.useEffect(()=>{live.current=true;let busy=false;
  Mc.load('update-preferences.json',{autoSave:false}).then(async s=>{if(live.current)setAuto(!!await s.get('autoUpdate'))}).catch(()=>{});
  async function read(){if(busy)return;busy=true;try{const store=await Mc.load('update-status.json',{autoSave:false});await store.reload();const data={};for(const key of ['current','version','available','url','notes','stage','progress','checkedAt','canInstall','errorCode'])data[key]=await store.get(key);
   if(!live.current)return;setStatus(data);
   if(requested.current&&data.checkedAt>=requested.current&&data.stage!=='checking'){requested.current=0;setWaiting(false);if(notes.current&&data.stage==='ready'){notes.current=false;window.dispatchEvent(new CustomEvent('fss-release-notes',{detail:data}))}}
   if(requested.current&&Date.now()-requested.current>15000){requested.current=0;setWaiting(false);setError(t('更新服務沒有回應，請重試。','Update service did not respond. Retry.'))}
  }catch{}finally{busy=false}}
  read();const timer=setInterval(read,1000);return()=>{live.current=false;clearInterval(timer)};
 },[]);
 const busy=waiting||['checking','downloading','installing'].includes(status?.stage);
 async function action(install){setError('');requested.current=Date.now();notes.current=!install;setWaiting(true);try{await FssUpdateAction(install?'update_install':'update_check')}catch{requested.current=0;setWaiting(false);setError(t('無法啟動更新服務。','Could not start update service.'))}}
 async function changeAuto(value){const prefs=await Mc.load('update-preferences.json',{autoSave:false});await prefs.set('autoUpdate',value);await prefs.save();setAuto(value);if(value)await FssUpdateAction('auto_update_changed')}
 let message=error|| (status?.stage==='downloading'?t('正在下載更新…','Downloading update…'):status?.stage==='installing'?t('正在安裝更新，程式將重新啟動。','Installing; the application will restart.'):status?.stage==='error'?t('更新未完成，請重試或至發行頁下載。','Update failed. Retry or download from Releases.'):busy?t('正在檢查更新…','Checking for updates…'):status?.version?status.available?t('有新版本：','New version: ')+status.version:t('已是最新版本','You are up to date'):'');
 return z.jsxs('section',{className:'fss-support-updates',children:[z.jsxs('div',{className:'fss-update-buttons',children:[z.jsx(Ht,{icon:z.jsx(FssDeviceGlyph,{name:'refresh'}),disabled:busy,onClick:()=>action(false),children:t('查看更新','View updates')}),z.jsx(Ht,{icon:z.jsx(FssDeviceGlyph,{name:'download'}),appearance:'primary',disabled:busy||!status?.available||!status?.canInstall,onClick:()=>action(true),children:t('更新','Update')})]}),z.jsx('p',{role:'status',children:message}),z.jsx(Qe,{label:t('自動更新','Automatic updates'),hint:t('自動下載並安裝新版，保留原有設定。','Download and install new versions automatically, retaining settings.'),children:z.jsx($t,{checked:auto,disabled:busy,onChange:(e,data)=>changeAuto(data.checked)})})]});
}
