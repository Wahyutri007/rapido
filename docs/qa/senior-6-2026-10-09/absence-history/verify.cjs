const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {owned,shared,read}=require('./sources.cjs');
const manifestPath=path.join(__dirname,'verification.json');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json=name=>JSON.parse(fs.readFileSync(path.join(__dirname,name),'utf8'));
const sourceFiles=[...owned,...shared,...read];
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
if(process.argv.includes('--seal')){
 assert.ok(!fs.existsSync(manifestPath),'Frozen manifest already exists; do not reseal');
 const model=json('model-results.json'),browser=json('browser-results.json'),quality=json('quality-results.json'),types=json('typecheck-results.json');
 assert.equal(model.status,'PASS');assert.equal(browser.status,'PASS');assert.equal(types.status,'PASS');assert.ok(quality.checks.every(c=>c.exitCode===0&&!c.error));
 for(const file of [...owned,...shared])for(const report of [model,browser,quality]){assert.equal(report.before[file],sha(file),file+' report/source binding');assert.equal(report.after[file],sha(file),file+' report/source end binding');}
 for(const file of read){assert.equal(model.before[file],sha(file));assert.equal(browser.before[file],sha(file));}
 assert.deepEqual(browser.runtime,[]);assert.deepEqual(browser.consoleErrors,[]);assert.deepEqual(browser.blocked,[]);
 const snapshot=path.join(__dirname,'source-snapshot');fs.mkdirSync(snapshot,{recursive:true});
 [...owned,...shared].forEach((file,index)=>fs.copyFileSync(file,path.join(snapshot,`${index}-${path.basename(file)}.txt`)));
 const manifest={status:'READY_FOR_QA',signal:'SD6-005-ABSENCE-HISTORY-READY-FOR-QA',sealedAt:new Date().toISOString(),counts:{model:model.passed,browser:browser.passed,quality:quality.checks.length,total:model.passed+browser.passed+quality.checks.length},contracts:Object.fromEntries(sourceFiles.map(file=>[file,sha(file)])),snapshots:Object.fromEntries([...owned,...shared].map((file,index)=>[file,`source-snapshot/${index}-${path.basename(file)}.txt`])),artifacts:Object.fromEntries(files(__dirname).filter(file=>file!==manifestPath).map(file=>[path.relative(__dirname,file),sha(file)])),limitations:'Developer evidence; preview/session data read-only, browser navigator/params/fixtures and offline transport. No independent QA/QC approval, full app/native/auth/backend/persistence/Figma certification or publication.'};
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
}
const manifest=json('verification.json');
for(const [file,hash] of Object.entries(manifest.contracts))assert.equal(sha(file),hash,'Source contract drift: '+file);
for(const [file,hash] of Object.entries(manifest.artifacts))assert.equal(sha(path.join(__dirname,file)),hash,'Frozen artifact drift: '+file);
for(const [file,snapshot] of Object.entries(manifest.snapshots))assert.ok(fs.readFileSync(file).equals(fs.readFileSync(path.join(__dirname,snapshot))),'Snapshot byte drift: '+file);
console.log(JSON.stringify({status:manifest.status,signal:manifest.signal,contracts:Object.keys(manifest.contracts).length,artifacts:Object.keys(manifest.artifacts).length,checks:manifest.counts.total,readOnly:!process.argv.includes('--seal')}));
