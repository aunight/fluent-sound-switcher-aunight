const fs=require('fs'),vm=require('vm'),assert=require('assert');
(async()=>{
 let effect,clean,frame,hidden=false,visible=true,stamp=Date.now(),inputs={mic:0.42,other:0.9},muted=false;
 const bar={style:{}},ref={current:{dataset:{},querySelector:()=>bar}},store={set:async()=>{},save:async()=>{},reload:async()=>{},get:async k=>k==='timestamp'?stamp:inputs};
 const ctx={x:{useEffect:f=>effect=f},Mc:{load:async()=>store},ql:()=>({isVisible:async()=>visible}),document:{get hidden(){return hidden}},Date,Math,Number,setInterval:f=>(frame=f,1),clearInterval:()=>{}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('work/fss-input-meter.js','utf8'),ctx);
 const flush=()=>new Promise(r=>setImmediate(r));
 const mount=async mute=>{ctx.fssUseInputPeak('mic',mute,ref);clean=effect();await flush()};
 await mount(false);assert.equal(bar.style.width,'42%');
 inputs={mic:0,other:1};await frame();assert.equal(bar.style.width,'0%','other device cannot move microphone meter');
 inputs={mic:1};stamp=Date.now()-1000;await frame();assert.equal(bar.style.width,'0%','stale sample');
 stamp=Date.now();clean();await mount(true);assert.equal(bar.style.width,'0%','muted');clean();await mount(false);assert.equal(bar.style.width,'100%');
 visible=false;await frame();assert.equal(bar.style.width,'0px','closed window');visible=true;hidden=true;await frame();assert.equal(bar.style.width,'0px','hidden document');hidden=false;
 inputs={mic:NaN};await frame();assert.equal(bar.style.width,'0%','invalid value');clean();assert.equal(bar.style.width,'0px');
 console.log('PASS: microphone device isolation, live level, silence, mute, stale/invalid samples and hidden-window cleanup');
})().catch(e=>{console.error(e);process.exit(1)});
