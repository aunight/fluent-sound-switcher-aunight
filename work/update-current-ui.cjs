// Refresh only the embedded UI asset. Preserve all native fixes in the input.
const fs=require('fs'),z=require('zlib'),vm=require('vm'),crypto=require('crypto');
const [input,output]=process.argv.slice(2);if(!input||!output||input===output)throw Error('Specify different input/output paths');
const b=fs.readFileSync(input),start=4764733,capacity=213091;
let js=z.brotliDecompressSync(b.subarray(start)).toString('utf8');
const prefix='fssStyle.textContent=',suffix=';document.head.appendChild(fssStyle)';
const p=js.lastIndexOf(prefix),q=js.indexOf(suffix,p);
if(p<0||q<0)throw Error('Current theme injection missing');
JSON.parse(js.slice(p+prefix.length,q));
const css=['fss-theme.css','system-theme.css','win7-theme.css','settings-design.css'].map(f=>fs.readFileSync('work/'+f,'utf8')).join('\n').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\n\s*/g,'\n');
js=js.slice(0,p+prefix.length)+JSON.stringify(css)+js.slice(q);
for(const [diameter,radius] of [[13,6.5],[20,10],[16,8]]){
 if(js.includes('(lit*'+diameter+')'))js=js.replace('(lit*'+diameter+')','(lit*14)').replace('(Math.min(1,lit*40)*'+radius+')','(Math.min(1,lit*40)*7)');
}
if(!js.includes('(lit*14)'))throw Error('Peak sizing missing');
js=require('./patch-hover-behavior.cjs')(js);
js=require('./patch-panel-animation.cjs')(js);
js=require('./patch-preserve-layout.cjs')(js);
js=require('./patch-tray-menu.cjs')(js);
js=require('./patch-system-sounds.cjs')(js);
js=require('./patch-session-order.cjs')(js);
js=require('./patch-system-theme.cjs')(js);
js=require('./patch-glass-option.cjs')(js);
js=require('./patch-settings-design.cjs')(js);
if(process.env.FSS_RELEASE_URL)js=require('./patch-release-links.cjs')(js);
js=require('./patch-input-meter.cjs')(js);
js=js.replace('className:e.scroll,"data-route-scroll":!0,children:', 'className:e.scroll,"data-route-scroll":!0,tabIndex:0,children:');
js=require('./patch-scroll-overflow.cjs')(js);
new vm.Script(js);
const asset=z.brotliCompressSync(Buffer.from(js),{params:{[z.constants.BROTLI_PARAM_QUALITY]:11}});
if(asset.length>capacity)throw Error('Asset too large');
const out=Buffer.from(b);out.fill(0,start,start+capacity);asset.copy(out,start);
if(z.brotliDecompressSync(out.subarray(start)).toString('utf8')!==js)throw Error('Roundtrip failed');
if(!b.subarray(0,start).equals(out.subarray(0,start))||!b.subarray(start+capacity).equals(out.subarray(start+capacity)))throw Error('Native bytes changed');
fs.writeFileSync(output,out);fs.writeFileSync('work/current-ui-patched.js',js);
console.log(JSON.stringify({output,compressed:asset.length,capacity,nativeBytesUnchanged:true,sha256:crypto.createHash('sha256').update(out).digest('hex')},null,2));
