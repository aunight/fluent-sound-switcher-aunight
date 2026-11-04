using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

class FluentGlass {
 delegate bool EnumProc(IntPtr w,IntPtr l);
 [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc callback,IntPtr param);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr w,out uint pid);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr w,StringBuilder s,int n);
 [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr w);
 [DllImport("user32.dll")] static extern long GetWindowLongPtr(IntPtr w,int index);
 [DllImport("user32.dll")] static extern IntPtr SetWindowLongPtr(IntPtr w,int index,IntPtr newLong);
 [DllImport("user32.dll")] static extern bool SetWindowPos(IntPtr w,IntPtr ins,int x,int y,int cx,int cy,uint flags);
 [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr w,int attr,ref int val,int size);
 [StructLayout(LayoutKind.Sequential)] struct WTA_OPTIONS {public uint dwFlags,dwMask;}
 [DllImport("uxtheme.dll")] static extern int SetWindowThemeAttribute(IntPtr w,int attr,ref WTA_OPTIONS pv,uint cb);
 [StructLayout(LayoutKind.Sequential)] struct AccentPolicy {public int State,Flags,Color,Animation;}
 [StructLayout(LayoutKind.Sequential)] struct CompositionData {public int Attribute;public IntPtr Data;public int Size;}
 [DllImport("user32.dll")] static extern int SetWindowCompositionAttribute(IntPtr w,ref CompositionData data);
 const int SystemBackdropType=38,CornerPreference=33,BorderColor=34,BackdropNone=1,CornerRound=2,AccentBlurBehind=3,ExTransparent=0x20;
 static readonly Dictionary<IntPtr,bool> Applied=new Dictionary<IntPtr,bool>();
 static bool NativeTitleBar(){
  try{string path=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"com.fluentsoundswitcher.app","config.json");var settings=new System.Web.Script.Serialization.JavaScriptSerializer().Deserialize<Dictionary<string,object>>(File.ReadAllText(path));object style;return settings.TryGetValue("titleBarStyle",out style)&&Convert.ToString(style)=="native";}catch{return false;}
 }

 static HashSet<uint> pids=new HashSet<uint>();
 static long pidsAt;
 public static bool AppRunning{get{return pids.Count>0;}}
 static int Blur(IntPtr w){var policy=new AccentPolicy{State=AccentBlurBehind};IntPtr ptr=Marshal.AllocHGlobal(Marshal.SizeOf(policy));try{Marshal.StructureToPtr(policy,ptr,false);var data=new CompositionData{Attribute=19,Data=ptr,Size=Marshal.SizeOf(policy)};return SetWindowCompositionAttribute(w,ref data);}finally{Marshal.FreeHGlobal(ptr);}}
 static void RefreshPids(){
  var found=new HashSet<uint>();
  string baseDir=AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\','/');
  foreach(var p in Process.GetProcessesByName("fluent-sound-switcher")){
   try{
    string path=p.MainModule.FileName;
    string dir=Path.GetDirectoryName(path).TrimEnd('\\','/');
    if(string.Equals(dir,baseDir,StringComparison.OrdinalIgnoreCase) ||
       string.Equals(Path.GetFileName(path),"fluent-sound-switcher.exe",StringComparison.OrdinalIgnoreCase)){
     found.Add((uint)p.Id);
    }
   }catch{}finally{p.Dispose();}
  }
  pids=found;pidsAt=Environment.TickCount;
 }
 public static string Apply(bool force){
  if(force||pids.Count==0||unchecked(Environment.TickCount-pidsAt)>5000)RefreshPids();
  var output=new StringBuilder();var alive=new HashSet<IntPtr>();
  EnumWindows(delegate(IntPtr w,IntPtr l){
   uint pid;GetWindowThreadProcessId(w,out pid);
   if(!pids.Contains(pid))return true;
   var title=new StringBuilder(256);GetWindowText(w,title,256);string t=title.ToString();
   if(t!="Tauri App"&&t!="\u97F3\u6548\u88DD\u7F6E\u5207\u63DB\u5668"&&t!="Fluent Sound Switcher")return true;
   alive.Add(w);bool visible=IsWindowVisible(w),wasVisible;bool known=Applied.TryGetValue(w,out wasVisible);Applied[w]=visible;
   long style=GetWindowLongPtr(w,-16);
   long exStyle=GetWindowLongPtr(w,-20);
   bool main=t=="\u97F3\u6548\u88DD\u7F6E\u5207\u63DB\u5668"||t=="Fluent Sound Switcher";
   bool osd=!main&&(exStyle&ExTransparent)!=0;
   if(main&&!NativeTitleBar()){
    // Custom buttons own the caption area; leave no invisible native caption buttons above them.
    long customStyle=style&~0x00CB0000L;
    if(customStyle!=style){SetWindowLongPtr(w,-16,new IntPtr(customStyle));SetWindowPos(w,IntPtr.Zero,0,0,0,0,0x0037);}
   }
   if(!main){
    var wta=new WTA_OPTIONS{dwFlags=0x0F,dwMask=0x0F};
    SetWindowThemeAttribute(w,1,ref wta,(uint)Marshal.SizeOf(wta));
    long cleanStyle=style&~0x000B0000L;
    if(cleanStyle!=style){
     SetWindowLongPtr(w,-16,new IntPtr(cleanStyle));
     SetWindowPos(w,IntPtr.Zero,0,0,0,0,0x0037);
    }
   }
   if(!force&&known)return true;
   int backdrop=BackdropNone,corner=CornerRound,border=osd?0x00c1d1db:0x00202020;
   if(!main&&!osd){int disabled=1;DwmSetWindowAttribute(w,3,ref disabled,4);}
   int hrBackdrop=DwmSetWindowAttribute(w,SystemBackdropType,ref backdrop,4);
   int blur=Blur(w);
   int hrBorder=main?0:DwmSetWindowAttribute(w,BorderColor,ref border,4);
   int hrCorner=DwmSetWindowAttribute(w,CornerPreference,ref corner,4);
   output.AppendLine(w+" "+(main?"main":osd?"osd":"flyout")+" visible="+visible+" backdrop="+hrBackdrop+" accent="+blur+" border="+hrBorder+" corner="+hrCorner);
   return true;
  },IntPtr.Zero);
  foreach(var w in new List<IntPtr>(Applied.Keys))if(!alive.Contains(w))Applied.Remove(w);
  return output.ToString();
 }
}
class GlassProbe{static void Main(string[] args){Console.WriteLine(FluentGlass.Apply(true));}}
