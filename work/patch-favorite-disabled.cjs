module.exports=function(js){
 for(const [flow,favorites] of [['output','h.output'],['input','h.input']]){
  const old='r.filter(V=>V.direction==="'+flow+'"&&V.state==="active")';
  const replacement='r.filter(V=>V.direction==="'+flow+'"&&('+favorites+'.length?'+favorites+'.includes(V.id)&&(V.state==="active"||V.state==="disabled"):V.state==="active"))';
  if(js.split(old).length!==2)throw Error('Favorite device filter missing: '+flow);
  js=js.replace(old,replacement);
 }
 return js;
};
