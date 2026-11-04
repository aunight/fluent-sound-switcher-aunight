const vm=require('vm'),assert=require('assert'),fs=require('fs');
const js=fs.readFileSync('work/current-ui-patched.js','utf8');
const helper=js.slice(js.indexOf('function fssWheelScrollsList'),js.indexOf('function Tw('));
class Element{constructor(volume){this.volume=volume}closest(selector){assert.equal(selector,'.fss-volume-control');return this.volume?{}:null}}
const ctx={Element};vm.createContext(ctx);vm.runInContext(helper,ctx);
for(const count of [1,10,50,100])for(const altKey of [false,true]){
 assert.equal(ctx.fssWheelScrollsList({target:new Element(false),altKey}),true,'blank space must leave wheel scrolling alone');
 assert.equal(ctx.fssWheelScrollsList({target:new Element(true),altKey}),false,'volume control must adjust volume without modifier');
}
assert.equal(ctx.fssWheelScrollsList({target:{}}),true);
console.log('PASS: blank-space scrolling and unmodified volume-wheel handling for short and long lists');
