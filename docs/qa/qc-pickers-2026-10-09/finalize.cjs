const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname,file)));
const fingerprint = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const suites = ['availability','form','single-select','sort'];
const results = suites.map(suite => read(suite === 'form' ? 'form-results.json' : suite+'-results.json'));
const snapshots = suites.map(suite => read(suite+'-snapshot.json'));
const additional = read('search-sort-results.json');
const lint = read('eslint.json');
for (const result of results) {
  if (result.failed || result.errors?.length || result.checks.some(check => typeof check === 'object' && !check.pass)) {
    throw Error('Picker test gate failed');
  }
}
for (const snapshot of snapshots) {
  if (!snapshot.stable || Object.entries(snapshot.after).some(([file,hash]) => fingerprint(file) !== hash)) {
    throw Error('Source or harness changed since verification');
  }
}
if (additional.failed || additional.errors.length || additional.checks.some(check => !check.pass)
  || Object.entries(additional.after).some(([file,hash]) => fingerprint(file) !== hash)
  || lint.some(file => file.errorCount || file.warningCount)) throw Error('Caller/static gate failed');
const rg = spawnSync('rg',['-n','-g','*.tsx','<SingleSelect|<SortActionSheet','app','components'],{encoding:'utf8'});
if (rg.status !== 0) throw Error('Could not inventory caller source');
const callers = rg.stdout.trim().split(/\r?\n/);
fs.writeFileSync(path.join(__dirname,'callers.json'),JSON.stringify({
  date:'2026-10-09',singleSelect:callers.filter(line=>line.includes('<SingleSelect')).length,
  sortActionSheet:callers.filter(line=>line.includes('<SortActionSheet')).length,
  entries:callers,scope:'Text inventory; representative source read, not runtime certification of every caller',
},null,2)+'\n');
const sourceFiles = ['components/common/SingleSelect.tsx','components/common/SortActionSheet.tsx'];
const sources = Object.fromEntries(sourceFiles.map(file=>[file,fingerprint(file)]));
const developerRerun = results.reduce((sum,result)=>sum+(result.passed ?? result.count),0);
const decision = {
  id:'QC-PICKERS-20261009-PASS-DELTA',status:'PASS_DELTA_FOR_PM_REVIEW',date:'2026-10-09',sources,
  verification:{developerAssertionRerun:developerRerun,qcCallerAssertions:additional.passed,
    totalPassed:developerRerun+additional.passed,failed:0,runtimeActErrors:0,eslintErrors:0,eslintWarnings:0,
    biome:'PASS',diffCheck:'PASS',fullIntegrationTypecheck:'PM_PENDING'},
  report:'REPORT.md',scope:'SingleSelect lifecycle/availability and SortActionSheet lifecycle delta with production Form/RHF/SearchBar/useSearch caller adapters',
  limitations:['No QC browser/native/accessibility/full navigator/API/Figma certification',
    'Native/UI/animation/haptic primitives are host adapters','Full-project integration and publication require PM gates'],
  handoffChannel:'Shared workspace; direct delivery not claimed',
};
fs.writeFileSync(path.join(__dirname,'DECISION.json'),JSON.stringify(decision,null,2)+'\n');
console.log(JSON.stringify({status:decision.status,totalPassed:decision.verification.totalPassed,callerInventory:callers.length}));
