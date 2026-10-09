# EXPORT-DATA-001 - Senior 8 - READY_FOR_QA

Ekspor Data sebelumnya hanya menjalankan timer dan menampilkan sukses tanpa output. Menu Kelola `/manage/export` sekarang membuka form ekspor CSV; `/manage/export/modify` tetap menjadi alias form agar tautan lama tidak putus. Header dimiliki layout. Implementasi memakai Wrapper/Card/Text/Form/RHF/Zod dan BottomActionButton bersama, tanpa perubahan shared component, store, API, dependency atau server.

Sumber yang benar-benar tersedia:

- Transaksi: baris `DEFAULT_TRANSACTION_GROUPS` existing, diberi label contoh; tidak memakai total ringkasan sebagai jumlah transaksi. Tidak memiliki identitas toko.
- Stok: produk `INVENTORY_ITEMS` dan bahan terbaru dari `useInventoryMaterialStore`; stok agregat, tanpa filter toko/periode buatan.
- Keuangan: `incomes` dan `expenses` terbaru dari `useAccountingStore`, termasuk jenis legacy dengan kolom sumber terpisah. Ini ekspor pendapatan/pengeluaran sesi, bukan laporan keuangan lengkap.

Setiap CSV menyertakan kolom sumber. Toko keuangan berasal dari nama toko pada record, pilihan semua mencakup record tanpa toko. Parameter legacy `store` diperlakukan sebagai nama tepat; ID/nama tidak dikenal harus dipilih ulang dan tidak fallback diam-diam. Tanggal opsional YYYY-MM-DD, kalender valid, batas inklusif; tanggal sumber Indonesia dinormalisasi dengan helper existing. Tanggal sumber invalid tetap tersedia pada ekspor tanpa periode, tetapi dikecualikan dengan pemberitahuan jumlah ketika periode digunakan. Inventori mengabaikan field periode/toko tersembunyi. Tidak menambah seed baru.

CSV memakai UTF-8 BOM, CRLF, quoting/escape kutip dan netralisasi awalan formula pada nilai teks. Nilai numerik negatif tetap numerik. Hasil kosong tidak dikirim. Submit memakai snapshot store terbaru, mencegah klik ganda selama pending, membedakan batal/gagal, memungkinkan retry, serta tidak memperbarui UI setelah unmount.

Web mengunduh file CSV lewat Blob/anchor; pemberitahuan aplikasi hanya menyatakan permintaan unduh dikirim. Native memakai Share sebagai **teks CSV**, bukan lampiran file. Tidak mengklaim penerima menyimpan data. UI menyatakan keterbatasan sumber dan transport ini.

## Bukti developer

- `node docs/qa/senior-8-2026-10-09/export-data/check.cjs`: **54 PASS / 0 FAIL**, runtime error 0. Helper/schema, actual screen/RHF/Zod/Zustand, filter/date/escaping, live source, double submit, cancel/error/retry, empty/missing store, hidden empty store dan unmount. Primitive UI/router/Share/browser DOM berupa adapter. Hasil `results.json`, contoh hasil `sample.csv`.
- `node docs/qa/senior-8-2026-10-09/export-data/browser-download.cjs`: **3 PASS / 0 FAIL**. Edge aktual memanggil production delivery dan menulis file 694 byte yang cocok byte-for-byte termasuk BOM. Browser memakai profil sendiri, ditutup setelah uji. Hasil `browser-results.json`; file unduhan lokal berada pada path di laporan. Ini uji transport browser, bukan render aplikasi penuh.
- `node docs/qa/senior-8-2026-10-09/export-data/quality.cjs`: ESLint max-warning0, Biome check, diff check exit0. TypeScript tujuh root source plus deklarasi/config/import closure aktual: 0 diagnostic. Bukan pemeriksaan TypeScript global.
- `verification.json`: fingerprint tujuh source, dependency yang dimuat harness dan artefak. `node docs/qa/senior-8-2026-10-09/export-data/manifest.cjs --check` untuk memastikan bukti masih sesuai. README/koordinasi adalah dokumen bersama yang boleh bertambah, tidak dibekukan dalam manifest.

## QA -> QC -> PM

QA: verifikasi manifest dahulu. Buka kedua route dari Kelola/deep link, pilih tiga sumber, uji periode kosong/valid/terbalik, toko hilang, empty result, ubah pendapatan/pengeluaran atau bahan lalu ekspor ulang. Buka CSV di aplikasi spreadsheet untuk cek Unicode, kutip, baris baru dan angka. Periksa tampilan kecil/landscape, keyboard, aksesibilitas dan back navigation pada aplikasi sebenarnya. Pada perangkat native uji share/cancel/failure/retry dan pastikan label teks CSV sesuai hasil.

QC: review kejujuran sumber/scope toko/periode, escaping CSV, snapshot terbaru, schema tersembunyi dan lifecycle submit. Figma callable tidak tersedia; tidak ada klaim parity Figma. Full router/auth/browser UI, native hardware, ukuran ekspor besar, SSR dan backend/persistensi belum disertifikasi. Ukuran sumber sekarang kecil; CSV dibuat dalam memori.

Sinyal melalui dokumen workspace; belum berarti QA/QC membaca atau menyetujui. Publikasi/integrasi tetap gate PM; tanpa stage/commit/push. Modul fungsional untuk sumber pratinjau/sesi yang tersedia, integrasi ekspor arsip server memerlukan kontrak backend terpisah.

Execution Profile & Operator Tips: Medium. Cocokkan hash -> replay checks -> perangkat/aplikasi aktual -> QA -> QC -> PM. Jangan restart Metro8088/backend/HP milik sesi lain. Runner memakai React test tools existing `.expo/senior7-test-tools`, Node/TypeScript/Edge terpasang; tanpa install atau server baru.
