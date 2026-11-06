using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using Microsoft.Win32;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading;
static class FluentAsioInfo {
 static string ActiveAbletonDriver(Process process,List<string> loaded){
  if(!process.ProcessName.StartsWith("Ableton Live",StringComparison.OrdinalIgnoreCase))return null;
  var siblings=Process.GetProcessesByName(process.ProcessName);int count=siblings.Length;foreach(var item in siblings)item.Dispose();if(count!=1)return null;
  try{string version=process.MainModule.FileVersionInfo.ProductVersion;
   string file=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"Ableton","Live "+version,"Preferences","Log.txt");
   string text;using(var stream=new FileStream(file,FileMode.Open,FileAccess.Read,FileShare.ReadWrite|FileShare.Delete)){stream.Position=Math.Max(0,stream.Length-262144);using(var reader=new StreamReader(stream))text=reader.ReadToEnd();}
   var matches=Regex.Matches(text,@"(?m)^(\S+): info: ASIO: (.+?): (Start|Stop): finished[^\r\n]*");if(matches.Count==0)return null;
   var last=matches[matches.Count-1];DateTime time;if(!DateTime.TryParse(last.Groups[1].Value,out time)||time<process.StartTime||last.Groups[3].Value!="Start")return null;
   string driver=last.Groups[2].Value;return loaded.Contains(driver)?driver:null;
  }catch{return null;}
 }
 [DllImport("ole32.dll")]static extern int CoCreateInstance(ref Guid clsid,IntPtr outer,int context,ref Guid iid,out IntPtr result);
 [DllImport("ole32.dll")]static extern int CoInitializeEx(IntPtr reserved,int mode);
 [DllImport("ole32.dll")]static extern void CoUninitialize();
 [DllImport("user32.dll")]static extern IntPtr GetDesktopWindow();
 [UnmanagedFunctionPointer(CallingConvention.StdCall)]delegate int AsioInit(IntPtr self,IntPtr window);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)]delegate int AsioPanel(IntPtr self);
 public static int OpenPanel(string name){
  Guid id=Guid.Empty;using(var hive=RegistryKey.OpenBaseKey(RegistryHive.LocalMachine,RegistryView.Registry64))using(var root=hive.OpenSubKey(@"SOFTWARE\ASIO"))using(var key=root==null?null:root.OpenSubKey(name))if(key==null||!Guid.TryParse(Convert.ToString(key.GetValue("CLSID")),out id))return 2;
  int com=CoInitializeEx(IntPtr.Zero,2);IntPtr ptr=IntPtr.Zero;try{Guid iid=id;int hr=CoCreateInstance(ref id,IntPtr.Zero,1,ref iid,out ptr);if(hr<0)return hr;if(ptr==IntPtr.Zero)return 3;IntPtr table=Marshal.ReadIntPtr(ptr);var init=(AsioInit)Marshal.GetDelegateForFunctionPointer(Marshal.ReadIntPtr(table,3*IntPtr.Size),typeof(AsioInit));if(init(ptr,GetDesktopWindow())==0)return 4;var panel=(AsioPanel)Marshal.GetDelegateForFunctionPointer(Marshal.ReadIntPtr(table,21*IntPtr.Size),typeof(AsioPanel));int result=panel(ptr);return result==0||result==0x3f4847a0?0:result;}catch{return 6;}finally{if(ptr!=IntPtr.Zero)Marshal.Release(ptr);if(com>=0)CoUninitialize();}
 }
 public static void LaunchPanel(string name){
  if(name=="MiniFuse ASIO Driver"){
   string shortcut=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonPrograms),"Arturia","MiniFuse Control Center","MiniFuse Control Center.lnk");
   if(File.Exists(shortcut)){Process.Start(new ProcessStartInfo(shortcut){UseShellExecute=true});return;}
  }
  if(string.IsNullOrWhiteSpace(name)||name.IndexOfAny(new[]{'\\','/','"','\r','\n'})>=0)throw new ArgumentException("Invalid ASIO driver name.");
  using(var hive=RegistryKey.OpenBaseKey(RegistryHive.LocalMachine,RegistryView.Registry64))using(var key=hive.OpenSubKey(@"SOFTWARE\ASIO\"+name))if(key==null)throw new InvalidOperationException("ASIO driver is no longer installed.");
  using(var child=Process.Start(new ProcessStartInfo(Process.GetCurrentProcess().MainModule.FileName,"--asio-panel "+Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(name))){UseShellExecute=false,CreateNoWindow=true})){
   if(child.WaitForExit(1500)&&child.ExitCode!=0)throw new InvalidOperationException("Unable to open the driver panel; the driver may be unavailable or in use.");
  }
 }
 static int scanBusy;static long nextScan;
 public static void Poll(){
  long now=DateTime.UtcNow.Ticks;if(now<Interlocked.Read(ref nextScan)||Interlocked.CompareExchange(ref scanBusy,1,0)!=0)return;
  Interlocked.Exchange(ref nextScan,now+TimeSpan.FromSeconds(12).Ticks);
  ThreadPool.QueueUserWorkItem(delegate{try{var data=(Dictionary<string,object>)ReadIsolated();data["timestamp"]=(long)(DateTime.UtcNow-new DateTime(1970,1,1)).TotalMilliseconds;string file=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"com.fluentsoundswitcher.app","asio-status.json"),temp=file+".tmp";File.WriteAllText(temp,new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(data));if(File.Exists(file))File.Replace(temp,file,null);else File.Move(temp,file);}catch{}finally{Interlocked.Exchange(ref scanBusy,0);}});
 }
 delegate bool WindowCallback(IntPtr window,IntPtr param);
 [DllImport("user32.dll")]static extern bool EnumWindows(WindowCallback callback,IntPtr param);
 [DllImport("user32.dll")]static extern bool IsWindowVisible(IntPtr window);
 [DllImport("user32.dll")]static extern uint GetWindowThreadProcessId(IntPtr window,out uint pid);
 public static object ReadIsolated(){
  string token=Guid.NewGuid().ToString("N"),dir=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"com.fluentsoundswitcher.app"),file=Path.Combine(dir,"asio-probe-"+token+".json");
  try{using(var process=Process.Start(new ProcessStartInfo(Process.GetCurrentProcess().MainModule.FileName,"--asio-probe "+token){UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden})){
   if(!process.WaitForExit(8000)){try{process.Kill();process.WaitForExit(1000);}catch{}throw new TimeoutException("ASIO scan timed out; device settings remain available.");}
   if(process.ExitCode!=0||!File.Exists(file))throw new InvalidOperationException("ASIO scan failed; device settings remain available.");
   return new System.Web.Script.Serialization.JavaScriptSerializer().DeserializeObject(File.ReadAllText(file));
  }}finally{try{if(File.Exists(file))File.Delete(file);}catch{}}
 }
 public static object Read(){
  var drivers=new Dictionary<string,List<string>>(StringComparer.OrdinalIgnoreCase);
  foreach(RegistryView view in new[]{RegistryView.Registry64,RegistryView.Registry32})try{
   using(var hive=RegistryKey.OpenBaseKey(RegistryHive.LocalMachine,view))using(var root=hive.OpenSubKey(@"SOFTWARE\ASIO")){
    if(root==null)continue;foreach(string name in root.GetSubKeyNames())using(var key=root.OpenSubKey(name)){
     string clsid=Convert.ToString(key.GetValue("CLSID"));using(var com=hive.OpenSubKey(@"SOFTWARE\Classes\CLSID\"+clsid+@"\InprocServer32")){
      string dll=com==null?"":Environment.ExpandEnvironmentVariables(Convert.ToString(com.GetValue(null))).Trim('"');
      if(!drivers.ContainsKey(name))drivers[name]=new List<string>();if(dll!="")drivers[name].Add(Path.GetFileName(dll));
     }
    }
   }
  }catch{}
  var apps=new List<object>();int denied=0,session=Process.GetCurrentProcess().SessionId;
  var visible=new HashSet<int>();EnumWindows(delegate(IntPtr window,IntPtr param){if(IsWindowVisible(window)){uint pid;GetWindowThreadProcessId(window,out pid);visible.Add((int)pid);}return true;},IntPtr.Zero);
  var audioApp=new Regex("sonobus|^live|ableton|reaper|cubase|nuendo|studio.?one|bitwig|^fl(64|32|studio)|reason|pro.?tools|audition|audacity|vsthost|gigperformer|voicemeeter|carla|cantabile",RegexOptions.IgnoreCase);
  foreach(var process in Process.GetProcesses())using(process)try{
   if(process.SessionId!=session||(!visible.Contains(process.Id)&&!audioApp.IsMatch(process.ProcessName)))continue;
   var loaded=new List<string>();foreach(ProcessModule module in process.Modules){foreach(var pair in drivers)if(pair.Value.Exists(dll=>string.Equals(dll,module.ModuleName,StringComparison.OrdinalIgnoreCase))&&!loaded.Contains(pair.Key))loaded.Add(pair.Key);}
   if(loaded.Count==0)continue;string current=ActiveAbletonDriver(process,loaded);
   // Driver loading is observable across DAWs. Active use is not established by module presence.
   apps.Add(new{pid=process.Id,name=process.ProcessName,icon=FluentAppIcons.Read(process.MainModule.FileName),loaded=loaded,current=current,windowsVolume=FluentAppMeter.HasWindowsSession(process.Id)});
  }catch{denied++;}
  return new{installed=new List<string>(drivers.Keys),apps=apps,inaccessible=denied};
 }
}
