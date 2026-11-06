using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Script.Serialization;

static class FluentReleaseCheck {
 public const string CurrentVersion="2026.11.06.6";
 const string Repo="https://github.com/aunight/fluent-sound-switcher-aunight/releases/";
 static readonly string Dir=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"com.fluentsoundswitcher.app");
 static long next;static int busy;static Dictionary<string,object> state;
 static string Text(Dictionary<string,object> data,string key){object value;return data.TryGetValue(key,out value)?Convert.ToString(value):"";}
 public static bool Newer(string candidate,string current){
  MatchCollection a=Regex.Matches(candidate??"",@"\d+"),b=Regex.Matches(current??"",@"\d+");if(a.Count==0)return false;
  for(int i=0;i<Math.Max(a.Count,b.Count);i++){int x=0,y=0;if(i<a.Count&&!int.TryParse(a[i].Value,out x))return false;if(i<b.Count&&!int.TryParse(b[i].Value,out y))return false;if(x!=y)return x>y;}return false;
 }
 public static void Poll(){long now=DateTime.UtcNow.Ticks;if(now<Interlocked.Read(ref next))return;Interlocked.Exchange(ref next,now+TimeSpan.FromHours(6).Ticks);Start(false,true);}
 public static void CheckNow(){Start(false,false);}
 public static void InstallNow(){Start(true,false);}
 public static void AutoChanged(){Start(false,true);}
 static Dictionary<string,object> Preferences(){try{return new JavaScriptSerializer().Deserialize<Dictionary<string,object>>(File.ReadAllText(Path.Combine(Dir,"update-preferences.json")));}catch{return new Dictionary<string,object>();}}
 static void Start(bool install,bool automatic){
  if(Interlocked.CompareExchange(ref busy,1,0)!=0)return;
  ThreadPool.QueueUserWorkItem(delegate{try{
   state=new Dictionary<string,object>{{"current",CurrentVersion},{"available",false},{"checkedAt",0}};Publish("checking");
   ServicePointManager.SecurityProtocol|=SecurityProtocolType.Tls12;
   var request=Request("https://api.github.com/repos/aunight/fluent-sound-switcher-aunight/releases/latest");request.Accept="application/vnd.github+json";
   Dictionary<string,object> release;using(var response=request.GetResponse())using(var reader=new StreamReader(response.GetResponseStream()))release=new JavaScriptSerializer().Deserialize<Dictionary<string,object>>(reader.ReadToEnd());
   string tag=Text(release,"tag_name"),url=Text(release,"html_url"),body=Text(release,"body");
   if(Convert.ToBoolean(release["draft"])||Convert.ToBoolean(release["prerelease"])||!url.StartsWith(Repo+"tag/",StringComparison.Ordinal))throw new InvalidDataException("Invalid release");
   Dictionary<string,object> asset=null;object items;if(release.TryGetValue("assets",out items)&&items is IEnumerable)foreach(object item in (IEnumerable)items){var candidate=item as Dictionary<string,object>;if(candidate!=null&&ValidAsset(candidate)){asset=candidate;break;}}
   bool available=Newer(tag,CurrentVersion);if(Newer(CurrentVersion,tag)){string local=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"RELEASE_NOTES.md");if(File.Exists(local)){body=File.ReadAllText(local);tag="v"+CurrentVersion;}}state["version"]=tag;state["url"]=url;state["notes"]=body.Length>16000?body.Substring(0,16000)+"\n…":body;state["available"]=available;state["canInstall"]=asset!=null;state["checkedAt"]=(long)(DateTime.UtcNow-new DateTime(1970,1,1)).TotalMilliseconds;Publish("ready");
   var prefs=Preferences();object enabled;bool auto=prefs.TryGetValue("autoUpdate",out enabled)&&Convert.ToBoolean(enabled);
   if(available&&(install||(automatic&&auto&&Text(prefs,"skip")!=tag))){
    if(asset==null)throw new CryptographicException("Missing verifiable installer");
    if(automatic&&!install){long now=(long)(DateTime.UtcNow-new DateTime(1970,1,1)).TotalMilliseconds,tried=0;long.TryParse(Text(prefs,"lastAutoAt"),out tried);if(Text(prefs,"lastAutoTag")==tag&&now-tried<21600000)return;prefs["lastAutoTag"]=tag;prefs["lastAutoAt"]=now;File.WriteAllText(Path.Combine(Dir,"update-preferences.json"),new JavaScriptSerializer().Serialize(prefs));}
    Install(asset);
   }
  }catch(Exception e){if(state==null)state=new Dictionary<string,object>{{"current",CurrentVersion}};state["errorCode"]=e is CryptographicException?"integrity":"update";state["checkedAt"]=(long)(DateTime.UtcNow-new DateTime(1970,1,1)).TotalMilliseconds;Publish("error");}finally{Interlocked.Exchange(ref busy,0);}});
 }
 static HttpWebRequest Request(string url){var request=(HttpWebRequest)WebRequest.Create(url);request.UserAgent="FluentSoundSwitcher-AuNight/"+CurrentVersion;request.Timeout=10000;request.ReadWriteTimeout=20000;return request;}
 public static bool ValidAsset(Dictionary<string,object> asset){return Regex.IsMatch(Text(asset,"name"),@"^FluentSoundSwitcher-[0-9A-Za-z.\-]+-Setup-x64\.exe$")&&Text(asset,"browser_download_url").StartsWith(Repo+"download/",StringComparison.Ordinal)&&Regex.IsMatch(Text(asset,"digest"),@"^sha256:[0-9a-fA-F]{64}$");}
 public static bool Verify(string file,string digest){if(!Regex.IsMatch(digest??"",@"^sha256:[0-9a-fA-F]{64}$"))return false;using(var hash=SHA256.Create())using(var stream=File.OpenRead(file)){string actual=BitConverter.ToString(hash.ComputeHash(stream)).Replace("-","");return string.Equals(actual,digest.Substring(7),StringComparison.OrdinalIgnoreCase);}}
 static void Install(Dictionary<string,object> asset){
  string cache=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"FluentSoundSwitcher","updates");Directory.CreateDirectory(cache);
  string target=Path.Combine(cache,Text(asset,"name")),partial=target+".partial";Publish("downloading");
  try{
   var request=Request(Text(asset,"browser_download_url"));using(var response=request.GetResponse())using(var input=response.GetResponseStream())using(var output=new FileStream(partial,FileMode.Create,FileAccess.Write,FileShare.None)){
    long length=response.ContentLength,total=0;if(length>134217728)throw new InvalidDataException("Installer too large");byte[] buffer=new byte[65536];int count;var watch=Stopwatch.StartNew();
    while((count=input.Read(buffer,0,buffer.Length))>0){total+=count;if(total>134217728)throw new InvalidDataException("Installer too large");output.Write(buffer,0,count);if(watch.ElapsedMilliseconds>300){state["progress"]=length>0?(int)(total*100/length):0;Publish("downloading");watch.Restart();}}
   }
   if(!Verify(partial,Text(asset,"digest")))throw new CryptographicException("Installer digest mismatch");
   if(File.Exists(target))File.Delete(target);File.Move(partial,target);Publish("installing");
   Process.Start(new ProcessStartInfo(target,"/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /FSSAUTOUPDATE=1"){UseShellExecute=true,WindowStyle=ProcessWindowStyle.Hidden});
  }finally{try{if(File.Exists(partial))File.Delete(partial);}catch{}}
 }
 static void Publish(string stage){
  try{
  state["stage"]=stage;Directory.CreateDirectory(Dir);string file=Path.Combine(Dir,"update-status.json"),temp=file+".tmp",json=new JavaScriptSerializer().Serialize(state);
  for(int i=0;i<3;i++)try{File.WriteAllText(temp,json);if(File.Exists(file))File.Replace(temp,file,null);else File.Move(temp,file);return;}catch{Thread.Sleep(30);}
  }catch{}
 }
}
