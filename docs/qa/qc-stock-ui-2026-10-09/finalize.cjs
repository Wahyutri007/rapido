const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const dir = __dirname;
const hashBytes = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const hash = file => hashBytes(fs.readFileSync(file));
const read = file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(dir, file), JSON.stringify(value, null, 2) + '\n');
const before = read('fingerprints-before.json');
const current = Object.fromEntries(Object.keys(before.files).map(file => [file, hash(file)]));
const changed = Object.keys(current).filter(file => current[file] !== before.files[file]);
const permittedConcurrentChanges = [];
for (const file of changed) {
  assert.equal(file, 'package.json', 'A reviewed UI source changed during QC');
  const text = fs.readFileSync(file, 'utf8');
  const restored = text.replace(/^\t\t"start:hp": "node scripts\/start-hp\.cjs",\r?\n/m, '');
  assert.notEqual(text, restored);
  assert.equal(hashBytes(restored), before.files[file], 'Package change exceeds the other QC session launcher alias');
  permittedConcurrentChanges.push({ file, owner: 'QC HP launcher session', before: before.files[file], after: current[file], proof: 'Removing only the start:hp script line reconstructs the initial raw SHA256 exactly. No application file was written.' });
}
const cache = 'node_modules/react-native-css-interop/.cache/android.js';
assert.equal(hash(cache), before.androidCache.sha256);
assert.equal(fs.statSync(cache).size, before.androidCache.bytes);
const webCache = 'node_modules/react-native-css-interop/.cache/web.css';
assert.equal(hash(webCache), hash(path.join(dir, 'web-before.css')));
const source = read('browser-results.json'), proposal = read('proposal/browser-results.json'), tokens = read('token-audit.json'), verification = read('proposal/verification.json');
assert.equal(source.executionMode, 'APPLICATION_SOURCES');
assert.equal(source.passed, 35); assert.equal(source.failed, 1);
assert.equal(source.checks.find(c => !c.passed).name, 'success modal320: confirm button visible inside viewport');
assert.equal(proposal.executionMode, 'UI_PROPOSAL_ONLY_NOT_APPLIED');
assert.equal(proposal.passed, 36); assert.equal(proposal.failed, 0);
for (const result of [source, proposal]) {
  assert.equal(result.exception, undefined); assert.equal(result.errors.length, 0);
  assert.equal(result.consoleErrors.length, 0); assert.equal(result.blockedRequests.length, 0);
}
assert.equal(tokens.count, 15);
assert.equal(verification.applied, false);
assert.equal(verification.applyCheckExit, 0); assert.equal(verification.eslint.exit, 0); assert.equal(verification.biome.exit, 0);
for (const [file, expected] of Object.entries(verification.fixtureHashes)) assert.equal(hash(file), expected);
const originalModal = fs.readFileSync('components/common/SuccessModal.tsx', 'utf8').replace(/\r\n/g, '\n');
const proposedModal = fs.readFileSync(path.join(dir, 'proposal/SuccessModal.candidate.txt'), 'utf8');
assert.equal(proposedModal.replace('\t\t\t\t\t\t\t\tstyle={{ height: 176, width: "100%" }}\n', ''), originalModal);
const originalScreen = fs.readFileSync('app/(no-layout)/manage/pos-settings/stock-limit.tsx', 'utf8');
const proposedScreen = fs.readFileSync('.expo/qc-stock-ui-screen.tsx', 'utf8');
assert.equal(proposedScreen.replace('from "./qc-stock-ui-success-modal"', 'from "@/components/common/SuccessModal"'), originalScreen);
const eslint = read('eslint-source.json');
assert.equal(eslint.length, 2); for (const result of eslint) { assert.equal(result.errorCount, 0); assert.equal(result.warningCount, 0); }
const capturedAt = new Date().toISOString();
write('fingerprints-after.json', { capturedAt, files: current, stable: Object.keys(current).length - changed.length, permittedConcurrentChanges, androidCache: { bytes: fs.statSync(cache).size, sha256: hash(cache) }, webCache: { bytes: fs.statSync(webCache).size, sha256: hash(webCache) }, additionalReadOnlyInputs: Object.fromEntries(['app/(no-layout)/manage/pos-settings/_layout.tsx', 'node_modules/react-native-web/dist/exports/Image/index.js'].map(file => [file, hash(file)])) });
write('quality.json', { capturedAt, sources: ['app/(no-layout)/manage/pos-settings/stock-limit.tsx', 'components/common/SuccessModal.tsx'], eslint: { exit: 0, files: 2, errors: 0, warnings: 0, evidence: 'eslint-source.json' }, biome: { exit: 0, files: 2, output: 'Checked 2 files in 69ms. No fixes applied.' }, diffCheck: { exit: 0, files: 2 }, proposal: verification, originalSourceUnchanged: true, proposalTextDifference: 'Only one explicit Image style prop; copied StockScreen only changes its SuccessModal import.', metro: { port: 8088, pidObserved: 9200, operatedByThisQC: false } });
const beforeDom = read('success-dom.json'), afterDom = read('proposal/success-dom.json');
const modalRect = dom => dom.ancestors.find(node => node.className.includes('group/modal') === false && node.className.includes('max-w-')).rect;
const confirmRect = result => result.checks.find(c => c.name === 'success modal320: confirm button visible inside viewport').detail;
const findings = [
  { id: 'QC-STOCK-UI-001', severity: 'P2', status: 'OPEN', source: 'components/common/SuccessModal.tsx:96', title: 'Success illustration intrinsic height clips modal actions on web 320x640', actual: { modal: modalRect(beforeDom), confirm: confirmRect(source) }, proposal: { modal: modalRect(afterDom), confirm: confirmRect(proposal), applied: false, patch: 'proposal/success-image-size.patch' } },
  { id: 'QC-STOCK-UI-002', severity: 'P3', status: 'OPEN', source: 'app/(no-layout)/manage/pos-settings/stock-limit.tsx', title: '15 existing styling occurrences violate the authoritative UI tokens or primitive override rules', summary: tokens.summary, evidence: 'token-audit.json' }
];
write('DECISION.json', { id: 'QC-STOCK-UI-20261009-CHANGES-REQUESTED', capturedAt, owner: 'QC', decision: 'CHANGES_REQUESTED', scope: 'UI only; backend deferred by explicit user direction', sourceHashes: { stockScreen: current['app/(no-layout)/manage/pos-settings/stock-limit.tsx'], successModal: current['components/common/SuccessModal.tsx'] }, sourceBrowser: { passed: source.passed, failed: source.failed, runtimeErrors: 0, consoleErrors: 0, httpApiAttempts: 0 }, proposalBrowser: { passed: proposal.passed, failed: proposal.failed, applied: false, candidateHash: verification.candidateHash }, findings, priorNativeWarnings: { ids: ['QC-HP-WARNING-001', 'QC-HP-WARNING-002'], status: 'OPEN; existing log evidence, no fresh native screenshot certification' }, backend: { deferred: true, uiGate: false, historicalFinding: 'QC-STOCK-001 remains historical OPEN, not CLOSED' }, finalPublicationOwner: 'PM', limitations: ['Browser-local API fixtures', 'Isolated Expo Router layout uses production Header/title; root auth/navigation is not reviewed', 'Physical phone visual behavior, accessibility, keyboard, all shared-modal callers and Figma parity are not certified'] });
fs.writeFileSync(path.join(dir, 'REPORT.md'), `# QC tampilan Batas Stok — 9 Oktober 2026

Keputusan: **CHANGES_REQUESTED** untuk tampilan saat ini. Backend ditunda sesuai instruksi pengguna dan tidak menjadi gate UI. Pemeriksaan UI selesai; developer perlu memperbaiki temuan berikut dan menyerahkan hash baru untuk recheck. PM tetap pemilik persetujuan akhir dan push Git.

## Temuan yang perlu diperbaiki

**QC-STOCK-UI-001 — P2 OPEN.** Pada web 320×640, modal sukses memanjang keluar layar dan tombol “Mengerti” tidak terlihat. Ilustrasi pada SuccessModal.tsx memiliki class h-44 tetapi ukuran intrinsik aset menghasilkan tinggi560px di RN-web. Modal berukuran288×791,5 pada y−75,75; tombol y642,75 dengan tinggi48. Komponen Image RN-web menyusun imageSizeStyle sebelum style eksplisit; class CSS saja tidak mengatasi ukuran inline ini.

Reproduksi pada fixture UI: buka Pengaturan Batas Stok di viewport320×640 → Simpan dengan respons sukses contoh → amati bagian atas modal dan tombol di bawah layar. [Screenshot source](success-resize-320.png) dan [pengukuran DOM](success-dom.json) mengonfirmasi temuan. Ini bukti web; perilaku native belum diverifikasi ulang.

[Usulan patch](proposal/success-image-size.patch) menambah satu style Image dengan tinggi176 dan lebar100%, sesuai niat h-44/w-full existing. [Screenshot usulan](proposal/success-resize-320.png): modal288×407,5 pada y116,25; tombol y450,75, tinggi48, terlihat utuh. **Patch belum diterapkan pada aplikasi**. Karena SuccessModal dipakai bersama, pemilik komponen/PM perlu memeriksa pemakai relevan sebelum mengubah source; usulan saat ini hanya diuji melalui Batas Stok.

**QC-STOCK-UI-002 — P3 OPEN.** [Audit token](token-audit.json) menemukan15 occurrence existing di stock-limit.tsx:8 spacing pecahan,5 warna zinc nonsemantik,1 override padding Card,1 override background SearchBar. Contoh baris177/192/239/267/288/313/357/365/377/400. Aturan AGENTS_UI.md bagian1.1/2.1/2.2/2.6 mengharuskan spacing kelipatan4 dan token semantik. Selaraskan token serta primitive tanpa mengubah hierarki layar. Ini bukan klaim regresi delta SD6-002 atau penyebab overflow tersendiri.

## Hasil pemeriksaan

| Paket | Lulus | Gagal | Status |
| --- | ---: | ---: | --- |
| Source aplikasi saat ini | 35 | 1 | Tombol modal sukses terpotong |
| Salinan usulan ukuran gambar | 36 | 0 | Belum di-apply |

Viewport320×640,360×780,390×844,768×1024: layar utama tanpa overflow horizontal, CTA Simpan berada dalam layar dan tinggi48, picker berlabel panjang/search/konfirmasi sesuai batas setelah animasi selesai. Copy empty/loading/error dan kategori diperiksa pada320; save disabled pada pengaturan pending/error. Modal error muat dalam viewport. Runtime/console error0, HTTP API nyata0 pada kedua eksekusi. [Hasil source](browser-results.json) dan [hasil usulan](proposal/browser-results.json) dipisahkan; hasil usulan tidak menutup temuan source.

ESLint dua source0error/warning, Biome dua source exit0, diff-check scoped exit0. Kandidat ESLint0, Biome stdin exit0 dengan output identik, git apply --check0. Seluruh teks kandidat identik kecuali satu prop Image; salinan layar hanya mengganti import untuk preview. [Bukti quality](quality.json) dan [metadata usulan](proposal/verification.json).

${Object.keys(current).length - changed.length}/27 fingerprint awal stabil. ${permittedConcurrentChanges.length ? 'Satu perubahan package.json milik sesi QC launcher HP: hanya penambahan start:hp; menghapus baris itu dari buffer merekonstruksi hash awal persis.' : 'Semua input stabil.'} Tidak menulis source aplikasi/backend/dependency/Git. Cache Android193003bytes dan CSS web tetap identik; Metro8088 PID9200 dipakai existing tanpa restart. [Fingerprint akhir](fingerprints-after.json).

## Alert kuning dan batas cakupan

Log Metro existing masih memuat warning root layout untuk menu/search, menu, catalog/menu serta deprecation InteractionManager. QC-HP-WARNING-001/002 tetap OPEN pada [paket warning sebelumnya](../qc-nativewind-cache-2026-10-09/REPORT.md). Ini warning pengembangan/routing/dependency; belum ada bukti bahwa semuanya merupakan banner yang sama pada HP pengguna. Tidak mematikan warning. Operasi launcher/HP sekarang milik sesi QC lain pada SESSION_COORDINATION.

Preview memakai React/RN-web, komponen stok, SearchBar, modal, provider, styling dan font produksi; adapter Axios browser-local menyediakan data contoh tanpa backend. Expo Router diisolasi untuk layar ini, Header memakai judul produksi “Pengaturan Batas Stok”; root auth/navigasi global tidak disertifikasi. Saat preflight Rapido tidak foreground pada HP, sehingga tidak mengambil screenshot native baru. Figma callable tidak tersedia. Native layout, seluruh pemakai shared modal, keyboard, aksesibilitas dan persistensi API perlu pemeriksaan tersendiri.

Hasil awal browser34check dengan2kegagalan picker akibat pengukuran saat animasi masih bergerak disimpan di browser-initial-results.json. Runner dikoreksi untuk menunggu spring; hasil final36check di atas. Biome stdin tanpa --write sebelumnya memberi exit1 meski teks identik; mode stdout dengan --write membuktikan teks identik dan exit0, tanpa menulis file aplikasi. Kesalahan quoting PowerShell node-e tidak menjalankan pemeriksaan; helper file menggantikannya.

Untuk recheck: pemilik Stock/Senior6 menangani token layar; pemilik SuccessModal menangani ukuran gambar. Serahkan source/hash baru dan hasil pengecekan pemakai shared modal. QC menilai source aplikasi yang diperbaiki, bukan menandai salinan usulan sebagai sudah masuk aplikasi. Backend QC-STOCK-001 tetap ditangguhkan pada [status terkini](../qc-stock-contract-2026-10-09/CURRENT_STATUS.md).
`);
const notes = `\n\n## QC — UI Batas Stok FINAL CHANGES_REQUESTED (9 Oktober 2026)\n\nQC-STOCK-UI-20261009-CHANGES-REQUESTED. Scope UI selesai: [report/keputusan/bukti](qa/qc-stock-ui-2026-10-09/REPORT.md). Source Stock1e0d3195 dan SuccessModal72b29fd0 unchanged. Browser source35lulus/1gagal pada36check; QC-STOCK-UI-001 P2 OPEN: gambar intrinsik560px menyebabkan modal sukses791,5px/tombol y642,75 keluar viewport320x640. Usulan satu prop Image176/100% pada salinan501c13d4 lulus36/36, lint/Biome/apply-check0, belum di-apply dan bukan penutupan temuan. QC-STOCK-UI-002 P3 OPEN:15occurrence token existing (8spacing pecahan/5zinc/2primitive override), Senior6/pemilik layar diminta menyelaraskan AGENTS_UI tanpa mengubah hierarki. Pemilik shared SuccessModal/PM menilai pemakai relevan dan source koreksi sebelum recheck; tidak mengambil source sesi lain.\n\nViewport320/360/390/768, keadaan empty/loading/error/kategori/picker panjang/modal error lolos; runtime/console0/HTTP API nyata0, Axios fixture browser-local dan isolated Expo Router dengan Header/judul produksi.26/27fingerprint stabil; package.json berubah hanya alias start:hp milik sesi QC HP (hapus baris dari buffer merekonstruksi hash awal persis), dependency lain tidak berubah. Cache Android193003bytes/056c153e dan webCSS identik, Metro8088PID9200 dipertahankan. Tidak restart/reload/nav HP, native screenshot atau Figma parity baru. Sesi QC HP sedang memiliki launcher/runtime/ADB; tidak diambil. ESLint/Biome dua source dan diff-check0. Warning root3route/InteractionManager masih tampak di logexisting; QC-HP-WARNING001/002 tetapOPEN, bukan temuan backend.\n\nArahan pengguna tetap fokus tampilan: QC-STOCK-001 backend dan proposal lama ditangguhkan, tidak menjadi gate UI, bukanCLOSED. Tidak mengedit source aplikasi/backend/dependency/harness developer/server/HP/branch/index/commit/push/PDFsnapshot. Handoff melalui workspace tanpa klaim percakapan lain menerima langsung; PM pemilik gate akhir dan pushGit.\n`;
const coordination = fs.readFileSync('docs/SESSION_COORDINATION.md', 'utf8');
if (!coordination.includes('## QC — UI Batas Stok FINAL CHANGES_REQUESTED')) fs.appendFileSync('docs/SESSION_COORDINATION.md', notes);
const list = base => fs.readdirSync(base, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? list(path.join(base, entry.name)) : [path.join(base, entry.name)]);
const artifacts = Object.fromEntries(list(dir).filter(file => path.basename(file) !== 'artifact-manifest.json').map(file => [path.relative(dir, file).replace(/\\/g, '/'), hash(file)]));
write('artifact-manifest.json', { capturedAt, artifacts });
console.log(JSON.stringify({ decision: 'CHANGES_REQUESTED', applicationChecks: [35, 1], proposalChecks: [36, 0], stableInputs: 26, concurrentAliasOnly: true, artifactCount: Object.keys(artifacts).length }));
