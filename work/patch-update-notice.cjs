module.exports=function(js){
 const start=js.indexOf('function YO('),end=js.indexOf('function bg(',start);let part=js.slice(start,end);
 const anchor='children:z.jsx(AO,{';if(!part.includes(anchor)||!part.endsWith('})})}'))throw Error('Main provider anchor missing');
 part=part.replace(anchor,'children:z.jsxs(z.Fragment,{children:[z.jsx(AO,{');
 part=part.slice(0,-5)+'}),z.jsx(FssUpdateNotice,{})]})})}';
 return js.slice(0,start)+part+js.slice(end)+'\n'+require('fs').readFileSync('work/fss-update-notice.js','utf8');
};
