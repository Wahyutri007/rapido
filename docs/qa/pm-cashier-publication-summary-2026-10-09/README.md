# Publikasi Kasir oleh Projek Manager

9 Oktober 2026. Arsip ini mencatat pekerjaan PM dan QA yang sudah dilakukan.
Commit arsip hanya menambahkan dokumentasi; source modul yang belum memenuhi
gate QA/QC tetap di workspace para pemiliknya.

| Perbaikan source yang sudah terbit | Branch modul | Commit |
| --- | --- | --- |
| Harga item dan subtotal keranjang | `fix/cashier-cart-pricing` | `42fb6217ad53047a444f698b25d0f01ce845807f` |
| Navbar Kasir, inset footer Katalog, opt-in tombol debug | `fix/cashier-navigation-layout` | `50d8196189d1c7bb945c385f961c5837f0b9c250` |

Keduanya diterbitkan ke branch modul lebih dahulu, lalu ke `main` melalui
fast-forward tanpa force push. Pricing menjalani developer51, QA16 dan QC44
sebagai suite terpisah. Navbar menjalani QA17 dan QC10 kelompok pemeriksaan
independen, serta TypeScript terfokus tanpa diagnostik. ESLint navbar memiliki
0 error dan 18 warning root yang sudah ada. Angka pemeriksaan tersebut tidak
menyatakan persentase seluruh Kasir selesai.

[Receipt harga](../pm-cashier-pricing-2026-10-09/PUBLICATION_RECEIPT.json) dan
[receipt navbar](../pm-cashier-navbar-publication-2026-10-09/PUBLICATION_RECEIPT.json)
ditulis setelah push source. Arsip ini mempublikasikan kedua receipt tersebut;
receipt bukan bagian dari commit source yang dicatatnya.

[Taskboard](../pm-cashier-intake-2026-10-09/TASKBOARD.json) adalah snapshot owner
dan gate saat arsip dibuat. Katalog serta reset Transaksi/Riwayat Shift masih
memiliki temuan P2. Stok menunggu QA native dan integrasi. Penawaran, Tipe
Pesanan, laporan, serta visual Cash Input/Tagihan masih mengikuti gate masing-masing.
Kontrak backend/pembayaran belum layak untuk menyatakan transaksi berhasil.

[QA reset Tagihan](../pm-cashier-bills-reset-qa-2026-10-09/REPORT.md) lulus20
pemeriksaan perilaku. [QA Cash Input SD5-014](../pm-cashier-cash-input-qa-2026-10-09/REPORT.md)
lulus24 pemeriksaan perilaku dan3 fingerprint caller. Kedua paket adalah bukti
historis untuk hash yang tertulis. Overlay visual berikutnya tidak menerima
approval otomatis dari paket lama. Snapshot source peer, native/Figma penuh,
checkout, live API dan pembayaran tidak disertifikasi oleh arsip ini.

[Audit kontrak backend](../pm-cashier-contract-2026-10-09/HANDOFF.md) berisi
temuan dari source; tidak menjalankan API atau database.
[Review referensi](../pm-cashier-reference-2026-10-09/REFERENCE_REVIEW.json)
menegaskan file Figma pengguna `gbdKqL2EcYNenWiQXG4SRW`, halaman `0:1`, section
Kasir `29:18658`, dan hash ekspor resmi yang telah diperiksa. Path peer/frame
di receipt dapat merupakan bukti lokal workspace yang belum ada di Git.

[Manifest arsip](ARCHIVE_MANIFEST.json) menyimpan hash setiap salinan. Jalankan
`node docs/qa/pm-cashier-publication-summary-2026-10-09/verify-archive.cjs`
untuk memeriksa kandidat atau tambahkan SHA commit untuk memeriksa blob Git.
Verifier hanya memeriksa arsip, JSON dan batas perubahan; tidak menjalankan ulang
suite aplikasi. Shared checkout, source dan index peer tetap dipertahankan.

Byte arsip historis dipertahankan, termasuk encoding/CRLF dan baris kosong
penutup pada empat berkas. Catatan formatting tersebut dicatat pada manifest;
receipt dan fingerprint historis tidak ditulis ulang.

Execution Profile & Operator Tips: Low untuk arsip dokumentasi; verifikasi
manifest/JSON dan batas Git, kemudian branch modul dan `main`. Gunakan daftar
path eksplisit, periksa remote head, dan pertahankan receipt historis.
