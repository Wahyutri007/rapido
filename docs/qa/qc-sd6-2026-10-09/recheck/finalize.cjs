const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname, file)));
const life = read('results.json');
const snapshot = read('snapshot.json');
const contract = read('contract-validation.json');
const lint = read('eslint.json');
const sources = Object.fromEntries(Object.keys(life.sources).map(file => [file,
  crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const developerDir = path.resolve('docs/qa/senior-6-2026-10-09');
const manifest = JSON.parse(fs.readFileSync(path.join(developerDir, 'verification.json')));
const uiResult = JSON.parse(fs.readFileSync(path.join(developerDir, 'ui-api-results.json')));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const compare = (entries, resolve) => Object.entries(entries).map(([file, expected]) => ({
  file, expected, actual:hash(resolve(file)), matches:hash(resolve(file)) === expected,
}));
const evidenceReview = {
  manifestStatus:manifest.status,
  manifestSha256:hash(path.join(developerDir, 'verification.json')),
  sources:compare(manifest.sources, file => file),
  developerEvidence:compare(manifest.evidenceHashes, file => path.join(developerDir, file)),
  uiResultDependencies:compare(uiResult.sourceHashes, file => file),
  developerUIChecksPassed:uiResult.checks.filter(check => check.passed).length,
  scope:'Read and fingerprint review of final developer UI evidence, not QC browser rerun',
};
fs.writeFileSync(path.join(__dirname, 'handoff-review.json'), JSON.stringify(evidenceReview, null, 2) + '\n');
if ([...evidenceReview.sources, ...evidenceReview.developerEvidence, ...evidenceReview.uiResultDependencies]
  .some(file => !file.matches)) throw Error('Final developer handoff evidence or UI snapshot changed');
if (JSON.stringify(sources) !== JSON.stringify(life.sources) || !snapshot.stable
  || !contract.passed || contract.databaseQueryCount !== 0 || life.runtimeErrors.length
  || life.checks.some(check => !check.passed) || lint.some(file => file.errorCount || file.warningCount)) {
  throw Error('Gate failed or source snapshot changed');
}
const decision = {
  id: 'QC-SD6-20261009-PASS-DELTA',
  status: 'PASS_DELTA_FOR_PM_REVIEW',
  date: '2026-10-09',
  closedFindings: [{id:'QC-SD6-001', severity:'P1', status:'CLOSED',
    sourceSha256:sources['app/(no-layout)/manage/pos-settings/rounding.tsx']}],
  sources,
  verification: {
    developerLifecycleRerun:42, qcAdditionalScenarios:12, lifecyclePassed:life.checks.length,
    requestAndPricingPayloadsPassed:contract.cases.length, databaseQueryCount:contract.databaseQueryCount,
    runtimeErrors:0, eslintErrors:0, eslintWarnings:0, biome:'PASS', diffCheck:'PASS',
    fullIntegrationTypecheck:'PM_PENDING',
    uiApiDeveloperEvidence:'FINAL_REVIEWED_AND_FINGERPRINTED_NOT_QC_BROWSER_RERUN',
  },
  report:'recheck/REPORT.md',
  scope:'Lifecycle delta plus rounding unit contract; full native/API/printer/stock-category/applyTo/main approval excluded',
  handoffChannel:'Shared workspace documents; direct delivery not claimed',
};
fs.writeFileSync(path.join(__dirname, 'DECISION.json'), JSON.stringify(decision, null, 2) + '\n');
console.log(JSON.stringify({status:decision.status, lifecycle:life.checks.length,
  payloads:contract.cases.length, stable:snapshot.stable}));
