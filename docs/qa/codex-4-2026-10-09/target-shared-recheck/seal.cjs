const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const digest=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=n=>JSON.parse(fs.readFileSync(path.join(__dirname,n),'utf8').replace(/^\uFEFF/,''));
const manifestFile=path.join(__dirname,'verification.json');
if(!process.argv.includes('--seal')){
 const m=read('verification.json');for(const i of m.fingerprints)assert.equal(digest(i.file),i.sha256,i.file);
 if(process.argv.includes('--source'))for(const i of m.testedInputs)assert.equal(digest(i.servedFile||i.file),i.sha256,i.file);
 console.log(`PASS ${m.fingerprints.length} SD4-006 fingerprints; developer shared recheck PASS, QA/QC/Figma/native pending.`);
}else{
 assert.ok(!fs.existsSync(manifestFile),'Already frozen; preserve it.');assert.match(process.env.RAPIDO_QA_HEAD||'',/^[a-f0-9]{40}$/);
 const input=read('source-inputs.json'),browser=read('browser-results.json'),proof=read('proof-results.json'),types=read('typecheck-results.json');
 for(const i of input.inputs)assert.equal(digest(i.servedFile||i.file),i.sha256,i.file);
 assert.equal(browser.status,'PASS');assert.equal(browser.passed,24);assert.deepEqual(browser.errors,[]);assert.deepEqual(browser.consoleErrors,[]);assert.equal(browser.apiRequests.filter(x=>!['GET','OPTIONS'].includes(x.method)).length,0);
 assert.equal(proof.status,'PASS');assert.equal(proof.passed,6);assert.equal(types.status,'PASS');assert.deepEqual(types.diagnostics,[]);
 function artifacts(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(i=>{const f=path.join(dir,i.name);return i.isDirectory()?artifacts(f):i.name==='verification.json'?[]:[path.relative(process.cwd(),f).replaceAll('\\','/')];});}
 const files=[...input.inputs.filter(i=>!i.servedFile).map(i=>i.file),...artifacts(__dirname)];
 const m={owner:'Software Developer Senior4 / Codex-4',ticket:'SD4-006',status:'READY_FOR_QA',sourceDelta:0,head:process.env.RAPIDO_QA_HEAD,sealedAt:new Date().toISOString(),sharedDependencyGate:'DEVELOPER_RECHECK_PASS_PENDING_QA_QC',figmaParityGate:'PENDING',nativeGate:'PENDING',testedInputs:input.inputs,externalOverlay:input.externalOverlay,generatedStyleOverlay:input.generatedStyleOverlay,checks:{browserScenarios:24,navigation17Repeated:17,targetedSharedScenarios:7,runtimeErrors:0,consoleErrors:0,apiMutations:0,typecheckRoots:4,typecheckSourceFiles:types.sourceFiles,typecheckDiagnostics:0,proof:6,callback18:'Reused unchanged layout/Header hashes; not rerun or added'},boundaries:['Developer evidence, not an independent QA/QC decision or visual approval.','No application source edits; two shared source overlays already authored by Senior5, selected44 sources plus a production CSS snapshot. Not all imported modules.','Production app entry/providers/guard/ExpoRouter with auth/API fixture and HTML/CSS boot adapter, Target session fixture. No backend/native/SSR certification.','HTML uses captured productionCSS bytes after bundler startup; global generated cache may regenerate and is not frozen.','Parent SD4-005/status/Income/QC packets preserved; old READY statuses not overwritten.','Only final24 counted; initial18 before runner locator failure is not an app failure or extra successful cohort.','Current Figma tool unavailable; metadata references only, full frame screenshot/style matching pending.','Own8097 stopped; HP8088/backend8001 preserved. No dependency/Git publication.'],fingerprints:files.map(file=>({file,sha256:digest(file)}))};
 fs.writeFileSync(manifestFile,JSON.stringify(m,null,2)+'\n');console.log(`Sealed ${files.length} SD4-006 fingerprints.`);
}
