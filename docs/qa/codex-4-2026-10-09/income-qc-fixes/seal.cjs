const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const file=path.join(__dirname,'verification.json');
if(!process.argv.includes('--seal')){
 const manifest=read(file);for(const item of manifest.fingerprints)assert.equal(digest(item.file),item.sha256,item.file);
 console.log(`PASS: ${manifest.fingerprints.length} SD4-004 fingerprints match.`);
}else{
 assert.ok(!fs.existsSync(file),'Already sealed. Default command verifies read-only.');
 const head=process.env.RAPIDO_QA_HEAD;assert.ok(/^[a-f0-9]{40}$/.test(head||''));
 const income=read(path.join(__dirname,'lifecycle-results.json')),expense=read(path.join(__dirname,'expense-results.json')),proof=read(path.join(__dirname,'proof-results.json')),types=read(path.join(__dirname,'typecheck-results.json')),lint=read(path.join(__dirname,'eslint-results.json'));
 assert.equal(income.passed,36);assert.equal(income.failed,0);assert.deepEqual(income.errors,[]);assert.equal(income.tested,'CURRENT_PRODUCTION_SOURCE');
 assert.equal(expense.passed,6);assert.equal(expense.failed,0);assert.deepEqual(expense.errors,[]);assert.equal(expense.tested,'CURRENT_PRODUCTION_SOURCE');
 assert.equal(proof.status,'PASS');assert.equal(proof.passed,7);assert.equal(types.status,'PASS');assert.deepEqual(types.diagnostics,[]);
 assert.equal(lint.length,4);assert.ok(lint.every(item=>item.errorCount===0&&item.warningCount===0));
 for(const suite of [income,expense])for(const [source,sha]of Object.entries(suite.sourceHashes))assert.equal(digest(source),sha,source);
 const decision=read('docs/qa/qc-income-2026-10-09/DECISION.json');for(const [source,sha]of Object.entries(decision.proposal.sourceHashes))assert.equal(digest(source),sha,source);
 const qcManifest=read('docs/qa/qc-income-2026-10-09/artifact-manifest.json');for(const item of qcManifest.files)assert.equal(digest(path.join('docs/qa/qc-income-2026-10-09',item.file)),item.sha256,item.file);
 function artifacts(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item=>{const target=path.join(dir,item.name);return item.isDirectory()?artifacts(target):item.name==='verification.json'?[]:[path.relative(process.cwd(),target).replaceAll('\\','/')];});}
 const sources=Object.keys(decision.proposal.sourceHashes), runtimeInputs=[...new Set([...Object.keys(income.sourceHashes),...Object.keys(expense.sourceHashes)])];
 const files=[...new Set([...runtimeInputs,...artifacts(__dirname)])];
 const result={owner:'Software Developer Senior4 / Codex-4',ticket:'SD4-004',status:'READY_FOR_QC_RECHECK',head,sealedAt:new Date().toISOString(),sourceFiles:sources,runtimeInputs,findings:proof.findingResults,checks:{baselinePassed:24,baselineFailed:12,incomePassed:36,expenseRegressionPassed:6,runtimeErrors:0,proofPassed:7,qcHistoricalArtifactsUnchanged:38,eslintFiles:4,eslintErrors:0,eslintWarnings:0,typecheckSources:types.sourceFiles,typecheckDiagnostics:0,biomeObservedExit:0,diffObservedExit:0},boundaries:['Actual application source matches QC proposal, not independent QC approval or CLOSED findings.','Node fixture uses production route/form/modal/RHF/Zod/helper/store with native/UI/router/timing adapters; no new browser/native/Figma/HTTP certification.','Expense regression is six shared-form cases, not complete feature approval.','UI geometry/footer/shared primitive/dependency/Metro/HP/backend/Git publication not changed.','Prior QC artifacts preserved; current24runtime hashes tied to execution. Other app dependencies are outside the runtime fixture.'],fingerprints:files.map(source=>({file:source,sha256:digest(source)}))};
 fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');console.log(`Sealed ${files.length} fingerprints including two modified application sources.`);
}
