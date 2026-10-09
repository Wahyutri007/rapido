# SD4-003 — Tempat Kasir: handoff terbaru

Owner Software Developer Senior4 / Codex-4, 9 Oktober2026 Asia/Jakarta. **READY_FOR_QA → QA → QC → PM**. Belum persetujuan reviewer atau publikasi.

Modul selesai pada sepuluh source: tab Tempat mempunyai pemilih outlet pratinjau eksplisit, daftar/pencarian/filter area-status/reset/ringkasan; detail memvalidasi outlet-area-place, menunjukkan jenis/kapasitas/unit/status konfigurasi; kembali dari normal navigation/deep link mempertahankan outlet dan filter yang sesuai. Data usePlaceStore existing read-only. Header hanya layout; dua shared layout masing-masing menerima satu delta integrasi.

## Koreksi provenance dan paket acuan

Paket [awal](../cashier-location/HANDOFF.md) tetap frozen sebagai histori. Saat finalisasi, integration-check mendeteksi Wrapper berubah dari e7917179 ke753ae276 oleh scope shared footer/safe-area sesi lain. Paket awal terlanjur disegel memakai integration-results terdahulu; pernyataan sembilan kontrak tidak berubah tidak mewakili Wrapper terbaru. **Supplement ini menjadi acuan final dan mengoreksi klaim tersebut.** Tidak mengubah/reseal bukti lama atau source Wrapper/BottomActionBar.

Delapan kontrak snapshot lama tetap sama; Wrapper baru direkam sebagai overlay eksternal, bukan approval scope footer. BottomActionBar baru ditambahkan sebagai kontrak baca. Sepuluh source Tempat Kasir tetap persis hash paket awal. Dua layout bersama tetap hanya delta header tab dan child location. File source-inputs.json mengikat21source/kontrak; seal memastikan semuanya tetap sama sepanjang recheck. Setup/transport awal0assertion dan log dependency CI dijelaskan di SETUP_NOTES.md.

## Verifikasi terkini

- Model28 PASS; production helper/fixture sumber lama tetap sama.
- Browser13 PASS, production entry/providers/Expo Router dengan owner/token/API dan HTML/CSS fixture terisolasi. Runtime0, console error0, mutation API0.
- Navigasi tab/detail, retained selection/filter, ganti outlet, inactive/empty, forged ID, fresh deep link/reload/fallback,320×640 dan844×390 diuji ulang terhadap dependency terbaru. Jumlah13 bukan ditambahkan ke pengulangan historis.
- Capture kartu lengkap di atas tab bawah pada390×844 PASS; margin16px. Screenshot daftar/detail kecil dan390 ditinjau.
- Integration3 PASS: dua delta tepat dan guard source/overlay. Scoped TypeScript tiga root+1196source0diagnostic.
- ESLint sepuluh owned source0error/warning serta Biome/diff exit0 dari paket awal digunakan ulang karena hash semua owned source sama. Tidak menyatakan lint/approval perubahan footer milik sesi lain.

## Batas dan runtime

Outlet/tempat masih contoh dan state sesi; tidak dipetakan ke toko aktif backend, tanpa pesanan/okupansi/reservasi/API/persistensi baru. Status Aktif adalah konfigurasi, kapasitas sesuai jenis. Browser memakai fixture autentikasi/transport; native actual flow, backend nyata, SSR dan Figma parity belum disertifikasi. Hasil developer bukan approval QA/QC. Shared dependency lain di luar manifest dapat berubah; cocokkan hash sebelum replay.

Metro final8088 exec15915 berjalan dengan EXPO_OFFLINE1/--localhost/--go/satuworker dan watcher aktif (CI dihapus), backend8001 exec47270 dipertahankan. Restart server sendiri memasukkan dependency BottomActionBar baru; tidak restart proses owner lain. Warm start:hp berhasil membuka Rapido di HP35b9a8aa/ExpoGo57.0.9 pada paket awal; pemeriksaan ini hanya launcher/pembukaan, bukan sertifikasi flow native. Konflik cold --offline+--localhost masih scope SDK/PM dan launcher tidak diedit.

## QA/QC dan replay

Sinyal melalui shared workspace; belum klaim diterima langsung. QA uji native sebenarnya, mode/auth, system back, deep link, pilihan/filter, live perubahan/hapus tempat dan sumber kosong. QC review layout kecil/landscape, ID/status/unit, token serta batas data. PM pemilik integrasi/publication. Tidak Git index/branch/commit/push/merge atau perubahan laporan histori/paket Payroll/Absensi.

Dari app root: `node docs/qa/codex-4-2026-10-09/cashier-location-wrapper-recheck/seal.cjs` default read-only verify. Manifest dibuat sekali memakai --seal dan RAPIDO_QA_HEAD. Jangan menjalankan runner yang menulis hasil pada paket frozen. Salin runner ke folder reviewer sendiri; integration runner mereferensi before/paket awal, pertahankan referensi itu. Browser/capture runner memakai Metro milik pemilik runtime dan Playwright existing `.expo/payroll-qa-tools/node_modules/playwright`; jangan restart runtime tanpa koordinasi. Model/typecheck/integration/browser/capture dapat direplay dari root aplikasi tanpa dependency baru.

Execution Profile & Operator Tips: Medium. Guard hash → QA native/actual → QC → PM. Gunakan handoff supplement ini; pastikan shared source terbaru dan pisahkan approval modul dari approval shared footer.
