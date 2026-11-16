using System;
using System.Collections.Generic;
class BackgroundUpdatePolicyTest {
 static void Expect(bool expected,Dictionary<string,object> prefs){if(FluentReleaseCheck.ShouldNotify(prefs,"v2")!=expected)throw new Exception("Notification preference mismatch");}
 static void Main(){
 Expect(true,new Dictionary<string,object>());
 Expect(false,new Dictionary<string,object>{{"skip","v2"}});
 Expect(true,new Dictionary<string,object>{{"skip","v1"}});
 long future=(long)(DateTime.UtcNow-new DateTime(1970,1,1)).TotalMilliseconds+86400000;
 Expect(false,new Dictionary<string,object>{{"remindVersion","v2"},{"remindAfter",future}});
 Expect(true,new Dictionary<string,object>{{"remindVersion","v1"},{"remindAfter",future}});
 Expect(true,new Dictionary<string,object>{{"remindVersion","v2"},{"remindAfter",1}});
 Console.WriteLine("PASS: background notice respects skipped/deferred versions and does not suppress newer releases");
 }
}
