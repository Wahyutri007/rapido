# SD4-003 — Tempat Kasir

Owner: Software Developer Senior 4 / Codex-4. Tanggal: 9 Oktober 2026 (Asia/Jakarta). Status: **READY_FOR_QA** → QA perilaku → QC UI/kontrak → PM. Sinyal melalui workspace, belum klaim diterima atau disetujui reviewer.

## Perubahan

Placeholder tab Tempat diganti daftar/detail read-only dari usePlaceStore existing. Outlet pratinjau dipilih eksplisit; tidak menebak pemetaan fixture `place-demo-*` ke toko aktif backend. Daftar mendukung pencarian trim/case-insensitive nama, area dan jenis; filter area/status aktif efektif; reset; jumlah hasil dan urutan konfigurasi. Status Aktif membutuhkan outlet dan tempat sama-sama aktif. Kapasitas memakai unit tiap jenis, tanpa penjumlahan kursi/operator/rak.

Pilihan outlet bertahan ketika navigasi tab menghapus parameter URL. Parameter outlet konkret yang baru mengganti pilihan dan mereset filter bila outlet berbeda. Callback pencarian stabil untuk debounce. Detail memvalidasi outlet → area → place berdasarkan ketiga ID, menampilkan data yang sama dan menjelaskan status konfigurasi. Missing/cross-parent/array ID tidak memilih catatan pertama. Header mengambil parameter route detail dan `dismissTo` kembali ke tab terkait; filter normal dipertahankan. Header daftar/detail hanya di layout, child no-layout headerShown:false.

Scope sepuluh source di verification.json: tiga feature components, helper/type, tab index, detail route/layout dan dua integrasi layout bersama. Integration audit memastikan dua shared layout hanya menerima opsi header Tempat dan registrasi child location. Sembilan kontrak baca tetap sama dengan snapshot awal. Store, fixture, auth/guard, komponen shared, transaksi, cart, Billing, server backend, dependency dan source owner lain tidak diedit.

## Bukti developer

- 28 model/helper checks PASS: isolasi outlet/area, urutan posisi/stabilitas, kombinasi filter, pencarian, efektif nonaktif, empty, triple ID, penghapusan/perubahan source dan unit.
- 13 actual-router/browser scenarios PASS: pemilih eksplisit, search/reset, filter, detail, kembali/filter, pindah tab/outlet, outlet nonaktif, invalid outlet, forged ID, fresh direct detail/reload dan viewport320×640 serta844×390.
- Runtime exception0, console error0, mutation API0. Transport API memakai fixture owner/token dan GETuser terisolasi.
- 3 integration checks PASS: dua exact delta shared layout dan sembilan read-only input hashes.
- Capture tambahan PASS: seluruh kartu tempat pada390×844 dapat digulir di atas tab bawah; margin horizontal16px. Screenshot initial/list/detail390 dan list/detail320/landscape ditinjau.
- Scoped TypeScript tiga root+1195source dependencies:0diagnostic. ESLint sepuluh source:0error/warning. Biome format/diff checks exit0.

Dua failure awal disimpan di before/: pilihan outlet hilang saat berpindah tab, lalu header deep link kehilangan parameter outlet. Keduanya dikoreksi dan final13scenario diulang. Assertion yang berulang tidak dijumlah sebagai kasus baru. Screenshot daftar yang belum digulir penuh adalah konteks posisi scroll; `list-row-390.png` membuktikan kartu penuh bisa dicapai.

## Batas

Data outlet/area/tempat masih fixture desain dan perubahan sesi yang sudah tersedia; tidak ada backend/persistensi tempat, reservasi, okupansi, hubungan pesanan atau perubahan toko aktif. Browser memakai entry/providers/Expo Router produksi dengan adapter HTML/CSS dan API fixture; bukan autentikasi/backend nyata, SSR atau sertifikasi Android/iOS. Figma callable tidak tersedia pada sesi ini; referensi Manajemen Tempat bukan persetujuan visual frame Kasir. Shared dependencies lain dapat berubah antar sesi; cocokkan hash sebelum replay.

`npm.cmd run start:hp` warm diulang setelah modul final: exit0, HP35b9a8aa, ExpoGo57.0.9, backend online, memakai Metro8088 dan Rapido dibuka. Ini pemeriksaan launcher/pembukaan saja; flow native Tempat belum disertifikasi. Metro final exec63329 dan backend exec47270 dipertahankan untuk pengguna. CI menonaktifkan watcher, sehingga source baru perlu restart oleh pemilik runtime. Konflik cold CLI --offline+--localhost tetap tiket SDK/PM sebelumnya; source launcher tidak diubah. Log native Form/BillPayment dari source lain disampaikan terpisah pada SESSION_COORDINATION, tanpa mengklaim diagnosis atau koreksi.

## Replay dan permintaan QA/QC

Dari root aplikasi, `node docs/qa/codex-4-2026-10-09/cashier-location/seal.cjs` memverifikasi paket secara read-only (opsi `--verify` juga sama). Jangan menjalankan runner yang menulis hasil pada paket frozen; salin runner/before ke folder reviewer sendiri, lalu jalankan dari app root. Browser runner memakai Metro8088 milik pemilik runtime; jangan restart tanpa koordinasi. Instalasi Playwright terisolasi existing di `.expo/payroll-qa-tools/node_modules/playwright`, browser Edge. Tidak ada dependency/package/lock baru.

Commands yang dijalankan: `node .../model-check.cjs`, `node .../browser-check.cjs`, `node .../capture-check.cjs`, `node .../integration-check.cjs`, `node .../typecheck.cjs`; ESLint JSON sepuluh source; Biome format check; git diff --check scoped. Manifest dibuat sekali dengan `RAPIDO_QA_HEAD` dari git rev-parse HEAD dan `seal.cjs --seal`; default verify tidak reseal.

QA diminta menguji alur asli di HP, mode/auth aktual, system back/deep link, retained choice/filter, pengubahan/penghapusan tempat melalui Manajemen Tempat dan kontrak data kosong. QC diminta meninjau token/spacing, detail/status/kapasitas, ID lintas parent, small/landscape serta batas pratinjau. PM pemilik gate integrasi/publication. Tidak ada commit/push/index/branch/merge atau revisi laporan PDF/PowerPoint/paket Payroll/Absensi histori.

Execution Profile & Operator Tips: Medium. Hash → QA actual/native → QC → PM. Satu alur per batch; gunakan source terbaru, pertahankan ID/sumber data serta header layout. Jangan menganggap READY_FOR_QA sebagai approval independen.
