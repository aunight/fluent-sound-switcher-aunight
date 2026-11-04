const fs=require('fs');
const file=process.argv[2],url=process.env.FSS_RELEASE_URL;
if(!file||!/^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+\/releases$/.test(url||''))throw Error('Expected executable path and FSS_RELEASE_URL');
const original='https://github.com/Leocadio94/fluent-sound-switcher/releases/latest/download/latest.json';
// This edition distributes manual installers only. Point the inherited
// startup checker away from upstream to this edition's Releases page.
const target=url;
if(target.length>original.length-2)throw Error('Repository URL too long for fixed native endpoint');
const replacement=target+'?'+'x'.repeat(original.length-target.length-1);
const bytes=fs.readFileSync(file),from=Buffer.from(original),to=Buffer.from(replacement);
const offset=bytes.indexOf(from);
if(offset<0||bytes.indexOf(from,offset+1)>=0||to.length!==from.length)throw Error('Native updater endpoint is not unique or has wrong size');
to.copy(bytes,offset);fs.writeFileSync(file,bytes);console.log('Updater endpoint replaced without changing binary size');
