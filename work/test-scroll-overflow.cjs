const vm=require('vm'),assert=require('assert'),fs=require('fs');
const js=fs.readFileSync('work/current-ui-patched.js','utf8');
const helper=js.slice(js.indexOf('function fssWheelScrollsList'),js.indexOf('function Tw('));
class Element{constructor(parent,h,s,overflow){this.parentElement=parent;this.clientHeight=h;this.scrollHeight=s;this.overflowY=overflow}}
const ctx={Element,getComputedStyle:e=>e};vm.createContext(ctx);vm.runInContext(helper,ctx);
for(const count of [1,10,50,100]){const scroll=new Element(null,600,count*60,'auto'),target=new Element(scroll,26,26,'visible');assert.equal(ctx.fssWheelScrollsList({target}),count*60>601);assert.equal(ctx.fssWheelScrollsList({target,altKey:true}),false)}
const hidden=new Element(null,600,6000,'hidden');assert.equal(ctx.fssWheelScrollsList({target:hidden}),false);
assert.equal(ctx.fssWheelScrollsList({target:{}}),false);
console.log('PASS: 1/10/50/100 rows, overflow wheel routing, Alt-volume override and non-scroll containers');
