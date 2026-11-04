using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;
class FluentLauncher {
 delegate bool EnumProc(IntPtr window,IntPtr param);
 [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc callback,IntPtr param);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window,out uint pid);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr window,StringBuilder text,int count);
 [DllImport("user32.dll")] static extern bool IsIconic(IntPtr window);
 [DllImport("user32.dll")] static extern bool ShowWindowAsync(IntPtr window,int command);
 [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr window);
 [DllImport("user32.dll")] static extern bool AllowSetForegroundWindow(uint pid);
 static Process Running(string path){
  foreach(var process in Process.GetProcessesByName("fluent-sound-switcher")){
   try{if(string.Equals(process.MainModule.FileName,path,StringComparison.OrdinalIgnoreCase))return process;}catch{}process.Dispose();
  }return null;
 }
 static IntPtr MainWindow(int processId){
  IntPtr found=IntPtr.Zero;
  EnumWindows(delegate(IntPtr window,IntPtr unused){uint pid;GetWindowThreadProcessId(window,out pid);if(pid!=(uint)processId)return true;var text=new StringBuilder(256);GetWindowText(window,text,text.Capacity);string title=text.ToString();if(title=="Fluent Sound Switcher"||title=="音效裝置切換器"){found=window;return false;}return true;},IntPtr.Zero);
  return found;
 }
 [STAThread] static int Main(string[] args){
  try{
   string dir=AppDomain.CurrentDomain.BaseDirectory,path=Path.Combine(dir,"fluent-sound-switcher.exe");
   bool autostart=Array.IndexOf(args,"--autostart")>=0;
   using(var gate=new Mutex(false,@"Local\FluentSoundSwitcherLauncher")){
    bool locked=false;try{try{locked=gate.WaitOne(15000);}catch(AbandonedMutexException){locked=true;}if(!locked)throw new TimeoutException("程式正在啟動，請稍後再試。");
     using(var process=Running(path)??Process.Start(new ProcessStartInfo(path,autostart?"--autostart":""){WorkingDirectory=dir,UseShellExecute=false,CreateNoWindow=true})){
      Process.Start(new ProcessStartInfo(Path.Combine(dir,"FluentAppMeter.exe")){WorkingDirectory=dir,UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden});
      if(autostart)return 0;
      try{process.WaitForInputIdle(3000);}catch{}
      for(int i=0;i<100;i++){
       if(process.HasExited)throw new InvalidOperationException("主程式啟動後已結束。");
       IntPtr window=MainWindow(process.Id);if(window!=IntPtr.Zero){AllowSetForegroundWindow((uint)process.Id);ShowWindowAsync(window,IsIconic(window)?9:5);SetForegroundWindow(window);return 0;}Thread.Sleep(100);
      }
      throw new TimeoutException("找不到主視窗，請稍後再試。");
     }
    }finally{if(locked)gate.ReleaseMutex();}
   }
  }catch(Exception e){MessageBox.Show("無法啟動音效裝置切換器：\n"+e.Message,"音效裝置切換器");return 1;}
 }
}
