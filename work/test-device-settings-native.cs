using System;using System.Collections.Generic;using System.Web.Script.Serialization;
class DeviceSettingsProbe{static void Main(string[] args){var r=new Dictionary<string,object>{{"command",args.Length==0?"list":"read"},{"deviceId",args.Length==0?"":args[0]}};Console.WriteLine(new JavaScriptSerializer().Serialize(FluentDeviceSettings.Execute(r)));}}
