const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(__dirname, name), JSON.stringify(value, null, 2) + '\n');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const quality = read('quality-results.json');
const baseline = read('source-before.json');
const current = read('lifecycle-results.json');
const income = read('proposal-results.json');
const expense = read('expense-proposal-results.json');
const model = read('model-results.json');
assert.equal(quality.status, 'PASS_PROPOSAL_AND_FINGERPRINTS');
assert.equal(quality.currentApplicationDecision, 'CHANGES_REQUESTED');
assert.deepEqual(quality.counts.current, { passed: 24, failed: 12, errors: 0 });
assert.deepEqual(quality.counts.candidate, { passed: 36, failed: 0, errors: 0 });
assert.deepEqual(quality.counts.candidateExpense, { passed: 6, failed: 0, errors: 0 });
assert.equal(model.checks.length, 43);
assert.equal(current.tested, 'CURRENT_PRODUCTION_SOURCE');
assert.equal(income.tested, 'PROPOSAL_ONLY_NOT_APPLIED');
assert.equal(expense.tested, 'PROPOSAL_ONLY_NOT_APPLIED');
assert.equal(quality.patch.applied, false);
assert.equal(quality.patch.applyCheck.exitCode, 0);
assert.equal(hash(path.join(__dirname, quality.patch.file)), quality.patch.sha256);
const finalMatches = Object.entries(baseline.hashes).map(([file, expected]) => ({ file, expected, actual: hash(file) }));
assert.equal(finalMatches.length, 35);
assert.ok(finalMatches.every((item) => item.expected === item.actual), 'Tracked source changed before handoff');
const copies = {
  'app/(no-layout)/manage/income/detail.tsx': path.join(__dirname, 'proposal/detail.tsx'),
  'components/feature/accounting/CashEntryForm.tsx': path.join(__dirname, 'proposal/CashEntryForm.tsx'),
};
for (const [file, expected] of Object.entries(quality.reviewedSourceHashes)) assert.equal(hash(file), expected);
for (const [file, expected] of Object.entries(quality.proposalSourceHashes)) assert.equal(hash(copies[file]), expected);
for (const [suite, report] of [['current', current], ['candidate-income', income], ['candidate-expense', expense]]) {
  for (const [file, expected] of Object.entries(report.sourceHashes)) {
    assert.equal(hash(suite === 'current' ? file : copies[file] || file), expected, `${suite}: ${file}`);
  }
}
assert.equal(hash(path.join(__dirname, 'CashEntryForm.before.tsx.txt')), baseline.hashes['components/feature/accounting/CashEntryForm.tsx']);
assert.equal(hash(path.join(__dirname, 'detail.before.tsx.txt')), baseline.hashes['app/(no-layout)/manage/income/detail.tsx']);
const failed = current.checks.filter((item) => !item.passed).map((item) => item.name);
const findings = [
  {
    id: 'QC-INCOME-001', severity: 'P2', status: 'OPEN',
    title: 'Callback simpan dari instance form yang ditinggalkan masih menulis store lokal',
    source: 'components/feature/accounting/CashEntryForm.tsx',
    reproduction: 'Mulai create/edit A, simpan callback atau tahan resolusi validasi RHF, pindah ke B/unmount, lalu selesaikan callback lama. Store incomes masih bertambah atau A berubah.',
    expected: 'Instance yang telah unmount tidak memulai penulisan store; draft halaman aktif tetap terpisah.',
    checks: failed.filter((name) => /old cached submit|old pending create|cached create callback/.test(name)),
    proposal: 'Guard mounted pada entry dan sesudah validasi, lock pending sinkron, ref savedId; salinan saja.',
  },
  {
    id: 'QC-INCOME-002', severity: 'P2', status: 'OPEN',
    title: 'Konfirmasi hapus tetap aktif saat ID berpindah dan callback lama dapat menghapus/navigasi',
    source: 'app/(no-layout)/manage/income/detail.tsx',
    reproduction: 'Buka konfirmasi A lalu ubah ID ke B: dialog tetap terbuka. Callback konfirmasi lama juga menghapus A dan delayedBack setelah pindah, Batal, atau unmount.',
    expected: 'B mulai dengan dialog tertutup; callback dari dialog yang dibatalkan atau instance lama tidak menghapus dan tidak menavigasi.',
    checks: failed.filter((name) => /delete A to B|cancel then queued confirm|disposed detail/.test(name)),
    proposal: 'Child keyed per ID, guard mounted dan ref konfirmasi aktif yang dikonsumsi sebelum penghapusan; salinan saja.',
  },
  {
    id: 'QC-INCOME-003', severity: 'P3', status: 'OPEN',
    title: 'Dua tekan Simpan pada event yang sama menampilkan error referensi duplikat setelah sukses',
    source: 'components/feature/accounting/CashEntryForm.tsx',
    reproduction: 'Form create valid; jalankan dua onPress sebelum render berikutnya. Satu record berhasil dibuat, modal sukses terbuka, tetapi referenceNumber mendapat error duplicate dari panggilan kedua.',
    expected: 'Satu operasi diterima selama validasi/simpan berlangsung; sukses tidak disertai error duplicate palsu.',
    checks: failed.filter((name) => name.startsWith('same-event double submit: successful create')),
    proposal: 'Lock pending sinkron dan savedId ref; simpan normal berikutnya tetap memperbarui ID pertama.',
  },
];
assert.deepEqual(findings.map((item) => item.checks.length), [4, 7, 1]);
assert.equal(new Set(findings.flatMap((item) => item.checks)).size, 12);
const unprepared = read('proposal-unprepared-results.json');
for (const [file, expected] of Object.entries(unprepared.sourceHashes)) assert.equal(expected, current.sourceHashes[file]);
write('harness-notes.json', {
  excludedArtifact: 'proposal-unprepared-results.json',
  sha256: hash(path.join(__dirname, 'proposal-unprepared-results.json')),
  reason: 'Preparasi pertama memakai path zod/lib/index.js yang tidak tersedia. Kandidat belum dibuat. Rangkaian command berikutnya tetap berjalan; --proposal pada runner awal fallback ke source asli. Hasil 24 PASS/12 FAIL tersebut merupakan source asli, bukan kegagalan kandidat.',
  corrections: ['Path entry RHF/Zod memakai require.resolve.', 'Mode --proposal kini mewajibkan kedua kandidat tersedia.', 'Preparasi, quality, dan rerun kandidat dilakukan dengan gate berurutan.'],
  excludedFromFinalCounts: true,
  finalCandidateEvidence: ['proposal-results.json', 'expense-proposal-results.json', 'quality-results.json'],
});
const completedAt = new Date().toISOString();
const signal = 'QC-INCOME-20261009-CHANGES-REQUESTED';
write('DECISION.json', {
  owner: 'QC', signal, status: 'CHANGES_REQUESTED', completedAt,
  scope: 'Penerimaan manual: modify/detail/IncomeForm, dengan CashEntryForm bersama sebagai dependency yang diuji',
  publicationApproval: false, publicationOwner: 'PM', approvedSourceHashes: {},
  reviewedSourceHashes: quality.reviewedSourceHashes,
  assertions: { currentIndependent: quality.counts.current, currentReplayedModel: { passed: 43, failed: 0 }, currentCombined: { passed: 67, failed: 12, includesOverlappingCoverage: true }, proposalIncome: quality.counts.candidate, proposalExpenseRegression: quality.counts.candidateExpense },
  findings,
  proposal: { applied: false, sourceHashes: quality.proposalSourceHashes, patch: quality.patch, passedAssertions: 42, approvalOfApplication: false },
  quality: { eslintErrors: quality.sourceLint.errors, eslintWarnings: quality.sourceLint.warnings, sourceBiomeExit: quality.sourceBiome.exitCode, sourceDiffExit: quality.diff.exitCode, candidateLintClean: quality.candidateLint.every((item) => !item.errors && !item.warnings), candidateBiomeExit: quality.candidateBiome.exitCode, returnedJsxMatchesAfterIntentionalEventBindings: quality.jsxMatches.every((item) => item.passed) },
  trackedFilesStable: finalMatches.length, productionModulesLoaded: Object.keys(current.sourceHashes).length,
  focusedTypecheck: 'Tidak direrun QC; bukti TypeScript preview lama tidak menyertifikasi kandidat ini.',
  limitations: ['Fixture Node dengan komponen/form/modal/helper produksi dan adapter host/router/timing, bukan pengujian native/browser/router lengkap.', 'SuccessModal/presentation memakai adapter; temuan visual shared SuccessModal pada paket QC stok tetap terpisah.', 'Data contoh Zustand hanya dalam proses tes; tanpa HTTP/API, DB, persistensi atau verifikasi jurnal/saldo otomatis.', 'Figma callable tidak tersedia pada sesi QC ini; parity desain tidak disertifikasi.', 'Enam regresi expense-kind hanya menguji delta shared form, bukan kelulusan seluruh Pengeluaran.'],
  nextAction: 'Developer Penerimaan dan pemilik CashEntryForm/PM menerapkan koreksi sesuai scope, menjalankan tipe/lint/regresi terfokus dan menyerahkan hash baru untuk recheck. Temuan tetap OPEN sampai source aplikasi diperiksa ulang.',
  evidence: ['REPORT.md', 'lifecycle-results.json', 'model-results.json', 'proposal-results.json', 'expense-proposal-results.json', 'quality-results.json', 'harness-notes.json', 'final-verification.json', 'artifact-manifest.json'],
});
const sourceRows = Object.entries(quality.reviewedSourceHashes).map(([file, value]) => `| \`${file}\` | \`${value}\` |`).join('\n');
const report = `# QC Penerimaan manual — 9 Oktober 2026\n\nKeputusan **CHANGES_REQUESTED**. Sinyal **${signal}** untuk developer/QA/PM melalui workspace. Pemeriksaan QC selesai; tiga temuan masih **OPEN** pada source aplikasi. PM tetap pemilik integrasi dan push Git.\n\n## Hasil\n\n| Bukti | Lolos | Gagal | Makna |\n| --- | ---: | ---: | --- |\n| Integrasi independen source saat ini | 24 | 12 | 36 pemeriksaan lifecycle form/detail |\n| Replay model developer pada source saat ini | 43 | 0 | Validasi dan operasi helper lokal |\n| Gabungan source saat ini | 67 | 12 | Eksekusi assertion, termasuk cakupan berulang |\n| Kandidat Penerimaan pada salinan | 36 | 0 | Dua koreksi belum diterapkan |\n| Regresi kandidat shared form, expense-kind | 6 | 0 | Cakupan terbatas Pengeluaran |\n\nAngka tersebut bukan persentase penyelesaian proyek. Runtime/React/act error pada suite independen dan kandidat: **0**. Kandidat lolos **42 pemeriksaan**; source aplikasi masih gagal 12.\n\n## Temuan yang harus diperbaiki\n\n| ID | Prioritas | Pemicu dan dampak |\n| --- | --- | --- |\n| QC-INCOME-001 | P2 OPEN | Callback simpan create/edit A atau validasi yang tertunda selesai setelah pindah ke B/unmount: store lokal masih bertambah atau A berubah. Empat assertion gagal. |\n| QC-INCOME-002 | P2 OPEN | Konfirmasi hapus A tetap terbuka ketika ID berubah ke B. Callback konfirmasi lama setelah perpindahan, Batal, atau unmount dapat menghapus A dan menjalankan delayedBack. Tujuh assertion gagal. |\n| QC-INCOME-003 | P3 OPEN | Dua tekan Simpan sebelum render berikutnya menghasilkan satu record dan modal sukses, disertai error referensi duplikat yang keliru. Satu assertion gagal. |\n\nLangkah reproduksi dan nama assertion persis tersedia di [DECISION.json](DECISION.json) serta nilai aktual/harapan di [lifecycle-results.json](lifecycle-results.json). Temuan 003 tidak menunjukkan dua record duplikat; helper berhasil menahan record kedua.\n\nPerilaku normal yang lolos mencakup prefill, draft pada update store dengan ID sama, transisi edit/create, blokir ID hilang/invoice, validasi, save normal berulang pada ID pertama, isolasi draft baru, dan penghapusan normal satu target.\n\n## Usulan koreksi yang sudah diuji\n\n[income-lifecycle.patch](income-lifecycle.patch) hanya mengubah detail Penerimaan dan shared CashEntryForm. Detail memakai child keyed per ID serta guard mounted/konfirmasi aktif. Form memakai guard sebelum dan setelah validasi, lock pending sinkron dan ref savedId. Simpan normal selanjutnya tetap memperbarui record pertama.\n\n**Patch belum di-apply ke aplikasi.** Dua salinan kandidat ada di [proposal/detail.tsx](proposal/detail.tsx) dan [proposal/CashEntryForm.tsx](proposal/CashEntryForm.tsx). Karena shared form juga dipakai Pengeluaran, pemilik komponen/PM harus memeriksa scope itu sebelum integrasi. Enam pemeriksaan expense-kind tidak meluluskan keseluruhan fitur Pengeluaran.\n\nESLint source empat file dan kandidat pada konfigurasi path source: **0 error/0 warning**. Biome source/kandidat, scoped diff dan git apply --check: exit **0**. Returned JSX cocok sesudah menormalkan binding event yang sengaja diganti; ini tidak menyertifikasi visual. [quality-results.json](quality-results.json) mengikat hasil ke hash yang diuji.\n\n## Source yang diperiksa\n\n| File | SHA-256 |\n| --- | --- |\n${sourceRows}\n\n24 modul produksi dibaca saat suite independen berjalan. Snapshot 35 file dibuat sesudah suite awal dengan hash 24 modul yang telah dicocokkan terhadap byte yang benar-benar dimuat; seluruh 35 masih cocok saat finalisasi. Source aplikasi, kontrak/helper/store, dependency, serta bukti developer tidak diedit.\n\nHarness memakai route, IncomeForm, CashEntryForm, Form/Input/Field/Message, DeleteConfirmModal/tombol konfirmasi produksi, RHF/Zod dan helper/Zustand produksi. Host RN/primitive/picker, router, presentasi IncomeDetail dan SuccessModal memakai adapter; sebagian validasi memakai batas promise terkendali untuk menguji hasil terlambat. Data hanya hidup dalam proses tes.\n\n## Batas dan handoff\n\nTidak ada verifikasi HP/browser/Figma baru, API/backend/DB/persistensi, jurnal/saldo otomatis, atau approval seluruh aplikasi. Suite browser 25 pemeriksaan dan tipe preview lama tidak direrun; bukan bukti QC baru. Temuan UI shared SuccessModal pada paket stok tetap milik paket tersebut. Tidak mengoperasikan Metro/server/HP, mengubah dependency, menjalankan global TypeScript, atau melakukan commit/push. PDF progres sebelumnya tetap snapshot historis.\n\nPersiapan harness pertama gagal karena path entry Zod; mode proposal awal kemudian fallback ke source asli. Bukti itu dipertahankan sebagai proposal-unprepared-results.json, dikeluarkan dari hitungan kandidat. Path diubah ke require.resolve dan mode proposal kini mewajibkan dua salinan. Detail ada di [harness-notes.json](harness-notes.json).\n\nDeveloper diminta memperbaiki dua source atau memakai patch yang diuji, menjalankan lint/Biome dan TypeScript terfokus, lalu menyerahkan hash/hasil baru. Recheck harus memakai source aplikasi tanpa --proposal. Simpan salinan runner dan hasil pada folder bukti baru karena runner menulis hasil dekat script; pertahankan paket QC ini sebagai histori. Ulangi 36 pemeriksaan Penerimaan dan regresi shared form yang relevan setelah koreksi. QC menutup temuan dan memberi sinyal baru setelah source aktual lolos; PM memutuskan integrasi/publikasi.\n\nExecution Profile & Operator Tips: Medium. Urutan recheck: koordinasi pemilik -> hash baru -> reproduksi temuan -> regresi terfokus -> quality -> keputusan QC -> gate PM. Jangan menghitung kelulusan salinan sebagai perbaikan source aplikasi.\n`;
fs.writeFileSync(path.join(__dirname, 'REPORT.md'), report);
write('final-verification.json', {
  completedAt, status: 'PASS_EVIDENCE_CHECK', currentApplicationDecision: 'CHANGES_REQUESTED',
  signal, trackedFiles: finalMatches.length, finalMatches,
  sourceHashes: quality.reviewedSourceHashes, proposalSourceHashes: quality.proposalSourceHashes,
  sourceApplied: false, checksCoveredByOpenFindings: 12, productionRuntimeHashesMatch: true,
  snapshotsMatch: true, counts: quality.counts,
});
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}
const artifacts = walk(__dirname).filter((file) => path.basename(file) !== 'artifact-manifest.json').sort().map((file) => ({ file: path.relative(__dirname, file).replaceAll('\\', '/'), bytes: fs.statSync(file).size, sha256: hash(file) }));
write('artifact-manifest.json', { createdAt: completedAt, owner: 'QC', signal, files: artifacts });
for (const item of read('artifact-manifest.json').files) assert.equal(hash(path.join(__dirname, item.file)), item.sha256);
const note = `\n\n## QC - Penerimaan manual FINAL CHANGES_REQUESTED (9 Oktober 2026)\n\n${signal}. Scope QC selesai; developer Penerimaan/pemilik shared form/QA/PM diminta membaca [report](qa/qc-income-2026-10-09/REPORT.md) dan [DECISION](qa/qc-income-2026-10-09/DECISION.json). Sinyal melalui workspace tanpa klaim sesi lain menerima langsung. Source aplikasi belum dikoreksi; gate Penerimaan CHANGES_REQUESTED, publikasi tetap PM.\n\nTemuan OPEN: QC-INCOME-001 P2 callback simpan/validasi lama setelah pindah ID/unmount masih menulis store lokal (4 assertion); QC-INCOME-002 P2 dialog hapus terbawa A ke B dan konfirmasi lama setelah Batal/pindah/unmount menghapus atau menavigasi (7); QC-INCOME-003 P3 dua tekan Simpan menampilkan error duplicate palsu bersama sukses (1), tanpa record ganda. Source independen 24 PASS/12 FAIL, replay model developer 43 PASS: 67 PASS/12 FAIL termasuk cakupan berulang, bukan persentase progres. Runtime/React/act error0.\n\nPatch income-lifecycle.patch mengubah salinan detail dan CashEntryForm saja, belum di-apply. Kandidat 36 PASS Penerimaan +6 PASS expense-kind shared form =42; bukan kelulusan source aplikasi atau seluruh Pengeluaran. Guard mounted/pending/savedId dan konfirmasi keyed per ID menutup reproduksi yang diuji. Source4 dan kandidat lint0error/warning, Biome/diff/apply-check0; returned JSX sama sesudah normalisasi binding event. 24 modul produksi di-hash pada runtime; snapshot sesudah suite awal dengan semua24 cocok, 35tracked stabil hingga finalisasi, ${artifacts.length} artefak manifest cocok. Persiapan pertama path Zod/fallback proposal salah dicatat terpisah; bukti asli utuh dan tidak dihitung sebagai kandidat.\n\nHash reviewed: modify dab1cd74a6a464a0baf0b9151a8f6c1b94a5acb0584b3ab5d89504be3abe0f24; detail ac2cd8fef13b500819c82ef010b2a7156dc1fe33e75dbe817a84a58fc2e273a1; IncomeForm dd59ae110ae656c8edb93df542533f488b22c07afbd6e399028ab445e1411e3e; CashEntryForm 891fbb76544f5e4b84d6dccc4c4f52d8478b4ed34eb533b3d6ed3ce4fe32ccf7. Candidate detail a5be980c7cb61175a3d3311a7b9b4f45d752d7c7578260b6e8d94a1ad3abb201/Cash c85159482a162b3d4f443d1929b7de1fd55de3970ea2f987effc7215831f2c50. Pemilik/PM menerapkan koreksi lalu menyerahkan hash dan bukti baru untuk recheck; shared form perlu regresi Pengeluaran. Temuan tetap OPEN sampai source aktual lolos.\n\nFixture React/RHF/Zod/shared Form/DeleteConfirmModal/helper/store produksi dengan adapter host/router/presentation/success/timing; tidak HP/browser/Figma/API/DB/persist/native/full TypeScript. Data contoh hanya dalam proses. Tipe preview lama bukan sertifikasi kandidat. Shared SuccessModal UI stok tetap gate terpisah; UI Pemasok QC lain, dialog Kelola Codex-3/boot Senior5 READY_FOR_QA, login Senior5/Payroll/ledger-ID belum diambil. Source aplikasi/backend/harness developer, Metro/server/HP/dependency/Git/index/branch/commit/push serta PDF snapshot tidak diubah.\n\nExecution Profile & Operator Tips: Medium. Koordinasi pemilik -> hash baru -> reproduksi source aktual tanpa --proposal -> regresi shared form/tipe terfokus -> keputusan QC -> PM. Pertahankan bukti lama; recheck ke folder baru. Scope QC Penerimaan selesai menunggu koreksi developer.\n`;
const coordination = 'docs/SESSION_COORDINATION.md';
if (!fs.readFileSync(coordination, 'utf8').includes(`## QC - Penerimaan manual FINAL CHANGES_REQUESTED`)) fs.appendFileSync(coordination, note);
console.log(JSON.stringify({ signal, status: 'CHANGES_REQUESTED', findings: findings.map(({ id, severity, status }) => ({ id, severity, status })), currentPassed: 67, currentFailed: 12, proposalPassed: 42, applied: false, trackedStable: 35, manifestFilesVerified: artifacts.length }));
