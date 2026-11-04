function FssContextIcon({name}) {
  if(name==='refresh')return z.jsx(gh,{className:'fss-app-context-icon','aria-hidden':true});
  const paths={
    pin:'M9 3h6M10 3v7l-4 4v3h12v-3l-4-4V3M12 17v5',
    mute:'M11 5 6 9H3v6h3l5 4V5M16 9l5 6M21 9l-5 6',
    volume:'M11 5 6 9H3v6h3l5 4V5M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14',
    switch:'M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4',
    ignore:'m3 3 18 18M10 5.2c5-1.3 9 3.3 11 6.8a18 18 0 0 1-3 4M6.6 6.6A19 19 0 0 0 2 12c3 5 7.5 8 12.8 5.8M10 10a3 3 0 0 0 4 4',
    apps:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    restore:'M3 5v6h6M4 11a8 8 0 1 1 1 7',
    refresh:'M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 2M4 17l2 2a8 8 0 0 0 13-3',
    device:'M3 4h18v12H3zM8 20h8M12 16v4'
  };
  return z.jsx('svg',{className:'fss-app-context-icon',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true,children:z.jsx('path',{d:paths[name]||paths.apps})});
}
function FssAppContextMenu({context,devices,onClose,onRefresh,onMute,onRoute}) {
  const ref=x.useRef(null),[expanded,setExpanded]=x.useState(''),[busy,setBusy]=x.useState(false),[error,setError]=x.useState('');
  const session=context.session,ignored=Object.entries(fssOrders.ignored);
  const pinned=session && (fssOrders.pinned[session.deviceId]||[]).includes(session.fssOrderKey);
  x.useLayoutEffect(()=>{
    const menu=ref.current;if(!menu)return;
    const rect=menu.getBoundingClientRect();
    menu.style.left=Math.max(8,Math.min(context.x,innerWidth-rect.width-8))+'px';
    menu.style.top=Math.max(8,Math.min(context.y,innerHeight-rect.height-8))+'px';
  },[context,expanded,error]);
  x.useEffect(()=>{
    const outside=event=>{if(!ref.current?.contains(event.target))onClose()};
    const keyboard=event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();return}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
      const buttons=[...ref.current.querySelectorAll('button:not(:disabled)')];
      if(!buttons.length)return;event.preventDefault();
      const current=buttons.indexOf(document.activeElement);
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(current+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
      buttons[next].focus();
    };
    document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',keyboard,true);window.addEventListener('blur',onClose);
    ref.current?.querySelector('button')?.focus({preventScroll:true});
    return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',keyboard,true);window.removeEventListener('blur',onClose)};
  },[]);
  const action=async callback=>{if(busy)return;setBusy(true);setError('');try{await callback();onRefresh();onClose()}catch(e){setError(String(e));setBusy(false)}};
  const item=(label,click,options={})=>z.jsxs('button',{type:'button',role:options.checked===undefined?'menuitem':'menuitemcheckbox','aria-checked':options.checked,disabled:busy||options.disabled,onClick:click,children:[z.jsx(FssContextIcon,{name:options.icon||'apps'}),z.jsx('span',{className:'fss-app-context-label',children:label})]},options.key||label);
  const children=[];
  if(session){
    children.push(z.jsxs('div',{className:'fss-app-context-title',children:[session.icon?z.jsx('img',{src:session.icon,alt:'',className:'fss-app-context-artwork'}):z.jsx(FssContextIcon,{name:'apps'}),z.jsx('span',{children:session.name})]},'title'));
    children.push(item(pinned?'取消置頂':'置頂',()=>action(()=>fssWritePreferences(prefs=>{
      const keys=prefs.pinned[session.deviceId]||[];
      prefs.pinned[session.deviceId]=pinned?keys.filter(key=>key!==session.fssOrderKey):[...keys,session.fssOrderKey];
    })),{checked:!!pinned,icon:'pin'}));
    children.push(item(session.muted?'取消靜音':'靜音',()=>action(()=>onMute(session)),{checked:!!session.muted,icon:session.muted?'volume':'mute'}));
    if(session.pid!==0){
      children.push(item('切換輸出裝置 ▸',()=>setExpanded(expanded==='devices'?'':'devices'),{icon:'switch'}));
      if(expanded==='devices')children.push(z.jsx('div',{role:'group','aria-label':'切換輸出裝置',className:'fss-app-context-submenu',children:devices.map(device=>item(device.name,()=>action(()=>onRoute(session,device.id)),{disabled:device.id===session.deviceId,key:device.id,icon:'device'}))},'devices'));
      children.push(item('忽略此應用程式',()=>action(()=>fssWritePreferences(prefs=>{prefs.ignored={...prefs.ignored,[fssAppIdentity(session)]:session.name}})),{icon:'ignore'}));
    }
  }
  if(ignored.length){
    children.push(z.jsx('div',{role:'separator',className:'fss-app-context-separator'},'separator'));
    children.push(item('已忽略的應用程式（'+ignored.length+'） ▸',()=>setExpanded(expanded==='ignored'?'':'ignored'),{icon:'apps'}));
    if(expanded==='ignored')children.push(z.jsx('div',{role:'group','aria-label':'恢復已忽略的應用程式',className:'fss-app-context-submenu',children:ignored.map(([key,name])=>item('恢復 '+name,()=>action(()=>fssWritePreferences(prefs=>{const next={...prefs.ignored};delete next[key];prefs.ignored=next})),{key,icon:'restore'}))},'ignored'));
  }
  children.push(item('重新整理',()=>{onRefresh();onClose()},{icon:'refresh'}));
  if(error)children.push(z.jsx('div',{role:'alert',className:'fss-app-context-error',children:error},'error'));
  return z.jsx('div',{ref,role:'menu','aria-label':session?session.name+' 常用功能':'混音器常用功能',className:'fss-app-context',onContextMenu:event=>event.preventDefault(),onPointerDown:event=>event.stopPropagation(),style:{left:context.x,top:context.y},children});
}
