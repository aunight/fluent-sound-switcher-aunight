using System;using System.Web.Script.Serialization;class AsioProbe{static void Main(){Console.WriteLine(new JavaScriptSerializer().Serialize(FluentAsioInfo.Read()));}}
