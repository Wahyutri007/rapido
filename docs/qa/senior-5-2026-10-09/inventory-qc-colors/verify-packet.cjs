// Read-only frozen packet verifier. Writing replay must use a reviewer copy.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const manifest=JSON.parse(fs.readFileSync(__dirname+'/artifacts.json'));
for(const [f,h]of Object.entries(manifest.files))assert.equal(hash(path.join(__dirname,f)),h,'Artifact drift '+f);
const result={artifacts:Object.keys(manifest.files).length,matched:true};
if(process.argv.includes('--source')){const v=JSON.parse(fs.readFileSync(__dirname+'/verification.json'));for(const [f,h]of Object.entries(v.sourceHashes))assert.equal(hash(f),h,'Source drift '+f);result.sourceHashes=Object.keys(v.sourceHashes).length;}
console.log(JSON.stringify(result));
