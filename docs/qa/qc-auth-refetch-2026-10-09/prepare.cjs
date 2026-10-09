const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const folder = 'docs/qa/senior-5-2026-10-09/auth-refetch';
if (fs.existsSync(path.join(__dirname, 'artifact-manifest.json'))) throw Error('QC packet already sealed; use a new folder');
const manifest = JSON.parse(fs.readFileSync(folder + '/verification.json', 'utf8'));
assert.equal(manifest.status, 'READY_FOR_QC_RECHECK');
const expected = { ...manifest.executedSourceHashes, ...manifest.runtimeLibraryHashes, ...Object.fromEntries(manifest.scopeProof.contractChecks.map(x => [x.file, x.expected])), ...manifest.artifactHashes };
const matches = Object.entries(expected).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
assert.ok(matches.every(x => x.passed), 'Developer source/runtime/evidence fingerprint drift');
const historic = JSON.parse(fs.readFileSync(folder + '/historical-packets-check.json', 'utf8')).files;
const sealedQC = ['qc-login-2026-10-09', 'qc-boot-2026-10-09', 'qc-guard-2026-10-09'].flatMap(name => {
  const directory = 'docs/qa/' + name;
  const file = directory + '/artifact-manifest.json';
  const packet = JSON.parse(fs.readFileSync(file, 'utf8'));
  return [{ file, sha256: hash(file) }, ...packet.files.map(item => ({ file: directory + '/' + item.file, sha256: item.sha256 }))];
});
const historicalMatches = [...historic, ...sealedQC].map(x => ({ file: x.file, expected: x.sha256, actual: hash(x.file), passed: x.sha256 === hash(x.file) }));
assert.ok(historicalMatches.every(x => x.passed), 'Historical packet was changed');
const type = JSON.parse(fs.readFileSync(folder + '/typecheck-results.json', 'utf8'));
const typeMatches = Object.entries(type.rootHashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
assert.ok(typeMatches.every(x => x.passed));
const extra = ['app/_layout.tsx', 'hooks/useNavigateAuthenticated.ts', 'components/custom/SplashScreenView.tsx', 'lib/haptics.ts', 'metro.config.js', 'tailwind.config.js', 'scripts/preserve-nativewind-cache.cjs', folder + '/verification.json', 'docs/qa/qc-guard-2026-10-09/independent-runner.cjs', 'docs/qa/qc-boot-2026-10-09/independent-runner.cjs'];
const hashes = Object.fromEntries([...new Set([...Object.keys(expected), ...extra])].map(file => [file, hash(file)]));
fs.writeFileSync(path.join(__dirname, 'source-before.json'), JSON.stringify({ createdAt: new Date().toISOString(), handoffMatches: matches, hashes, historicalMatches, focusedTypeRootMatches: typeMatches, currentProviderPinned: false, note: 'All executed sources use current disk bytes matching the final SD5-005 handoff; historical packets are read-only.' }, null, 2) + '\n');
fs.copyFileSync('context/AuthContext.tsx', path.join(__dirname, 'AuthContext.reviewed.tsx.txt'));
fs.copyFileSync(folder + '/AuthContext.before.tsx.txt', path.join(__dirname, 'AuthContext.before.tsx.txt'));
fs.copyFileSync(folder + '/check.cjs', path.join(__dirname, 'replay.cjs'));
const output = path.relative(process.cwd(), __dirname).replaceAll('\\', '/');
for (const name of ['boot-regression', 'guard-regression']) {
  fs.mkdirSync(path.join(__dirname, name), { recursive: true });
  const original = fs.readFileSync(folder + '/' + name + '/check.cjs', 'utf8');
  const copy = original.replaceAll(folder + '/' + name, output + '/' + name);
  assert.equal(copy.replaceAll(output + '/' + name, folder + '/' + name), original);
  assert.notEqual(copy, original);
  fs.writeFileSync(path.join(__dirname, name, 'check.cjs'), copy);
}
fs.mkdirSync(path.join(__dirname, 'guard-integration'), { recursive: true });
const oldGuardRunner = fs.readFileSync('docs/qa/qc-guard-2026-10-09/independent-runner.cjs', 'utf8');
const anchor = "const tested = file === 'context/AuthContext.tsx' ? path.join(__dirname, 'fixtures/AuthContext.tsx.txt') : file;";
assert.equal(oldGuardRunner.split(anchor).length, 2);
const currentGuardRunner = oldGuardRunner.replace(anchor, 'const tested = file;').replace('CURRENT_GUARD_WITH_PINNED_HANDOFF_PROVIDER', 'CURRENT_GUARD_WITH_CURRENT_PROVIDER');
assert.equal(currentGuardRunner.replace('const tested = file;', anchor).replace('CURRENT_GUARD_WITH_CURRENT_PROVIDER', 'CURRENT_GUARD_WITH_PINNED_HANDOFF_PROVIDER'), oldGuardRunner);
fs.writeFileSync(path.join(__dirname, 'guard-integration/check.cjs'), currentGuardRunner);
fs.mkdirSync(path.join(__dirname, 'boot-integration'), { recursive: true });
const oldBootRunner = fs.readFileSync('docs/qa/qc-boot-2026-10-09/independent-runner.cjs', 'utf8');
const currentBootRunner = oldBootRunner.replaceAll('docs/qa/qc-boot-2026-10-09', output + '/boot-integration');
assert.equal(currentBootRunner.replaceAll(output + '/boot-integration', 'docs/qa/qc-boot-2026-10-09'), oldBootRunner);
assert.notEqual(currentBootRunner, oldBootRunner);
fs.writeFileSync(path.join(__dirname, 'boot-integration/check.cjs'), currentBootRunner);
const note = `

## QC - SD5-005 AuthProvider RECHECK IN_PROGRESS (9 Oktober 2026)

Scope koreksi context/AuthContext.tsx hash ${manifest.finalProviderHash} dari FINAL READY_FOR_QC_RECHECK. Folder QC docs/qa/qc-auth-refetch-2026-10-09/. Cocokkan fingerprint source/kontrak/library/artefak, replay85 login-provider +64boot +105guard ke output sendiri. Tambahan QC baru untuk gejala QC-LOGIN-001, retry/late storage/reverse-order StrictMode/remount/helpers nonowner. Replay tambahan QC Guard46 dan Boot41 pada pasangan provider+guard aktual; paket historis tetap beku. Root layout kontrak baca, bukan full navigator. Quality provider serta tipe lima root developer direview; Figma callable tidak tersedia. QC-LOGIN-001P2/002P3 tetap OPEN sampai final keputusan.

Provider saat ini memakai disk final, tidak pin provider lama. Penerimaan tiga temuan OPEN. QC tidak mengambil shared modal/Stock/Supplier/Payroll/account/ledger milik sesi lain. Tanpa source aplikasi, API/backend/DB/persistensi nyata/Metro/server/HP/dependency/globalTypeScript/Git branch/index/commit/push/PDFhistoris. Semua IO fixture memori.

Execution Profile & Operator Tips: High untuk shared auth loading/query/refetch/lifetime. Hash koreksi -> replay -> skenario QC -> quality -> closure per hash -> QA/PM; pertahankan bukti historis dan pisahkan gate perangkat/publikasi.
`;
const coordination = 'docs/SESSION_COORDINATION.md';
if (!fs.readFileSync(coordination, 'utf8').includes('## QC - SD5-005 AuthProvider RECHECK IN_PROGRESS')) fs.appendFileSync(coordination, note);
console.log(JSON.stringify({ handoffMatched: matches.length, trackedFiles: Object.keys(hashes).length, historicalMatched: historicalMatches.length, focusedTypeRootsMatched: typeMatches.length, providerHash: manifest.finalProviderHash, applicationEdited: false }));
