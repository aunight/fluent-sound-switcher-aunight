function FssUseGlass(){
 const[enabled,setEnabled]=x.useState(false),[error,setError]=x.useState(''),[tint,setTint]=x.useState(false);
 x.useEffect(()=>{let alive=true;Mc.load('appearance.json',{autoSave:!1}).then(async store=>{await store.reload().catch(()=>{});const v=await store.get('win7Glass'),c=await store.get('accentGlass');if(alive){setEnabled(v===true);setTint(c===true)}}).catch(()=>{});return()=>{alive=false}},[]);
 Vt('fss-glass-changed',event=>setEnabled(event.payload===true));
 Vt('fss-glass-tint-changed',event=>setTint(event.payload===true));
 async function save(key,value,event,set){try{const store=await Mc.load('appearance.json',{autoSave:!1});await store.reload().catch(()=>{});await store.set(key,value);await store.save();set(value);setError('');await Ih(event,value)}catch(e){setError('外觀設定儲存失敗。')}}
 return[enabled,value=>save('win7Glass',value,'fss-glass-changed',setEnabled),error,tint,value=>save('accentGlass',value,'fss-glass-tint-changed',setTint)];
}
function FssGlassOption(){
 const[enabled,change,error,tint,changeTint]=FssUseGlass(),{i18n}=Tt(),zh=i18n.language.startsWith('zh'),t=(a,b)=>zh?a:b;
 return z.jsxs(z.Fragment,{children:[z.jsx(Qe,{label:t('Win7 玻璃質感','Win7 glass'),hint:t('反光紋理與透明玻璃底；切換後立即套用。','Reflective glass.'),children:z.jsx($t,{checked:enabled,onChange:(event,data)=>change(data.checked)})}),z.jsx(Qe,{label:t('主色玻璃','Accent-colored glass'),hint:t('以目前主色為玻璃染色；關閉時使用系統底色。','Tint glass with the current accent color.'),children:z.jsx($t,{checked:tint,disabled:!enabled,onChange:(event,data)=>changeTint(data.checked)})}),error?z.jsx('div',{role:'alert',children:error}):null]});
}
