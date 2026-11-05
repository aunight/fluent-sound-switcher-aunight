using System;
using System.IO;
using System.Xml;
using System.Drawing;
using System.Drawing.Imaging;

static class FluentAppIcons {
 public static string Read(string executable){
  string packaged=PackageIcon(executable);
  if(packaged!=null)return packaged;
  try{using(var icon=Icon.ExtractAssociatedIcon(executable))using(var bitmap=icon.ToBitmap())using(var stream=new MemoryStream()){bitmap.Save(stream,ImageFormat.Png);return "data:image/png;base64,"+Convert.ToBase64String(stream.ToArray());}}catch{return null;}
 }
 static string PackageIcon(string executable){
  try{
   if(!Path.IsPathRooted(executable))return null;
   var directory=new DirectoryInfo(Path.GetDirectoryName(executable));
   for(int depth=0;directory!=null&&depth<8;depth++,directory=directory.Parent){
    string manifest=Path.Combine(directory.FullName,"AppxManifest.xml");if(!File.Exists(manifest))continue;
    var doc=new XmlDocument{XmlResolver=null};
    using(var reader=XmlReader.Create(manifest,new XmlReaderSettings{DtdProcessing=DtdProcessing.Prohibit,XmlResolver=null}))doc.Load(reader);
    var applications=doc.SelectNodes("/*[local-name()='Package']/*[local-name()='Applications']/*[local-name()='Application']");
    XmlNode application=null;
    foreach(XmlNode candidate in applications){var attribute=candidate.Attributes["Executable"];if(attribute!=null&&string.Equals(Path.GetFullPath(Path.Combine(directory.FullName,attribute.Value)),Path.GetFullPath(executable),StringComparison.OrdinalIgnoreCase)){application=candidate;break;}}
    if(application==null&&applications.Count==1)application=applications[0];
    if(application==null)return null;
    var visual=application.SelectSingleNode("*[local-name()='VisualElements']");if(visual==null)return null;
    foreach(string attribute in new[]{"Square44x44Logo","Square150x150Logo","Logo"}){
     var logo=visual.Attributes[attribute];if(logo==null)continue;
     string path=Path.GetFullPath(Path.Combine(directory.FullName,logo.Value));
     if(!path.StartsWith(directory.FullName+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase))continue;
     string folder=Path.GetDirectoryName(path),stem=Path.GetFileNameWithoutExtension(path),extension=Path.GetExtension(path);
     string best=null;int bestScore=int.MinValue;
     if(!Directory.Exists(folder))continue;
     foreach(string candidate in Directory.GetFiles(folder,stem+"*"+extension)){
      string name=Path.GetFileNameWithoutExtension(candidate);
      if(name!=stem&&!name.StartsWith(stem+".",StringComparison.OrdinalIgnoreCase))continue;
      bool unplated=name.IndexOf("altform-unplated",StringComparison.OrdinalIgnoreCase)>=0;
      bool light=name.IndexOf("lightunplated",StringComparison.OrdinalIgnoreCase)>=0;
      var match=System.Text.RegularExpressions.Regex.Match(name,"targetsize-(\\d+)",System.Text.RegularExpressions.RegexOptions.IgnoreCase);
      int size=match.Success?int.Parse(match.Groups[1].Value):48;
      int score=(unplated?1000:0)-(light?2000:0)+(match.Success?200:0)-Math.Abs(size-48);
      if(score>bestScore){bestScore=score;best=candidate;}
     }
     if(best==null)continue;
     using(var image=Image.FromFile(best)){
      if(string.Equals(Path.GetExtension(best),".png",StringComparison.OrdinalIgnoreCase))return "data:image/png;base64,"+Convert.ToBase64String(File.ReadAllBytes(best));
      using(var output=new MemoryStream()){image.Save(output,ImageFormat.Png);return "data:image/png;base64,"+Convert.ToBase64String(output.ToArray());}
     }
    }
    return null;
   }
  }catch{}
  return null;
 }
}
