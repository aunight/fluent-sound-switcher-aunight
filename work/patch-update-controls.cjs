module.exports=function(js){
 const start=js.indexOf('function bO('),end=js.indexOf('function yO(',start);let part=js.slice(start,end);
 const from=part.indexOf('z.jsx(Qe,{label:"GitHub Releases"'),to=part.indexOf('z.jsx(Qe,{label:e("support.reportBug")',from);
 if(start<0||end<0||from<0||to<0)throw Error('Support update controls anchor missing');
 part=part.slice(0,from)+'z.jsx(FssSupportUpdates,{}),'+part.slice(to);
 const version=require('fs').readFileSync('work/FluentReleaseCheck.cs','utf8').match(/CurrentVersion="([^"]+)"/)[1];
 part=part.replace('r?e("support.version",{version:r}):e("support.versionLoading")','e("support.version",{version:'+JSON.stringify(version)+'})');
 js=js.slice(0,start)+part+js.slice(end);
 return js+'\n'+require('fs').readFileSync('work/fss-support-updates.js','utf8');
};
