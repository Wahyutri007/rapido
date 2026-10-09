const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const read=n=>JSON.parse(fs.readFileSync(path.join(__dirname,n),'utf8').replace(/^\uFEFF/,''));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const inputs=read('source-inputs.json'),delta=read('post-test-dependency-delta.json');
assert.equal(delta.status,'PENDING_SHARED_DEPENDENCY_RECHECK');assert.equal(delta.ownedUnchanged,true);
for(const f of inputs.owned)assert.equal(hash(f),inputs.inputs.find(x=>x.file===f).sha256,f);
for(const i of inputs.inputs){const change=delta.changes.find(x=>x.file===i.file);assert.equal(hash(i.file),change?.current||i.sha256,i.file);if(change)assert.equal(change.sha256,i.sha256);}
assert.equal(read('browser-results.json').passed,17);assert.equal(read('navigation-results.json').passed,18);assert.equal(read('typecheck-results.json').status,'PASS');assert.equal(read('proof-results.json').passed,7);
assert.equal(hash(path.join(__dirname,'before/_layout.tsx')),read('before/navigation-results.json').inputs[0].sha256);
assert.equal(read('before/first-browser-pass/source-inputs.json').inputs[0].sha256,inputs.inputs[0].sha256);
const result={status:'PASS_EVIDENCE_FREEZE_ONLY',testedInputs:43,ownedUnchanged:true,unverifiedDependencyChanges:delta.changes.length,checkedAt:new Date().toISOString(),scope:'Matches owned layout and known post-test drift; does not test or approve changed dependencies.'};fs.writeFileSync(path.join(__dirname,'freeze-proof-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
