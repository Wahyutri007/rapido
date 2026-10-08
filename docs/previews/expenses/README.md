# Preview Biaya & Pengeluaran

Implementasi UI ditinjau pada 8 Oktober 2026 (Asia/Jakarta). Placeholder Kelola diganti dengan tiga layar: daftar/filter, detail, dan tambah/edit pengeluaran.

- [Daftar dan total](list.png)
- [Daftar dengan filter toko/sumber dana](list-filtered.png)
- [Pencarian kosong](search-empty.png) dan [daftar tanpa pengeluaran](list-empty.png)
- [Detail](detail.png)
- [Form edit](form-edit.png), [validasi](form-validation.png), [form tambah](form-create.png), dan [bagian deskripsi](form-create-description.png)
- Viewport 320 px: [daftar](list-narrow.png), [form](form-narrow.png), dan [detail](detail-narrow.png)

Daftar dikelompokkan per tanggal dan memiliki pencarian, filter sumber dana/toko, reset, total hasil filter, sheet tindakan, serta hapus terkonfirmasi. Form memakai RHF/Zod dan komponen bersama: akun, kode otomatis yang tidak dapat diketik, referensi, sumber dana, toko, tanggal, nominal Rupiah, dan deskripsi. Referensi unik per toko, tanggal kalender 1900–2100, nominal bulat 1–Rp1 triliun, serta panjang teks divalidasi. Pesan referensi ganda dibersihkan ketika toko berubah; pengecekan ulang tetap dilakukan saat simpan.

Tanggal memakai input ISO `YYYY-MM-DD` agar dapat diedit pada web/native melalui FormInput; picker bersama belum membuka kontrol web/iOS. Tanggal berformat Indonesia dari form laporan lama dinormalisasi saat edit. Metadata pembuat/jam tidak diubah saat edit, dan simpan berulang memakai ID pertama. ID hilang atau milik fixture saldo masuk tidak menampilkan form/detail pengeluaran.

State memakai `useAccountingStore` dan tipe/fixture akuntansi yang sudah tersedia. Perubahan dibaca oleh konsumen laporan yang memakai koleksi yang sama; source layar laporan tidak diubah. Daftar Kelola hanya menampilkan `type: expense`, sehingga saldo masuk pada fixture lama tidak ikut total pengeluaran. Tidak ada penghitungan jurnal/saldo akun otomatis. Satu perubahan bersama terbatas pada alokasi ID `addExpense`: suffix ditambahkan jika timestamp telah dipakai, agar penambahan berdekatan tidak menghasilkan ID sama. Koleksi/action akuntansi lain dipertahankan.

Verifikasi: 21 pemeriksaan browser dan 42 pemeriksaan model/schema lolos, runtime exception dan console error 0. Cakupan meliputi pencarian/reset/filter/total, prefill, kode akun, draft saat state lain berubah, tanggal tidak valid, nominal nol, field wajib, referensi ganda, tambah/edit/simpan berulang, metadata, kedua jalur hapus, isolasi saldo masuk, state kosong, ID invalid, dan viewport 320 px. Model juga menguji batas nominal, tahun/kabisat, panjang teks, tanggal legacy, serta ID pada timestamp sama. TypeScript seluruh proyek serta ESLint/Biome 10 file sumber terkait lolos.

Screenshot berasal dari komponen produksi pada harness web dengan parameter route dan stack sederhana. Sebagian gambar menunjukkan fixture yang diubah selama pengujian. Header produksi berada di nested layout; harness tidak menguji navigator/autentikasi penuh. Perangkat Android/iOS untuk fitur ini belum diuji. Penekanan warna semantic `!text-destructive` dipakai secara lokal karena warna foreground bawaan Text menimpa warna nominal pada preview; tidak mengubah primitive/token bersama.

Jalankan ulang dari root aplikasi:

```powershell
node .expo/expenses-model-check.cjs
node node_modules/expo/bin/cli start --port 8093 --offline --max-workers 1
```

Di terminal kedua: `node .expo/expenses-preview-check.cjs`. Harness/script berada di `.expo/` sebagai artefak lokal; Playwright memakai instalasi sementara verifikasi yang sudah tersedia. Server sementara 8093 dihentikan setelah verifikasi dan server sesi lain dipertahankan.

Referensi metadata Figma: [form 1:40481](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-40481), [daftar 1:40511](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-40511), dan [detail 1:40612](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-40612). Nama frame detail menyebut pemasukan, tetapi isinya pengeluaran. OAuth terhubung; pembacaan design context form baru ditolak batas MCP Starter. Implementasi memakai metadata tersimpan dan aturan komponen/tokens proyek. Kesamaan penuh dengan screenshot Figma belum diverifikasi.

Data tetap fixture/state lokal selama aplikasi berjalan, belum API atau persistensi perangkat. Penambahan baru diberi pembuat `Pratinjau lokal`; tidak menggunakan nama pengguna rekaan atau mengklaim transaksi tersimpan pada backend.
