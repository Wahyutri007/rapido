const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.join(__dirname,'browser-fixture'),target=path.resolve('.expo/sd5-closing-preview');
assert.ok(target.startsWith(path.resolve('.expo')+path.sep));
for(const file of JSON.parse(fs.readFileSync(base+'/files.json','utf8'))){const bytes=fs.readFileSync(base+'/'+file+'.txt'),out=path.join(target,file);if(fs.existsSync(out))assert.ok(bytes.equals(fs.readFileSync(out)),'Existing fixture differs; choose a reviewer namespace instead of overwriting');else{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,bytes);}}
console.log('Browser fixture prepared. Copy runners/output to a reviewer packet before replay; this packet is frozen.');
