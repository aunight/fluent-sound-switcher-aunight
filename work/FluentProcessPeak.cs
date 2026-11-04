using System;
using System.Runtime.InteropServices;
using System.Threading;

[ComImport,Guid("1CB9AD4C-DBFA-4C32-B178-C2F568A703B2"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IProcessAudioClient {
 [PreserveSig]int Initialize(int mode,uint flags,long duration,long period,ref ProcessWaveFormat format,IntPtr session);
 [PreserveSig]int GetBufferSize(out uint frames);
 [PreserveSig]int GetStreamLatency(out long latency);
 [PreserveSig]int GetCurrentPadding(out uint frames);
 [PreserveSig]int IsFormatSupported(int mode,IntPtr format,out IntPtr closest);
 [PreserveSig]int GetMixFormat(out IntPtr format);
 [PreserveSig]int GetDevicePeriod(out long normal,out long minimum);
 [PreserveSig]int Start();
 [PreserveSig]int Stop();
 [PreserveSig]int Reset();
 [PreserveSig]int SetEventHandle(IntPtr handle);
 [PreserveSig]int GetService(ref Guid iid,[MarshalAs(UnmanagedType.IUnknown)]out object value);
}
[StructLayout(LayoutKind.Sequential,Pack=2)]
public struct ProcessWaveFormat {public ushort tag,channels;public uint rate,bytesPerSecond;public ushort blockAlign,bits,extra;}
[ComImport,Guid("C8ADBD64-E71E-48A0-A4DE-185C395CD317"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IProcessCaptureClient {
 [PreserveSig]int GetBuffer(out IntPtr data,out uint frames,out uint flags,out ulong position,out ulong qpc);
 [PreserveSig]int ReleaseBuffer(uint frames);
 [PreserveSig]int GetNextPacketSize(out uint frames);
}
[ComImport,Guid("72A22D78-CDE4-431D-B8CC-843A71199B6D"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IProcessActivation { [PreserveSig]int GetActivateResult(out int result,[MarshalAs(UnmanagedType.IUnknown)]out object value); }
[ComVisible(true),Guid("41D949AB-9862-444A-80F6-C261334DA5EB"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IProcessCompletion { [PreserveSig]int ActivateCompleted(IProcessActivation operation); }
[ComVisible(true),Guid("94EA2B94-E9CC-49E0-C0FF-EE64CA8F5B90"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IProcessAgile {}
[ComVisible(true),ClassInterface(ClassInterfaceType.None)]
public sealed class FluentProcessPeak : IProcessCompletion,IProcessAgile,IDisposable {
 [StructLayout(LayoutKind.Explicit,Size=24)] struct BlobVariant {
  [FieldOffset(0)]public ushort type;
  [FieldOffset(8)]public uint size;
  [FieldOffset(16)]public IntPtr data;
 }
 [DllImport("Mmdevapi.dll",CharSet=CharSet.Unicode,ExactSpelling=true)]
 static extern int ActivateAudioInterfaceAsync(string path,ref Guid iid,ref BlobVariant parameters,IProcessCompletion completion,out IProcessActivation operation);
 readonly ManualResetEvent completed=new ManualResetEvent(false);
 readonly AutoResetEvent ready=new AutoResetEvent(false);
 IProcessActivation operation;
 IProcessAudioClient client;
 IProcessCaptureClient capture;
 int activationResult;
 short[] samples=new short[0];
 public FluentProcessPeak(uint pid) {
  IntPtr parameters=Marshal.AllocHGlobal(12);
  try {
   Marshal.WriteInt32(parameters,0,1); // AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK
   Marshal.WriteInt32(parameters,4,unchecked((int)pid));
   Marshal.WriteInt32(parameters,8,0); // Include only target process and its children.
   var variant=new BlobVariant{type=65,size=12,data=parameters};
   Guid iid=typeof(IProcessAudioClient).GUID;
   Check(ActivateAudioInterfaceAsync("VAD\\Process_Loopback",ref iid,ref variant,this,out operation));
   if(!completed.WaitOne(3000))throw new TimeoutException("Process audio activation timed out");
   Check(activationResult);
  } finally {Marshal.FreeHGlobal(parameters);}
 }
 static void Check(int result){Marshal.ThrowExceptionForHR(result);}
 public int ActivateCompleted(IProcessActivation asyncOperation) {
  try {
   object activated;int result;Check(asyncOperation.GetActivateResult(out result,out activated));Check(result);
   client=(IProcessAudioClient)activated;
   var format=new ProcessWaveFormat{tag=1,channels=2,rate=44100,bits=16,blockAlign=4,bytesPerSecond=176400};
   Check(client.Initialize(0,0x80060000,0,0,ref format,IntPtr.Zero));
   Guid iid=typeof(IProcessCaptureClient).GUID;object service;Check(client.GetService(ref iid,out service));capture=(IProcessCaptureClient)service;
   Check(client.SetEventHandle(ready.SafeWaitHandle.DangerousGetHandle()));Check(client.Start());activationResult=0;
  } catch(Exception error){activationResult=Marshal.GetHRForException(error);}
  finally {completed.Set();}
  return 0;
 }
 public float ReadPeak() {
  if(capture==null)return 0;
  float peak=0;uint packet;
  for(int packets=0;packets<64;packets++) {
   Check(capture.GetNextPacketSize(out packet));if(packet==0)break;
   IntPtr data;uint frames,flags;ulong position,qpc;Check(capture.GetBuffer(out data,out frames,out flags,out position,out qpc));
   try {
    if((flags&2)==0&&data!=IntPtr.Zero){int count=checked((int)frames*2);if(samples.Length<count)samples=new short[count];Marshal.Copy(data,samples,0,count);for(int i=0;i<count;i++){float value=Math.Abs((int)samples[i])/32768f;if(value>peak)peak=value;}}
   } finally {Check(capture.ReleaseBuffer(frames));}
  }
  return peak;
 }
 public void Dispose() {
  if(client!=null){try{client.Stop();}catch{}}
  if(capture!=null){Marshal.ReleaseComObject(capture);capture=null;}
  if(client!=null){Marshal.ReleaseComObject(client);client=null;}
  if(operation!=null){Marshal.ReleaseComObject(operation);operation=null;}
  ready.Dispose();completed.Dispose();
 }
}
class ProcessPeakProbe {
 [MTAThread]static void Main(string[] args){using(var meter=new FluentProcessPeak(uint.Parse(args[0]))){for(int i=0;i<30;i++){Thread.Sleep(100);Console.WriteLine(meter.ReadPeak().ToString(System.Globalization.CultureInfo.InvariantCulture));}}}
}
