const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const directory = __dirname;
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before = read('fingerprints-before.json'), after = read('fingerprints-after.json');
assert.deepEqual(after.changed, []);
for (const [key, value] of Object.entries(after.fingerprints)) {
  const [domain, ...parts] = key.split(':');
  const file = path.join(domain === 'backend' ? before.backendRoot : before.frontendRoot, parts.join(':'));
  assert.equal(hash(file), value, key);
}
const lifecycle = read('results.json'), backend = read('backend-results.json'), independent = read('independent-screen-results.json'), identity = read('domain-identity-results.json'), policy = read('stock-policy-results.json');
assert.equal(lifecycle.sourceHash, before.sourceHash); assert.equal(lifecycle.passed, 31); assert.equal(lifecycle.failed, 0); assert.equal(lifecycle.runtimeConsoleErrors.length, 0);
assert.equal(backend.passed, true); assert.equal(backend.cases.length, 25); assert.ok(backend.cases.every(x => x.passed));
assert.equal(independent.passed, 24); assert.equal(independent.failed, 0); assert.equal(independent.runtimeReactErrors.length, 0);
assert.equal(identity.passed, 6); assert.equal(identity.failed, 0);
assert.equal(policy.passed, 20); assert.equal(policy.failed, 10); assert.equal(policy.database, ':memory:'); assert.equal(policy.transactionLevel, 0); assert.equal(policy.hashesStable, true);
assert.equal(policy.controllerRoundtrips.length, 4);
const failing = policy.checks.filter(x => !x.passed);
assert.ok(failing.every(x => /^(item exclusion|category exclusion) \/ (accessor|zero-stock validation)/.test(x.name)));
for (const [file, sha] of Object.entries(policy.sourceHashes)) assert.equal(hash(path.join(before.backendRoot, file)), sha, file);
assert.equal(hash(path.join(directory, 'payloads.json')), backend.payloadHash);
assert.equal(hash(path.join(directory, 'payloads.json')), policy.payloadHash);
assert.equal(hash(path.join(directory, 'backend-contract.php')), hash(path.join(before.frontendRoot, 'docs/qa/senior-6-2026-10-09/stock-contract/backend-contract.php')));
const eslint = read('eslint.json'); assert.equal(eslint.length, 1); assert.equal(eslint[0].errorCount, 0); assert.equal(eslint[0].warningCount, 0);
fs.writeFileSync(path.join(directory, 'quality-results.json'), JSON.stringify({
  eslint: {exitCode: 0, files: 1, errorCount: 0, warningCount: 0, command: "node node_modules/eslint/bin/eslint.js 'app/(no-layout)/manage/pos-settings/stock-limit.tsx' --no-cache --max-warnings 0 --format json --output-file docs/qa/qc-stock-contract-2026-10-09/eslint.json"},
  biome: {exitCode: 0, output: 'Checked 1 file in 20ms. No fixes applied.', command: "node node_modules/@biomejs/biome/bin/biome check 'app/(no-layout)/manage/pos-settings/stock-limit.tsx'"},
  diffCheck: {exitCode: 0, command: "git diff --check -- 'app/(no-layout)/manage/pos-settings/stock-limit.tsx'", workingDirectory: before.frontendRoot, output: 'No whitespace errors; Git emitted LF/CRLF conversion advisory.'},
  typecheck: {qcRerun: false, developerClaim: 'Scoped one root/dependency closure, 0 diagnostic in HANDOFF.md', fullProjectCertification: false},
  figma: {callableToolsDiscovered: 0, parityCertified: false},
}, null, 2)+'\n');
fs.writeFileSync(path.join(directory, 'harness-notes.json'), JSON.stringify({
  finalProductChecks: {policyPassed: 20, policyFailed: 10, frontendRuntimeErrors: 0},
  corrections: [
    {issue: 'First git diff invocation used backend root, which is not a Git repository.', correction: 'Reran scoped diff check from application root; exit 0. Initial invocation excluded from gate evidence.'},
    {issue: 'Initial memory fixture tried to inject Store.latestShift as a relation; production implements an accessor and queried store_shifts.', correction: 'Created isolated store_shifts table and open shift fixture; production accessor/SQL now runs. No missing-table error in final run. The initial Console exception output returned shell exit 0, so success is validated by artifacts and assertions as well as exit code.'},
    {issue: 'Initial controller roundtrip assertion compared complete POST and GET JSON objects, including nullable defaults and relations populated during Eloquent serialization.', correction: 'Compare source-consumed contract fields: ID/type/enabled/content_type default and morph-type/ID detail pairs. Record both full responses. Two harness-only mismatch assertions removed; four roundtrips pass and ten accessor/guard product failures remain.'},
  ],
}, null, 2)+'\n');
const decision = {
  id: 'QC-STOCK-CONTRACT-20261009-CHANGES-REQUESTED', status: 'CHANGES_REQUESTED', completedAt: new Date().toISOString(),
  sourceDeltaStatus: 'PASS_DELTA', integrationStatus: 'CHANGES_REQUESTED', publicationApproval: false,
  sourceDeltaScope: 'One frontend stock-limit.tsx state/query-selection/payload delta, with UI/query/native/modal/router adapters and actual Laravel Request on isolated fixture database.',
  reviewedSourceHashes: {'app/(no-layout)/manage/pos-settings/stock-limit.tsx': before.sourceHash},
  reviewedBackendHashes: policy.sourceHashes, sourceFingerprintCount: Object.keys(after.fingerprints).length, fingerprintsStable: true,
  assertions: {developerLifecycleRerun: {passed: 31, failed: 0}, developerRequestRerun: {passed: 25, failed: 0}, qcScreen: {passed: 24, failed: 0}, qcNamespace: {passed: 6, failed: 0}, qcPolicy: {passed: 20, failed: 10}, total: {passed: 106, failed: 10}},
  findings: [{id: 'QC-STOCK-001', severity: 'P1', status: 'OPEN', owner: 'PM / backend owner with Senior6 contract coordination', source: 'app/Domain/Catalog/Models/Menu.php:67/83', consumer: 'app/Domain/Order/Requests/TransactionRequest.php:52/66', title: 'Hybrid stock policy inverts item exclusions and ignores category policy', origin: 'Existing backend dependency mismatch; not demonstrated to be introduced by SD6-002 frontend delta.', evidence: 'stock-policy-results.json', failedAssertions: 10, distinctFailedPolicyCombinations: 5, impact: 'Selected item is incorrectly stock-limited; unselected items and products outside an excluded category bypass actual zero-stock validation after-rule in isolated fixtures.'}],
  followup: 'Align exclusion policy and namespace with owner/settings scope, legacy content type and uncategorized menus; rerun production policy guards, submit new backend hashes and final Query/Axios supplement for QC recheck before PM publication.',
  actualWrites: 'QC-authored files are own artifacts and session coordination; backend persistence was ephemeral SQLite :memory:. Framework exception reporting may append ordinary diagnostic logs. No actual HTTP/application DB/transaction/source edits/Metro/server/device/Git writes.',
  limitations: ['CartService/Cart::load are preloaded graph adapters; no transaction creation, HTTP middleware/auth, bundle or live database.', 'Frontend UI/native/query/mutation/router/modal adapters; actual screen/SearchBar/React DOM/StrictMode only.', 'No Figma/native/full-project typecheck/full-app certification.', 'Developer Query/Axios supplement not yet delivered in reviewed handoff; no approval implied.', 'Startup cache and yellow phone warning remain separate open gates.'],
};
fs.writeFileSync(path.join(directory, 'DECISION.json'), JSON.stringify(decision, null, 2)+'\n');
if (process.argv.includes('--handoff')) {
  const coordination = path.join(before.frontendRoot, 'docs/SESSION_COORDINATION.md');
  const marker = '## QC — SD6-002 FINAL CHANGES_REQUESTED (9 Oktober 2026)';
  if (!fs.readFileSync(coordination, 'utf8').includes(marker)) fs.appendFileSync(coordination, `\n\n${marker}\n\nQC-STOCK-CONTRACT-20261009-CHANGES-REQUESTED. Scope review selesai; keputusan/report/runner/bukti sendiri docs/qa/qc-stock-contract-2026-10-09/. Source stock-limit.tsx 1e0d3195772926d05f7f26c9325f494a2e27074a26edf1441993db374e7dc666 lulus delta state/draft/jenis/ID/loading/error/Request; persetujuan fitur terintegrasi ditahan. 31rerun React DOM +25Request/ownership +24QC screen/SearchBar StrictMode +6QC namespace-ID +30QC controller/model/stock/TransactionRequest after-rule =116eksekusi:106lulus/10gagal. Runtime/React0. ESLint1source0error/warning, Biome/diff-check0; TypeScript scoped hanya klaim handoff developer, bukan rerun QC/global.50fingerprint tracked cocok/stabil,24hash policy backend stabil. Figma callable tidak tersedia. Supplement Query/Axios developer belum final pada paket yang direview.\n\nQC-STOCK-001 P1 OPEN: Menu::isStockManaged (Menu.php:67/83) memperlakukan detail item hybrid sebagai pembatasan, berlawanan copy Semua Produk/Kecuali; mode kategori mengabaikan content_type/category_id. Lima kombinasi salah diuji accessor+guard =10kegagalan. Item terpilih stok0 salah ditolak; menu lain/produk di luar kategori pengecualian/produk tanpa kategori tidak dikumpulkan oleh guard produksi TransactionRequest::after (baris52/66). Empat controller store/GET dengan payload handler layar lulus dan membuktikan jenis/ID benar tersimpan. Semua persistensi/SQL di SQLite :memory:, StockService stok0 dan shift terbuka produksi; hanya CartService/Cart::load graph fixture. Tidak ada HTTP/transaksi penjualan/database aplikasi nyata. Temuan backend existing, bukan regresi pasangan jenis/ID baru.\n\nPM/pemilik backend bersama Senior6 diminta menyelaraskan kebijakan pengecualian item/kategori dengan owner/current-setting dan kontrak legacy/no-category, ulang kasus30+namespace/all/disabled dan serahkan hash baru serta supplement final untuk recheck QC. Inversi boolean item saja belum menutup kategori; jangan mengirim ID kategori sebagai item. Tidak ada source patch aplikasi/backend di-apply, commit/push/merge/index/branch/Metro/server/HP/dependency/globaltypecheck/PDFsnapshot dioperasikan. Koreksi persiapan harness dibedakan dalam harness-notes.json. Sinyal lewat workspace; tidak mengklaim percakapan lain menerima langsung. Startup cache/alert kuning masih gate terpisah.\n`);
}
const files = fs.readdirSync(directory).filter(file => file !== 'artifact-manifest.json' && fs.statSync(path.join(directory, file)).isFile()).sort();
fs.writeFileSync(path.join(directory, 'artifact-manifest.json'), JSON.stringify({generatedAt: new Date().toISOString(), files: Object.fromEntries(files.map(file => [file, hash(path.join(directory, file))]))}, null, 2)+'\n');
console.log(`${decision.id}: ${decision.assertions.total.passed} passed / ${decision.assertions.total.failed} failed; ${files.length} artifacts hashed`);
