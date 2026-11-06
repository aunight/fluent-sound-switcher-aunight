using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Script.Serialization;
using Microsoft.Win32;

[ComImport,Guid("f8679f50-850a-41cf-9c72-430f290290c8"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IDevicePolicyProperties {
 void Slot0();void Slot1();void Slot2();void Slot3();void Slot4();void Slot5();void Slot6();void Slot7();void Slot8();
 [PreserveSig]int SetPropertyValue([MarshalAs(UnmanagedType.LPWStr)]string id,[MarshalAs(UnmanagedType.Bool)]bool fxStore,IntPtr key,IntPtr value);
}

// On-demand advanced endpoint configuration. No polling of devices while this page is closed.
static class FluentDeviceSettings {
 static readonly JavaScriptSerializer Json=new JavaScriptSerializer();
 static readonly string Dir=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"com.fluentsoundswitcher.app");
 static readonly string Request=Path.Combine(Dir,"device-settings-request.json"),Response=Path.Combine(Dir,"device-settings-response.json");
 static readonly string Tool=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"third-party","SoundVolumeView","SoundVolumeView.exe");
 static readonly Regex Endpoint=new Regex(@"^\{0\.0\.[01]\.00000000\}\.\{[0-9a-fA-F-]{36}\}$");
 const string Exclusive="{b3f8fa53-0004-438e-9003-51a46e139bfc},3",Priority="{b3f8fa53-0004-438e-9003-51a46e139bfc},4",SysFx="{1da5d803-d492-4edd-8c23-e0c0ffee7f0e},5";
 const string Sonic="{b53d940c-b846-4831-9f76-d102b9b725a0}";
 static string last="";static int busy;
 static readonly string[,] Effects={
  {"loudness","{e0a941a0-88a2-4df5-8d6b-dd20bb06e8fb},4"},
  {"headphone","{e0a941a0-88a2-4df5-8d6b-dd20bb06e8fb},3"},
  {"surround","{e0a941a0-88a2-4df5-8d6b-dd20bb06e8fb},2"},
  {"voice","{4b361010-def7-43a1-a5dc-071d955b62f7},3"}};
 public static void Poll(){
  if(Interlocked.CompareExchange(ref busy,1,0)!=0)return;
  ThreadPool.QueueUserWorkItem(delegate{
   string token="";
   try{
    if(!File.Exists(Request))return;
    var req=Json.Deserialize<Dictionary<string,object>>(File.ReadAllText(Request));
    token=S(req,"requestId");if(token==""||token==last)return;
    // Consume before execution: a saved request must never replay on a helper restart.
    double sent; if(!double.TryParse(S(req,"timestamp"),out sent)||Math.Abs((DateTime.UtcNow-new DateTime(1970,1,1)).TotalMilliseconds-sent)>30000)return;
    last=token;File.Delete(Request);
    object result=Execute(req);Write(new {requestId=token,ok=true,data=result});
   }catch(Exception e){if(token!="")Write(new {requestId=token,ok=false,error=e.Message});}
   finally{Interlocked.Exchange(ref busy,0);}
  });
 }
 static void Write(object result){try{string temp=Response+".tmp";File.WriteAllText(temp,Json.Serialize(result),new UTF8Encoding(false));if(File.Exists(Response))File.Replace(temp,Response,null);else File.Move(temp,Response);}catch{}}
 static string S(Dictionary<string,object> o,string k){object v;return o.TryGetValue(k,out v)?Convert.ToString(v):"";}
 static string Quote(string s){if(s.IndexOf('"')>=0||s.IndexOf('\r')>=0||s.IndexOf('\n')>=0)throw new ArgumentException("Invalid argument");return "\""+s+"\"";}
 static void Run(string args){
  if(!File.Exists(Tool))throw new FileNotFoundException("Audio configuration component is missing.");
  using(var p=Process.Start(new ProcessStartInfo(Tool,args){UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden,WorkingDirectory=Path.GetDirectoryName(Tool)})){
   if(!p.WaitForExit(10000)){try{p.Kill();}catch{}throw new TimeoutException("The audio driver did not respond.");}
   if(p.ExitCode!=0)throw new InvalidOperationException("Audio configuration failed ("+p.ExitCode+").");
  }
 }
 static List<Dictionary<string,object>> Devices(){
  string file=Path.Combine(Dir,"device-settings-export-"+Guid.NewGuid().ToString("N")+".json");
  try{Run("/sjson "+Quote(file)+" /SaveFileEncoding 3 /ShowDisabledDevices 1 /ShowUnpluggedDevices 1");
   var rows=Json.Deserialize<List<Dictionary<string,object>>>(File.ReadAllText(file));
   return rows.FindAll(d=>S(d,"Type")=="Device"&&Endpoint.IsMatch(S(d,"Item ID")));
  }finally{if(File.Exists(file))File.Delete(file);}
 }
 static Dictionary<string,object> Find(string id){if(!Endpoint.IsMatch(id))throw new ArgumentException("Invalid audio endpoint.");var d=Devices().Find(v=>S(v,"Item ID")==id);if(d==null)throw new InvalidOperationException("The audio device is no longer available.");return d;}
 static string Key(Dictionary<string,object> d){string id=S(d,"Item ID");return @"SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\"+(id.StartsWith("{0.0.1.")?"Capture":"Render")+"\\"+id.Substring(id.LastIndexOf('{'));}
 static object Value(string key,string prop){using(var hive=RegistryKey.OpenBaseKey(RegistryHive.LocalMachine,RegistryView.Registry64))using(var k=hive.OpenSubKey(key)){return k==null?null:k.GetValue(prop);}}
 static bool? Boolean(object value){if(value==null)return null;byte[] b=value as byte[];if(b!=null){if(b.Length<12)return null;int type=BitConverter.ToUInt16(b,0);if(type!=11&&type!=3&&type!=19)return null;return BitConverter.ToInt32(b,8)!=0;}if(value is int)return (int)value!=0;return null;}
 static void SetEnhancements(string id,bool enabled){
  object policy=Activator.CreateInstance(Type.GetTypeFromCLSID(new Guid("870af99c-171d-4f9e-af0d-e63df40c2bc9")));
  IntPtr key=Marshal.AllocCoTaskMem(20),value=Marshal.AllocCoTaskMem(24);
  try{Marshal.Copy(new byte[24],0,value,24);Marshal.Copy(new Guid("1da5d803-d492-4edd-8c23-e0c0ffee7f0e").ToByteArray(),0,key,16);Marshal.WriteInt32(key,16,5);Marshal.WriteInt16(value,19);Marshal.WriteInt32(value,8,enabled?0:1);Marshal.ThrowExceptionForHR(((IDevicePolicyProperties)policy).SetPropertyValue(id,true,key,value));}
  finally{Marshal.FreeCoTaskMem(key);Marshal.FreeCoTaskMem(value);Marshal.ReleaseComObject(policy);}
 }
 static Dictionary<string,object> State(Dictionary<string,object> d,bool formats){
  string key=Key(d);bool active=S(d,"Device State")=="Active";bool? disabledFx=Boolean(Value(key+"\\FxProperties",SysFx));
  var effects=new Dictionary<string,object>();for(int i=0;i<Effects.GetLength(0);i++)effects[Effects[i,0]]=Boolean(Value(key+"\\FxProperties",Effects[i,1]));
  var state=new Dictionary<string,object>{{"id",S(d,"Item ID")},{"name",S(d,"Name")+" ("+S(d,"Device Name")+")"},{"input",S(d,"Direction")=="Capture"},{"active",active},{"format",S(d,"Default Format")},{"exclusive",Boolean(Value(key+"\\Properties",Exclusive))},{"priority",Boolean(Value(key+"\\Properties",Priority))},{"enhancements",disabledFx.HasValue?(object)!disabledFx.Value:null},{"effects",effects},{"spatial",S(d,"Spatial Guid")}};
  if(formats)state["formats"]=active?Formats(S(d,"Item ID"),S(d,"Default Format")):new List<string>();
  return state;
 }
 static List<string> Formats(string id,string current){
  var result=new List<string>();var match=Regex.Match(current,@"(\d+) Channel, (\d+) bit, (\d+) Hz");if(!match.Success)return result;
  int channels=int.Parse(match.Groups[1].Value);result.Add(match.Groups[2].Value+":"+match.Groups[3].Value);
  IDevices en=null;IDevice dev=null;object obj=null;
  try{en=(IDevices)new MMEnumerator();Marshal.ThrowExceptionForHR(en.GetDevice(id,out dev));Guid iid=typeof(IInputAudioClient).GUID;Marshal.ThrowExceptionForHR(dev.Activate(ref iid,23,IntPtr.Zero,out obj));var client=(IInputAudioClient)obj;
   foreach(int bits in new[]{16,24,32})foreach(int rate in new[]{44100,48000,88200,96000,176400,192000}){
    string value=bits+":"+rate;if(result.Contains(value))continue;
    bool supported=false;for(int kind=0;kind<2&&!supported;kind++){
     byte[] data=new byte[40];Action<int,short> w16=(offset,v)=>Array.Copy(BitConverter.GetBytes(v),0,data,offset,2);Action<int,int>w32=(offset,v)=>Array.Copy(BitConverter.GetBytes(v),0,data,offset,4);
     w16(0,kind==0?(short)1:unchecked((short)65534));w16(2,(short)channels);w32(4,rate);w32(8,rate*channels*bits/8);w16(12,(short)(channels*bits/8));w16(14,(short)bits);
     if(kind==1){w16(16,22);w16(18,(short)bits);w32(20,channels==1?4:channels==2?3:0);Array.Copy(new Guid("00000001-0000-0010-8000-00aa00389b71").ToByteArray(),0,data,24,16);}
     IntPtr p=Marshal.AllocCoTaskMem(40),closest=IntPtr.Zero;try{Marshal.Copy(data,0,p,40);supported=client.IsFormatSupported(1,p,out closest)==0;}finally{if(closest!=IntPtr.Zero)Marshal.FreeCoTaskMem(closest);Marshal.FreeCoTaskMem(p);}
    }if(supported)result.Add(value);
   }
  }catch{}finally{if(obj!=null)Marshal.ReleaseComObject(obj);if(dev!=null)Marshal.ReleaseComObject(dev);if(en!=null)Marshal.ReleaseComObject(en);}
  // An ASIO client or disabled exclusive access can prevent capability probing.
  // Keep the requested common rates available; the setter and readback validate them.
  foreach(int bits in new[]{16,24,32})foreach(int rate in new[]{44100,48000}){string value=bits+":"+rate;if(!result.Contains(value))result.Add(value);}return result;
 }
 public static object Execute(Dictionary<string,object> req){
  string cmd=S(req,"command");if(cmd=="asio")return FluentAsioInfo.ReadIsolated();if(cmd=="list"){var result=new List<object>();foreach(var d in Devices())result.Add(State(d,false));return result;}
  string id=S(req,"deviceId");var device=Find(id);if(cmd=="read")return State(device,true);
  if(S(device,"Device State")!="Active")throw new InvalidOperationException("Enable and connect this device first.");
  string val=S(req,"value"),expected=val,field=cmd;var before=State(device,true);
  if(cmd=="format"){
   if(!((List<string>)before["formats"]).Contains(val))throw new InvalidOperationException("This audio format is not supported by the device.");
   string[] parts=val.Split(':');string backup=Path.Combine(Dir,"device-format-"+Guid.NewGuid().ToString("N")+".dat");
   try{
    Run("/SaveDeviceFormat "+Quote(id)+" "+Quote(backup));
    if(!File.Exists(backup)||new FileInfo(backup).Length==0)throw new InvalidOperationException("Unable to preserve the current format.");
    try{Run("/SetDefaultFormat "+Quote(id)+" "+parts[0]+" "+parts[1]);Thread.Sleep(200);var confirmed=State(Find(id),true);
     if(!Convert.ToString(confirmed["format"]).Contains(", "+parts[0]+" bit, "+parts[1]+" Hz"))throw new InvalidOperationException("The driver rejected this format or the device is in use.");return confirmed;
    }catch{Run("/LoadDeviceFormat "+Quote(id)+" "+Quote(backup));throw;}
   }finally{if(File.Exists(backup))File.Delete(backup);}
  }else if(cmd=="exclusive"||cmd=="priority"){
   if(val!="0"&&val!="1")throw new ArgumentException("Invalid switch value.");
   Run((cmd=="exclusive"?"/SetAllowExclusive ":"/SetExclusivePriority ")+Quote(id)+" "+val);
  }else if(cmd=="spatial"){
   if(S(device,"Direction")!="Render"||(val!=""&&val!=Sonic&&val!=S(device,"Spatial Guid")))throw new ArgumentException("Unsupported spatial format.");
   Run("/SetSpatial "+Quote(id)+" "+Quote(val));
  }else{
   if(val!="0"&&val!="1")throw new ArgumentException("Invalid switch value.");
   string prop=null;if(cmd=="enhancements"&&before["enhancements"]!=null)prop=SysFx;
   for(int i=0;i<Effects.GetLength(0);i++)if(cmd==Effects[i,0]&&((Dictionary<string,object>)before["effects"])[cmd]!=null)prop=Effects[i,1];
   if(prop==null)throw new InvalidOperationException("This enhancement is not exposed by the device driver.");
   if(cmd=="enhancements")SetEnhancements(id,val=="1");
   else Run("/SetBooleanFxProperty "+Quote(id)+" "+Quote(prop)+" "+val);
  }
  Thread.Sleep(200);var after=State(Find(id),true);bool verified=false;
  if(cmd=="format"){var parts=val.Split(':');verified=Convert.ToString(after["format"]).Contains(", "+parts[0]+" bit, "+parts[1]+" Hz");}
  else if(cmd=="spatial")verified=string.Equals(Convert.ToString(after["spatial"]),expected,StringComparison.OrdinalIgnoreCase);
  else{object actual=after.ContainsKey(field)?after[field]:((Dictionary<string,object>)after["effects"])[field];verified=actual!=null&&Convert.ToBoolean(actual)==(val=="1");}
  if(!verified)throw new InvalidOperationException("Windows did not apply this setting. The driver may not support it or the device is in use. Refresh to see the current state.");
  return after;
 }
}
