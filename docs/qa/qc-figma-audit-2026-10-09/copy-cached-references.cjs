const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const index=path.join(__dirname,'cached-reference-index.json'),data=JSON.parse(fs.readFileSync(index,'utf8'));
const target=path.join(__dirname,'references/cached');fs.mkdirSync(target,{recursive:true});
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for(const capture of data.captures){
 assert.equal(hash(capture.file),capture.sha256);
 const destination=path.join(target,path.basename(capture.file));
 if(path.resolve(capture.file)!==path.resolve(destination))fs.copyFileSync(capture.file,destination);
 assert.equal(hash(destination),capture.sha256);
 capture.originalCacheFile=capture.originalCacheFile||capture.file;capture.file=destination.replace(/\\/g,'/');
}
data.limits='Only Figma responses for the approved Rapido file, copied without alteration from workspace-matched sessions. No credential/profile/private unrelated conversation copied. Page XML is partially truncated. Not a live reread.';
fs.writeFileSync(index,JSON.stringify(data,null,2)+'\n');console.log(JSON.stringify({copied:data.captures.length,bytes:data.captures.reduce((a,c)=>a+c.bytes,0)}));
