# QC startup HP/web — 9 Oktober 2026

Status: **QC-STARTUP-20261009-PASS** untuk perbaikan error tema saat startup.

Log Metro sebelum perbaikan menunjukkan `Unable to manually set color scheme without using darkMode: class` dari `GluestackUIProvider`. Provider root memakai `mode="light"` dan memanggil setter NativeWind, sementara `tailwind.config.js` memakai `darkMode: "media"`. Setter pada NativeWind yang terpasang menolak kombinasi ini.

Perubahan aplikasi hanya `tailwind.config.js:3`, dari `media` menjadi `class`. Generated NativeWind Android dan CSS web kemudian sama-sama memakai `class dark`. Tampilan tema manual provider dapat diinisialisasi tanpa exception tersebut.

## Verifikasi

- ESLint terfokus `tailwind.config.js`: lulus tanpa diagnostic; `git diff --check -- tailwind.config.js`: lulus.
- Android vivo 1918 / Android 11 / Expo Go 57.0.9: bundle Expo Router berhasil, kemudian aplikasi terlihat pada layar Persediaan. Snapshot UI paket Expo Go berisi Persediaan, Ringkasan Inventory dan tab aplikasi. Ini membuktikan startup native dan render layar; bukan pengujian seluruh operasi Inventory.
- Web aktual melalui Edge, Expo Router/SSR dan provider produksi, backend lokal tanpa fixture: **8/8 pemeriksaan lulus**. Login tampil pada 390×844 dan 1280×900, input menerima teks, tema tetap light saat preferensi OS dark, boot tanpa login mencapai onboarding dan tombol Gabung Sekarang aktif. Tidak ada page exception, console error, request gagal atau respons HTTP >=400 selama pemeriksaan. Kredensial tidak dikirim.
- Bukti terstruktur: `verification.json`, `native-results.json`, `web-results.json`. Runner web dan tiga screenshot aplikasi tersedia di direktori ini. Percobaan pertama runner terlalu cepat memeriksa tombol onboarding saat loading; runner diperbaiki untuk menunggu loading selesai, lalu seluruh pemeriksaan lulus.

## Handoff Project Manager

Metro USB sebelumnya PID 17912 dimulai ulang untuk membaca konfigurasi tema baru sesuai permintaan perbaikan pengguna. Runtime pengganti PID **28952**, port **8088**, satu worker, dibiarkan berjalan. Log lokal ada di `.expo/qc-startup-2026-10-09/`. Backend8001 PID24116 tetap berjalan. ADB reverse vivo untuk 8088 dan8001 tetap terpasang. Web lokal: http://127.0.0.1:8088.

PM dapat meninjau publikasi perubahan satu baris ini bersama gate integrasi akhir. Tidak ada commit/push dari sesi QC. Source boot/onboarding/provider dan modul sesi lain tidak diedit. Test dependency Playwright hanya dipasang di `.expo/qc-startup-tools`, tanpa perubahan dependency aplikasi.

Warning route `menu/search`, `menu`, `catalog/menu` serta warning development/offline yang masih tercatat tidak menghalangi startup yang diuji. Laporan ini tidak mengesahkan seluruh backlog lint, semua modul, semua perangkat atau produksi. Boot/index sedang menjadi scope SD5-002; hasil web merupakan snapshot source bersama saat pemeriksaan.
