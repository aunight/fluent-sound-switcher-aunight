const assert=require('assert'),vm=require('vm');const patch=require('./patch-favorite-disabled.cjs');
const signature='[r.filter(V=>V.direction==="output"&&V.state==="active"),r.filter(V=>V.direction==="input"&&V.state==="active")]';
const r=[];for(const direction of ['output','input'])for(const state of ['active','disabled','unplugged'])for(const favorite of [false,true])r.push({id:direction+state+favorite,direction,state,favorite});
const h={output:r.filter(d=>d.direction==='output'&&d.favorite).map(d=>d.id),input:r.filter(d=>d.direction==='input'&&d.favorite).map(d=>d.id)};
const actual=vm.runInNewContext(patch(signature),{r,h});for(let i=0;i<2;i++){const expected=r.filter(d=>d.direction===(i?'input':'output')&&(d.favorite&&(d.state==='active'||d.state==='disabled')));assert.equal(JSON.stringify(actual[i]),JSON.stringify(expected));}
console.log('PASS: active devices, disabled favorites, hidden nonfavorites, disconnected devices and input/output isolation');

const empty=vm.runInNewContext(patch(signature),{r,h:{output:[],input:[]}});
assert.equal(JSON.stringify(empty[0]),JSON.stringify(r.filter(d=>d.direction==='output'&&d.state==='active')));
assert.equal(JSON.stringify(empty[1]),JSON.stringify(r.filter(d=>d.direction==='input'&&d.state==='active')));
console.log('PASS: favorites-only lists include disabled favorites; no-favorites fallback shows active devices');
