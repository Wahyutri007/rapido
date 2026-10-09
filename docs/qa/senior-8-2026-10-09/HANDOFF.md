# Senior 8 — Katalog, Buku Besar dan Kartu Saldo

Paket form terbaru: [ACCOUNT-FORM-001](account-form/HANDOFF.md), draft stabil per ID/tambah dan penyimpanan satu kali, siap QA/QC. Tiga paket Saldo Awal Akun memiliki hasil terpisah; jangan menyamakan READY_FOR_QA dengan approval.

Lanjutan Saldo Awal Akun: [ACCOUNT-DETAIL-001](account-detail/HANDOFF.md) memperbaiki pemilihan akun; [ACCOUNT-ID-001](account-ids/HANDOFF.md) menghindari benturan ID yang menyebabkan edit/hapus lebih dari satu record. Keduanya READY_FOR_QA dengan bukti tersendiri. Store berubah pada paket ID baru; manifest lama tetap snapshot historis.

Status terbaru 9 Oktober: QC filter **PASS-DELTA**, QC-S8-LEGACY-001/002 **CLOSED** menurut [laporan independen](../qc-ledger-filters-2026-10-09/REPORT.md). Lanjutan terbaru [LEDGER-IDENTITY-001](ledger-identity/HANDOFF.md) menghapus fallback akun pertama dan memiliki hash screen baru untuk QA/QC. LEDGER-ID-001 masih gate terpisah; status dan bukti di bawah merupakan histori batch masing-masing.

Paket lanjutan terbaru: [LEDGER-ID-001 — ID unik entri Buku Besar](ledger-ids/HANDOFF.md), perubahan satu action store dengan regresi layar gabungan. Bukti/approval paket sebelumnya tidak otomatis menyetujui hash dependency store baru.

Pembaruan 9 Oktober 2026: paket historis di bawah sudah lulus **QC-S8-20261009-PASS-DELTA** ([laporan independen](../qc-senior8-2026-10-09/REPORT.md)). Temuan lanjutan QC-S8-LEGACY-001/002 pada Buku Besar ditangani dalam [handoff filter baru](ledger-filters/HANDOFF.md). Hash Buku Besar berubah pada batch baru dan menunggu recheck; empat source lain tetap. Manifest/hasil historis di direktori ini dipertahankan sebagai bukti snapshot sebelumnya.

Tanggal: 9 Oktober 2026, Asia/Jakarta. Status **READY_FOR_QA**, belum persetujuan QA/QC atau integrasi main. Penugasan mengikuti `docs/PM_TASK_BOARD.md`. Perubahan source belum di-commit oleh Senior 8; hash SHA-256 dan HEAD saat serah-terima tersedia di `verification.json` untuk mencocokkan snapshot working tree.

## Batch 1 — detail Katalog

Scope hanya `app/(no-layout)/catalog/{bundling,extra-menu,menu}/detail.tsx`. Delapan dependency array kini mengikuti objek `data` yang dibaca callback, menyelesaikan sembilan diagnostic `react-hooks/preserve-manual-memoization`. Relasi, harga, fallback, request, mutation dan JSX tetap mengikuti source sebelumnya.

- ESLint tiga file: exit 0, 0 error; 7 warning existing (unused variables/import order).
- `node docs/qa/senior-8-2026-10-09/catalog-regression.cjs`: 13 skenario lolos; runtime exception 0. Bukti `catalog-results.json`.
- Skenario: relasi/harga awal, query refetch, pergantian ID, relasi yang tidak ditemukan, embedded extra menus, kedua arah relasi menu-ekstra, outlet/harga/item bundling dan fallback existing.
- Harness mengekstrak deklarasi memo aktual dengan TypeScript AST, menjalankannya dengan React DOM produksi di Edge dan mempertahankan referensi fixture yang nilainya tidak berubah. API diganti fixture; layar/native UI dan navigasi aplikasi penuh tidak dirender.

Sinyal Katalog ditulis pada SESSION_COORDINATION.md sebelum melanjutkan Buku Besar.

## Batch 2 — detail Buku Besar

Scope hanya `app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx`.

- ID akun dibaca sebagai nilai tersendiri agar dependency memo sesuai callback; dua diagnostic React Compiler terselesaikan.
- Layar berlangganan koleksi `ledgerEntries`. Sebelumnya hanya berlangganan fungsi getter yang referensinya tetap, sehingga penambahan entri tidak memicu pembaruan layar.
- Pembacaan total aman saat koleksi akun kosong, sehingga cabang `Akun tidak ditemukan` dapat dirender tanpa dereference `account` yang undefined.
- Fallback akun pertama dan fallback total existing dipertahankan. Tidak mengubah store atau kontrak akuntansi.
- `node docs/qa/senior-8-2026-10-09/ledger-regression.cjs`: 13 skenario lolos; runtime exception 0. Bukti `ledger-results.json`.
- Skenario: akun awal, pergantian/ID tidak ditemukan, update koleksi tanpa perubahan route/akun, pencarian reference, draft pencarian tetap saat store berubah, filter debit/kredit, metadata akun diperbarui, koleksi entri dihapus, akun kosong dan pemulihannya.
- Harness menjalankan prefix hook produksi dengan React `useSyncExternalStore` dan fixture store. Ini memeriksa subscription/render, bukan integration test store Zustand produksi, API atau native UI.

## Batch 3 — AccountBalanceCard

Antrean lanjutan PM diterima setelah dua batch pertama diserahkan. Scope hanya `components/feature/accounting/accounts/AccountBalanceCard.tsx`; pemanggil `report/accounting/accounts/index.tsx` dan action `updateBalance/resetBalance` dibaca, tidak diubah. Dua effect sinkronisasi diganti state yang menyimpan ID/saldo sumber dan draft teks. Rekonsiliasi dijalankan secara bersyarat saat ID/nilai saldo sumber berubah, sebelum React commit input. Echo nilai numerik yang sama mempertahankan teks draft; perubahan eksternal berbeda menyelaraskan field yang berubah; perpindahan akun menginisialisasi ulang kedua field. `Object.is` mencegah loop render pada nilai NaN yang stabil. Kontrak callback dan sanitasi angka existing dipertahankan.

- `node docs/qa/senior-8-2026-10-09/balance-regression.cjs`: 22 skenario lolos, runtime exception 0. Bukti `balance-results.json`.
- Memeriksa prefill, callback ID/debit/kredit, sanitasi, pengosongan input, angka nol, leading zero, refetch metadata, update satu sisi, reset kedua saldo, pergantian akun bernilai sama, draft sebelum/selama acknowledgment tertunda, penggantian saldo eksternal, serta NaN stabil/pemulihannya.
- Harness menjalankan state dan handler produksi pada React DOM dengan fixture props/callback. Primitive input native/keyboard, layar parent serta store Zustand produksi tidak dirender. JSX lama tidak diubah; perapian UI/Form standar tetap perlu tiket terpisah.
- API komponen hanya menerima nilai saldo/ID; perintah reset yang menghasilkan nilai numerik identik tidak dapat dibedakan dari render biasa. Draft teks setara angka nol dapat tetap terlihat sebagai `000`; callback tetap nol. Ini batas kontrak existing yang membutuhkan sinyal reset eksplisit bila harus mengosongkan teks juga.

## Pemeriksaan dan batas

ESLint aktual dan hash source setiap file ada di `verification.json`. Satu proses TypeScript penuh `node node_modules/typescript/bin/tsc --noEmit --pretty false` exit 0; dimulai setelah perubahan Katalog dan sebelum perubahan Buku Besar. Karena proses berjalan bersamaan sesi lain, hasil tersebut bukan sertifikasi snapshot final Buku Besar/integrasi. Pemeriksaan tipe final dua root Buku Besar/AccountBalanceCard beserta dependency closure dicatat terpisah pada `typecheck-focused.json`; dapat diulang melalui `node docs/qa/senior-8-2026-10-09/typecheck-focused.cjs`. Typecheck snapshot akhir lintas tiket tetap mengikuti gate terkoordinasi PM; Senior 8 tidak menggandakan proses penuh setelah batch.

Tidak mengklaim seluruh proyek bebas lint, kecocokan Figma atau kelulusan perangkat native. Tidak menambah suppression/dependency, mengganti branch, commit atau push. Alat Figma langsung belum tersedia di sesi ini; perubahan tidak menyentuh geometri/JSX.

Utang lama yang terlihat dan tetap perlu tiket terpisah: fallback mock Katalog dapat menampilkan data contoh bila backend tidak memberi data; styling layar lama belum seluruhnya sesuai AGENTS_UI. Pilihan periode Buku Besar belum memfilter entri; total nol hasil pencarian/filter masih memakai total akun sebagai fallback. Batch ini mempertahankan kontrak tersebut sesuai backlog memoization, bukan persetujuan kebenaran laporan keuangan atau UI secara keseluruhan.

## Permintaan pemeriksaan QA → QC

QA: cocokkan hash source, jalankan ulang tiga harness, lalu periksa detail Katalog/refetch/pergantian ID, perubahan entri Buku Besar, dan kartu saldo pada aplikasi sebenarnya. Periksa state akun kosong tanpa crash, regresi pencarian/jenis transaksi, input debit/kredit, reset melalui menu akun dan kehilangan draft. QC: cocokkan diff terbatas dengan kontrak/fallback existing, batas pengujian di atas dan gate TypeScript terkoordinasi. Setelah hasil independen tersedia, PM menentukan publikasi/integrasi. Sinyal melalui file workspace tidak membuktikan penerima telah membaca.

Runner memakai Node 22, TypeScript/React/ReactDOM aplikasi serta Edge terpasang. `browser.cjs` membuka profil headless sendiri di TEMP, menutup browser miliknya setelah pemeriksaan, dan meninggalkan profil diagnostik sementara. Tidak membutuhkan server Metro, Playwright atau instalasi dependency.
