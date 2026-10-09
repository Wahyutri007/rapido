# QC independen pencarian Stok Kasir — 10 Oktober 2026

QC_ACCEPTED_SCOPED_STOCK_SEARCH_WITH_HEADER. CashierStockScreen90b06bd1e1f029b8ab0fd3c990898a7d4a9511acdd19f19a66da807e469cf30e diterima untuk perubahan satu prop viewportSafe. Reviewer tidak mengubah kode produksi. Penghilangan prop tersebut mereproduksi seluruh source Beforea6c44b35 tepat setelah normalisasi EOL, termasuk handler, pencarian, copy, status, data dan filter.

21 kelompok browser dan enam kontrak lulus. Bundle yang sama memuat Before dan screen/thinroute/Header/layout aktual. Input Before melewati batas SearchBox pada280/240, sedangkan versi opt-in berada di dalamnya. Pada390/320 geometri seluruh kotak/input/ikon dan Filter tetap sama dalam0.7px. Ikon SVG asli18×18, font input12, gap12, tinggi48 dan Filter48 dipertahankan.

Lima viewport390×844,320×568,240×320,844×240,320×240 menggunakan inset OS48 dan sisi8/48/24 sesuai fixture. Input dan tombol Filter sepenuhnya aman; setiap sheet dibuka dengan klik fisik pertama, keempat radio status, kategori pertama/terakhir, Reset/Terapkan48, tutup sheet dan note statis terakhir dapat dicapai dengan scroll. Gambar halaman awal memang hanya merekam bagian daftar yang sedang terlihat; pengujian JSON memeriksa note terakhir setelah scroll. Header Stok Produk dan label Pratinjau aktual dipertahankan.

Pencarian trim/case untuk nama,varian,kategori, hasil kosong/reset, cancel draft/reopen, serta jumlah status Habis7,Menipis4,Tersedia14,Semua21 lulus. Titipan mempertahankan Beras10.6kg dan Kecap12Pcs; Baju+Celana19, Dalaman0, reset draft/apply tetap. CSS28/40 memeriksa input editable pada320/240; pemeriksaan ini bukan sertifikasi seluruh kontrol atau sheet dengan font besar. Back fisik memakai callback aktual. Tidak ada runtimeerror, jaringan/API/storage atau mutasi record.

2root+4ambient,1175file TypeScript,0diagnostik; ESLint0error/0warning, Biome/diff lulus.16guard produksi, rawcompile75sourceproject/9778907bytes/30aset, fixture/Before, typeclosure, konfigurasi serta receipt pengembang tetap. Empat pasangan context+PNG Figma29:27153/27290/27343/27391 dan8SVG asli diverifikasi hash; empat PNG acuan dan dua screenshot final diperiksa visual.

Browser pertama gagal sebelum menjalankan pemeriksaan karena oracle menunggu accessible-name pada textbox, padahal SearchBar saat ini menaruh accessibilityLabel pada container Input. Artefak/fatal/as-run dipertahankan. Locator privat dikoreksi menjadi placeholder aktual Cari... yang unik, tanpa perubahan produksi, bundle, batas0.7px atau cara klik; replay21PASS. Nama accessible native/screenreader pada input belum disertifikasi.

Akses Figma context/screenshot langsung masih dibatasi kuota; referensi unduhan dipakai secara eksplisit. Tidak ada klaim100%Figma/latest, nativekeyboard/fontScale, seluruh ExpoRouter, batas stok/backend, publikasi atau persetujuan seluruh Kasir. PM masih perlu memeriksa kandidat gabungan yang akan dipublikasikan. Receipt lama tetap beku.

[21 hasil browser](/D:/RapidoQCCache/cashier-stock-search-header-qc-2026-10-10/browser-final/results.json), [enam kontrak](/D:/RapidoQCCache/cashier-stock-search-header-qc-2026-10-10/contracts.json), [kualitas](/D:/RapidoQCCache/cashier-stock-search-header-qc-2026-10-10/quality.json).
