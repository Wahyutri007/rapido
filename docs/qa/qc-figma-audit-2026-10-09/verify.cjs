// Read-only verifier. Never update fingerprints or regenerate the frozen audit.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.json'),'utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),failed=[];
for(const artifact of manifest.artifacts){const f=path.resolve(__dirname,artifact.file);if(!f.startsWith(__dirname+path.sep)||!fs.existsSync(f)||hash(f)!==artifact.sha256)failed.push({kind:'artifact',file:artifact.file});}
const source=process.argv.includes('--source');if(source)for(const input of manifest.sources){const f=path.join(root,input.file);if(!fs.existsSync(f)||hash(f)!==input.sha256)failed.push({kind:'source',file:input.file});}
console.log(JSON.stringify({signal:manifest.signal,scope:'Packet integrity; not app/design PASS',artifacts:manifest.artifacts.length,sourcesChecked:source?manifest.sources.length:0,failures:failed},null,2));if(failed.length)process.exitCode=1;
