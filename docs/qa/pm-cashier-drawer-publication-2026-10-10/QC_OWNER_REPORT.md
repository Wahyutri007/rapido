# QC Laci Kasir — 10 Oktober 2026

**READY_FOR_QA_SCOPED: pemulihan rute menu, bukan implementasi perangkat.** Inventory sebelum membuktikan callback MainMenu `/cash-drawer` tidak mempunyai file tujuan. Kini file Cashier no-layout dan satu registrasi Header tersedia. MainMenu delapan aksi, ikon, urutan dan callback tidak berubah; inverse AST membuktikan seluruh registrasi layout lama termasuk Laporan Shift dan callback PM tetap sama.

Halaman menyatakan koneksi/pembukaan laci belum tersedia dan menyediakan Pengaturan Printer menuju route existing. Back memakai history, atau Beranda pada cold link. Tidak menciptakan status koneksi, toggle otomatis, perintah perangkat, API/persistensi atau sukses palsu. Ini menutup kegagalan navigasi menuju route tidak dikenal; fitur hardware tetap belum selesai.

**11 kelompok browser aktual PASS, 15 kontrak route/preservation PASS**. TypeScript dua root + empat ambient / 1086 closure **0 diagnostic**; ESLint/Biome/diff PASS. Runtime/console/eksternal nol. MainMenu, screen, parent Header/primitives/font produksi diuji pada 390×844, 320×568, 240×320 dan 844×390 dengan inset top/side/bottom. Seluruh keterangan dan CTA dapat dicapai; satu header, tombol kembali dan route pengaturan diperiksa. Layar 240px diperiksa visual. Adapter hanya router/JSStack selection/inset/haptic; boot full Expo Router dan native belum diuji.

`missing-route-before.json`, snapshot layout, hasil browser/contracts/quality dan gambar disimpan di paket ini. README navigation diperbarui dengan append UTF8; prefix byte nonUTF8 existing dibuktikan utuh. Tidak mengubah primitive, data, source peer, Git/index, runtime/HP atau package/config.

Figma29:21572 get_design_context terbaru ditolak kuota Starter. Arsip metadata berisi konsep pengaturan laci otomatis, bukan konteks/image/prototype lengkap untuk slicing. Tidak mengklaim kesamaan Figma100 atau menyatakan desain hardware selesai. QA memeriksa kohort baru dan full-router/device sebelum PM mengintegrasikan; paket publikasi MainMenu lama perlu review tujuan rute bersama modul Stock/Shift/Scanner lain, bukan otomatis disetujui oleh callback test.
