using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

// Read-only Live meter listeners. No project, file or driver changes.
static class FluentAbletonMeter {
 sealed class Reading {public int Pid;public float Peak;public long Stamp;public double SourceTime;}
 static volatile Reading reading;static int busy,pid;static long next,lastVisible,backoff;
 public static long LeaseUntil;
 static long leaseAt;
 public static bool Leased{get{long now=Now();if(now>=leaseAt){leaseAt=now+500;try{var file=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"com.fluentsoundswitcher.app","asio-meter-control.json");var data=new JavaScriptSerializer().Deserialize<Dictionary<string,object>>(File.ReadAllText(file));object value;if(data.TryGetValue("until",out value))Interlocked.Exchange(ref LeaseUntil,Convert.ToInt64(value));}catch{}}return Interlocked.Read(ref LeaseUntil)>now;}}
 static readonly object SocketLock=new object(),UdpLock=new object();
 static TcpClient connection;static NetworkStream channel;static long lastRead;static UdpClient receiver;static string token;
 static readonly string LevelFile=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"com.fluentsoundswitcher.app","asio-level.json");
 static long Now(){return (long)(DateTime.UtcNow-new DateTime(1970,1,1)).TotalMilliseconds;}
 public static object Snapshot(){var value=reading;var result=new Dictionary<string,object>();if(value!=null&&Now()-value.Stamp<1000)result[value.Pid.ToString()]=new{peak=value.Peak,source="ableton-master-push",timestamp=value.Stamp,sourceTime=value.SourceTime};return result;}
 public static void Poll(){
  long now=Now();Interlocked.Exchange(ref lastVisible,now);
  if(now<Interlocked.Read(ref next)||now<Interlocked.Read(ref backoff)||Interlocked.CompareExchange(ref busy,1,0)!=0)return;
  Interlocked.Exchange(ref next,now+2000);
  ThreadPool.QueueUserWorkItem(delegate{try{
   int found=0,count=0;foreach(var process in Process.GetProcesses())using(process)try{if(process.ProcessName.StartsWith("Ableton Live",StringComparison.OrdinalIgnoreCase)){found=process.Id;count++;}}catch{}
   pid=count==1?found:0;if(pid==0){Idle();return;}
   int port;string nonce;lock(UdpLock){if(receiver==null){receiver=new UdpClient(new IPEndPoint(IPAddress.Loopback,0));token=Guid.NewGuid().ToString("N");receiver.BeginReceive(Receive,receiver);}port=((IPEndPoint)receiver.Client.LocalEndPoint).Port;nonce=token;}
   string script=Subscription.Replace("__TOKEN__",nonce).Replace("__PORT__",port.ToString()).Replace("__PID__",pid.ToString());
   Rpc("exec",new{code=script,timeout=2,strict_timeout=true});
  }catch{Interlocked.Exchange(ref backoff,Now()+12000);}finally{Interlocked.Exchange(ref busy,0);}});
 }
 public static void Idle(){lock(UdpLock){if(receiver!=null){receiver.Close();receiver=null;}token=null;reading=null;}}
 static void Receive(IAsyncResult pending){
  var udp=(UdpClient)pending.AsyncState;try{IPEndPoint from=null;byte[] bytes=udp.EndReceive(pending,ref from);if(IPAddress.IsLoopback(from.Address)&&bytes.Length<1024){var packet=new JavaScriptSerializer().Deserialize<Dictionary<string,object>>(Encoding.UTF8.GetString(bytes));lock(UdpLock){if(receiver==udp&&Convert.ToString(packet["token"])==token&&Convert.ToInt32(packet["pid"])==pid){float peak=Convert.ToSingle(packet["peak"]);if(!float.IsNaN(peak)&&!float.IsInfinity(peak))reading=new Reading{Pid=pid,Peak=Math.Max(0,Math.Min(1,peak)),Stamp=Now(),SourceTime=Convert.ToDouble(packet["sourceTime"])};}}}}
  catch{}finally{var latest=reading;if(latest!=null)Publish(latest);lock(UdpLock){if(receiver==udp){if(Now()-Interlocked.Read(ref lastVisible)>5000){receiver.Close();receiver=null;reading=null;}else try{udp.BeginReceive(Receive,udp);}catch{receiver=null;}}}}
 }
 static void Publish(Reading value){try{var peaks=new Dictionary<string,object>{{value.Pid.ToString(),new{peak=value.Peak,source="ableton-master-push",timestamp=value.Stamp,sourceTime=value.SourceTime}}};string temp=LevelFile+".tmp";File.WriteAllText(temp,new JavaScriptSerializer().Serialize(new{asioPeaks=peaks}));if(File.Exists(LevelFile))File.Replace(temp,LevelFile,null);else File.Move(temp,LevelFile);}catch{}}
 static object Rpc(string method,object parameters){lock(SocketLock){try{
  if(connection!=null&&Now()-lastRead>4000){connection.Close();connection=null;channel=null;}
  if(connection==null){connection=new TcpClient();var connect=connection.BeginConnect("127.0.0.1",8765,null,null);try{if(!connect.AsyncWaitHandle.WaitOne(150))throw new TimeoutException("Live bridge unavailable");connection.EndConnect(connect);}finally{connect.AsyncWaitHandle.Close();}connection.ReceiveTimeout=2500;connection.SendTimeout=300;channel=connection.GetStream();}
  lastRead=Now();var json=new JavaScriptSerializer();byte[] request=Encoding.UTF8.GetBytes(json.Serialize(new{jsonrpc="2.0",id=1,method=method,@params=parameters})+"\n");channel.Write(request,0,request.Length);
  var bytes=new List<byte>();for(int b;(b=channel.ReadByte())>=0&&b!=10;){bytes.Add((byte)b);if(bytes.Count>32768)throw new InvalidDataException();}
  var root=json.Deserialize<Dictionary<string,object>>(Encoding.UTF8.GetString(bytes.ToArray()));object result;if(!root.TryGetValue("result",out result))throw new InvalidOperationException("Live meter subscription failed");return result;
 }catch{if(connection!=null)connection.Close();connection=null;channel=null;throw;}}}
 public static float ReadMaster(){var result=(Dictionary<string,object>)Rpc("get",new{@ref=new{path="live_set master_track"},properties=new[]{"output_meter_left","output_meter_right"},timeout=2,strict_timeout=true});var properties=(Dictionary<string,object>)result["properties"];return Math.Max(Convert.ToSingle(properties["output_meter_left"]),Convert.ToSingle(properties["output_meter_right"]));}
 const string Subscription=@"import socket, json, time
old=getattr(this,'_fss_volume_stream',None)
master=song.master_track
if old and old['active'] and old['token']=='__TOKEN__' and old['pid']==__PID__ and old['master']==master:
    old['deadline']=time.monotonic()+8
else:
    if old: old['stop']()
    udp=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
    udp.setblocking(False)
    state={'active':True,'last':0,'deadline':time.monotonic()+8,'token':'__TOKEN__','pid':__PID__,'master':master}
    def stop():
        if not state['active']: return
        state['active']=False
        for side in ('left','right'):
            try: getattr(master,'remove_output_meter_'+side+'_listener')(send)
            except: pass
        udp.close()
    def send():
        if not state['active']: return
        now=time.monotonic()
        if now>state['deadline']: stop(); return
        if now-state['last']<0.025: return
        state['last']=now
        try:
            peak=max(master.output_meter_left,master.output_meter_right)
            udp.sendto(json.dumps({'token':state['token'],'pid':state['pid'],'peak':peak,'sourceTime':time.time()}).encode('utf-8'),('127.0.0.1',__PORT__))
        except: stop()
    def beat():
        if state['active']:
            send()
            if state['active']: this.schedule_message(3,beat)
    state['stop']=stop
    this._fss_volume_stream=state
    master.add_output_meter_left_listener(send)
    master.add_output_meter_right_listener(send)
    beat()
result={'streaming':True}";
}
