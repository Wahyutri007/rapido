const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const sourceFiles = ['app/(cashier)/location/index.tsx','app/(cashier)/_layout.tsx','app/(no-layout)/(cashier)/_layout.tsx','app/(no-layout)/(cashier)/location/_layout.tsx','app/(no-layout)/(cashier)/location/detail.tsx','components/feature/cashier/location/CashierLocationScreen.tsx','components/feature/cashier/location/CashierLocationDetailScreen.tsx','components/feature/cashier/location/LocationCommon.tsx','lib/cashier/location.ts','types/ui/cashier/location.ts'];
const readOnlyContracts = ['store/placeStore.ts','types/ui/manage/place.ts','constants/data/manage/place.ts','components/common/Header.tsx','components/common/Wrapper.tsx','components/common/SingleSelect.tsx','components/common/SearchBar.tsx','components/custom/CatalogItemCard.tsx','components/custom/DetailRow.tsx','components/custom/JSStack.tsx'];
const manifestPath = path.join(__dirname,'verification.json');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (!process.argv.includes('--seal')) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  for (const item of manifest.fingerprints) assert.equal(digest(item.file),item.sha256,item.file);
  console.log(`PASS: ${manifest.fingerprints.length} SD4-003 fingerprints match.`);
} else {
  assert.ok(!fs.existsSync(manifestPath),'Already sealed: use --verify, do not rewrite history.');
  const head = process.env.RAPIDO_QA_HEAD; assert.ok(/^[a-f0-9]{40}$/.test(head || ''));
  const read = name => JSON.parse(fs.readFileSync(path.join(__dirname,name),'utf8').replace(/^\uFEFF/,''));
  const model=read('model-results.json'), browser=read('browser-results.json'), types=read('typecheck-results.json'), lint=read('eslint-results.json'), integration=read('integration-results.json'), capture=read('capture-results.json');
  assert.equal(model.status,'PASS'); assert.equal(model.passed,28);
  assert.equal(browser.status,'PASS'); assert.equal(browser.passed,13); assert.deepEqual(browser.errors,[]); assert.deepEqual(browser.consoleErrors,[]);
  assert.equal(browser.apiRequests.filter(item=>!['GET','OPTIONS'].includes(item.method)).length,0);
  assert.equal(types.status,'PASS'); assert.deepEqual(types.diagnostics,[]);
  assert.equal(lint.length,10); assert.ok(lint.every(item=>item.errorCount===0 && item.warningCount===0));
  assert.equal(capture.status,'PASS'); assert.deepEqual(capture.errors,[]); assert.deepEqual(capture.consoleErrors,[]);
  assert.equal(integration.status,'PASS'); assert.equal(integration.passed,3);
  for (const item of model.inputs) assert.equal(digest(item.file),item.sha256,item.file);
  function artifacts(directory) {return fs.readdirSync(directory,{withFileTypes:true}).flatMap(item=>{const file=path.join(directory,item.name);return item.isDirectory()?artifacts(file):item.name==='verification.json'?[]:[path.relative(process.cwd(),file).replaceAll('\\','/')];});}
  const files=[...sourceFiles,...readOnlyContracts,...artifacts(__dirname)];
  const manifest={owner:'Software Developer Senior 4 / Codex-4',ticket:'SD4-003',status:'READY_FOR_QA',head,sealedAt:new Date().toISOString(),sourceFiles,readOnlyContracts,checks:{model:28,browser:13,integration:3,runtimeErrors:0,consoleErrors:0,apiMutations:0,typecheckDiagnostics:0,typecheckSourceFiles:types.sourceFiles,lintSourceFiles:10,lintErrors:0,lintWarnings:0,biomeObservedExitCode:0,sourceDiffObservedExitCode:0},boundaries:[
    'Developer evidence on a shared working tree, not independent QA/QC approval or an isolated commit.',
    'Read-only existing local design outlets/areas/places; explicit preview selection, no mapping to active backend store, no occupancy/reservations/orders/API/persistence.',
    'Actual production app entry/providers/router with isolated browser owner/token/API and HTML/CSS boot adapter; not real backend/auth or native/Figma certification.',
    'Selected shared hashes are recorded at sealing. Other shared dependencies are not sealed; concurrent changes require QA replay.',
    'Initial and second browser failures preserved in before; repeated assertions counted only in final suite.',
    'Metro8088 and backend8001 remain active for HP. CI disables watchers: later source changes need owner restart.',
    'Historical Payroll/Absensi packets and reports were not resealed. Git publication remains PM-owned.'
  ],fingerprints:files.map(file=>({file,sha256:digest(file)}))};
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');console.log(`Sealed ${files.length} fingerprints, including ten application sources.`);
}


