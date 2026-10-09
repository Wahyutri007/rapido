# QC paket Senior 8 — 9 Oktober 2026

**Status lanjutan:** [recheck filter Buku Besar](../qc-ledger-filters-2026-10-09/REPORT.md) lulus dengan sinyal **QC-LEDGER-FILTERS-20261009-PASS-DELTA**; QC-S8-LEGACY-001/002 CLOSED pada dua hash final dalam keputusan recheck. Laporan berikut adalah snapshot delta awal, sebelum perbaikan filter; temuan dan hasil historis dipertahankan.

**Kode serah terima: QC-S8-20261009-PASS-DELTA.** Perubahan backlog pada lima berkas lulus QA/QC terfokus dan dapat diajukan kepada Projek Manager untuk review publikasi. Persetujuan ini mencakup delta memoization/subscription/lifecycle yang diperiksa; gate integrasi snapshot akhir, keseluruhan modul keuangan, native dan desain tetap memiliki batas di bawah.

Penerima: Senior 8 dan Projek Manager. Sinyal melalui catatan/dokumen workspace. Tidak mengklaim pengiriman atau penerimaan pesan langsung antarpercakapan. Tidak commit/push atau memindahkan branch/index workspace.

## Scope dan fingerprint

HEAD konteks workspace: `acba0d92460c1af3149abc3775f09888a2943cab`. Kelima berkas berupa perubahan lokal milik Senior 8. Hash awal/akhir identik dengan `docs/qa/senior-8-2026-10-09/verification.json`, dan tidak berubah selama pemeriksaan.

| Berkas | Keputusan delta |
| --- | --- |
| `app/(no-layout)/catalog/bundling/detail.tsx` | PASS: dependency memo mengikuti object yang dibaca callback |
| `app/(no-layout)/catalog/extra-menu/detail.tsx` | PASS: relasi menu diperbarui ketika data berubah |
| `app/(no-layout)/catalog/menu/detail.tsx` | PASS: dependency kategori/brand/unit/tipe/ekstra |
| `app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx` | PASS: berlangganan koleksi entri dan aman saat akun kosong |
| `components/feature/accounting/accounts/AccountBalanceCard.tsx` | PASS: draft/prefill/reset saldo sesuai identitas dan nilai sumber |

Daftar SHA-256 lengkap, hash harness, command, lint dan pemeriksaan JSX tersedia pada [verification.json](verification.json). Pemanggil Accounts dan `store/accountingStore.ts` diperiksa baca saja. Tidak ada route, kontrak API, store produksi, geometri JSX, dependency, token atau primitive yang diubah oleh paket delta ini. AST return JSX kelima berkas sama dengan baseline HEAD.

## Hasil QA/QC yang dijalankan ulang

| Pemeriksaan | Hasil |
| --- | --- |
| Katalog, memo produksi di React DOM/Edge | 13 skenario lulus, runtime error 0 |
| Buku Besar, hook/subscription di React DOM/Edge | 13 skenario lulus, runtime error 0 |
| Kartu saldo, state/handler di React DOM/Edge | 22 skenario lulus, runtime error 0 |
| QC independen, komponen lengkap + Zustand produksi | 24 assertion lulus, runtime error 0 |
| ESLint lima berkas | Exit 0, 0 error, 7 warning Katalog yang sudah dicatat developer |
| `git diff --check` lima berkas | Exit 0 |
| Fingerprint awal/akhir + JSX | Cocok handoff, source stabil, return JSX tidak berubah |

Total **72 pemeriksaan lulus**. Tiga harness developer dibaca lalu dijalankan dari salinan di `.expo/qc-senior8-2026-10-09/`, dengan output QC tersendiri. Bukti asli developer tidak ditimpa. Hasil rerun ada pada [catalog-results.json](catalog-results.json), [ledger-results.json](ledger-results.json), dan [balance-results.json](balance-results.json).

Tambahan [store-check.cjs](store-check.cjs) dibuat QC dan menjalankan **seluruh function komponen produksi**, bukan hanya prefix hook: detail Buku Besar, halaman Accounts dan AccountBalanceCard. Store Zustand produksi dan action `addLedgerEntry`, `updateBalance`, `updateAccount`, `resetBalance` dijalankan pada fixture proses Node yang terisolasi. Pemeriksaan memastikan entri baru merender ulang tanpa perubahan route/parent, pencarian tetap terjaga, akun kosong/pulih, input tersimpan ke store, angka nol di depan tidak hilang saat echo, summary parent diperbarui, dan reset dari menu/konfirmasi parent benar-benar mengosongkan input. Hasil beserta hash dependency yang dimuat ada pada [store-results.json](store-results.json).

Native primitives, child UI/picker/modal/summary diganti host stub pada tes tambahan; callback UI dipanggil langsung. Uji ini menguji jalur handler/state/store produksi tanpa klik browser atau rendering geometri. Tidak menyentuh data atau database aplikasi pengguna.

Perintah dari root aplikasi:

```text
node docs/qa/qc-senior8-2026-10-09/verify.cjs
node docs/qa/qc-senior8-2026-10-09/store-check.cjs
```

`verify.cjs` mencocokkan source dan harness dengan handoff sebelum tes, menyalin harness ke output terpisah, menjalankan ketiga regresi secara berurutan, lalu ESLint dan diff-check. Instalasi dependency tidak dilakukan. Edge headless memakai profil TEMP tersendiri dan ditutup oleh masing-masing harness; server dan HP sesi lain tidak dikendalikan. `store-check.cjs` memakai test renderer yang sudah tersedia di `.expo/senior7-test-tools/`.

## Review kontrak dan batas modul

Katalog: diff hanya delapan dependency array. Callback, resolver relasi, fallback, query/mutation dan JSX dipertahankan. Tujuh warning bukan kelulusan tanpa warning; rinciannya ada pada `eslint.json` (unused/import order yang dicatat developer). Data mock fallback lama bisa menampilkan data contoh jika API kosong/gagal; paket ini tidak menyetujui perilaku tersebut untuk produksi.

Buku Besar: `ledgerEntries[account.id] ?? []` memiliki hasil yang sama dengan getter store lama. Berlangganan koleksi diperlukan karena getter beridentitas tetap; penambahan entri kini terbukti memperbarui render melalui store asli. Optional access pada total memungkinkan cabang akun kosong dirender. Fallback akun pertama dan total tetap mengikuti kontrak lama.

Kartu saldo: callback ID/debit/kredit dan sanitasi tetap kompatibel dengan pemanggil. Rekonsiliasi bersyarat menangani perubahan akun/nilai sumber dan mempertahankan draft pada echo numerik. Tes produksi parent membuktikan reset `12/42 → 0/0` mengosongkan kedua field. Reset bernilai numerik identik tetap tidak menyediakan sinyal khusus untuk menghapus teks `000`; ini batas kontrak props yang dijelaskan developer.

## Masalah lama yang tetap terbuka

Temuan berikut sudah ada sebelum delta dan juga disebut developer. QC mengonfirmasinya pada komponen/store produksi. Catat sebagai tiket terpisah agar persetujuan perbaikan backlog tidak dibaca sebagai persetujuan keseluruhan fitur:

- **QC-S8-LEGACY-001:** `general-ledger/detail.tsx:77` dan `:78` memakai fallback total akun saat hasil filter nol. Pada pencarian tanpa kecocokan, daftar berisi 0 entri tetapi summary menunjukkan debit 100/kredit 20 dari fixture akun. Kebenaran summary terfilter belum disetujui.
- **QC-S8-LEGACY-002:** `general-ledger/detail.tsx:42` dan `:51` menyimpan pilihan periode tetapi tidak menerapkannya pada filter. Source memakai search/type saja; pilihan periode belum memberikan laporan sesuai periode.
- UI lama masih mengandung raw color, fractional spacing, style override, raw TextInput dan font override. Return JSX tidak diubah paket ini; kepatuhan UI seluruh layar memerlukan pekerjaan tersendiri.
- Fallback ID tidak ditemukan memakai akun pertama masih dipertahankan; ini bukan bukti isolasi akun/otorisasi laporan.

## Gate sebelum publikasi/integrasi

**QA delta: PASS. QC delta: PASS.** PM dapat memproses lima hash yang tertera pada [DECISION.json](DECISION.json) sebagai paket perbaikan backlog terverifikasi. Jika source berubah, cek diff/hash dan ulangi pemeriksaan yang relevan. Persetujuan ini tidak mencakup berkas aktif Member, Printer/POS, shared picker, Barcode, onboarding atau patch milik sesi lain.

TypeScript penuh tidak dijalankan ulang oleh QC untuk mengikuti satu gate terkoordinasi. Senior 8 mencatat focused typecheck akhir untuk Buku Besar/kartu saldo dan full typecheck snapshot sebelumnya; keduanya bukti developer, bukan tes QC baru. PM tetap perlu gate tipe/lint snapshot integrasi akhir sesuai aturan proyek. Tidak memberi izin merge/push `main` otomatis dari laporan ini.

Browser/native aplikasi penuh, request backend, Figma dan geometri UI belum diperiksa pada batch QC ini. Tool Figma langsung tidak tersedia pada sesi ini. **PASS-DELTA memberi persetujuan perubahan backlog yang diuji; kesiapan seluruh modul Katalog/laporan keuangan dan produksi belum disetujui.**
