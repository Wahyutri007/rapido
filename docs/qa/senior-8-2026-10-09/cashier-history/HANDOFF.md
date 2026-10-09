# CASHIER-HISTORY-001 - Software Developer Senior 8

Status **READY_FOR_QA**, lalu QC dan gate publikasi PM. Scope enam source tersedia pada `verification.json`; tidak ada commit/push atau perubahan modul milik sesi lain.

Halaman `app/(cashier)/report/history.tsx` sebelumnya hanya teks placeholder. Kini tab Laporan Kasir memiliki tombol Riwayat pada header, membuka daftar pencarian/filter status/tanggal/pembayaran/reset dan detail transaksi. Semua href mencantumkan group `/(cashier)` supaya tidak mengarah ke laporan Back Office. Detail baru `/history-detail?id=<key>` memakai key gabungan tanggal sumber dan ID invoice. ID kosong, tidak dikenal, berulang pada query, atau ambigu tidak membuka record pertama.

Data membaca `DEFAULT_TRANSACTION_GROUPS` existing, **delapan baris contoh**; tidak membuat fixture aplikasi baru atau mengklaim transaksi toko aktif. Total group pada fixture berbeda dari jumlah baris aktual; layar menghitung baris actual, memakai `dateKey` karena label tanggal fixture tidak konsisten, dan mengurutkan tanggal/jam terbaru. Nominal ditampilkan sesuai sumber tanpa menganggap refund sebagai pemasukan/keuntungan. Tidak mengarang struk, item pesanan, toko, pembayaran atau refund operasional. Ini modul baca untuk pratinjau yang tersedia; backend/persistensi memerlukan kontrak terpisah.

UI memakai Wrapper/SearchBar/SingleSelect/Card/CatalogItemCard compact/Text/DetailRow/Button bersama. Kontrol filter berada di header FlatList sehingga ikut bergulir pada viewport kecil. Header hanya layout, anchor index dan back/fallback explicit, dengan wrapper fokus agar header tersembunyi tidak menangkap pointer. Layar Laporan index, modal/picker bersama, cart/shift, auth serta layout Tempat Kasir milik Codex4 tidak diedit.

## Verifikasi developer

- `node docs/qa/senior-8-2026-10-09/cashier-history/check.cjs`: **50 PASS / 0 FAIL**, runtime errors 0. Production helper, route reexports, list/detail/layout dirender React; UI/native/router menggunakan adapter. Mencakup jumlah aktual vs metadata, urutan, case/whitespace search, seluruh filter/gabungan, opsi dinamis, reset/empty, identitas lintas tanggal, parameter berubah/missing/ambiguous, entry header, fallback dan fokus pointer. Error setup pertama berupa default-export adapter tanpa `__esModule` sudah dikoreksi pada runner; tidak mengubah source aplikasi untuk meluluskan tes.
- `node docs/qa/senior-8-2026-10-09/cashier-history/quality.cjs`: ESLint max-warnings0, Biome check, diff exit0; TypeScript enam root beserta konfigurasi/deklarasi/dependency impor aktual **0 diagnostic**. Tidak menjalankan TS global. Hasil awal `initial-quality.json` memuat satu warning BOM pada layout hasil penulisan PowerShell; BOM dihapus, lalu perilaku/quality diperiksa ulang. Hasil50PASS dihitung sekali.
- `node docs/qa/senior-8-2026-10-09/cashier-history/manifest.cjs --check`: memeriksa fingerprint source/helper/mock yang dimuat dan artefak. README/koordinasi bersama tidak dibekukan. Bukti lama Ekspor Data tidak ditulis ulang.

## Permintaan QA -> QC

QA: buka tab Laporan Kasir -> Riwayat -> pilih transaksi -> kembali; filter/search harus tetap selama daftar masih mounted. Uji reset, kombinasi yang kosong, semua status, tanggal berbeda, deep link valid/missing/berulang, browser back/forward dan fallback pada stack kosong. Pastikan route tidak pindah ke Back Office. Verifikasi kartu panjang, scroll/filter pada layar kecil dan landscape, keyboard, pemilihan native, keterbacaan nominal serta tombol header.

QC: review identitas, pemisahan data contoh dari toko aktif, penggunaan jumlah baris aktual/dateKey, readonly flow dan kontrak header/shared components. Figma callable tidak tersedia; belum parity Figma. Tes renderer tidak membuktikan geometri browser/native, animasi stack, full router/auth ataupun perangkat fisik; semuanya tetap cakupan QA berikutnya. Data source contoh tidak berubah selama aplikasi berjalan; tidak ada janji arsip transaksi live.

Sinyal dikirim melalui workspace; belum berarti QA/QC menerima atau menyetujui. PM tetap pemilik publikasi/integrasi.

Execution Profile & Operator Tips: Medium. Verifikasi hash -> replay terfokus -> uji aplikasi/perangkat -> QA -> QC -> PM. Runner memakai Node/TypeScript dan `.expo/senior7-test-tools` yang sudah tersedia. Jangan restart Metro8088/backend/HP sesi lain; tanpa install, mutasi API, server baru, atau perubahan dependency.
