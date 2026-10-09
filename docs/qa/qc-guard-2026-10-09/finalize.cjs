const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const provider = 'context/AuthContext.tsx', source = 'hooks/useProtectedRoute.ts';
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const testedPath = file => file === provider ? path.join(__dirname, 'fixtures/AuthContext.tsx.txt') : file;
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(__dirname, name), JSON.stringify(value, null, 2) + '\n');
const quality = read('quality-results.json'), before = read('source-before.json');
assert.equal(quality.status, 'PASS');
assert.equal(quality.routingPolicyUnchanged, true);
assert.equal(quality.developerPolicySemanticsMatch, true);
assert.deepEqual(quality.counts, { replay: { passed: 105, failed: 0, errors: 0 }, independent: { passed: 46, failed: 0, runtimeErrors: 0, unhandledRejections: 0 } });
const finalMatches = Object.entries(before.hashes).map(([file, expected]) => ({ file, testedPath: testedPath(file), expected, actual: hash(testedPath(file)), passed: expected === hash(testedPath(file)), pinnedFixture: file === provider }));
assert.equal(finalMatches.length, 32);
assert.equal(finalMatches.filter(x => !x.pinnedFixture).length, 31);
assert.ok(finalMatches.every(x => x.passed));
assert.equal(before.handoffMatches.length, 16);
assert.equal(before.handoffMatches.filter(x => x.passed).length, 15);
assert.deepEqual(before.handoffMatches.filter(x => !x.passed).map(x => x.file), [provider]);
assert.equal(hash(testedPath(provider)), before.providerContract.testedHash);
const replay = read('final-results.json'), independent = read('independent-results.json');
assert.equal(replay.errors.length, 0);
assert.equal(independent.runtimeErrors.length, 0);
assert.equal(independent.unhandledRejections.length, 0);
for (const report of [replay, independent]) assert.equal(report.failed, 0);
for (const sources of [replay.sources, independent.sourceHashes]) {
  for (const [file, expected] of Object.entries(sources)) assert.equal(hash(testedPath(file)), expected);
}
assert.equal(hash(source), quality.sourceHash);
assert.equal(hash(path.join(__dirname, 'guard.reviewed.ts.txt')), quality.sourceHash);
const developerFolder = 'docs/qa/senior-5-2026-10-09/guard';
const qcFolder = path.relative(process.cwd(), __dirname).replaceAll('\\', '/');
const originalReplay = fs.readFileSync(developerFolder + '/check.cjs', 'utf8');
const restoredReplay = fs.readFileSync(path.join(__dirname, 'replay.cjs'), 'utf8')
  .replaceAll(qcFolder, developerFolder)
  .replace(":fs.readFileSync(file==='context/AuthContext.tsx'?'docs/qa/senior-5-2026-10-09/guard/fixtures/AuthContext.tsx.txt':file,'utf8')", ":fs.readFileSync(file,'utf8')");
assert.equal(restoredReplay, originalReplay);
write('harness-notes.json', {
  fixtureOrigin: 'Frozen QC Login setup reused after read-only audit: actual React Query, Axios, react-hook-form, LoginScreen, Form, auth hook, Common and provider. QC guard scenarios and frame scheduler are separate new code.',
  providerIsolation: 'SD5-005 was actively editing the provider. Pin the exact f311 production snapshot named by the guard handoff, verified against both handoff and QC Login raw snapshot. Current workspace provider is not approved.',
  initialGateStop: { evidence: 'handoff-changes.json', cause: 'Expected provider fingerprint drift while another owner implements SD5-005.', applicationFailure: false, replayRunBeforeIsolation: false },
  initialQualityComparison: { evidence: 'harness-initial-quality-results.json', cause: 'QC scanner retained the optional trailing comma in some(callback,), while the developer AST printer omitted it. Baseline and current scanner policies were already identical.', correction: 'Compare baseline and current independently with all tokens retained. Normalize only the optional final call-argument comma in isOnboarding for handoff equality.', applicationFailure: false, rerun: 'Quality PASS; both final application suites remain 105+46 PASS.' },
  replayIntegrity: 'Restoring only output directory and provider read seam exactly reproduces developer runner bytes; scenario/assertion logic unchanged.',
  strictScope: 'StrictMode only on Guard subtree; actual handoff AuthProvider outside StrictMode. Guard remount after loading runs setup-cleanup-setup with two IDs and one active frame.',
  scheduler: 'RAF/cancel adapter returns distinct IDs. History can deliver canceled callbacks after cleanup to test the active flag; normal queued callbacks are delivered once.',
  externalIO: 'No HTTP, backend, DB, real storage, native host/router, server, or device operation.',
});
const completedAt = new Date().toISOString(), signal = 'QC-GUARD-20261009-PASS-DELTA';
write('DECISION.json', {
  owner: 'QC', ticket: 'SD5-004', signal, status: 'PASS_DELTA', completedAt,
  scope: 'Only the redirect frame lifetime delta in hooks/useProtectedRoute.ts on the exact reviewed hash.',
  approvedSourceHashes: { [source]: quality.sourceHash },
  publicationApproval: false, publicationOwner: 'PM', sourceApplicationEditedByQC: false,
  assertions: { ...quality.counts, totalPassed: 151, totalFailed: 0, includesOverlappingCoverage: true }, findings: [],
  quality: { eslintErrors: quality.lint.errors, eslintWarnings: quality.lint.warnings, biomeExit: quality.biome.exitCode, diffExit: quality.diff.exitCode, routingPolicyUnchanged: true, developerPolicySemanticsMatch: true },
  handoffFingerprints: { total: 16, initialDiskMatched: 15, isolatedProviderFixtureMatched: true },
  trackedFiles: { diskStable: 31, pinnedProviderFixtureStable: 1 }, productionIndependentModules: quality.productionIndependentModules,
  providerContract: { testedHash: hash(testedPath(provider)), fixture: 'fixtures/AuthContext.tsx.txt', currentWorkspaceHashAtClose: hash(provider), currentProviderApproved: false, separateOwner: 'Senior5 SD5-005' },
  focusedTypecheck: quality.focusedTypecheck,
  limitations: [
    'Current provider under SD5-005 is excluded. This is not approval of the latest combined auth snapshot.',
    'Actual guard/provider/Login/Form/Common/Axios/Query code runs with memory transport/storage, segments/router/RAF and UI host adapters.',
    'Fixture QueryClient uses retry:false, staleTime/gcTime:Infinity; actual root uses retry:2 and staleTime:5min and is review-only.',
    'No full root navigator, browser, Android/iOS, native rendering/frame ordering, real SecureStore, network, SSR, or Figma parity certification.',
    'Cleanup rejects pending/detached callbacks after cleanup; it cannot undo navigation already completed before cleanup.',
    'Existing route predicates/public routes/index exception/targets/dependencies are preserved, including segment matching semantics.',
    'Type evidence is the developer focused root/dependency closure with the pinned provider; reviewed, not rerun by QC, and not the current provider/full project.',
  ],
  separateOpenFindings: ['QC-LOGIN-001 P2', 'QC-LOGIN-002 P3', 'QC-INCOME-001 P2', 'QC-INCOME-002 P2', 'QC-INCOME-003 P3'],
  nextAction: 'QA/PM may use this single-hook decision. Recheck the final SD5-005 provider handoff and combined dependency hashes separately before auth integration/publication.',
  evidence: ['REPORT.md', 'final-results.json', 'independent-results.json', 'quality-results.json', 'source-before.json', 'harness-notes.json', 'final-verification.json', 'artifact-manifest.json'],
});
const modules = Object.keys(independent.sourceHashes).map(file => '- `' + file + '`').join('\n');
fs.writeFileSync(path.join(__dirname, 'REPORT.md'), `# QC SD5-004 — Guard — 9 Oktober 2026

**PASS-DELTA** untuk pembatalan frame redirect pada satu hash \`${source}\`. Sinyal **${signal}** tersedia untuk Senior5/QA/PM melalui workspace. Tidak ada temuan baru pada delta Guard yang diuji. Integrasi dan publikasi Git tetap ditangani PM.

## Hasil

| Pemeriksaan | Lolos | Gagal |
| --- | ---: | ---: |
| Replay developer ke folder QC | 105 | 0 |
| Tambahan integrasi QC | 46 | 0 |
| Gabungan assertion, mencakup pengujian berulang | 151 | 0 |

Runtime/React/act error dan unhandled rejection: **0**. ESLint hook: **0 error/0 warning**; Biome dan scoped diff-check exit **0**. Pemeriksaan AST/token independen membuktikan daftar public route, predicate onboarding/public/index, kondisi redirect, tujuan, serta dependency effect sama dengan baseline Git acba0d9. Perubahan hanya lifetime frame; bukan perubahan kebijakan route.

Source yang disetujui: **${quality.sourceHash}**. Salinan byte tersedia di [guard.reviewed.ts.txt](guard.reviewed.ts.txt). Tipe terfokus developer: **0 diagnostic**, bukti dan fingerprint direview, tidak dijalankan ulang oleh QC. Ini bukan pemeriksaan TypeScript seluruh proyek atau provider terbaru.

## Kontrak provider dan integritas bukti

Provider di workspace sudah berubah ketika QC mulai karena Senior5 mengerjakan SD5-005. Gate fingerprint pertama berhenti sebelum replay; lihat [handoff-changes.json](handoff-changes.json). QC memakai byte produksi provider **${before.providerContract.testedHash}** yang persis tercatat di handoff Guard, dari snapshot raw QC Login yang diverifikasi ulang. Provider tersebut disimpan dalam [fixture](fixtures/AuthContext.tsx.txt). Ini bukan provider palsu, namun versi produksi historis yang terikat pada kontrak handoff.

15 dari 16 fingerprint handoff cocok dengan disk; satu provider cocok dengan fixture yang diisolasi. Selama tes hingga finalisasi, **31 berkas disk + 1 fixture provider** tetap cocok dengan snapshot. Seluruh hash modul yang dimuat cocok. Source Guard aktual dari disk dimuat pada kedua suite. Restorasi output path dan read seam provider menghasilkan runner developer persis; skenario/assertion replay tidak diubah. Provider workspace terkini **tidak diuji/disetujui** dalam keputusan ini.

## Perilaku yang diuji

Replay mencakup 72 kombinasi policy (18 route × authenticated true/false × loading true/false), serta kasus pembatalan/queue/lifetime dan integrasi provider. Tambahan QC menghubungkan Guard aktual dengan LoginScreen, shared Form, auth hook, Common, Axios, Query, dan provider handoff:

- Login melalui tombol/form asli, dua penekanan dalam satu event, satu POST dan satu token write; GET user menunggu storage. Login selesai di route privat membatalkan redirect anonymous yang masih menunggu.
- Pengguna tervalidasi pada onboarding memperoleh frame home. Pindah ke route kasir sebelum frame berjalan membatalkannya sehingga route pilihan tidak ditimpa.
- Sign-out provider asli menghapus token/query dan membatalkan frame home. ReloadAuth mengaktifkan loading, membatalkan frame lama, lalu hanya frame baru yang menavigasi sesudah validasi selesai.
- Pindah dari route privat ke maintenance public, unmount/remount Guard, dan unmount root menolak callback lama yang sengaja dikirim setelah cleanup.
- StrictMode pada subtree Guard menjalankan setup-cleanup-setup ketika diremount setelah auth loading selesai: dua ID dibuat, hanya satu tetap aktif. Callback retired ditolak dan callback aktif menavigasi sekali.

RAF adapter menyimpan antrean aktif dan riwayat secara terpisah sehingga callback yang sudah dicabut dari antrean tetap dapat dikirim setelah cleanup untuk menguji flag active. Callback normal dikirim sekali. Cleanup tidak membatalkan navigasi yang sudah terjadi sebelumnya.

13 modul produksi dimuat, termasuk provider handoff dari fixture:

${modules}

Hasil: [replay](final-results.json), [integrasi QC](independent-results.json), [quality](quality-results.json), [keputusan](DECISION.json), dan [handoff developer](../senior-5-2026-10-09/guard/HANDOFF.md).

## Batas dan tindak lanjut

Persetujuan hanya delta hook pada hash tersebut. Tidak meluluskan seluruh auth/root navigator/aplikasi atau provider SD5-005 terbaru. Root layout dibaca sebagai kontrak; tidak dieksekusi. Fixture QueryClient memakai retry:false dan staleTime/gcTime:Infinity; root produksi memakai retry:2 dan staleTime:5 menit. IO transport/storage, route/segmen/frame dan host UI memakai adapter memori. StrictMode hanya subtree Guard, bukan sertifikasi bootstrap provider dalam StrictMode.

Tidak ada sertifikasi browser/Android/iOS, frame native, SecureStore/API nyata, SSR atau parity Figma. Callable Figma tidak tersedia pada sesi QC. Tidak ada perubahan route/screen atau source aplikasi oleh QC. Tidak ada HTTP/backend/DB/persistensi nyata, Metro/server/HP, dependency install/global TypeScript, Git branch/index/commit/push, maupun perubahan laporan PDF historis.

**QC-LOGIN-001 P2 dan QC-LOGIN-002 P3 tetap OPEN** sampai recheck independen handoff koreksi SD5-005. **QC-INCOME-001/002/003 tetap OPEN**. Kelulusan Guard tidak menutup temuan paket lain. QA/PM dapat memakai keputusan satu hook ini dan memeriksa ulang provider beserta kombinasi dependency terbaru sebelum integrasi/publikasi.

Quality pertama menandai perbedaan teks karena scanner QC mempertahankan trailing comma opsional pada call some(callback,), sementara printer developer menghapusnya. Token baseline dan current sebenarnya identik. QC memperbaiki perbandingan manifest secara terbatas dan mengulang quality; bukti awal dipertahankan. Itu masalah pembandingan harness, bukan kegagalan aplikasi. Lihat [harness-notes.json](harness-notes.json).

Paket ini dibekukan sebagai bukti review; hasil ulang untuk perubahan source disimpan pada folder baru. Sinyal melalui dokumen workspace, tanpa klaim chat lain telah menerima langsung.

Execution Profile & Operator Tips: High. Hash handoff → isolasi kontrak provider → replay → integrasi frame → quality → keputusan delta → QA/PM. Recheck provider baru secara terpisah dan pertahankan bukti historis.
`);
write('final-verification.json', { completedAt, signal, status: 'PASS_EVIDENCE_CHECK', sourceHash: quality.sourceHash, counts: quality.counts, diskStable: 31, pinnedProviderFixtureStable: 1, currentProviderApproved: false, finalMatches, replayRestorationMatchesDeveloper: true, runtimeHashesMatch: true, sourceSnapshotMatches: true });
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}
const artifacts = walk(__dirname).filter(file => path.basename(file) !== 'artifact-manifest.json').sort().map(file => ({ file: path.relative(__dirname, file).replaceAll('\\', '/'), bytes: fs.statSync(file).size, sha256: hash(file) }));
write('artifact-manifest.json', { createdAt: completedAt, owner: 'QC', signal, files: artifacts });
for (const item of read('artifact-manifest.json').files) assert.equal(hash(path.join(__dirname, item.file)), item.sha256);
const coordination = 'docs/SESSION_COORDINATION.md';
const note = `

## QC - SD5-004 Guard FINAL PASS-DELTA (9 Oktober 2026)

${signal}. Review selesai; [report](qa/qc-guard-2026-10-09/REPORT.md) dan [DECISION](qa/qc-guard-2026-10-09/DECISION.json) untuk Senior5/QA/PM. Hanya hooks/useProtectedRoute.ts hash ${quality.sourceHash} disetujui sebagai delta frame cancellation; integrasi/publikasi Git tetap PM. Sinyal workspace, tanpa klaim chat lain menerima langsung.

Replay105 + integrasi QC46 =151 assertion PASS/0FAIL (cakupan berulang), runtime/React/act/unhandled0. 13 modul produksi: Guard aktual bersama provider produksi handoff f3118239 yang dipin, Login/Form/authhook/Common/Axios/Query. Login/double press/storage->userGET, auth selesai/private, route kasir, sign-out, reload loading->validation, maintenance public, guard/root unmount/remount, StrictMode Guard setup-cleanup-setup dan callback retired yang datang setelah cleanup lolos. Predicate public/onboarding/index, kondisi, target dan deps identik baseline Git. ESLint hook0error/0warning, Biome/diff0. Tipe focused developer0diagnostic direview/fingerprint cocok, tidak rerun QC; tidak mencakup provider baru.

15handoff fingerprint disk +1provider fixture exact cocok;31disk +1fixture stabil sampai final; ${artifacts.length} artefak manifest terverifikasi. Gate awal berhenti pada drift provider sebelum replay karena SD5-005 aktif; tidak ada tes campuran source. Perbandingan quality awal gagal karena trailing comma call pada printer berbeda, bukan policy berubah; bukti disimpan dan pembandingan terbatas diperbaiki, final quality PASS. Replay dipulihkan menjadi byte runner developer persis setelah melepas hanya output path/read seam.

Provider workspace SD5-005 terbaru tidak diuji/disetujui di sini. QC-LOGIN-001P2/002P3 tetap OPEN hingga recheck handoff koreksi; Penerimaan tiga temuan OPEN. Root layout kontrak baca; Query retry adapterfalse/staleInfinite berbeda root retry2/stale5min. Tidak seluruh navigator/browser/native/SecureStore/API nyata/Figma/SSR/providerStrictMode. Cleanup tidak mengulang/membatalkan navigasi yang sudah terjadi. Tanpa source aplikasi, HTTP/backend/DB/persist, Metro/server/HP/dependency/globalTypeScript/Git index/branch/commit/push/PDF historis. Scope Guard selesai.

Execution Profile & Operator Tips: High. Keputusan hanya satu hash Guard; pin kontrak handoff untuk bukti, lalu review provider baru dan kombinasi dependency secara terpisah sebelum PM publikasi.
`;
if (!fs.readFileSync(coordination, 'utf8').includes('## QC - SD5-004 Guard FINAL PASS-DELTA')) fs.appendFileSync(coordination, note);
console.log(JSON.stringify({ signal, status: 'PASS_DELTA', source, hash: quality.sourceHash, passed: 151, failed: 0, diskStable: 31, pinnedProviderFixtureStable: 1, artifactManifestVerified: artifacts.length, currentProviderApproved: false, applicationEdited: false, publicationApproval: false }));
