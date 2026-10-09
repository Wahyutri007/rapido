const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const packet=path.resolve(__dirname,'../sales-target-navigation');
const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
const original=read(path.join(packet,'verification.json'));
for(const i of original.fingerprints)assert.equal(digest(i.file),i.sha256,i.file);
const inputs=read(path.join(packet,'source-inputs.json'));
for(const f of inputs.owned)assert.equal(digest(f),inputs.inputs.find(x=>x.file===f).sha256,f);
const statusPath=path.join(__dirname,'status.json');
if(process.argv.includes('--seal')){
 assert.ok(!fs.existsSync(statusPath),'Already sealed.');
 const delta=read(path.join(packet,'post-test-dependency-delta.json'));
 const files=[path.join(__dirname,'HANDOFF.md'),__filename,path.join(packet,'verification.json')].map(f=>path.relative(process.cwd(),f).replaceAll('\\','/'));
 const status={owner:'Codex-4 / Software Developer Senior4',ticket:'SD4-005',status:'READY_FOR_QA_SHARED_RECHECK',sharedDependencyGate:'PENDING',figmaParityGate:'PENDING',nativeGate:'PENDING',ownedSources:inputs.owned,testedInputs:inputs.inputs,postTestChanges:delta.changes,originalEvidenceFingerprints:original.fingerprints.length,sealedAt:new Date().toISOString(),scope:'Authoritative status supplement; verify owned layout and historical evidence, not approval of changed dependencies.',fingerprints:files.map(file=>({file,sha256:digest(file)}))};
 fs.writeFileSync(statusPath,JSON.stringify(status,null,2)+'\n');
}
const status=read(statusPath);assert.equal(status.status,'READY_FOR_QA_SHARED_RECHECK');
for(const i of status.fingerprints)assert.equal(digest(i.file),i.sha256,i.file);
if(process.argv.includes('--runtime'))for(const i of status.testedInputs)assert.equal(digest(i.file),i.sha256,i.file);
console.log(`PASS original${original.fingerprints.length}+status${status.fingerprints.length} evidence fingerprints; owned source unchanged. Shared/Figma/native gates PENDING.`);
