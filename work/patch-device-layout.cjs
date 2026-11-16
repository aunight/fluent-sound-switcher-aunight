module.exports=function(js){
 const gear='z.jsx("button",{type:"button",className:"fss-panel-settings","aria-label":"開啟主視窗",title:"開啟主視窗",onClick:()=>{vj().then(()=>XD("show")).catch(console.error)},children:z.jsx(dh,{})})';
 if(!js.includes(gear+','))throw Error('Panel gear anchor missing');
 js=js.replace(gear+',','');
 let count=0;
 js=js.replace(/z.jsx\("div",\{className:(\w+).groupHeading,children:z.jsx\("h2",\{className:\1.groupLabel,children:(\w+)\}\)\}\)/g,(_,a,b)=>{count++;return 'z.jsxs("div",{className:'+a+'.groupHeading,children:[z.jsx("h2",{className:'+a+'.groupLabel,children:'+b+'}),'+gear+']})'});
 if(count!==1)throw Error('Panel heading anchor mismatch: '+count);
 return js;
};
