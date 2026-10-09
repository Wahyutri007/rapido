// Application-root; read-only default verifies an existing manifest. --seal creates it once.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const folder = __dirname, manifestPath = path.join(folder, 'verification.json');
const source = 'app/(no-layout)/manage/pos-settings/stock-limit.tsx';
const expectedSource = '0b61bef95fe023f1aa685560151c716c4c58faed9164509cd70546262878cc9d';
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8').replace(/^\uFEFF/, ''));
assert.equal(hash(source), expectedSource);
const lifecycle = read('results.json'), baseline = read('baseline-results.json'), query = read('query-http-results.json');
const ui = read('ui-recheck/browser-results.json'), audit = read('ui-recheck/token-audit.json'), quality = read('quality-results.json');
assert.equal(lifecycle.sourceHash, expectedSource); assert.equal(lifecycle.passed, 32); assert.equal(lifecycle.failed, 0); assert.deepEqual(lifecycle.runtimeConsoleErrors, []);
assert.equal(baseline.passed, 6); assert.equal(baseline.failed, 26);
assert.equal(query.checks.length, 12); assert.ok(query.checks.every(check => check.passed)); assert.deepEqual(query.runtimeConsoleErrors, []);
assert.equal(ui.passed, 36); assert.equal(ui.failed, 0); assert.ok(!ui.exception); assert.deepEqual(ui.errors, []); assert.deepEqual(ui.consoleErrors, []); assert.deepEqual(ui.blockedRequests, []); assert.deepEqual(ui.fingerprintDrift, []);
assert.equal(audit.sourceHash, expectedSource); assert.equal(audit.before.count, 15); assert.equal(audit.after.count, 0); assert.ok(audit.classNameOnlyDelta);
assert.equal(quality.beforeHash, expectedSource); assert.equal(quality.afterHash, expectedSource); assert.equal(quality.checks.length, 4); assert.ok(quality.checks.every(check => check.exitCode === 0));
const eslint = read('eslint.json'); assert.equal(eslint.length, 1); assert.equal(eslint[0].errorCount, 0); assert.equal(eslint[0].warningCount, 0);
const before = read('ui-recheck/fingerprints-before.json'), after = read('ui-recheck/fingerprints-after.json');
assert.deepEqual(before.files, after.files); assert.deepEqual(after.drift, []); assert.deepEqual(ui.sourceHashes, before.files);
assert.equal(ui.sourceHashes['components/common/SuccessModal.tsx'], 'f90eec3d8d4b95ad5a5b1b6ff7cc354e9097fe5d232eef4c0d020ebb61f4e495');
const sourceHashes = { ...query.sourceHashes };
const excludedRoutingContext = ['app/(no-layout)/_layout.tsx', 'app/(no-layout)/(cashier)/catalog/_layout.tsx'];
const routingObservation = read('ui-recheck/context-drift.json');
assert.deepEqual(routingObservation.drift.map(entry => entry.file).sort(), [...excludedRoutingContext].sort());
assert.ok(routingObservation.rootLayoutsNotExecuted && routingObservation.virtualLayoutProvidedByFixture);
for (const [file, expected] of Object.entries(ui.sourceHashes)) {
  if (excludedRoutingContext.includes(file)) continue;
  if (sourceHashes[file]) assert.equal(sourceHashes[file], expected, file);
  sourceHashes[file] = expected;
}
for (const [file, expected] of Object.entries(sourceHashes)) assert.equal(hash(file), expected, file);
assert.equal(hash('docs/qa/senior-6-2026-10-09/stock-contract/ui-recheck/ui-entry.jsx'), hash('.expo/senior6-stock-ui-entry.jsx'));
assert.equal(hash('docs/qa/senior-6-2026-10-09/stock-contract/scoped-tsconfig.json'), hash('.expo/senior6-stock-tsconfig.json'));
const historicalBackend = read('backend-results.json');
assert.equal(historicalBackend.cases.length, 26); assert.ok(historicalBackend.cases.every(check => check.passed));
assert.ok(historicalBackend.emptySettingControllerResponse.passed);
assert.equal(hash(path.join(folder, 'payloads.json')), historicalBackend.payloadHash);
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name); return entry.isDirectory() ? walk(file) : file === manifestPath ? [] : [file];
  });
}
const artifacts = Object.fromEntries(walk(folder).map(file => [path.relative(folder, file).replace(/\\/g, '/'), hash(file)]));
const summary = { lifecycle: { passed: 32, failed: 0, baselinePassed: 6, baselineFailed: 26 }, queryHttp: { passed: 12, failed: 0, fingerprints: Object.keys(query.sourceHashes).length }, browserUi: { passed: 36, failed: 0, fingerprintsStableDuringRun: Object.keys(ui.sourceHashes).length, laterChangedUnexecutedRoutingContext: excludedRoutingContext, runtimeErrors: 0, consoleErrors: 0, externalHttpAttempts: 0 }, tokenAudit: { before: 15, after: 0, classNameOnlyDelta: true }, quality: { eslintErrors: 0, eslintWarnings: 0, biomeExit: 0, scopedTypeScriptExit: 0, diffWhitespaceExit: 0 }, historicalBackend: { passed: 26, repeatedOnFinalTokenHash: false, status: 'DEFERRED; not UI gate or closed' } };
if (process.argv.includes('--seal')) {
  assert.ok(!fs.existsSync(manifestPath), 'Manifest exists; verify instead of overwriting frozen evidence');
  fs.writeFileSync(manifestPath, JSON.stringify({ capturedAt: new Date().toISOString(), owner: 'Software Developer Senior 6', status: 'READY_FOR_QA', source, sourceHash: expectedSource, sourceHashes, summary, artifacts, limitations: 'Developer fixtures; UI replay of QC harness. Independent QA/QC decision, native/full-router/Figma/live backend and PM publication remain separate. Backend evidence historical, not rerun.' }, null, 2) + '\n');
} else {
  const manifest = read('verification.json'); assert.deepEqual(manifest.sourceHashes, sourceHashes); assert.deepEqual(manifest.artifacts, artifacts); assert.deepEqual(manifest.summary, summary);
}
console.log(JSON.stringify({ status: 'READY_FOR_QA', sourceHash: expectedSource, artifacts: Object.keys(artifacts).length, summary }));
