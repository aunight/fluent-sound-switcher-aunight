module.exports=function(js){
 const url=process.env.FSS_RELEASE_URL;
 if(!url||!/^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+\/releases$/.test(url))throw Error('FSS_RELEASE_URL must be a GitHub repository releases URL');
 const langAnchor='function bO(){const{t:e}=Tt(),n=vO()';
 if(!js.includes(langAnchor))throw Error('Support language anchor missing');
 js=js.replace(langAnchor,'function bO(){const{t:e,i18n:fssLanguage}=Tt(),n=vO()');
 const old='z.jsx(Qe,{label:e("support.checkUpdates"),hint:e("support.checkUpdatesHint"),children:z.jsx(Ht,{icon:z.jsx(gh,{}),appearance:"primary",disabled:l,onClick:()=>{c(!0),Sj().finally(()=>c(!1))},children:e(l?"support.checking":"support.checkUpdates")})})';
 const replacement='z.jsx(Qe,{label:"GitHub Releases",hint:(fssLanguage.resolvedLanguage||fssLanguage.language||"").startsWith("zh")?"查看此修改版的版本與安裝檔":"View releases and installers for this modified edition",children:z.jsx(Ht,{icon:z.jsxs("svg",{viewBox:"0 0 24 24",width:20,height:20,fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true,children:[z.jsx("path",{d:"M12 3v11m-4-4 4 4 4-4"}),z.jsx("path",{d:"M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"})]}),appearance:"primary",onClick:()=>void iy('+JSON.stringify(url)+'),children:(fssLanguage.resolvedLanguage||fssLanguage.language||"").startsWith("zh")?"更新":"Updates"})})';
 if(!js.includes(old))throw Error('Support update row missing');
 js=js.replace(old,replacement);
 const upstreamIssues='https://github.com/Leocadio94/fluent-sound-switcher/issues';
 if(!js.includes(upstreamIssues))throw Error('Upstream issues link missing');
 js=js.replace(upstreamIssues,url.replace(/\/releases$/,'/issues'));
 const listeners='Vt("update-available",Re=>de(Re.payload.version)),Vt("update-finished",x.useCallback(()=>{Se(!1),de(null)},[]));';
 if(!js.includes(listeners))throw Error('Upstream update listeners missing');
 js=js.replace(listeners,'void 0;');
 return js;
};
