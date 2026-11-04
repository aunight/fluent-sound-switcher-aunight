function fssUseInputPeak(deviceId,muted,ref){
 x.useEffect(()=>{
  if(!deviceId)return;let stopped=false,busy=false,meter,control,nextBeat=0;
  const reset=()=>{const bar=ref.current?.querySelector('.fss-track-motion');if(bar)bar.style.width='0px';if(ref.current)ref.current.dataset.inputPeak='0'};
  const tick=async()=>{if(stopped||busy)return;busy=true;try{
   if(document.hidden||!await ql().isVisible()){reset();return}
   control??=await Mc.load('app-meter-control.json',{autoSave:false});
   if(Date.now()>=nextBeat){await control.set('until',Date.now()+3000);await control.save();nextBeat=Date.now()+1000}
   meter??=await Mc.load('app-meter.json',{autoSave:false});await meter.reload();
   const [stamp,inputs]=await Promise.all([meter.get('timestamp'),meter.get('inputPeaks')]);if(stopped)return;
   const fresh=Number.isFinite(stamp)&&Date.now()-stamp>=-1000&&Date.now()-stamp<600;
   const raw=fresh&&!muted?inputs?.[deviceId]:0;const peak=Number.isFinite(raw)?Math.max(0,Math.min(1,raw)):0;
   if(ref.current)ref.current.dataset.inputPeak=String(peak);
   const bar=ref.current?.querySelector('.fss-track-motion');if(bar)bar.style.width=(peak*100)+'%';
  }catch{reset()}finally{busy=false}};
  tick();const timer=setInterval(tick,60);return()=>{stopped=true;clearInterval(timer);reset()};
 },[deviceId,muted,ref]);
}
