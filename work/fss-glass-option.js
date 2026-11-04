function FssUseGlass(){
 const[enabled,setEnabled]=x.useState(true);
 const[error,setError]=x.useState('');
 x.useEffect(()=>{let alive=true;Mc.load('appearance.json',{autoSave:!1}).then(async store=>{await store.reload().catch(()=>{});const v=await store.get('win7Glass');if(alive)setEnabled(v!==false)}).catch(()=>{});return()=>{alive=false}},[]);
 Vt('fss-glass-changed',event=>setEnabled(event.payload===true));
 async function change(value){
  try{const store=await Mc.load('appearance.json',{autoSave:!1});await store.reload().catch(()=>{});await store.set('win7Glass',value);await store.save();setEnabled(value);setError('');await Ih('fss-glass-changed',value)}
  catch(e){setError('外觀設定儲存失敗，請再試一次。')}
 }
 return[enabled,change,error];
}
function FssGlassOption(){
 const[enabled,change,error]=FssUseGlass();
 return z.jsxs(z.Fragment,{children:[z.jsx(Qe,{label:'Win7 玻璃質感',hint:'反光紋理與透明玻璃底；切換後立即套用。',children:z.jsx($t,{checked:enabled,onChange:(event,data)=>change(data.checked)})}),error?z.jsx('div',{role:'alert',children:error}):null]});
}
