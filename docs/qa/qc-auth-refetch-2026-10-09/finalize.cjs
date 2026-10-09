const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(__dirname, name), JSON.stringify(value, null, 2) + '\n');
const source = 'context/AuthContext.tsx', developerFolder = 'docs/qa/senior-5-2026-10-09/auth-refetch';
assert.ok(!fs.existsSync(path.join(__dirname, 'artifact-manifest.json')), 'QC packet already sealed');
const quality = read('quality-results.json'), before = read('source-before.json');
assert.equal(quality.status, 'PASS'); assert.equal(quality.totalPassed, 389); assert.equal(quality.totalFailed, 0);
assert.equal(quality.lint.errors, 0); assert.equal(quality.lint.warnings, 0);
assert.equal(quality.biome.exitCode, 0); assert.equal(quality.diff.exitCode, 0);
assert.equal(quality.unchangedOutsideDeclaredDelta, true);
assert.equal(hash(source), quality.sourceHash);
assert.equal(hash(path.join(__dirname, 'AuthContext.reviewed.tsx.txt')), quality.sourceHash);
assert.equal(hash(path.join(__dirname, 'AuthContext.before.tsx.txt')), 'f31182398af070ff77b84538653ec5e7ceff176965a6982a44de268f7620ae6c');
assert.ok(!/eslint-disable|biome-ignore|@ts-ignore|@ts-nocheck/.test(fs.readFileSync(source, 'utf8')));
const finalMatches = Object.entries(before.hashes).map(([file, expected]) => ({ file, expected, actual: hash(file), passed: expected === hash(file) }));
assert.equal(finalMatches.length, 61); assert.ok(finalMatches.every(x => x.passed));
for (const item of [...quality.historicalMatches, ...quality.runtimeMatches, ...quality.focusedTypecheck.currentSourceMatches]) assert.equal(hash(item.file), item.expected);
const outputs = ['final-results.json', 'boot-regression/final-results.json', 'guard-regression/final-results.json', 'guard-integration/independent-results.json', 'boot-integration/independent-results.json', 'independent-results.json'];
for (const file of outputs) {
  const result = read(file); assert.equal(result.failed, 0);
  assert.equal((result.errors || result.runtimeErrors || []).length, 0);
  assert.equal((result.unhandledRejections || []).length, 0);
  assert.equal((result.sources || result.sourceHashes)[source], quality.sourceHash);
}
const loginReplay = read('final-results.json'), independent = read('independent-results.json');
const originalP2Checks = ['real Query refetch failure: form receives generic error', 'real Query refetch failure: call returns an error', 'real button user-query failure: generic error appears in FormMessage'];
for (const name of originalP2Checks) assert.equal(loginReplay.checks.find(x => x.name === name)?.passed, true);
const newP2Checks = ['QC-LOGIN-001: actual button path sets generic form error', 'QC-LOGIN-001: production FormMessage renders the error', 'QC-LOGIN-001: hook caller receives user-validation error tuple'];
for (const name of newP2Checks) assert.equal(independent.checks.find(x => x.name === name)?.passed, true);
assert.equal(fs.readFileSync(path.join(__dirname, 'replay.cjs'), 'utf8'), fs.readFileSync(developerFolder + '/check.cjs', 'utf8'));
const qcFolder = path.relative(process.cwd(), __dirname).replaceAll('\\', '/');
for (const name of ['boot-regression', 'guard-regression']) {
  const replay = fs.readFileSync(path.join(__dirname, name + '/check.cjs'), 'utf8').replaceAll(qcFolder + '/' + name, developerFolder + '/' + name);
  assert.equal(replay, fs.readFileSync(developerFolder + '/' + name + '/check.cjs', 'utf8'));
}
const providerAnchor = "const tested = file === 'context/AuthContext.tsx' ? path.join(__dirname, 'fixtures/AuthContext.tsx.txt') : file;";
const restoredGuard = fs.readFileSync(path.join(__dirname, 'guard-integration/check.cjs'), 'utf8').replace('const tested = file;', providerAnchor).replace('CURRENT_GUARD_WITH_CURRENT_PROVIDER', 'CURRENT_GUARD_WITH_PINNED_HANDOFF_PROVIDER');
assert.equal(restoredGuard, fs.readFileSync('docs/qa/qc-guard-2026-10-09/independent-runner.cjs', 'utf8'));
const restoredBoot = fs.readFileSync(path.join(__dirname, 'boot-integration/check.cjs'), 'utf8').replaceAll(qcFolder + '/boot-integration', 'docs/qa/qc-boot-2026-10-09');
assert.equal(restoredBoot, fs.readFileSync('docs/qa/qc-boot-2026-10-09/independent-runner.cjs', 'utf8'));
write('harness-notes.json', {
  fixtureOrigin: 'New QC scenarios use the audited setup of developer SD5-005, itself copied from QC Login. Real Query/Axios/RHF/Zod and production Form/Login/AuthProvider execute with memory IO and host/route/RAF adapters.',
  replayIntegrity: 'Root developer replay bytes identical; boot/guard developer replay differs only output folder. Previous QC Guard scenarios differ only provider load seam and descriptive result label; prior QC Boot runner only output folder.',
  baseline: 'New scenarios deliberately reproduce 38 PASS/10 FAIL on the exact old production provider f311 with current Guard. Final current provider 48 PASS/0 FAIL; baseline failures are excluded from current totals.',
  guardMetadataCorrection: { evidence: 'guard-integration/harness-initial-metadata-results.json', issue: 'First copied runner retained the old descriptive PINNED_HANDOFF_PROVIDER label even though the provider loader already read current source603 and runtime hashes proved that.', correction: 'Correct the label/prepare recipe and rerun only the 46-case suite. Final label CURRENT_GUARD_WITH_CURRENT_PROVIDER and current provider hash match.', applicationFailure: false, countedTwice: false },
  isolation: 'No native rendering, actual transport/SecureStore, application servers/device/data writes, or source edits. Historical packets remain sealed.',
});
const completedAt = new Date().toISOString(), signal = 'QC-AUTH-20261009-PASS-RECHECK';
const findings = [
  { id: 'QC-LOGIN-001', severity: 'P2', status: 'CLOSED_BY_RECHECK', reviewedProviderHash: quality.sourceHash, evidence: ['final-results.json: original three failed checks now PASS', 'independent-results.json: new button/FormMessage/hook error and complete retry cases PASS'] },
  { id: 'QC-LOGIN-002', severity: 'P3', status: 'CLOSED_BY_RECHECK', reviewedProviderHash: quality.sourceHash, evidence: ['ESLint provider0error/0warning', 'Biome/diff exit0', 'No suppression/timer workaround; stable bootstrap/reload/StrictMode cases PASS'] },
];
write('DECISION.json', {
  owner: 'QC', ticket: 'SD5-005', signal, status: 'PASS_RECHECK', completedAt,
  scope: 'Provider correction and closure of QC Login findings on the current provider/unchanged login hook/current guard/boot hashes.',
  approvedSourceHashes: { [source]: quality.sourceHash },
  exercisedContractHashes: Object.fromEntries(['api/hooks/auth.ts', 'app/(onboarding)/login.tsx', 'app/index.tsx', 'hooks/useProtectedRoute.ts'].map(file => [file, hash(file)])),
  findings, newOpenFindings: [],
  supersedesFindingsFrom: { signal: 'QC-LOGIN-20261009-CHANGES-REQUESTED', decision: '../qc-login-2026-10-09/DECISION.json', findings: ['QC-LOGIN-001', 'QC-LOGIN-002'], originalHistoricalDecisionEdited: false },
  assertions: { suites: quality.counts, totalPassed: 389, totalFailed: 0, includesOverlappingCoverage: true, baseline: { passed: 38, failed: 10, countedInCurrentTotal: false } },
  quality: { eslintErrors: 0, eslintWarnings: 0, biomeExit: 0, diffExit: 0, unchangedOutsideDeclaredDelta: true, noSuppression: true },
  handoffFingerprintsMatched: before.handoffMatches.length, trackedDiskStable: finalMatches.length,
  historicalEvidence: { matchedEntries: before.historicalMatches.length, uniqueFiles: quality.historicalUniqueFiles, unchanged: true }, productionRuntimeModules: quality.productionRuntimeModules.length,
  focusedTypecheck: { developerEvidenceReviewed: true, rerunByQC: false, diagnosticCount: quality.focusedTypecheck.diagnosticCount, roots: quality.focusedTypecheck.roots, dependencyFingerprintsMatched: 83, fullProjectCheck: false },
  sourceApplicationEditedByQC: false, publicationApproval: false, publicationOwner: 'PM',
  separateOpenFindings: ['QC-INCOME-001 P2', 'QC-INCOME-002 P2', 'QC-INCOME-003 P3'],
  limitations: ['Memory transport/storage and host/route/RAF adapters; no actual backend/SecureStore/native frames/browser/HP/full root navigator/Figma parity certification.', 'Query fixtures retry:false and staleTime/gcTime:Infinity differ from production root retry:2 and staleTime:5min.', 'Failed user validation can retain the stored token under existing contract; no rollback/atomic auth or cross-instance login-logout guarantee.', 'Bootstrap cleanup ignores inactive read results but does not cancel storage IO or auth/query transactions already started.', 'Developer focused type evidence matches all83 source fingerprints; not rerun by QC and not global TypeScript.', 'Previous Guard/Boot decisions remain historical; these supplements verify the current pair under the stated fixtures.'],
  nextAction: 'QA/PM can use this per-hash recheck and the two closed findings for integration; device/network/root checks and Git publication remain PM gates.',
  evidence: ['REPORT.md', 'independent-baseline-results.json', 'independent-results.json', 'final-results.json', 'quality-results.json', 'final-verification.json', 'artifact-manifest.json'],
});
const rows = Object.entries(quality.counts).map(([name, count]) => '| ' + name + ' | ' + count.passed + ' | ' + count.failed + ' |').join('\n');
const modules = quality.productionRuntimeModules.map(file => '- `' + file + '`').join('\n');
fs.writeFileSync(path.join(__dirname, 'REPORT.md'), `# QC SD5-005 — Provider/Login recheck — 9 Oktober 2026

**PASS-RECHECK. QC-LOGIN-001 P2 dan QC-LOGIN-002 P3 ditutup pada hash Provider koreksi.** Kegagalan validasi user setelah POST login kini tampil pada form, hook menerima error, dan tombol dapat mencoba ulang. Diagnostic kualitas Provider sudah bersih. Sinyal **${signal}** tersedia untuk Senior5/QA/PM melalui workspace; integrasi/publikasi tetap ditangani PM.

Provider disetujui: \`${quality.sourceHash}\`. [Salinan source](AuthContext.reviewed.tsx.txt), [keputusan dan closure](DECISION.json). Source aplikasi telah dikoreksi developer; QC tidak mengedit source atau menerapkan patch historis.

## Hasil pada source aktual

| Suite | Lolos | Gagal |
| --- | ---: | ---: |
${rows}
| Total eksekusi assertion, cakupan berulang | 389 | 0 |

Semua hasil final runtime/React/act error dan unhandled rejection **0**. Tambahan QC baru memakai fixture library aktual yang diaudit dan menguji **48** assertion. Provider lama f311 dengan Guard saat ini: **38 lulus/10 gagal** pada skenario yang sama; Provider baru603: **48/48 lulus**. Baseline tidak masuk hitungan kelulusan source aktual. Sepuluh assertion gagal bukan sepuluh temuan baru; tiga mereproduksi gejala QC-LOGIN-001 dan tujuh menguji bootstrap/lifetime storage.

ESLint Provider **0 error/0 warning**, Biome/diff exit **0**, tanpa suppression. Pemeriksaan independen statement AST/source membuktikan type/useAuth, state awal, role/permission helpers, JSX provider, signOut/cache clearing dan code lain identik baseline setelah normalisasi EOL serta opsi refetch yang sengaja ditambahkan. Perubahan lain terbatas pada loader/reload/bootstrap effect dan binding refetch stabil.

TypeScript lima root developer **0 diagnostic**: provider, login hook/screen, boot, Guard beserta import/declaration closure. QC memeriksa fingerprint seluruh **83** source pada bukti tipe; tidak menjalankan ulang TypeScript terfokus/global.

## Penutupan temuan

- **QC-LOGIN-001 P2 — CLOSED_BY_RECHECK.** Tiga pemeriksaan yang gagal pada QC Login lama sekarang lulus dalam replay. Kasus QC baru melalui tombol dan FormMessage produksi menampilkan pesan generic setelah GET user500; hook menerima error pada GET user401. Draft dipertahankan dan tombol aktif untuk retry. Retry dua kali dalam satu event menghasilkan satu POST baru, satu storage write, satu GET; sukses mengautentikasi pengguna dan Guard mengarahkan home sekali.
- **QC-LOGIN-002 P3 — CLOSED_BY_RECHECK.** Lint/Biome Provider bersih. Dependency refetch stabil teruji dengan QueryObserver aktual: penyelesaian query/rerender tidak mengulang bootstrap. Loading bootstrap/reload selesai pada hasil aktif. Tidak menggunakan timer penundaan atau suppression.

Kasus baru membalik urutan penyelesaian pembacaan token StrictMode. Hasil effect lama berupa token kosong atau rejection tidak menghapus auth, tidak mengakhiri loading bootstrap aktif dan tidak membatalkan frame home aktif. Setelah provider ditutup/diremount, hasil storage lama tidak memulai GET; provider baru menuntaskan pembacaan miliknya sendiri. Helpers nonowner diuji untuk grant/deny scalar/array, lalu semuanya menolak setelah sign-out. Sign-out menghapus token/query; reload tanpa token tidak menambah GET dan tidak menavigasi home.

Regresi developer85/64/105 dan tambahan QC sebelumnya Guard46/Boot41 dijalankan ke output supplement ini pada Provider603+Guardffe aktual. Guard tambahan menguji callback retired setelah login/signOut/reload/pindahroute/unmount/StrictMode. Boot tambahan memakai SplashScreenView/haptic produksi dengan adapter Reanimated, termasuk finished=false, callback lama, target terbaru dan pemulihan. Kelulusan ini terikat fixture, bukan bukti frame visual/native.

## Integritas dan batas keputusan

**51** fingerprint handoff source/kontrak/library/artefak cocok sebelum tes. **61** berkas disk stabil dari awal hingga final. **153** entri bukti historis (**115** berkas unik) cocok; paket QC Login/Boot/Guard serta developer lama tetap beku. Seluruh runtime module hash cocok dengan disk; semua enam suite memuat Provider603 terkini. Tidak ada pin Provider lama pada suite final. Runner replay developer identik kecuali output folder pada boot/guard; runner QC lama disalin dengan perubahan provider load seam/label dan output path, tanpa mengubah assertion.

17 modul produksi dieksekusi pada gabungan suite; kode query/transport pada integrasi Login memakai library React Query/Axios/RHF/Zod aktual:

${modules}

Query fixture memakai retry:false dan staleTime/gcTime:Infinity; root produksi retry:2 dan staleTime:5 menit. Transport/storage, router/segmen/RAF, host UI serta runtime Reanimated memakai adapter. Root layout hanya kontrak baca. Tidak sertifikasi browser/Android/iOS, native frames, storage/API nyata, root navigator/mode/toko menyeluruh, SSR atau parity Figma; callable Figma tidak tersedia.

Cleanup mengabaikan hasil read bootstrap yang sudah tidak aktif, tanpa membatalkan IO atau transaksi auth/query yang sudah berjalan. Gagal validasi user dapat meninggalkan token tersimpan sesuai kontrak existing. Tidak menambahkan rollback, atomic auth atau jaminan concurrency lintas instance login-logout.

Keputusan baru ini menutup dua temuan pada versi koreksi; [keputusan Login lama](../qc-login-2026-10-09/DECISION.json) tetap utuh sebagai histori. **Penerimaan QC-INCOME-001/002/003 tetap OPEN**, dan paket sesi lain mempunyai gate sendiri. PM dapat menggunakan keputusan per hash ini untuk melanjutkan integrasi, dengan pemeriksaan perangkat/network/root yang relevan dan publikasi Git sebagai gate PM.

Tidak source aplikasi/dependency/backend/API/DB/persistensi nyata, operasi Metro/server/HP, branch/index/commit/push atau perubahan PDF progres historis oleh QC. Sinyal melalui dokumen, tanpa klaim penerimaan chat lain.

Label metadata pada salinan Guard pertama masih menyebut pin historis walaupun loader dan hash sudah memakai Provider603. Label/recipe diperbaiki dan suite46 diulang; bukti awal dipertahankan, tidak dihitung dua kali. Ini koreksi metadata harness, tanpa kegagalan aplikasi. [Catatan harness](harness-notes.json).

Paket dibekukan; simpan hasil ulang untuk hash baru pada folder baru. Execution Profile & Operator Tips: High. Hash koreksi → reproduksi temuan → urutan storage/lifecycle → regresi provider+Guard+Boot → quality → closure per hash → QA/PM. Pisahkan gate perangkat dan pertahankan histori.
`);
write('final-verification.json', { completedAt, signal, status: 'PASS_EVIDENCE_CHECK', sourceHash: quality.sourceHash, counts: quality.counts, totalPassed: 389, totalFailed: 0, finalMatches, historicalEntriesMatched: 153, historicalUniqueFilesMatched: 115, runtimeHashesMatch: true, allSixSuitesCurrentProvider: true, typeSourceFingerprintsMatched: 83, noSuppression: true, replayRestorationMatches: true, sourceSnapshotMatches: true, closedFindings: findings.map(x => x.id) });
function walk(directory) { return fs.readdirSync(directory, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(directory, item.name)) : [path.join(directory, item.name)]); }
const artifacts = walk(__dirname).filter(file => path.basename(file) !== 'artifact-manifest.json').sort().map(file => ({ file: path.relative(__dirname, file).replaceAll('\\', '/'), bytes: fs.statSync(file).size, sha256: hash(file) }));
write('artifact-manifest.json', { createdAt: completedAt, owner: 'QC', signal, files: artifacts });
for (const item of read('artifact-manifest.json').files) assert.equal(hash(path.join(__dirname, item.file)), item.sha256);
const note = `

## QC - SD5-005 AuthProvider FINAL PASS-RECHECK (9 Oktober 2026)

${signal}. [Report](qa/qc-auth-refetch-2026-10-09/REPORT.md), [DECISION/closure](qa/qc-auth-refetch-2026-10-09/DECISION.json) untuk Senior5/QA/PM. Provider context/AuthContext.tsx hash ${quality.sourceHash} disetujui sebagai delta koreksi. QC-LOGIN-001P2 dan QC-LOGIN-002P3 CLOSED_BY_RECHECK pada source koreksi; keputusan/harness QC Login lama tetap histori, tidak ditimpa. Integrasi/publikasi Git tetap PM; sinyal workspace tanpa klaim chat lain menerima langsung.

389assertion source aktual PASS/0FAIL: developer replay85Login+64Boot+105Guard, tambahan QC historis direplay46Guard+41Boot pada pasangan provider603/guardffe terkini, dan48 skenario QC baru. Baseline providerf311+Guardaktual38PASS/10FAIL pada48kasus; tiga gejala Login dan tujuh bootstrap/lifetime, bukan10temuan baru. Runtime/React/act/unhandled0. Pesan form/hook error pada user500/401, retrydoublepress satu POST/write/GET sampai home, StrictMode hasil storage reverse-order/null/rejection, late storage setelah unmount/remount, helpers nonowner serta signOut/reload/cache lolos. ESLint provider0error/0warning, Biome/diff0 tanpa suppression/timer; statement/source selain delta yang dideklarasikan identik. Tipe lima root developer0diagnostic direview dengan83fingerprint source cocok, bukan rerun/global. 51handoff cocok sebelum tes;61disk stabil;153historic entri/115unique tetap;17runtime modul, ${artifacts.length} artefak manifest diverifikasi. Label salinan Guard awal salah menyebut pin historis walau hashaktual603; diperbaiki dan46kasus diulang, bukti disimpan/hitung sekali.

Temuan Penerimaan QC-INCOME-001/002/003 tetap OPEN. Source/patch aplikasi tidak diedit QC. Semua6suite final Provider aktual603, tidak pinlama. Rootlayout hanya kontrak baca; IO/storage/router/RAF/host/Reanimated memori, Query retryfalse/staleInfinite berbeda rootretry2/stale5min. Tidak browser/Android/native frames/API nyata/rootnavigator/Figma/SSR/atomic login-logout/rollback. Cleanup menolak hasil bootstrap lama, tidak membatalkan transaksi yang sudah dimulai; token tersimpan dapat tetap ada setelah validasi gagal existing. Source owner lain, backend/DB/HTTP/persist/Metro/server/HP/dependency/fullTS/branch/index/commit/push/PDFhistoris tidak disentuh. Scope recheck Provider selesai.

Execution Profile & Operator Tips: High. Closure hanya hash603 dengan kontrak hook334/guardffe/bootc06 yang diuji; bila hash berubah recheck relevan ke folder baru. QA perangkat/root dan PM integrasi/publikasi terpisah.
`;
const coordination = 'docs/SESSION_COORDINATION.md';
assert.ok(!fs.readFileSync(coordination, 'utf8').includes('## QC - SD5-005 AuthProvider FINAL PASS-RECHECK'), 'Closure already recorded');
fs.appendFileSync(coordination, note);
console.log(JSON.stringify({ signal, status: 'PASS_RECHECK', providerHash: quality.sourceHash, closedFindings: findings.map(x => x.id), passed: 389, failed: 0, trackedStable: 61, historicalUniqueStable: 115, artifactManifestVerified: artifacts.length, applicationEdited: false, publicationApproval: false }));
