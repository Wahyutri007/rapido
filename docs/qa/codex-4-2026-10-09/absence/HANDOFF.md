# Codex-4 — SD4-002 Absensi Kelola

Tanggal: 9 Oktober 2026 (Asia/Jakarta). Status: **READY_FOR_QA — developer selesai**, menunggu review QA/QC dan gate PM.

## Hasil pekerjaan

Placeholder `/manage/absence` diganti daftar catatan yang membaca `useAbsenceStore` produksi. Pencarian mencakup toko, tanggal, lokasi, jam dan label status; filter status/toko/tanggal dapat digabung dan direset. Ringkasan mengikuti hasil filter. Tanggal kalender valid diurutkan terbaru dahulu, tanggal yang tidak dapat dibaca tidak diberi tanggal baru, dan urutan sumber pada hari yang sama dipertahankan.

Tap catatan membuka `/manage/absence/detail?id=<id>` dengan tanggal, jam masuk/keluar, status dan lokasi dari record yang sama. ID kosong/tidak ditemukan menampilkan jalan kembali ke daftar. Header berada pada layout; daftar menjadi initial route untuk deep link. Back memakai riwayat tersedia, atau replace ke daftar/Kelola bila stack kosong. Header khusus Absensi mengikuti fokus supaya tombol kembali tetap dapat diklik setelah detail ditutup.

Tiga status menjelaskan kelengkapan jam: Masuk & Keluar, Belum Keluar, Belum Lengkap. Tidak menghitung durasi shift/keterlambatan dari jam yang belum memiliki kontrak shift. Identitas karyawan dan jadwal tidak dibuat-buat. Detail tidak mengunduh/menerbitkan selfie atau memanggil GPS.

Delapan source: tiga route/layout `app/(no-layout)/manage/absence/`, tiga komponen `components/feature/manage/absence/`, helper `lib/manage/absence.ts` dan tipe filter `types/ui/manage/absence.ts`. Parent Kelola sudah mendaftarkan absence tanpa header tambahan. Store/form/camera mode Absensi dan primitive bersama tidak diubah. Paket Payroll sebelumnya tetap frozen.

## Verifikasi developer

- [34 pemeriksaan helper](model-results.json) lolos: kalender/leap day/jam/status, pencarian lokasi, kombinasi filter, urutan stabil, hasil kosong, ringkasan dan source tidak berubah. Record synthetic hanya input pengujian, bukan seed aplikasi.
- [TypeScript](typecheck-results.json): tiga root route dan 1.177 source dependency impor, 0 diagnostic. [ESLint](eslint-results.json): delapan source, 0 error/warning. Biome dan diff scope exit 0 pada source akhir.
- [10 skenario router/browser](browser-results.json) lolos, runtime/console error 0. [Harness](browser-check.cjs) memakai entry/providers/guard/Expo Router produksi, API fixture browser terisolasi dan adapter boot HTML/CSS. Mencakup daftar, search kosong/clear, filter/reset, gabungan status/toko/tanggal, ID detail, kembali dengan filter yang bertahan, fallback ID tidak ditemukan, direct link/reload/back, viewport320x844 dan844x390. Delapan GET user browser ditangani fixture; mutation API nyata 0.
- [Kegagalan browser awal](before/browser-failure.json): lima skenario lolos, lalu header daftar gagal menerima klik setelah back dari detail. [Layout sebelum koreksi fokus](before/focus-layout.tsx) dan [gambar](before/browser-failure.png) dipertahankan. Wrapper header terdaftar berdasarkan fokus memulihkan interaksi tanpa mengubah Header/JSStack bersama. Margin horizontal daftar diperbaiki ke 16 px melalui child View dan padding vertikal Wrapper, karena `contentContainerStyle` tidak dipakai pada mode `isNotScrollable`.

Screenshot: [daftar390](list-390.png), [detail390](detail-390.png), [daftar320](list-320x844.png), [landscape](list-844x390.png). Daftar390 diambil ulang setelah header actionable karena screenshot awal berlangsung saat transisi; [capture-check.cjs](capture-check.cjs) melakukan trial click tanpa menjalankan tombol kembali. Base HEAD `acba0d92460c1af3149abc3775f09888a2943cab`; working tree bersama. [verification.json](verification.json) mengikat delapan source dan artefak; shared dependency yang berubah sesudah pengujian memerlukan replay reviewer. Bukti developer bukan approval independen.

Jalankan ulang dari root aplikasi, dengan Metro8088 proyek ini siap dan tool Playwright terisolasi `.expo/payroll-qa-tools/node_modules/playwright` tersedia (atau isi `PLAYWRIGHT_MODULE`):

```powershell
node docs/qa/codex-4-2026-10-09/absence/model-check.cjs
node docs/qa/codex-4-2026-10-09/absence/browser-check.cjs
node docs/qa/codex-4-2026-10-09/absence/typecheck.cjs
node docs/qa/codex-4-2026-10-09/absence/seal.cjs --verify
```

Browser default Edge pada Program Files (x86); `BROWSER_PATH` dan `ORIGIN` dapat mengganti executable/origin. Tidak memerlukan login akun pengguna. Jangan mengulang bundle saat reviewer lain sedang menggunakan Metro untuk HP.

## Instruksi HP yang telah dijalankan

`npm.cmd run start:hp` berhasil exit 0; HP USB/Expo Go 57.0.9, backend online dan manifest Metro Rapido cocok. Foreground teramati `host.exp.exponent/.experience.ExperienceActivity`; bundle Android awal selesai. Ini bukti launcher/pembukaan aplikasi, belum sertifikasi flow Absensi baru di perangkat.

Awalnya ADB memerlukan akses di luar sandbox, lalu dua server lama tidak merespons. Backend8001 PID24116/31180 dan Metro8088 PID9200 diverifikasi melalui commandline/proyek sebelum dihentikan untuk pemulihan yang diperlukan instruksi pengguna. Backend8000/queue/dataHP dipertahankan. Backend diganti server 127.0.0.1:8001; Metro diganti server proyek yang sama, satu worker, tanpa clear cache.

Cold launcher SDK57 gagal karena argumen `--offline` bersama `--localhost`. Source launcher tidak diubah; Metro dimulai terpisah dengan `EXPO_OFFLINE=1`, `CI=1`, `--go --localhost --port 8088 --max-workers 1`, kemudian launcher warm berhasil. Bug cold launcher diminta ditinjau pemilik SDK/PM. Mode CI memerlukan restart server sendiri untuk memuat perubahan source baru. Runtime backend/Metro dipertahankan untuk pengguna, tidak dibersihkan setelah QA browser.

## Batas dan serah terima

Ini daftar/detail catatan pratinjau sesi dari store yang sudah ada. Tidak menambah seed, menulis store, mengirim absensi/API, membuat rekap semua karyawan, menyimpan ke backend/perangkat, mengatur shift/izin/cuti, atau mengubah penggajian. Reload memulihkan seed existing. Metadata/screenshot Figma Absensi Kelola tidak ditemukan pada sumber tersimpan dan tool Figma tidak callable; kesamaan penuh Figma belum diverifikasi.

QA diminta replay search/filter/reset, identitas detail, ID hilang, kembali ke daftar/Kelola, serta regresi native/GPS/camera mode lama secara terpisah. QC diminta menilai token/geometri, fokus header, status jam, batas data sesi dan dokumentasi. Sinyal lewat workspace, bukan klaim penerimaan/approval sesi lain. PM memutuskan publikasi; developer tidak commit/push/merge atau mengubah branch/index.

Execution Profile & Operator Tips: Medium untuk kalender, ID dan stack/fokus. Data/helper → dua layar/header → model/router/viewport → kualitas terfokus → QA/QC → gate PM. Gunakan shared Wrapper/Card/Text/SearchBar/SingleSelect/CatalogItemCard/DetailRow; hindari bundle bersamaan pada Metro HP dan koordinasikan TypeScript penuh dengan PM.
