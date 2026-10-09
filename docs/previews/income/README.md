# Preview Pendapatan & Penerimaan

Alur desain Kelola: daftar/filter → detail → tambah/edit penerimaan manual. Penerimaan penjualan ditampilkan sebagai informasi. Komponen mengikuti aturan Card, Form, Wrapper, CatalogItemCard, DetailRow, ItemActionSheet, dan modal bersama; header berada di nested layout.

Ditinjau pada 8 Oktober 2026 (Asia/Jakarta), memakai dependency SDK57 yang sedang dimigrasikan sesi lain.

- [Daftar dan total](list.png), [filter penjualan](list-invoice-filter.png), dan [filter gabungan](list-filtered.png)
- [Detail manual](detail.png) dan [detail penjualan](detail-invoice.png)
- [Form edit](form-edit.png), [validasi](form-validation.png), [form tambah](form-create.png), dan [bagian deskripsi](form-create-description.png)
- [Pencarian kosong](search-empty.png), [manual kosong](list-manual-empty.png), dan [koleksi kosong](list-empty.png)
- Viewport 320 px: [daftar](list-narrow.png), [form](form-narrow.png), dan [detail](detail-narrow.png)

Daftar memiliki pencarian referensi/akun/deskripsi/toko/sumber dana/pembuat, filter sumber dana/toko/jenis, pengelompokan tanggal, reset, dan total hasil filter. Form manual memakai kode otomatis mengikuti akun, tanggal kalender ISO 1900–2100, nominal Rupiah bulat 1–Rp1 triliun, referensi unik per toko, serta teks yang dibatasi panjangnya. Referensi invoice juga tidak dapat dipakai untuk manual dalam toko yang sama.

Simpan berulang memakai ID pertama; edit mempertahankan pembuat/jam dan draft saat state lain berubah. Hapus manual memerlukan konfirmasi. Invoice tidak mendapat tombol edit/hapus; route edit dan helper mutation menolak ID invoice. Detail invoice membaca nominal/jumlah item dari record penerimaan. Receipt pada fixture lama mempunyai nomor/tanggal/total berbeda dan tidak ditampilkan sebagai struk penerimaan tersebut.

Komposisi `CashEntryForm`, factory schema `cash-entry`, dan utilitas `lib/accounting/date` dipakai bersama dengan Pengeluaran. Wrapper/alias lama Pengeluaran dipertahankan. State memakai koleksi incomes yang sudah tersedia pada accountingStore; perubahan alokasi ID addIncome memberi suffix saat timestamp sama. Tidak ada fixture baru atau penggantian mode/API global. Field opsional tidak diberi data rekaan. State ini belum memakai API/persistensi/jurnal/saldo akun otomatis; penambahan diberi pembuat Pratinjau lokal.

Verifikasi: [25 pemeriksaan browser](results.json) dan [43 pemeriksaan model/schema](model-results.json) Penerimaan lolos. Regresi Pengeluaran setelah ekstraksi form/schema/tanggal juga lolos 21 pemeriksaan browser dan 42 pemeriksaan model. Kedua preview tidak menghasilkan runtime exception atau console error. ESLint/Biome 15 file sumber terkait lolos.

Browser memeriksa filter/reset/total, prefill/kode akun, draft saat state lain berubah, validasi tanggal/nominal/field wajib, referensi ganda termasuk invoice, tambah/edit/simpan berulang, metadata, dua jalur hapus, invoice yang tidak boleh dimutasi, ID tidak valid, koleksi kosong, serta viewport 320 px. Model juga memeriksa batas nominal/teks, kalender kabisat/tahun, normalisasi tanggal Indonesia, ID pada timestamp sama, dan isolasi koleksi akuntansi lain.

TypeScript seluruh proyek masih menemukan diagnostic kompatibilitas SDK57 pada file di luar modul ini; pemeriksaan terakhir tersisa pada form katalog menu/bundling, tanpa diagnostic Income atau form/schema/tanggal bersama. Migrasi tersebut dimiliki sesi Codex-5. Preview juga menemukan posisi tombol kembali Header bergeser karena className AnimatedPressable/BouncyPressable tidak diterapkan pada web setelah upgrade Reanimated. Masalah bersama ini dicatat di SESSION_COORDINATION.md untuk sesi migrasi; source primitive tidak diubah oleh Income. Tes kembali memilih elemen tombol yang terlihat dan tidak bergantung pada koordinat lama, sehingga hasil alur tidak mengklaim geometri Header sudah pulih.

Harness web lokal memakai komponen produksi, parameter route, dan stack sederhana. Navigator/auth penuh serta fitur ini pada perangkat native belum diverifikasi. Screenshot memakai data fixture yang sebagian berubah selama pengujian; indikator dev Expo dapat terlihat pada bundle development. Edge tes memakai flag LocalNetworkAccessChecks untuk websocket localhost. Flag tersebut hanya milik proses tes dan tidak mengubah aplikasi. Skrip berada di .expo sebagai artefak lokal:

```powershell
node .expo/income-model-check.cjs
node node_modules/expo/bin/cli start --port 8094 --offline --max-workers 1
```

Di terminal kedua: `node .expo/income-preview-check.cjs`. Regresi Pengeluaran dapat memakai server yang sama: `$env:EXPENSES_PREVIEW_PORT='8094'; node .expo/expenses-preview-check.cjs`. Server sementara 8094 dihentikan setelah verifikasi dan port diperiksa tidak listening. Server sesi lain tidak dihentikan atau diubah.

Referensi metadata Figma: [form 1:40660](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-40660), [daftar 1:40690](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-40690), dan [detail 1:40775](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-40775). OAuth terhubung tetapi pembacaan design context baru ditolak kuota MCP Starter. Implementasi memakai metadata tersimpan dan token proyek; kesamaan penuh dengan screenshot Figma belum diverifikasi.

### 9 Oktober2026 — koreksi QC lifecycle Penerimaan (SD4-004)

Tiga temuan QC-INCOME-001/002/003 ditindaklanjuti pada detail Penerimaan dan shared CashEntryForm: instance/validasi stale tidak menulis store, konfirmasi hapus keyed/aktif menolak callback lama, pending lock/savedId ref menahan double submit tanpa error duplikat palsu. Source persis kandidat QC, kini diterapkan ke aplikasi. Baseline24PASS/12FAIL → final36PASS Penerimaan +6PASS regresi expense-kind; runtime0. Scopedlint/format/diff/TS1219source0diag. [Handoff baru](../../qa/codex-4-2026-10-09/income-qc-fixes/HANDOFF.md) READY_FOR_QC_RECHECK, temuan menunggu keputusan independen. Browser/model/histori di atas tidak dijalankan ulang atau reseal; batas frontend lokal/native/Figma tetap. Fokus sesi kembali Back Office sesuai instruksi pengguna.
