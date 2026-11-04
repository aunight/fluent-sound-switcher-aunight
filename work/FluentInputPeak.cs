using System;
using System.Runtime.InteropServices;
[ComImport,Guid("1CB9AD4C-DBFA-4C32-B178-C2F568A703B2"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IInputAudioClient {
 [PreserveSig]int Initialize(int mode,uint flags,long duration,long period,IntPtr format,IntPtr session);
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

sealed class FluentInputPeak:IDisposable{
 IInputAudioClient client;IProcessCaptureClient capture;int bits,kind;byte[] samples=new byte[0];
 public FluentInputPeak(IDevice device){
  IntPtr format=IntPtr.Zero;object obj=null;
  try{Guid iid=typeof(IInputAudioClient).GUID;Check(device.Activate(ref iid,23,IntPtr.Zero,out obj));client=(IInputAudioClient)obj;
   Check(client.GetMixFormat(out format));channelCount=(ushort)Marshal.ReadInt16(format,2);bits=(ushort)Marshal.ReadInt16(format,14);kind=(ushort)Marshal.ReadInt16(format,0);if(kind==65534)kind=Marshal.ReadInt32(format,24);
   if(channelCount<1||!((kind==3&&bits==32)||(kind==1&&(bits==16||bits==24||bits==32))))throw new NotSupportedException("Unsupported input format");
   Check(client.Initialize(0,0,1000000,0,format,IntPtr.Zero));iid=typeof(IProcessCaptureClient).GUID;Check(client.GetService(ref iid,out obj));capture=(IProcessCaptureClient)obj;Check(client.Start());
  }catch{Dispose();throw;}finally{if(format!=IntPtr.Zero)Marshal.FreeCoTaskMem(format);}
 }
 static void Check(int hr){Marshal.ThrowExceptionForHR(hr);}
 public float ReadPeak(){
  float peak=0;uint packet;
  for(int n=0;n<64;n++){Check(capture.GetNextPacketSize(out packet));if(packet==0)break;IntPtr data;uint frames,flags;ulong position,qpc;Check(capture.GetBuffer(out data,out frames,out flags,out position,out qpc));
   try{if((flags&2)==0&&data!=IntPtr.Zero){uint channels;
    channels=(uint)channelCount;int count=checked((int)frames*(int)channels*(bits/8));if(samples.Length<count)samples=new byte[count];Marshal.Copy(data,samples,0,count);
    for(int i=0;i<count;i+=bits/8){float value=0;if(kind==3&&bits==32)value=Math.Abs(BitConverter.ToSingle(samples,i));else if(kind==1&&bits==16)value=Math.Abs((int)BitConverter.ToInt16(samples,i))/32768f;else if(kind==1&&bits==32)value=(float)(Math.Abs((double)BitConverter.ToInt32(samples,i))/2147483648d);else if(kind==1&&bits==24){int v=samples[i]|samples[i+1]<<8|samples[i+2]<<16;if((v&0x800000)!=0)v|=unchecked((int)0xff000000);value=Math.Abs(v)/8388608f;}if(!float.IsNaN(value)&&!float.IsInfinity(value)&&value>peak)peak=value;}
   }}finally{Check(capture.ReleaseBuffer(frames));}
  }return Math.Min(1,peak);
 }
 int channelCount;
 public void Dispose(){if(client!=null)try{client.Stop();}catch{}if(capture!=null){Marshal.ReleaseComObject(capture);capture=null;}if(client!=null){Marshal.ReleaseComObject(client);client=null;}}
}
