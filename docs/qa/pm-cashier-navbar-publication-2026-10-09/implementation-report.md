# Pemeriksaan seluruh tampilan Kasir — QC, 9 Oktober 2026

Status: **PERBAIKAN TERBATAS SELESAI; KESESUAIAN SELURUH KASIR BELUM LULUS QC.**

Pengguna meminta semua tampilan Kasir diperiksa dan diperbaiki sesuai Figma terbaru. Audit source membaca 52 file route: 39 layar dan 13 layout, ditambah entry komponen feature yang diimpor, total 84 source. Cakupan meliputi kedua group Kasir, Printer, dan pengaturan POS. Angka ini adalah inventaris kode, **bukan jumlah layar yang sudah dibandingkan langsung atau persentase selesai**. Detail per file/hash tersedia di [audit.json](audit.json).

Tampilan masih berbeda karena beberapa modul sebelumnya menyelesaikan fungsi/filter/navigasi dengan struktur lama. Handoff fungsi maupun jumlah tes tidak membuktikan kesamaan desain. Referensi resmi lengkap yang tersimpan saat audit hanya empat state Stok dan dua state Tagihan; indeks 159 layer bukan 159 modul.

## Perbaikan yang dibuat

| Temuan | Perbaikan | Bukti dan batas |
| --- | --- | --- |
| Navbar Kasir masih memakai ikon pengganti, ukuran lama, dan label terklip pada capture HP awal | Opt-in `appearance="cashier"` pada BottomTab existing. Lima SVG asli Figma disalin identik, ikon24, gap8, label Inter12/line16, item48, top16, radius20, warna aktif/inaktif dari context29:26627. Tinggi konten64 ditambah safe area minimum32 | Lima hash aset identik; actual-component regression dan screenshot HP settled. Appearance default/figma mode lain mempertahankan geometri sebelumnya. Bukan sertifikasi semua tab/native accessibility |
| Footer Katalog tidak menyediakan ruang navigasi Android; total harga/bagian Checkout terpotong | Tambah `useSafeAreaInsets()` dan padding bawah24+inset pada footer existing. Href checkout dipertahankan | Harga utuh pada capture sesudah inset; tiga actual-screen mount/inset/callback checks. Desain kartu produk dan filter belum disamakan Figma |
| DevFab aplikasi menutupi Checkout | DevFab sekarang memerlukan `__DEV__` **dan** `EXPO_PUBLIC_SHOW_DEV_TOOLS=1`. Default preview tidak menampilkan tombol debug ini | Guard source diverifikasi; capture HP berikutnya di Stok tidak menampilkan DevFab. Overlay sistem/Expo tetap di luar scope. Belum ada capture Checkout final sesudah guard pada perangkat yang terus berpindah layar |

Katalog juga dibersihkan dari import/handler mati dan efek init memakai dependency `fetchData` yang stabil. Format/import Root dirapikan untuk quality; auth, API, transisi, fungsi debug, data toko dan pembayaran tidak diubah. Tidak ada route ditambah/dihapus. QA packet peer dan source Search/Filter/MenuView/pricing/Keypad tetap utuh.

Lihat [perbandingan potongan gambar](perbandingan.html). Capture navbar dibuat sesudah perbaikan navbar, sebelum guard DevFab. Capture Katalog sesudah inset juga masih menampilkan DevFab; jangan menganggapnya capture final guard. Full screenshot/XML perangkat disimpan privat di D:/Rapido-QC-temp/cashier-visual. Nama capture awal menunjukkan tujuan pengambilan, bukan jaminan route aktual: `report-after` sebenarnya Katalog; `catalog-footer-final` sebenarnya Stok. Screenshot/XML tidak selalu konsisten pada runtime bersama; tidak dihitung sebagai pengujian full Router atau accessibility.

## Status per kelompok layar

| Kelompok | Acuan terbaru | Hasil pemeriksaan / pekerjaan tersisa |
| --- | --- | --- |
| Beranda | 29:18671,29:18940 — metadata saja | Hero/summary/menu masih legacy. Kas Sekarang/Pengeluaran masih hardcoded -1; daftar penjualan/count juga contoh hardcoded. Perlu full frame dan kontrak data, belum diredesain |
| Katalog, pencarian, detail | 29:22106,29:22138,29:22323,29:23669 — metadata saja | Inset diperbaiki. Grid/list, gambar produk, filter, ukuran kartu dan state belum lulus visual. Search aktif milik Senior7 |
| Keranjang, promo, tunai, konfirmasi | 29:28228,29:24281,29:24473,29:25047,29:26539,29:26573 — metadata saja | Perbaikan harga/input/promo terpisah dari desain; quote/payment/live API belum selesai. Preserve PM/Senior5/Codex3 |
| Tagihan dan detail/split | Context+screenshot lengkap29:26627 dan29:48148; varian lain metadata | Reader sudah menyerahkan dua state ke Senior8. Mapping data/status dan perubahan visual screen belum diterapkan pada batch QC ini |
| Stok | Empat context+screenshot lengkap29:27153/27290/27343/27391 | PM terbaru sudah menerima QC visual terisolasi dari reader lain; bukan hasil audit native batch ini. HP terlihat menjalankan Stok; empat state native/router masih pending sehingga PM menahan publikasi |
| Tempat | 29:23446/23607/23652/28014 — metadata saja | UI pratinjau outlet/area/status sudah ada; kesamaan layout dan semua state menunggu detail frame |
| Laporan dan Riwayat | 29:20561/20736/21356 — metadata saja | TabPager/kartu legacy. Perbaikan reset lifecycle bukan kelulusan visual. Pemasukan20372/20402 tidak dijadikan acuan expense-input |
| Transaksi dan detail/refund/void | 29:23044/22628/22835/20054/20199 — metadata saja | UI pesanan contoh/filter tersedia; styling/state lengkap masih pending; reset search dikembalikan ke Codex2 pada packet terpisah |
| Riwayat/Laporan Shift | 29:20916/20997/27489/27600 — metadata saja | Data read-only dan pagination bukan kesamaan visual; native/header/detail/state perlu diperiksa setelah acuan lengkap |
| Printer | 29:21613/21639/21677 — metadata saja | Memakai route Kelola existing. Dialog masih menyebut Biaya Tambahan dan success belum membuktikan penghapusan/hardware; temuan terbuka |
| Scanner | 29:21652 — metadata saja | Route ada, belum sertifikasi tampilan/koneksi perangkat |
| Pengaturan POS dan subhalaman | 29:21514/21572/21585 — metadata saja | Perlu mapping varian terhadap layar bersama; jangan mengubah Back Office melalui tebakan |
| Cash Drawer | Caller `/cash-drawer` | Tidak ditemukan route tujuan; temuan tetap terbuka, tidak dibuat layar perangkat palsu |
| State Member/Pelanggan/Voucher/Struk pada Figma | 29:27412/27448/27688/26497/28201/28214/26179 — metadata saja | Belum dipetakan satu per satu ke state/route Kasir yang setara. Inventaris kode39layar tidak membuktikan seluruh state Figma sudah diimplementasikan; popup/nested frame juga tidak dihitung sebagai modul selesai |

## Pengujian

- **27 PASS / 0 FAIL / 0 renderer error**: actual BottomTab JSX/effects, empat lebar320/360/390/844, inset0/24/48, selected state lima tab, route custom Katalog, haptic, hidden tab, geometri mode lama, lima hash aset, serta actual Katalog mount/efek/init/footer/checkout. Native/presentation/navigation/Reanimated memakai adapter; hasil bukan sertifikat geometri native/full Router/backend.
- Scoped TypeScript: **4 root +4 ambient, closure1340, 0 diagnostic**. ESLint, Biome dan diff-check exit0; source stabil. ESLint masih **18 warning existing** di Root (import setelah splash initialization dan unused debug variables); Biome juga mencatat warning existing `any`/unused. Tidak diklaim warning-free atau full-project clean.
- Quality awal menemukan missing effect dependency Katalog; sudah diperbaiki. Initial results/log disimpan terpisah. Saat patch quality sempat salah menaruh dependency pada useCallback; diperbaiki segera sebelum final regression/quality. Final actual Katalog mount mencakup kasus ini. Tidak dihitung sebagai bug developer atau hasil final.
- Observasi HP memakai vivo1918 / Expo Go / Metro8088 existing. QC tidak restart/kill service, clear cache/data/token, ubah USB atau membuka/menutup toko/membayar. Runtime bersama berpindah layar; observasi dibatasi sesuai screenshot aktual.

## Batas akses dan langkah berikut

File otoritatif tetap [Figma Kasir terbaru](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=29-18658). Login/koneksi berhasil, tetapi panggilan Home `get_design_context` dan `get_screenshot` mengembalikan **Starter tool call limit**, termasuk retry setelah referensi Tagihan masuk. Receipt [figma-access.json](figma-access.json).

[Skill figma-design-to-code](skill://figma/figma-design-to-code/SKILL.md) menyatakan: “You MUST implement exclusively from the high-fidelity `get_design_context` responses”. Karena itu metadata/outline browser tidak dijadikan dasar menebak desain halaman lain. Ini persyaratan referensi desain, bukan permintaan izin baru untuk mengerjakan; instruksi pengguna memperbaiki semua sudah diterima. Rencana implementasi sudah diizinkan pengguna dan key lama pada skill lokal dikesampingkan oleh URL terbaru.

Lanjutkan pengambilan full context/screenshot/aset Home, Katalog, Checkout, Laporan dan Tempat saat layanan bisa membaca lagi. Ekspor frame Figma terbaru dapat membantu review visual, tetapi belum menggantikan context lengkap untuk slicing menurut skill. Tagihan dua state dapat dikerjakan owner dari referensi yang sudah tersedia. Batch terbatas ini siap QA/PM review; **jangan publish sebagai seluruh Kasir selesai atau sesuai100%**. Tidak ada commit/push pada batch ini.

Execution Profile & Operator Tips: Medium per kelompok; reference -> mapping state/data -> bounded fix -> native comparison -> QA/QC -> PM. Pertahankan callback dan scope peer, verifikasi hash terkini sebelum integrasi, dan gunakan perangkat bergiliran agar bukti native konsisten.
