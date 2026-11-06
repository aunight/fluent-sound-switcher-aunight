function FssUpdateNotice(){
 const {i18n}=Tt(),zh=i18n.language.startsWith('zh'),[release,setRelease]=x.useState(null),seen=x.useRef('');
 async function dismiss(skip){if(release.manual&&!release.available){setRelease(null);return}const prefs=await Mc.load('update-preferences.json',{autoSave:false});if(skip)await prefs.set('skip',release.version);else await prefs.set('remindAfter',Date.now()+86400000);await prefs.save();setRelease(null)}
 x.useEffect(()=>{let live=true,busy=false;
  async function check(){if(busy)return;busy=true;try{const store=await Mc.load('update-status.json',{autoSave:false});await store.reload();if(!await store.get('available')||await store.get('stage')!=='ready'||Date.now()-Number(await store.get('checkedAt'))>86400000)return;const version=await store.get('version');if(version===seen.current)return;
   const prefs=await Mc.load('update-preferences.json',{autoSave:false});if(await prefs.get('autoUpdate')||await prefs.get('skip')===version||Number(await prefs.get('remindAfter'))>Date.now())return;
   const url=await store.get('url');if(!url?.startsWith('https://github.com/aunight/fluent-sound-switcher-aunight/releases/tag/'))return;
   const data={version,url,available:true,notes:await store.get('notes')};if(live){seen.current=version;await XD('show');setRelease(data)}
  }catch{}finally{busy=false}}
  const show=e=>{seen.current=e.detail.version;setRelease({...e.detail,manual:true})};window.addEventListener('fss-release-notes',show);
  const start=setTimeout(check,10000),timer=setInterval(check,60000);return()=>{live=false;clearTimeout(start);clearInterval(timer);window.removeEventListener('fss-release-notes',show)};
 },[]);
 if(!release)return null;
 return z.jsx(Oh,{open:true,onOpenChange:(e,d)=>{if(!d.open)dismiss(false)},children:z.jsx(Lh,{className:'fss-update-surface',children:z.jsxs(Fh,{children:[z.jsx(Hh,{children:release.available?(zh?'有新版本可更新':'Update available'):(zh?'已是最新版本':'You are up to date')}),z.jsxs(qh,{children:[z.jsx('strong',{children:release.version}),z.jsx('h3',{children:zh?'更新日誌':'Release notes'}),z.jsx('div',{className:'fss-update-notes',tabIndex:0,children:release.notes||'—'})]}),z.jsxs(Mh,{children:[release.available&&z.jsx(Ht,{appearance:'subtle',onClick:()=>dismiss(true),children:zh?'略過此版本':'Skip version'}),z.jsx(Ht,{onClick:()=>dismiss(false),children:release.available?(zh?'稍後提醒':'Later'):(zh?'關閉':'Close')}),release.available&&z.jsx(Ht,{appearance:'primary',onClick:()=>{FssUpdateAction('update_install');dismiss(false)},children:zh?'更新':'Update'})]})]})})});
}
