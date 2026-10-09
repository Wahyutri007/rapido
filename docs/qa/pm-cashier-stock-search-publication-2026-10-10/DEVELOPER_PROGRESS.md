# Kasir — Stok: kolom pencarian pada layar sempit

10 Oktober 2026 WIB, Codex-7 / SD7-CASHIER-STOCK-007.

Status developer: **READY_FOR_QA_SCOPED**.

Pencarian Stok memakai prop `viewportSafe` pada SearchBar yang sudah tersedia.
Sebelumnya input mempertahankan lebar minimum 160 px sehingga keluar dari
kolom pencarian pada viewport 280 dan 240 px. Kini input dapat mengecil sesuai
ruang di sebelah tombol filter. Ikon, teks, tinggi kontrol, kartu dan seluruh
logika pencarian/filter tetap memakai implementasi sebelumnya.

Satu source berubah: `components/feature/cashier/stock/CashierStockScreen.tsx`.
Perbandingan dengan snapshot membuktikan bahwa menghapus satu prop tersebut
mengembalikan seluruh source sebelumnya setelah normalisasi line ending.
SHA-256 final:
`90b06bd1e1f029b8ab0fd3c990898a7d4a9511acdd19f19a66da807e469cf30e`.

Referensi full get_design_context dan PNG berasal dari frame `29:27153`
(Semua), `29:27290` (Habis), `29:27343` (Menipis), dan `29:27391` (filter)
di [arsip yang diunduh](figma/offline-gbdKqL2EcYNenWiQXG4SRW-20261009/README.md).
Delapan konteks/gambar serta delapan aset lokal cocok dengan hash arsip.
Pembacaan Figma langsung terbaru masih terkena kuota Starter.

Baseline browser: 15 pemeriksaan lulus, dua gagal untuk batas input pada
280/240 px. Final: 37 pemeriksaan lulus tanpa error runtime/jaringan. Final
mencakup semua pemeriksaan baseline, ditambah alur status Semua/Tersedia/
Menipis/Habis, kombinasi kategori dan multiselect, batal/reopen draf, reset,
hasil kosong, pencarian nama/varian/kategori serta presisi 10.6 kg. Konten
contoh tetap 21 baris: Habis 7, Menipis 4, Tersedia 14 termasuk stok Menipis.

ESLint terfokus tanpa error/peringatan; Biome dan pemeriksaan whitespace lulus.
TypeScript satu root + tiga deklarasi, dependency closure 1003 berkas,
nol diagnostic. Hash source/dependensi stabil selama build dan browser.
Gambar `final-stock-280.png` dan `final-empty-status.png` ditinjau langsung.

Script, snapshot, hasil dan gambar:
`D:/Codex-7/tmp/rapido-cashier-stock-20261010/`.
Pratinjau merender StockScreen, StockGroupCard, StockFilterSheet, helper/data,
komponen bersama, font dan SVG aplikasi aktual pada React Native Web.
Router/haptics memakai adapter privat dan safe area nol. Header tidak ikut
fixture; pengukuran berlaku pada badan layar. Cache/bundle privat ada di D.
Percobaan menjalankan browser sebelum bundle selesai tidak dihitung sebagai
verifikasi; baseline/final hanya memakai bundle lengkap dengan hash stabil.

Batch ini tidak mengubah data contoh menjadi stok toko yang terhubung API,
dan belum memverifikasi Android, full router atau seluruh kesamaan Figma.
Paket pemilik sebelumnya tetap tersimpan sebagai bukti historis; source baru
memerlukan QA/QC independen sebelum persetujuan integrasi.

Execution Profile & Operator Tips: Medium untuk regresi alur filter lengkap.
Lanjutan: pemeriksaan Android/navigasi nyata → QA/QC → integrasi PM. Cocokkan
hash dan klaim sesi terbaru sebelum menyentuh Header atau filter bersama.
