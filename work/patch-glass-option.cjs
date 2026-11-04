const fs=require('fs');
module.exports=function(js){
 if(js.includes('/* fss-glass-option-v1 */'))return js;
 const hook='function Yw(e){';
 if(!js.includes(hook))throw Error('Appearance root missing');
 js=js.replace(hook,'function Yw(e){const[glass]=FssUseGlass();x.useEffect(()=>{document.documentElement.dataset.fssGlass=glass?"win7":"system"},[glass]);');
 const anchor='z.jsx(Qe,{label:f("settings.systemAccent")';
 if(!js.includes(anchor))throw Error('Appearance settings missing');
 js=js.replace(anchor,'z.jsx(FssGlassOption,{}),'+anchor);
 return js+'\n/* fss-glass-option-v1 */\n'+fs.readFileSync('work/fss-glass-option.js','utf8');
};
