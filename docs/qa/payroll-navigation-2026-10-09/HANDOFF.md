# Software Developer Senior 4 / Codex-4 — Payroll

Tanggal: 9 Oktober 2026 (Asia/Jakarta). Identitas: profil `D:/Codex-4`.

Status: **READY_FOR_QA — pemeriksaan developer selesai**. Menunggu review QA/QC dan gate publikasi PM.

Penugasan: [PM_TASK_BOARD.md](../../PM_TASK_BOARD.md), router utama Penggajian: deep link, ID karyawan/periode, reload, tombol kembali, dan alur pembayaran sampai slip. Koordinasi melalui [SESSION_COORDINATION.md](../../SESSION_COORDINATION.md); dokumen ini bukan bukti penerimaan atau persetujuan sesi lain.

## Scope

- Satu source aplikasi berubah: `app/(no-layout)/manage/payroll/_layout.tsx`. Enam layar tetap memakai header pada layout dan komponen bersama.
- Harness [check.cjs](check.cjs) menggunakan entry aplikasi, providers, guard autentikasi, dan Expo Router produksi. Respons API merupakan fixture browser yang terisolasi; tidak memakai akun pengguna atau mengirim pembayaran.
- Hasil lama modul: [README pratinjau](../../previews/payroll/README.md), [39 model/schema](../../previews/payroll/model-results.json), [29 browser komponen](../../previews/payroll/results.json), dan [enam screenshot sempit](../../previews/payroll/visual-results.json). Ini bukti pembuat sebelumnya, bukan pengujian baru QA independen.

## Perubahan dan hasil

Deep link kini memakai daftar Payroll sebagai initial route. Tombol kembali memakai riwayat yang tersedia; bila stack kosong, child mengganti rute ke daftar Payroll dan daftar mengganti rute ke Kelola. Ini menjaga jalan keluar setelah browser back/forward merekonstruksi stack.

Saat kembali dari slip setelah pembayaran, header pembayaran terlihat tetapi tidak dapat diklik. Pemeriksaan menunjukkan fokus React Navigation sudah aktif sedangkan DOM masih memiliki `pointer-events: none`. Header Payroll sekarang membungkus Header bersama dengan style terdaftar berdasarkan `useIsFocused`: aktif menerima klik, tidak aktif menolak klik. Tidak mengubah animasi bersama atau source Header/JSStack. Bukti sebelum koreksi disimpan sebagai [before-pointer-fix.json](before-pointer-fix.json) dan [gambar](before-pointer-fix.png); 7 skenario awal lolos sebelum gagal pada tombol kembali. Percobaan mematikan animasi tidak memperbaiki masalah dan telah dikembalikan.

| Pemeriksaan developer pada 9 Oktober 2026 | Hasil | Bukti |
| --- | --- | --- |
| Router aplikasi produksi di Edge, viewport 390 × 844 | 21/21 skenario lolos; runtime/console error 0 | [results.json](results.json), [check.cjs](check.cjs) |
| Layout produksi dengan adapter router/header/stack | 20 assertion lolos | [layout-results.json](layout-results.json), [layout-check.cjs](layout-check.cjs) |
| TypeScript root layout + deklarasi proyek + dependency impor | 0 diagnostic, 1.041 source files | [typecheck-results.json](typecheck-results.json), [typecheck.cjs](typecheck.cjs) |
| ESLint satu source aplikasi | 0 error / 0 warning | [eslint-results.json](eslint-results.json) |
| Biome dan `git diff --check` pada satu source | exit 0 | [verification.json](verification.json) |

Router mencakup Kelola → daftar → detail → pengaturan → pembayaran → slip, pengaturan tersimpan pada ID yang sama, validasi field wajib, satu pembayaran dan HTML dengan referensi yang sama, kembali dari slip sampai daftar, pergantian karyawan, histori periode, reload dengan fixture awal, lima rute ID tidak dikenal, guard periode lunas, deep link baru, browser back/forward, jalan keluar ke Kelola, dan pengalihan tanpa token ke login. Dua kelompok assertion layout dan skenario browser adalah bukti developer dengan tingkat isolasi berbeda, bukan penjumlahan sertifikasi QA.

Screenshot aplikasi: [daftar](list-router.png), [slip](slip-router.png), [rincian lunas setelah kembali](paid-detail-after-back.png). Source final SHA256: `7044c595a766905e29045fcf4758b7f9056704a8a744fd22b23d86c8426f445b`. Base HEAD pengujian: `acba0d92460c1af3149abc3775f09888a2943cab`; hasil berasal dari working tree bersama, bukan commit terisolasi. Fingerprint paket dan batas ada pada [verification.json](verification.json).

## Menjalankan ulang

Jalankan dari root aplikasi. Harness browser memakai Playwright 1.56.1 yang dipasang terpisah pada `.expo/payroll-qa-tools/` (diabaikan Git); package/lock aplikasi tidak diubah. Jika folder belum tersedia, siapkan tool dengan `npm install --prefix .expo/payroll-qa-tools --no-audit --no-fund --ignore-scripts playwright@1.56.1`, atau arahkan `PLAYWRIGHT_MODULE` ke instalasi Playwright yang tersedia. Edge default berasal dari Program Files (x86); `BROWSER_PATH` dapat menggantinya. Pastikan port milik pengujian kosong sebelum mulai.

```powershell
$env:EXPO_OFFLINE='1'
$env:CI='1'
node node_modules/expo/bin/cli start --localhost --port 8096 --max-workers 1
```

Di terminal lain:

```powershell
node docs/qa/payroll-navigation-2026-10-09/check.cjs
node docs/qa/payroll-navigation-2026-10-09/layout-check.cjs
node docs/qa/payroll-navigation-2026-10-09/typecheck.cjs
```

Metro khusus pengujian memakai port 8096. Watcher Windows gagal pada percobaan pertama; server milik tugas tersebut dihentikan berdasarkan identitas PID dan dijalankan kembali dengan `CI=1`, satu worker. Karena watch dinonaktifkan, perubahan source setelah bundling memerlukan restart server milik tugas. Proses server sesi lain dipertahankan.

## Batas dan gate

Data Payroll masih fixture/state sesi. Reload mengembalikan fixture awal; bukan persistensi payroll produksi. Belum kontrak API/permission Payroll, absensi/layanan nyata, transfer uang, jurnal otomatis, verifikasi perangkat/native Share, atau pencocokan Figma penuh. Adapter HTML memuat CSS hasil build; respons SSR tidak diuji.

QA diminta mengulang alur kembali dari slip dan direct link, memeriksa ID/status/pembayaran satu kali, serta menilai regresi perangkat native. QC diminta mereview pembatasan interaksi header aktif, penggunaan komponen bersama, dokumentasi, dan batas pratinjau. Sinyal serah terima dicatat pada workspace; belum ada klaim penerimaan atau approval sesi lain. PM memutuskan publikasi. Tidak commit/push atau mengubah branch dari sesi developer ini. TypeScript integrasi penuh tetap mengikuti batch terkoordinasi PM.

Execution Profile & Operator Tips: Medium untuk stack/fokus/deep link. Audit → reproduksi router → satu layout → regresi browser/layout → lint/Biome/tipe terfokus → QA/QC → gate PM. Tidak mengambil source auth/guard, primitive bersama, dependency, Metro/HP/server milik sesi lain, atau PDF status desain historis. Tidak ada alat Figma langsung yang callable pada sesi ini; pekerjaan ini tidak mengklaim kesamaan visual baru.
