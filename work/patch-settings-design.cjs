module.exports=function(js){
 if(js.includes('/* fss-settings-design-v1 */'))return js;
 const replace=(a,b)=>{if(!js.includes(a))throw Error('Settings anchor missing: '+a.slice(0,80));js=js.replace(a,b)};
 replace('function YO({themePref:e,accent:n,titleBar:r}){','function YO({themePref:e,accent:n,titleBar:r}){');
 const anchor='h=Kw(c),{theme:m,isDark:v}=Ww(i,h);Yw(v);';
 replace(anchor,anchor+'x.useEffect(()=>{const root=document.documentElement;root.style.setProperty("--fss-accent",h.palette?.accent??m.colorBrandBackground);root.style.setProperty("--fss-accent-dark",h.palette?.dark1??m.colorBrandBackgroundHover);root.style.setProperty("--fss-accent-light",h.palette?.light2??m.colorBrandForeground2)},[h.palette,m]);');
 replace('className:i.row,children:[z.jsxs("div",{className:i.text','className:"fss-settings-row "+i.row,children:[z.jsxs("div",{className:i.text');
 replace('function SO(e){const n=xO(),','/* fss-settings-design-v1 */function SO(e){const n=xO(),');
 const start=js.indexOf('function SO(e){'),end=js.indexOf('function $w()',start);
 let part=js.slice(start,end);
 part=part.replace('[i,l]=x.useState("general");return','[i,l]=x.useState("general"),[closing,setClosing]=x.useState(false),closeTimer=x.useRef(null);x.useEffect(()=>()=>clearTimeout(closeTimer.current),[]);x.useEffect(()=>{if(e.open){clearTimeout(closeTimer.current);setClosing(false)}},[e.open]);function requestClose(){if(closing)return;setClosing(true);closeTimer.current=setTimeout(()=>{e.onOpenChange(false)},window.matchMedia("(prefers-reduced-motion: reduce)").matches?0:160)}return');
 part=part.replace('onOpenChange:(c,u)=>e.onOpenChange(u.open)','onOpenChange:(c,u)=>u.open?e.onOpenChange(true):requestClose()');
 part=part.replace('Lh,{className:n.surface','Lh,{className:"fss-settings-surface "+n.surface');
 part=part.replace('"fss-settings-surface "+n.surface','"fss-settings-surface "+(closing?"fss-settings-leaving ":"")+n.surface');
 part=part.replace('Fh,{className:n.body','Fh,{className:"fss-settings-body "+n.body');
 part=part.replace('Hh,{children:r("settings.title")','Hh,{children:r(`settings.tabs.${i}`)');
 part=part.replace('Dh,{selectedValue:i','Dh,{vertical:!0,className:"fss-settings-nav",selectedValue:i');
 part=part.replace('jc,{value:c,children:r(`settings.tabs.${c}`)','jc,{value:c,icon:z.jsx(FssSettingsIcon,{name:c}),children:r(`settings.tabs.${c}`)');
 part=part.replace('qh,{className:n.content','qh,{key:i,className:"fss-settings-content "+n.content');
 part=part.replace('i==="support"&&z.jsx(bO,{})','i==="support"&&z.jsxs(z.Fragment,{children:[z.jsx(bO,{}),z.jsxs("section",{className:"fss-settings-credits","aria-labelledby":"fss-credits-title",children:[z.jsx("h3",{id:"fss-credits-title",children:"Credits"}),z.jsxs("dl",{children:[z.jsx("dt",{children:"原始開發者"}),z.jsx("dd",{children:"Gabriel Leocadio"}),z.jsx("dt",{children:"修改者"}),z.jsx("dd",{children:"AuNight"})]})]})]})');
 part=part.replace('z.jsx(Mh,{children:','z.jsx(Mh,{className:"fss-settings-close-wrap",children:');
 part=part.replace('Ht,{appearance:"secondary",children:r("common.close")','Ht,{className:"fss-settings-close",appearance:"subtle",icon:z.jsx(FssSettingsIcon,{name:"close"}),"aria-label":r("common.close"),title:r("common.close")');
 js=js.slice(0,start)+part+js.slice(end);
 return js+'\nfunction FssSettingsIcon({name}){if(name==="mute")return z.jsxs("svg",{className:"fss-settings-icon",viewBox:"0 0 20 20",width:18,height:18,fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round","aria-hidden":true,children:[z.jsx("rect",{x:2,y:4,width:16,height:12,rx:2}),z.jsx("circle",{cx:10,cy:10,r:2,fill:"currentColor",stroke:"none"})]});const icons={general:"\\uE713",hotkeys:"\\uE765",volume:"\\uE767",notifications:"\\uE7F4",support:"\\uE897",close:"\\uE8BB"};return z.jsx("span",{className:"fss-settings-icon","aria-hidden":true,children:icons[name]||icons.general})}\n';
};


