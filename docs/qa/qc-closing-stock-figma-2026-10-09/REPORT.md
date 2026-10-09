# QC Stok Akhir Figma — 9 Oktober 2026

Sinyal **QC-CLOSING-STOCK-FIGMA-20261009-PASS-SCOPED**. Frame `1:12401` pada file pengguna `gbdKqL2EcYNenWiQXG4SRW` lulus pemeriksaan terbatas RNWeb pada source SD5-010-NARROW. Ini bukan kelulusan seluruh aplikasi, seluruh state, Android atau kesamaan pixel 100%.

| Pemeriksaan baru QC | Lulus | Gagal |
| --- | ---: | ---: |
| Browser fresh build | 52 | 0 |
| Browser tambahan: batas 359–360 px, target tekan, teks panjang, filter/status | 50 | 0 |
| Kesetaraan output varian default komponen dengan baseline, memakai adapter | 51 | 0 |
| AST callback dan isolasi appearance/path | 17 | 0 |
| Callback kembali layout Inventory | 4 | 0 |
| Integritas/provenance SVG | 11 | 0 |
| **Total assertion yang dieksekusi; cakupan berulang** | **185** | **0** |

Sembilan anchor / 36 nilai x/y/w/h dibandingkan langsung dengan metadata tersimpan 390×1347; selisih dalam toleransi 0,1 px. Sebelas SVG berasal dari receipt export yang tersedia. Warna kategori/status, Inter, dimensi ikon, search/filter, navigasi dan jarak row terakhir terhadap tab bawah diperiksa. Label Inventory tidak terpotong pada 320 px. Matrix tambahan: 320×480, 359×640, 360×640, 390×844, 414×736, 844×390, 768×1024. Lima target navigasi minimal 44 px dan bisa ditekan; teks/SKU panjang tetap memperlihatkan jumlah tanpa overflow horizontal. Stok nol dibedakan dari data toko yang belum tersedia.

ESLint sembilan root: 0 error/warning. TypeScript root beserta closure: 0 diagnostic. Biome exit 0 dengan dua warning noExplicitAny yang sudah ada pada BottomTab; diff check exit 0. Dua percobaan pembanding default awal gagal karena adapter/perbandingan lintas realm dan disimpan di interim; setelah adapter disesuaikan dengan Text/TabItemButton/cn aktual, cohort final 51/0. Tidak ada source aplikasi yang diedit QC untuk hasil ini.

`proof.json` mengikat 20 source/aset, 2.927 runtime input, 80 source aplikasi pada closure TypeScript dan 358 artefak historis terlindungi; drift masing-masing nol ketika pemeriksaan selesai. `replay/` memuat salinan konteks developer beserta output replay baru. `replay/verification.json` dan manifest developer yang disalin adalah konteks historis, bukan manifest QC baru. Bundle/cache/profil browser QC terpisah berada di D:/Rapido-QC-temp/closing-stock-figma-2026-10-09. Frozen packet asli tidak diubah.

Generated cache web.css bersama berubah selama sesi lain menjalankan Metro; fixture QC menggunakan stylesheet fresh miliknya sendiri, SHA256 `0184ef11f3e6c583eff054711b5446932ec696bffa16c9536b2105a4abed6c04`. Cache bersama tersebut tidak menjadi runtime input bundle QC. Tidak mengklaim semua cache bersama identik atau hasil ini meluluskan CSS runtime aplikasi penuh.

Acuan penuh frame tersimpan dipakai karena tool Figma langsung tidak callable pada sesi QC. Gambar Figma `replay/figma-reference.png` telah downscale; `replay/reference-390x1347.png` adalah render QC, bukan gambar Figma. Geometry/color/asset checks tidak membuktikan identitas byte atau semua state. API/auth/router menggunakan fixture/adapters; data Figma hanya fixture perbandingan dan tidak menjadi seed aplikasi. Native/safe area/keyboard/font scale/full router dan seluruh frame lain tetap gate berikutnya. Temuan QC-FIGMA-001–004, Income dan Delete mempunyai keputusan/overlay terpisah.

Permintaan terbaru pengguna mengambil alih PM/publikasi; hasil ini boleh dibaca sebagai review frame terbatas, bukan otomatis kelulusan tree integrasi. Paket bukti masih membutuhkan manifest QC terpisah untuk distribusi frozen; jangan menjalankan ulang writing runner pada folder ini setelah distribusi.

Execution Profile & Operator Tips: Medium. Hash/acuan → replay terpisah → keputusan scoped → QA native → PM. Jangan mengubah atau reseal paket historis.
