# QC tampilan Batas Stok — 9 Oktober 2026

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

26/27 fingerprint awal stabil. Satu perubahan package.json milik sesi QC launcher HP: hanya penambahan start:hp; menghapus baris itu dari buffer merekonstruksi hash awal persis. Tidak menulis source aplikasi/backend/dependency/Git. Cache Android193003bytes dan CSS web tetap identik; Metro8088 PID9200 dipakai existing tanpa restart. [Fingerprint akhir](fingerprints-after.json).

## Alert kuning dan batas cakupan

Log Metro existing masih memuat warning root layout untuk menu/search, menu, catalog/menu serta deprecation InteractionManager. QC-HP-WARNING-001/002 tetap OPEN pada [paket warning sebelumnya](../qc-nativewind-cache-2026-10-09/REPORT.md). Ini warning pengembangan/routing/dependency; belum ada bukti bahwa semuanya merupakan banner yang sama pada HP pengguna. Tidak mematikan warning. Operasi launcher/HP sekarang milik sesi QC lain pada SESSION_COORDINATION.

Preview memakai React/RN-web, komponen stok, SearchBar, modal, provider, styling dan font produksi; adapter Axios browser-local menyediakan data contoh tanpa backend. Expo Router diisolasi untuk layar ini, Header memakai judul produksi “Pengaturan Batas Stok”; root auth/navigasi global tidak disertifikasi. Saat preflight Rapido tidak foreground pada HP, sehingga tidak mengambil screenshot native baru. Figma callable tidak tersedia. Native layout, seluruh pemakai shared modal, keyboard, aksesibilitas dan persistensi API perlu pemeriksaan tersendiri.

Hasil awal browser34check dengan2kegagalan picker akibat pengukuran saat animasi masih bergerak disimpan di browser-initial-results.json. Runner dikoreksi untuk menunggu spring; hasil final36check di atas. Biome stdin tanpa --write sebelumnya memberi exit1 meski teks identik; mode stdout dengan --write membuktikan teks identik dan exit0, tanpa menulis file aplikasi. Kesalahan quoting PowerShell node-e tidak menjalankan pemeriksaan; helper file menggantikannya.

Untuk recheck: pemilik Stock/Senior6 menangani token layar; pemilik SuccessModal menangani ukuran gambar. Serahkan source/hash baru dan hasil pengecekan pemakai shared modal. QC menilai source aplikasi yang diperbaiki, bukan menandai salinan usulan sebagai sudah masuk aplikasi. Backend QC-STOCK-001 tetap ditangguhkan pada [status terkini](../qc-stock-contract-2026-10-09/CURRENT_STATUS.md).
