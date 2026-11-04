const assert=require('assert'),vm=require('vm');const patch=require('./patch-favorite-disabled.cjs');
const signature='[r.filter(V=>V.direction==="output"&&V.state==="active"),r.filter(V=>V.direction==="input"&&V.state==="active")]';
const r=[];for(const direction of ['output','input'])for(const state of ['active','disabled','unplugged'])for(const favorite of [false,true])r.push({id:direction+state+favorite,direction,state,favorite});
const h={output:r.filter(d=>d.direction==='output'&&d.favorite).map(d=>d.id),input:r.filter(d=>d.direction==='input'&&d.favorite).map(d=>d.id)};
const actual=vm.runInNewContext(patch(signature),{r,h});for(let i=0;i<2;i++){const expected=r.filter(d=>d.direction===(i?'input':'output')&&(d.state==='active'||d.state==='disabled'&&d.favorite));assert.equal(JSON.stringify(actual[i]),JSON.stringify(expected));}
console.log('PASS: active devices, disabled favorites, hidden nonfavorites, disconnected devices and input/output isolation');
