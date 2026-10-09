# Audit kesesuaian Figma

9 Oktober 2026, Software Developer Senior 5 / Codex-5. Arahan pengguna: tampilan yang ada di Figma harus sama. **Seluruh aplikasi belum dinyatakan 100%**. Persentase global tidak dihitung tanpa daftar seluruh frame dan bukti perbandingan setiap layar/state.

File: `gbdKqL2EcYNenWiQXG4SRW`. Akses terbaru berhasil membaca full design context, screenshot dan metadata Stok Akhir `1:12401`. Panggilan metadata Page 1 berikutnya ditolak oleh batas Starter Figma; [respons akses](qa/senior-5-2026-10-09/closing-stock-figma/access-limit.txt) disimpan. Inventaris lengkap Page 1 belum tersedia pada audit ini.

## Bagian yang sudah diperbaiki dan diukur

[Perbandingan Stok Akhir terkini](qa/senior-5-2026-10-09/closing-stock-figma-narrow/compare.html) menampilkan referensi dan hasil render. Delapan anchor pada 390×1347—search, dua filter, outer card, column header, dua category groups dan bottom navigation—mempunyai posisi/ukuran sama dengan metadata, selisih terukur 0 px. Warna kategori/zero/low/header, font label navigasi serta 11 SVG export/root dimensions diuji. Ini pemeriksaan RNWeb initial filled state dengan konten pembanding Figma di fixture, bukan data contoh baru aplikasi.

Supplement SD5-010-NARROW memperbaiki label Inventory yang terpotong pada 320 px: gap menu 8 px di bawah 360 px, tetap 14 px pada acuan 390 px. Pemeriksaan terbaru 52 browser +17 scope/default-isolation =69 PASS/0 FAIL; empat back callbacks dipakai ulang pada hash layout yang sama. Hasil utama 70 pemeriksaan tetap historis, tidak dijumlah ulang. Packet terbaru 77 artefak disegel, packet utama 76 dan SD5-009 133 tetap identik. Android, safe area/keyboard/font scale perangkat, router/auth lengkap, picker/empty/loading state dengan referensi tersendiri, dan identitas piksel lintas renderer belum disahkan QA/QC.

## Cakupan Inventory yang sudah terpetakan

Daftar ini mengikuti [progres implementasi](FIGMA_PROGRESS.md), bukan inventaris seluruh file Figma. Sepuluh menu tersambung tidak membuktikan seluruh frame/state sama.

| Flow | Referensi frame | Gate visual saat ini |
| --- | --- | --- |
| Persediaan hub | `1:4792` | Belum diukur pada audit ini |
| Ringkasan Inventory | `1:12487`, `1:12956` | Referensi lengkap pernah diakses; audit tampilan terkini belum dilakukan |
| Transfer Stok | `1:12059`, `1:11949`, `1:12312` | SD5-011 koreksi warna metadata/browser selesai; bentuk asset resmi/full-frame layout/QC pending |
| Penyesuaian Stok | `1:13404`, `1:13851`, `1:13605` | SD5-011 koreksi warna total/Rusak/browser selesai; label-wrap/card/header/full-frame layout/QC pending |
| Pembelian Barang | `1:14945`, `1:14543`, `1:14866` | SD5-011 koreksi warna metadata/browser selesai; asset resmi/layout/detail full context pending |
| Pemasok | `1:15653`, `1:15530`, `1:15570` | Referensi penuh/visual comparison masih pending |
| Bahan Baku | `1:29776`, `1:31002` | Referensi penuh dan frame daftar masih pending |
| Komposisi Produk | `1:31287`, `1:31448`, `1:31480` | Referensi penuh/visual comparison masih pending |
| Pembayaran Tagihan | `1:15208`, `1:14178`, `1:26045` | Referensi penuh/visual comparison masih pending |
| Riwayat Mutasi Stok | `1:30149`, `1:30441`, `1:30733`, `1:30871` | Referensi penuh/visual comparison masih pending |
| Stok Akhir | `1:12401` | SD5-010-NARROW: initial geometry/assets/colors browser cocok, label 320 px utuh; native/QC dan state lain pending |

## Syarat menutup audit

Koreksi warna [SD5-011](qa/senior-5-2026-10-09/inventory-qc-colors/compare.html) menindaklanjuti QC-FIGMA-003 dan bagian warna004. Latest44browser+7scope=51PASS, lint/type/formatting terfokus bersih. Default shared consumers yang diuji tetap memakai warna awal; delapan callsite metadata opt-in muted. QC003 belum CLOSED oleh reviewer;004 tetap PARTIAL karena bentuk ikon resmi belum tersedia. [Temuan visual tersisa](qa/senior-5-2026-10-09/inventory-qc-colors/visual-observations.json) mencatat wrapping/geometry/asset/native yang belum sama atau belum diverifikasi. Akses fresh1:13605 kembali Starterlimit; koreksi semantic contract existing tidak menggantikan audit acuan penuh.

Inventaris seluruh frame/state dari Figma aktual, petakan setiap frame ke route/component, lalu bandingkan screenshot pada viewport dan konten yang sama. [Audit QC lintas layar](qa/qc-figma-audit-2026-10-09/REPORT.md) mencatat gate terpisah; daftar acuan parsial bukan persentase kesamaan desain. Perbaiki setiap selisih in-scope, verifikasi seluruh asset slot dan interaksi, ulangi Android aktual, dan minta keputusan QA/QC. Sample values Figma hanya untuk pembanding terisolasi; data aplikasi tetap mengikuti sumbernya. Source/paket pemilik lain dan approval historis tidak diganti tanpa gate baru.

Execution Profile & Operator Tips: Medium, satu flow per pemeriksaan. Referensi penuh → source scoped → screenshot/geometry/assets → QA Android → QC → PM. Jangan menaikkan hasil satu frame menjadi persetujuan seluruh aplikasi, jangan mengarang frame atau memakai metadata saja untuk menebak visual. Akses referensi penuh untuk frame berikutnya perlu pulih terlebih dahulu.
