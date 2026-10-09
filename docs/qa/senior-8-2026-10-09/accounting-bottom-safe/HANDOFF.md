# ACCOUNTING-BOTTOM-SAFE-001 - Senior 8

Status **READY_FOR_QA -> QC -> PM**. Pengguna meminta bug tombol tertutup navigasi HP diperbaiki lebih dahulu dan mengonfirmasi banyak terjadi di Akuntansi. Implementasi modul baru ditunda untuk prioritas tersebut.

## Perbaikan

Lima belas footer Akuntansi memakai `absolute bottom-0` dengan padding16 tetap, sehingga tidak menjauh dari area navigasi Android/iOS. Kini footer memakai `BottomActionBar` yang membaca `useSafeAreaInsets`: padding bawah = jarak konten16 + inset bawah, kiri/kanan =16 + inset sisi. Ruang atas tidak ditambah inset status bar. Nilai berubah mengikuti context saat rotasi. Tombol, label, disabled/loading dan handler lama dipertahankan.

Scope19source: komponen baru BottomActionBar,15screen pada migration.json, Wrapper, AnimatedWrapper dan ReportActionButton. Screen meliputi daftar/form Akun; daftar/form/struk Penerimaan; form Pengeluaran; daftar/form/detail Jurnal Umum, Penyesuaian dan Penutup. Tidak ada lagi raw absolute-bottom footer di folder Akuntansi pada audit final. Ini tidak mengklaim seluruh aplikasi bebas masalah safe area.

ReportActionButton memakai gap bawah24+inset dan atas8 sesuai grid4px, menggantikan atas10 lama. Perubahan wadah shared ini juga berlaku pada laporan lain; mode standalone tetap tanpa footer tambahan. BottomActionButton/DetailBottomActions existing tidak diubah karena sudah memperhitungkan inset.

BottomActionInset menambah tinggi sesuai inset pada enam ScrollView manual. Wrapper/AnimatedWrapper menambah inset setelah spacer existing128 untuk hasActionButton dan80 untuk hasBottomBar. Ini menjaga konten paling akhir dapat digulir melewati bar yang bertambah tinggi, termasuk pemanggil laporan yang menggunakan hasBottomBar. Spacer memakai pointerEvents none. Keyboard, scroll/refresh callback, floating button, navigator, API dan operasi finansial tidak diubah.

## Bukti

- `node docs/qa/senior-8-2026-10-09/accounting-bottom-safe/check.cjs`: **65 PASS / 0 FAIL**. AST inverse18source memastikan seluruh body form/handler/children sama setelah delta footer/spacer dibalik. Lima belas footer diperiksa migrasinya. Production Bar/Wrapper/AnimatedWrapper/ReportActionButton diuji dengan React renderer, native/presentation/safe-inset adapters: inset bawah0/16/24/34/48/64, sisi landscape, perubahan inset, callback tombol, report open dan standalone, serta clearance kondisional. Runtime errors0.
- `quality.cjs`: lint final dibandingkan snapshot sebelum perubahan; **7 temuan lama, tidak ada temuan baru**. Ini bukan klaim seluruh19source lint bersih. Biome/diff exit0; Biome masih melaporkan3unused-import warnings legacy pada expenses/modify. TypeScript19root+actual config/declarations/import closure0diagnostic. Tidak menjalankan TS global.
- `initial-quality.json` menyimpan percobaan pembanding lint yang salah menganggap nomor baris dalam message sebagai warning baru. Signature diperbaiki untuk membuang lokasi/codeframe, tetap membandingkan file/rule/severity/reason dan jumlah occurrence. Pemeriksaan terakhir diulang; source tidak diubah untuk menghilangkan warning legacy. Snapshot before membuktikan asalnya.
- `migration.json` menunjuk byte-before18file; migrator hanya untuk audit dan menolak dijalankan ulang jika receipt sudah ada. Perubahan lanjutan spacer hasBottomBar dan report top8 tercatat di diff serta inverse AST.
- `manifest.cjs --check` memverifikasi source/bukti/snapshot. Paket sebelumnya tetap frozen; hash consumer Account/Form/Journal serta kontrak Wrapper yang berubah membutuhkan overlay/recheck oleh QA, bukan penulisan ulang histori.

## Batas dan QA

Perangkat35b9a8aa terdeteksi, read-only wm melaporkan1080x2340/density480. Tidak dilakukan navigasi/reload/tap/simpan ataupun restart Metro/backend/HP milik Codex4. **Belum ada bukti visual native setelah perubahan**. Renderer dengan inset fixture bukan pengujian navigasi sistem fisik atau screenshot aplikasi. Tidak mengklaim parity Figma, keyboard terbuka, accessibility/font-scale besar ataupun seluruh consumer laporan sudah diuji di perangkat.

QA/perawat runtime HP: muat source terbaru lewat runtime yang dikoordinasikan, lalu cek Akuntansi -> Akun (Simpan/Tambah), form Penerimaan/Pengeluaran, Jurnal Umum/Penyesuaian/Penutup (Tambah/Simpan/Edit/Hapus) dan laporan Neraca/Laba Rugi/Perubahan Modal (aksi laporan). Periksa mode3tombol dan gesture, portrait/landscape, scroll sampai field terakhir serta keyboard tampil/tutup. Cukup periksa posisi/hit area; jangan menyimpan/menghapus data nyata untuk tes geometri. Pastikan tombol berada di atas area sistem dan konten akhir tidak tertutup bar.

QC: review additive inset kiri/kanan/bawah, spacer conditional, gap atas report8 vs lama10, mode standalone dan AST preservation. Review shared consumers lain bila terpengaruh. Warning legacy hooks/RHF/unused imports merupakan pekerjaan terpisah, tidak disembunyikan dengan suppression. Sinyal melalui workspace belum berarti diterima/approved; publikasi tetap PM.

Execution Profile & Operator Tips: Medium. Hash -> renderer/AST -> native actual coordinated runtime -> QA -> QC -> PM. Tanpa install/dependency/root navigation/API/backend/mutasi data/globalTS/commit/push. Jangan menjalankan migrator sekali lagi atau meregenerasi manifest historis setelah source consumer berubah.
