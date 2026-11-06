function FssAsioSummary(){
 const {i18n}=Tt(),zh=i18n.language.startsWith('zh'),[data,setData]=x.useState([]);
 x.useEffect(()=>{let live=true;
  async function read(){try{
   const s=await Mc.load('asio-status.json',{autoSave:false});await s.reload();
   const stamp=await s.get('timestamp'),apps=await s.get('apps'),telemetry=await fssReadSessionTelemetry().catch(()=>null);
   const sessions=telemetry&&Date.now()-telemetry.timestamp<5000?Object.values(telemetry.sessionStatus||{}):[];
   if(live)setData(Date.now()-stamp<30000?(apps||[]).filter(app=>!sessions.some(session=>session.pid===app.pid)):[]);
  }catch{}}
  read();const timer=setInterval(read,1500);return()=>{live=false;clearInterval(timer)};
 },[]);
 if(!data.length)return null;
 return z.jsx('div',{className:'fss-asio-rows',children:data.map(app=>z.jsxs('div',{className:'fss-asio-row',children:[
  app.icon?z.jsx('img',{src:app.icon,alt:'',width:28,height:28,draggable:false}):z.jsx(o1,{}),
  z.jsxs('div',{children:[z.jsx('strong',{children:app.name}),z.jsx('small',{children:(app.current||(app.loaded||[]).join(' · '))+(!app.current?(zh?'（已載入）':' (loaded)'):'')}),z.jsx(FssAsioLevel,{pid:app.pid,zh})]})
 ]},app.pid))});
}
function FssAsioLevel({pid,zh}){
 const ref=x.useRef(null),[ready,setReady]=x.useState(false);
 x.useEffect(()=>{let stopped=false,busy=false,meter,control,asioControl,nextBeat=0,lastReady=false;
  async function tick(){if(stopped||busy)return;busy=true;try{
   if(document.hidden||!await ql().isVisible())return;
   control??=await Mc.load('app-meter-control.json',{autoSave:false});if(Date.now()>=nextBeat){await control.set('until',Date.now()+3000);await control.save();asioControl??=await Mc.load('asio-meter-control.json',{autoSave:false});await asioControl.set('until',Date.now()+3000);await asioControl.save();nextBeat=Date.now()+1000}
   meter??=await Mc.load('asio-level.json',{autoSave:false});await meter.reload();const peak=(await meter.get('asioPeaks'))?.[pid];if(stopped)return;
   const available=!!peak&&Date.now()-peak.timestamp<1000&&Number.isFinite(peak.peak);
   if(available!==lastReady){lastReady=available;setReady(available)}
   if(ref.current)ref.current.style.width=(available?Math.max(0,Math.min(1,peak.peak))*100:0)+'%';
  }catch{}finally{busy=false}}
  tick();const timer=setInterval(tick,40);return()=>{stopped=true;clearInterval(timer)};
 },[pid]);
 return z.jsxs('div',{className:'fss-asio-level','data-ready':ready,children:[z.jsx('span',{className:'fss-asio-level-track','aria-hidden':true,children:z.jsx('span',{ref,className:'fss-asio-level-fill'})}),z.jsx('small',{children:ready?(zh?'ASIO · 程式主輸出音量 · 僅顯示':'ASIO · application master meter · read only'):(zh?'ASIO · 等待程式音量資料連接':'ASIO · waiting for application meter connection')})]});
}
