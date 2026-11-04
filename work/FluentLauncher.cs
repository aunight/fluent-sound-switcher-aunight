using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
class FluentLauncher {
 [STAThread] static int Main(string[] args){
  try{
   string dir=AppDomain.CurrentDomain.BaseDirectory;
   Process.Start(new ProcessStartInfo(Path.Combine(dir,"fluent-sound-switcher.exe"),Array.IndexOf(args,"--autostart")>=0?"--autostart":""){WorkingDirectory=dir,UseShellExecute=false,CreateNoWindow=true});
   Process.Start(new ProcessStartInfo(Path.Combine(dir,"FluentAppMeter.exe")){WorkingDirectory=dir,UseShellExecute=false,CreateNoWindow=true,WindowStyle=ProcessWindowStyle.Hidden});
   return 0;
  }catch(Exception e){MessageBox.Show("無法啟動 Fluent Sound Switcher：\n"+e.Message,"Fluent Sound Switcher");return 1;}
 }
}
