module.exports=function(js){const i=js.indexOf('function FssAsioSummary()');if(i<0)throw Error('ASIO summary missing');return js.slice(0,i)+require('fs').readFileSync('work/fss-asio-row.js','utf8')};
