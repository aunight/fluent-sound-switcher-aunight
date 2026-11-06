using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class MMEnumerator {}
[ComImport, Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IDevices {
 [PreserveSig] int EnumAudioEndpoints(int flow, uint mask, out IDeviceCollection devices);
 [PreserveSig] int GetDefaultAudioEndpoint(int flow,int role,out IDevice device);
 [PreserveSig] int GetDevice([MarshalAs(UnmanagedType.LPWStr)]string id,out IDevice device);
 [PreserveSig] int RegisterEndpointNotificationCallback(IntPtr callback);
 [PreserveSig] int UnregisterEndpointNotificationCallback(IntPtr callback);
}
[ComImport, Guid("0BD7A1BE-7A1A-44DB-8397-CC5392387B5E"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IDeviceCollection {
 [PreserveSig] int GetCount(out uint count);
 [PreserveSig] int Item(uint index,out IDevice device);
}
[ComImport, Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IDevice {
 [PreserveSig] int Activate(ref Guid iid,uint context,IntPtr parameters,[MarshalAs(UnmanagedType.IUnknown)]out object result);
 [PreserveSig] int OpenPropertyStore(int access,out IntPtr store);
 [PreserveSig] int GetId([MarshalAs(UnmanagedType.LPWStr)]out string id);
 [PreserveSig] int GetState(out uint state);
}
[ComImport, Guid("77AA99A0-1BD6-484F-8BC7-2C654C9A9B6F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface ISessionManager {
 [PreserveSig] int GetAudioSessionControl(IntPtr session,uint flags,out IntPtr control);
 [PreserveSig] int GetSimpleAudioVolume(IntPtr session,uint flags,out IntPtr volume);
 [PreserveSig] int GetSessionEnumerator(out ISessions sessions);
}
[ComImport, Guid("E2F5BB11-0570-40CA-ACDD-3AA01277DEE8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface ISessions {
 [PreserveSig] int GetCount(out int count);
 [PreserveSig] int GetSession(int index,[MarshalAs(UnmanagedType.IUnknown)]out object session);
}
[ComImport, Guid("BFB7FF88-7239-4FC9-8FA2-07C950BE9C6D"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface ISession {
 [PreserveSig] int GetState(out int state);
 [PreserveSig] int GetDisplayName([MarshalAs(UnmanagedType.LPWStr)]out string name);
 [PreserveSig] int SetDisplayName([MarshalAs(UnmanagedType.LPWStr)]string name,ref Guid context);
 [PreserveSig] int GetIconPath([MarshalAs(UnmanagedType.LPWStr)]out string path);
 [PreserveSig] int SetIconPath([MarshalAs(UnmanagedType.LPWStr)]string path,ref Guid context);
 [PreserveSig] int GetGroupingParam(out Guid group);
 [PreserveSig] int SetGroupingParam(ref Guid group,ref Guid context);
 [PreserveSig] int RegisterAudioSessionNotification(IntPtr events);
 [PreserveSig] int UnregisterAudioSessionNotification(IntPtr events);
 [PreserveSig] int GetSessionIdentifier([MarshalAs(UnmanagedType.LPWStr)]out string id);
 [PreserveSig] int GetSessionInstanceIdentifier([MarshalAs(UnmanagedType.LPWStr)]out string id);
 [PreserveSig] int GetProcessId(out uint pid);
 [PreserveSig] int IsSystemSoundsSession();
 [PreserveSig] int SetDuckingPreference([MarshalAs(UnmanagedType.Bool)]bool optOut);
}
[ComImport, Guid("C02216F6-8C67-4B5B-9D00-D008E73E0064"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IPeak {
 [PreserveSig] int GetPeakValue(out float peak);
 [PreserveSig] int GetMeteringChannelCount(out uint channels);
 [PreserveSig] int GetChannelsPeakValues(uint count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=0)]float[] peaks);
 [PreserveSig] int QueryHardwareSupport(out uint mask);
}
[ComImport, Guid("87CE5498-68D6-44E5-9215-6DA47EF883D8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IVolume {
 [PreserveSig] int SetMasterVolume(float level,ref Guid context);
 [PreserveSig] int GetMasterVolume(out float level);
 [PreserveSig] int SetMute([MarshalAs(UnmanagedType.Bool)]bool mute,ref Guid context);
 [PreserveSig] int GetMute([MarshalAs(UnmanagedType.Bool)]out bool mute);
}

class MeterEntry { public string Key, ProcessName, ProcessPath, Icon; public uint Pid; public object Session; public IPeak Meter; public IVolume Volume; }
class FluentAppMeter {
 [DllImport("user32.dll", CharSet = CharSet.Unicode)]
 static extern int PrivateExtractIcons(string lpszFile, int nIconIndex, int cxIcon, int cyIcon, IntPtr[] phicon, int[] piconid, int nIcons, int flags);
 [DllImport("user32.dll")]
 static extern bool DestroyIcon(IntPtr hIcon);
 static readonly string SysIcon = GetSystemSoundIcon();
 static string GetSystemSoundIcon(){
  try{
   string path=Path.Combine(Environment.SystemDirectory,"AudioSrv.Dll");
   IntPtr[] icons=new IntPtr[1];int[] ids=new int[1];
   if(PrivateExtractIcons(path,-203,32,32,icons,ids,1,0)>0&&icons[0]!=IntPtr.Zero){
    using(var ico=System.Drawing.Icon.FromHandle(icons[0]))using(var bmp=ico.ToBitmap())using(var ms=new MemoryStream()){
     bmp.Save(ms,System.Drawing.Imaging.ImageFormat.Png);
     DestroyIcon(icons[0]);
     return "data:image/png;base64,"+Convert.ToBase64String(ms.ToArray());
    }
   }
  }catch{}
  return null;
 }
 static readonly JavaScriptSerializer Json=new JavaScriptSerializer();
 static readonly string Dir=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"com.fluentsoundswitcher.app");
 static readonly string Control=Path.Combine(Dir,"app-meter-control.json");
 static readonly string ActionFile=Path.Combine(Dir,"app-meter-action.json");
 static readonly string Output=Path.Combine(Dir,"app-meter.json");
 static readonly string Error=Path.Combine(Dir,"app-meter-error.log");
 static bool? PublishedTheme;
 static void PublishWindowsTheme(){
  try{
   using(var key=Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize")){
    object value=key==null?null:key.GetValue("AppsUseLightTheme");
    bool dark=value!=null&&Convert.ToInt32(value)==0;
    if(PublishedTheme==dark)return;
    SafeWrite(Path.Combine(Dir,"system-theme.json"),dark?"{\"dark\":true}":"{\"dark\":false}");
    PublishedTheme=dark;
   }
  }catch{}
 }
 static readonly List<MeterEntry> Entries=new List<MeterEntry>(); public static bool HasWindowsSession(int pid){lock(CommandLock){RefreshCore();return Entries.Exists(e=>e.Pid==pid);}}
 static readonly DateTime Epoch=new DateTime(1970,1,1,0,0,0,DateTimeKind.Utc);
 static long Now(){return (long)(DateTime.UtcNow-Epoch).TotalMilliseconds;}
 static void Check(int hr){Marshal.ThrowExceptionForHR(hr);}
 static void Release(object o){if(o!=null&&Marshal.IsComObject(o))Marshal.ReleaseComObject(o);}
 static readonly Dictionary<string,FluentInputPeak> InputMeters=new Dictionary<string,FluentInputPeak>();
 static readonly Dictionary<string,IPeak> OutputMeters=new Dictionary<string,IPeak>();
 static readonly Dictionary<string,object> LastSystemSounds=new Dictionary<string,object>();
 static void Clear(bool inputs=true){lock(CommandLock){if(inputs){foreach(var meter in InputMeters.Values)meter.Dispose();InputMeters.Clear();}foreach(var meter in OutputMeters.Values)Release(meter);OutputMeters.Clear();foreach(var e in Entries)Release(e.Session);Entries.Clear();}}
 static void Refresh(bool inputs=true){lock(CommandLock){RefreshCore();if(inputs)RefreshInputs();}}
 static void RefreshInputs(){
  var active=new HashSet<string>();
  IDevices enumerator=null;IDeviceCollection devices=null;
  try{enumerator=(IDevices)new MMEnumerator();Check(enumerator.EnumAudioEndpoints(1,1,out devices));uint count;Check(devices.GetCount(out count));
   for(uint i=0;i<count;i++){IDevice device=null;object meter=null;try{Check(devices.Item(i,out device));string id;Check(device.GetId(out id));if(!InputMeters.ContainsKey(id))InputMeters[id]=new FluentInputPeak(device);active.Add(id);}catch{}finally{Release(meter);Release(device);}}
  }catch{}finally{Release(devices);Release(enumerator);}
  foreach(var id in new List<string>(InputMeters.Keys))if(!active.Contains(id)){InputMeters[id].Dispose();InputMeters.Remove(id);}
 }
 static void RefreshCore(){
  Clear(false); IDevices enumerator=null;IDeviceCollection devices=null;
  try {
   enumerator=(IDevices)new MMEnumerator();Check(enumerator.EnumAudioEndpoints(0,1,out devices));uint count;Check(devices.GetCount(out count));
   for(uint d=0;d<count;d++){
    IDevice device=null;object managerObject=null;ISessions sessions=null;
    try{
     Check(devices.Item(d,out device));string id;Check(device.GetId(out id));Guid peakIid=typeof(IPeak).GUID;object endpointMeter=null;try{if(device.Activate(ref peakIid,23,IntPtr.Zero,out endpointMeter)==0){IPeak old;if(OutputMeters.TryGetValue(id,out old))Release(old);OutputMeters[id]=(IPeak)endpointMeter;endpointMeter=null;}}catch{}finally{Release(endpointMeter);}Guid iid=typeof(ISessionManager).GUID;
     Check(device.Activate(ref iid,23,IntPtr.Zero,out managerObject));Check(((ISessionManager)managerObject).GetSessionEnumerator(out sessions));int sessionCount;Check(sessions.GetCount(out sessionCount));
     for(int j=0;j<sessionCount;j++){
      object session=null;
      try{Check(sessions.GetSession(j,out session));var info=(ISession)session;uint pid;int state;Check(info.GetProcessId(out pid));Check(info.GetState(out state));
       if(info.IsSystemSoundsSession()==0)pid=0;
       else if(pid==(uint)Process.GetCurrentProcess().Id){Release(session);continue;}
       if(state==2){Release(session);continue;}
       string processName="",processPath="";
       if(pid!=0){try{using(var process=Process.GetProcessById((int)pid)){if(process.HasExited){Release(session);continue;}processName=process.ProcessName;try{processPath=process.MainModule.FileName;}catch{processPath=processName;}}}catch{Release(session);continue;}}
       Entries.Add(new MeterEntry{Key=pid.ToString(CultureInfo.InvariantCulture)+":"+id,Pid=pid,ProcessName=processName,ProcessPath=processPath,Icon=pid==0?SysIcon:ProcessIcon(processPath),Session=session,Meter=(IPeak)session,Volume=(IVolume)session});session=null;
      }catch{Release(session);}
     }
    }catch{}finally{Release(sessions);Release(managerObject);Release(device);}
   }
  }finally{Release(devices);Release(enumerator);}
  var live=new HashSet<uint>();foreach(var entry in Entries)live.Add(entry.Pid);
  foreach(uint pid in new List<uint>(ProcessMeters.Keys)){if(!live.Contains(pid)){ProcessMeters[pid].Dispose();ProcessMeters.Remove(pid);}}
  foreach(uint pid in new List<uint>(ProcessFailures.Keys))if(!live.Contains(pid))ProcessFailures.Remove(pid);
 }
 static readonly Dictionary<string,string> ProcessIcons=new Dictionary<string,string>();
 static string ProcessIcon(string path){string cached;if(ProcessIcons.TryGetValue(path,out cached))return cached;string value=FluentAppIcons.Read(path);if(value!=null)ProcessIcons[path]=value;return value;}
 static readonly Dictionary<uint,FluentProcessPeak> ProcessMeters=new Dictionary<uint,FluentProcessPeak>();
 static readonly Dictionary<uint,long> ProcessFailures=new Dictionary<uint,long>();
 static bool LineAux(string name){return string.Equals(name,"LineCall",StringComparison.OrdinalIgnoreCase)||string.Equals(name,"LineMediaPlayer",StringComparison.OrdinalIgnoreCase);}
 static float OwnProcessPeak(MeterEntry entry,int state){if(state!=1)return 0;FluentProcessPeak meter;if(!ProcessMeters.TryGetValue(entry.Pid,out meter)){long failed;if(ProcessFailures.TryGetValue(entry.Pid,out failed)&&Now()-failed<30000)return 0;try{meter=new FluentProcessPeak(entry.Pid);ProcessMeters[entry.Pid]=meter;}catch(Exception error){ProcessFailures[entry.Pid]=Now();File.WriteAllText(Error,DateTime.UtcNow.ToString("o")+" process peak "+entry.ProcessName+" "+error.GetType().Name);return 0;}}try{return meter.ReadPeak();}catch{meter.Dispose();ProcessMeters.Remove(entry.Pid);ProcessFailures[entry.Pid]=Now();return 0;}}
 static void StopProcessMeters(){lock(CommandLock){foreach(var meter in ProcessMeters.Values)meter.Dispose();ProcessMeters.Clear();}}
 static readonly Dictionary<string,long> LastAudible=new Dictionary<string,long>();
 static string Sample(){lock(CommandLock){return SampleCore();}}
 static string SampleCore(){
  var peaks=new Dictionary<string,float>();
  var systemSounds=new Dictionary<string,object>();foreach(var device in OutputMeters.Keys){object prior;if(LastSystemSounds.TryGetValue(device,out prior))systemSounds[device]=prior;}
  var sessionStatus=new Dictionary<string,object>();
  long sampledAt=Now();
  foreach(var e in Entries){
   int state=2;try{if(((ISession)e.Session).GetState(out state)<0||state==2)continue;}catch{continue;}
   float peak=0;bool muted=false;
   try{if(e.Meter.GetPeakValue(out peak)<0||e.Volume.GetMute(out muted)<0||muted||float.IsNaN(peak)||float.IsInfinity(peak))peak=0;}catch{peak=0;}
   float sessionPeak=peak;
   if(LineAux(e.ProcessName))peak=muted?0:OwnProcessPeak(e,state);
   peak=Math.Max(0,Math.Min(1,peak));
   if(peak>0.0001f)LastAudible[e.Key]=sampledAt;
   long last;LastAudible.TryGetValue(e.Key,out last);
   object prior;long priorLast=0;
   if(sessionStatus.TryGetValue(e.Key,out prior)){var previous=(Dictionary<string,object>)prior;priorLast=Convert.ToInt64(previous["lastAudible"]);}
   float volume=1;try{e.Volume.GetMasterVolume(out volume);}catch{}
   sessionStatus[e.Key]=new Dictionary<string,object>{{"pid",e.Pid},{"deviceId",e.Key.Substring(e.Key.IndexOf(':')+1)},{"name",e.Pid==0?"\u7CFB\u7D71\u97F3\u6548":e.ProcessName=="parsecd"?"Parsec":e.ProcessName},{"volume",volume},{"muted",muted},{"icon",e.Icon},{"active",state==1},{"meterMode",LineAux(e.ProcessName)?"process-render":"session"},{"sessionPeak",sessionPeak},{"renderPeak",peak},{"processName",e.ProcessName},{"processPath",e.ProcessPath},{"state",state},{"alive",true},{"lastAudible",Math.Max(last,priorLast)}};
   float current;if(!peaks.TryGetValue(e.Key,out current)||peak>current)peaks[e.Key]=peak;
   if(e.Key.StartsWith("0:")){
    string devId=e.Key.Substring(2);
    float v=1.0f;bool m=false;
    try{e.Volume.GetMasterVolume(out v);e.Volume.GetMute(out m);}catch{}
    systemSounds[devId]=new Dictionary<string,object>{
     {"pid",0},{"name","\u7CFB\u7D71\u97F3\u6548"},{"deviceId",devId},{"volume",v},{"muted",m},{"active",true},{"icon",SysIcon}
    };
    LastSystemSounds[devId]=systemSounds[devId];
   }
  }
  var inputPeaks=new Dictionary<string,float>();
  foreach(var input in InputMeters){float peak=0;try{peak=input.Value.ReadPeak();if(float.IsNaN(peak)||float.IsInfinity(peak))peak=0;}catch{peak=0;}inputPeaks[input.Key]=Math.Max(0,Math.Min(1,peak));}
  var outputPeaks=new Dictionary<string,float>();foreach(var output in OutputMeters){float peak=0;try{output.Value.GetPeakValue(out peak);}catch{}outputPeaks[output.Key]=float.IsNaN(peak)||float.IsInfinity(peak)?0:Math.Max(0,Math.Min(1,peak));}
  return Json.Serialize(new Dictionary<string,object>{{"asioPeaks",FluentAbletonMeter.Snapshot()},{"outputPeaks",outputPeaks},{"inputPeaks",inputPeaks},{"timestamp",Now()},{"peaks",peaks},{"systemSounds",systemSounds},{"sessionStatus",sessionStatus}});
 }
 static void SafeWrite(string path, string text){
  for(int attempt=0; attempt<5; attempt++){
   try{
    string tmp=path+".tmp";
    using(var fs=new FileStream(tmp,FileMode.Create,FileAccess.Write,FileShare.ReadWrite)){
     using(var sw=new StreamWriter(fs,new UTF8Encoding(false))){
      sw.Write(text);
     }
    }
    if(File.Exists(path)){
     try{File.Delete(path);}catch{}
    }
    File.Move(tmp,path);
    break;
   }catch{
    Thread.Sleep(15);
   }
  }
 }
 static void UpdateSystemSound(string devId, float? vol, bool? mute){
  Refresh();
  bool matched=false;
  foreach(var e in Entries){
   if(e.Key.StartsWith("0:") && (string.IsNullOrEmpty(devId) || e.Key.IndexOf(devId, StringComparison.OrdinalIgnoreCase) >= 0)){
    matched=true;
    Guid empty=Guid.Empty;
    if(vol.HasValue) try{e.Volume.SetMasterVolume(vol.Value,ref empty);}catch{}
    if(mute.HasValue) try{e.Volume.SetMute(mute.Value,ref empty);}catch{}
   }
  }
  if(!matched){
   foreach(var e in Entries){
    if(e.Key.StartsWith("0:")){
     Guid empty=Guid.Empty;
     if(vol.HasValue) try{e.Volume.SetMasterVolume(vol.Value,ref empty);}catch{}
     if(mute.HasValue) try{e.Volume.SetMute(mute.Value,ref empty);}catch{}
    }
   }
  }
  try{SafeWrite(Output, Sample());}catch{}
 }
 static readonly object CommandLock=new object();
 static void CheckAction(){
  if(!File.Exists(ActionFile))return;
  try{
   string text;
   using(var f=new FileStream(ActionFile,FileMode.Open,FileAccess.Read,FileShare.ReadWrite|FileShare.Delete))
   using(var r=new StreamReader(f))text=r.ReadToEnd();
   var obj=Json.Deserialize<Dictionary<string,object>>(text);
   if(obj!=null){
    object act;
    if(obj.TryGetValue("action",out act)&&act!=null&&(act.ToString()=="update_check"||act.ToString()=="update_install"||act.ToString()=="auto_update_changed")){
     string action=act.ToString();try{File.Delete(ActionFile);}catch{SafeWrite(ActionFile,"{}");}
     if(action=="update_install")FluentReleaseCheck.InstallNow();else if(action=="auto_update_changed")FluentReleaseCheck.AutoChanged();else FluentReleaseCheck.CheckNow();return;
    }
    if(obj.TryGetValue("action",out act)&&Convert.ToString(act)=="show_main"){
     FluentGlass.ShowMain();try{File.Delete(ActionFile);}catch{SafeWrite(ActionFile,"{}");}return;
    }
    if(obj.TryGetValue("action",out act)&&Convert.ToString(act)=="hide_main"){
     FluentGlass.HideMain();try{File.Delete(ActionFile);}catch{SafeWrite(ActionFile,"{}");}return;
    }
    if((obj.TryGetValue("action",out act)||obj.TryGetValue("command",out act))&&act!=null&&act.ToString()=="legacy_sound"){
     try{File.Delete(ActionFile);}catch{SafeWrite(ActionFile,"{}");}
     try{Process.Start(new ProcessStartInfo("control.exe","mmsys.cpl"){UseShellExecute=true});}catch{}
    }
   }
  }catch{}
 }
 static void CheckCommands(Dictionary<string,object> obj){
  if(obj==null)return;
  lock(CommandLock){
   bool saveNeeded=false;
   if(obj.ContainsKey("command")){
    obj.Remove("command");
    saveNeeded=true;
   }

   object setVol;
   if(obj.TryGetValue("set_system_sound_volume",out setVol)&&setVol!=null){
    obj.Remove("set_system_sound_volume");
    saveNeeded=true;
    try{
     float newVol=Convert.ToSingle(setVol,CultureInfo.InvariantCulture);
     string devId=obj.ContainsKey("deviceId")&&obj["deviceId"]!=null?obj["deviceId"].ToString():null;
     UpdateSystemSound(devId,newVol,null);
    }catch{}
   }

   object setMute;
   if(obj.TryGetValue("set_system_sound_mute",out setMute)&&setMute!=null){
    obj.Remove("set_system_sound_mute");
    saveNeeded=true;
    try{
     bool newMute=Convert.ToBoolean(setMute);
     string devId=obj.ContainsKey("deviceId")&&obj["deviceId"]!=null?obj["deviceId"].ToString():null;
     UpdateSystemSound(devId,null,newMute);
    }catch{}
   }

   if(saveNeeded){
    try{
     SafeWrite(Control, Json.Serialize(obj));
    }catch{}
   }
  }
 }
 static bool Enabled(){
  try{string text;using(var f=new FileStream(Control,FileMode.Open,FileAccess.Read,FileShare.ReadWrite|FileShare.Delete))using(var r=new StreamReader(f))text=r.ReadToEnd();
   var obj=Json.Deserialize<Dictionary<string,object>>(text);
   CheckCommands(obj);
   object v;return obj.TryGetValue("until",out v)&&Convert.ToInt64(v,CultureInfo.InvariantCulture)>Now();
  }catch{return false;}
 }
 static void Tone(){
  const int rate=48000,seconds=8;using(var mem=new MemoryStream()){
   using(var w=new BinaryWriter(mem,Encoding.ASCII,true)){
    int size=rate*seconds*2;w.Write(Encoding.ASCII.GetBytes("RIFF"));w.Write(size+36);w.Write(Encoding.ASCII.GetBytes("WAVEfmt "));w.Write(16);w.Write((short)1);w.Write((short)1);w.Write(rate);w.Write(rate*2);w.Write((short)2);w.Write((short)16);w.Write(Encoding.ASCII.GetBytes("data"));w.Write(size);
    for(int i=0;i<rate*seconds;i++){double t=(double)i/rate;double a=t<2?.025:t<4?0:t<6?.1:0;w.Write((short)(Math.Sin(2*Math.PI*440*t)*a*32767));}
   }
   mem.Position=0;using(var player=new System.Media.SoundPlayer(mem)){player.Load();player.PlaySync();}
  }
 }
 [MTAThread] static int Main(string[] args){
  if(args.Length==2&&args[0]=="--asio-probe"){try{Directory.CreateDirectory(Dir);string token=Guid.Parse(args[1]).ToString("N");File.WriteAllText(Path.Combine(Dir,"asio-probe-"+token+".json"),Json.Serialize(FluentAsioInfo.Read()));return 0;}catch{return 1;}}
  if(args.Length>0&&args[0]=="--test-tone"){Console.WriteLine(Process.GetCurrentProcess().Id);Tone();return 0;}
  bool sample=args.Length>0&&args[0]=="--sample";bool once=args.Length>0&&args[0]=="--once";
  bool created;using(var mutex=new Mutex(true,@"Local\FluentSoundSwitcherAppMeter"+(sample||once?Process.GetCurrentProcess().Id.ToString():""),out created)){
   if(!created)return 0;Directory.CreateDirectory(Dir);long end=Now()+((sample&&args.Length>1)?int.Parse(args[1])*1000:0),refreshAt=0,leaseAt=0,glassAt=0,appSeen=Now();bool enabled=false;
   FileSystemWatcher watcher=null;
   FileSystemWatcher actionWatcher=null;
   if(!sample&&!once){
    try{
     Action onFile=delegate{
      try{string text;using(var f=new FileStream(Control,FileMode.Open,FileAccess.Read,FileShare.ReadWrite|FileShare.Delete))using(var r=new StreamReader(f))text=r.ReadToEnd();
       var obj=Json.Deserialize<Dictionary<string,object>>(text);CheckCommands(obj);
      }catch{}
     };
     watcher=new FileSystemWatcher(Dir,"app-meter-control.json");
     watcher.NotifyFilter=NotifyFilters.LastWrite|NotifyFilters.Size|NotifyFilters.FileName;
     watcher.Changed+=(s,e)=>onFile();
     watcher.Created+=(s,e)=>onFile();
     watcher.Renamed+=(s,e)=>onFile();
     watcher.EnableRaisingEvents=true;

     Action onAction=delegate{ CheckAction(); };
     actionWatcher=new FileSystemWatcher(Dir,"app-meter-action.json");
     actionWatcher.NotifyFilter=NotifyFilters.LastWrite|NotifyFilters.Size|NotifyFilters.FileName;
     actionWatcher.Changed+=(s,e)=>onAction();
     actionWatcher.Created+=(s,e)=>onAction();
     actionWatcher.Renamed+=(s,e)=>onAction();
     actionWatcher.EnableRaisingEvents=true;
    }catch{}
   }
   try{Refresh(false);SafeWrite(Output, Sample());}catch{}
   try{while(true){long now=Now();
    if(!sample&&!once&&now>=glassAt){
     PublishWindowsTheme();FluentReleaseCheck.Poll();
     try{FluentGlass.Apply(false);}catch(Exception e){File.WriteAllText(Error,DateTime.UtcNow.ToString("o")+" glass "+e.ToString());}
     CheckAction();
     FluentDeviceSettings.Poll();
     glassAt=now+500;
     if(FluentGlass.AppRunning)appSeen=now;
     else if(now-appSeen>15000)break;
    }
    if(once||sample)enabled=true;else if(now>=leaseAt){enabled=Enabled();leaseAt=now+500;}
    if(enabled){if(!once&&!sample){FluentAsioInfo.Poll();if(FluentAbletonMeter.Leased)FluentAbletonMeter.Poll();else FluentAbletonMeter.Idle();}try{if(now>=refreshAt){Refresh();refreshAt=now+1500;}string json=Sample();if(once||sample)Console.WriteLine(json);else SafeWrite(Output, json);}catch(Exception e){File.WriteAllText(Error,DateTime.UtcNow.ToString("o")+" "+e.ToString());refreshAt=0;}}
    else{FluentAbletonMeter.Idle();if(Entries.Count>0||InputMeters.Count>0){Clear();StopProcessMeters();refreshAt=0;}}
    if(once||(sample&&Now()>=end))break;Thread.Sleep(enabled?50:500);
   }}finally{Clear();StopProcessMeters();}
  }return 0;
 }
}
