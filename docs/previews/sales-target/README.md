# Preview Target Penjualan

Implementasi UI ditinjau pada 8 Oktober 2026 (Asia/Jakarta). Placeholder “Segera Hadir” diganti dengan alur daftar → detail → tambah/edit.

- [Daftar target](list.png)
- [Pencarian kosong](search-empty.png)
- [Daftar tanpa target](list-empty.png)
- [Detail dan total target tersimpan](detail.png)
- [Form dengan data edit](form-default.png)
- [Target beberapa produk](form-products.png)
- [Target beberapa kategori](form-categories.png)
- [Daftar pada lebar 320 px](list-narrow.png)
- [Form pada lebar 320 px](form-narrow.png)
- [Rincian form pada lebar 320 px](form-fields-narrow.png)
- [Hasil 20 pemeriksaan browser](results.json)
- [Hasil 41 pemeriksaan model/schema](model-results.json)

Entry point: Kelola → Target Penjualan. Tap kartu membuka detail; menu aksi menyediakan detail, edit, dan hapus. Hapus melalui daftar maupun detail memerlukan konfirmasi. Form menyimpan nama, tanggal mulai/akhir, toko, dan target per produk atau kategori. Pilihan banyak item memakai `MultiSelect`; item yang tetap dipilih mempertahankan nilai dan kuantitasnya. Pergantian toko atau tipe mengosongkan rincian lama agar pilihan dari scope sebelumnya tidak ikut tersimpan.

Produk menggunakan kuantitas dan nilai target; kategori menggunakan nilai target. Total nilai adalah penjumlahan nilai setiap baris, bukan harga satuan dikalikan kuantitas. Nilai tersebut merupakan tujuan penjualan, bukan capaian atau data transaksi aktual.

Validasi: nama di-trim, maksimal 100 karakter, unik per toko; periode menggunakan tanggal kalender valid `YYYY-MM-DD`, tahun 1900–2100, dan tanggal akhir tidak boleh lebih awal dari tanggal mulai. Kuantitas berupa integer 1–1.000.000; nilai berupa Rupiah bulat 1–1 triliun. Maksimal 50 baris; produk/kategori harus tersedia pada toko yang dipilih dan tidak boleh berulang dalam target. Tanggal memakai `FormInput` bersama agar dapat diedit di web dan native; picker tanggal bersama saat ini hanya membuka kontrol Android.

Verifikasi: 20 pemeriksaan browser dan 41 pemeriksaan model/schema lolos. Runtime exception dan console error: 0. Termasuk pencarian trim, prefill, periode terbalik, batas nilai/kuantitas, baris ganda, pemilihan banyak produk, nilai yang dipertahankan, tambah/edit dan simpan berulang tanpa duplikasi, isolasi target, perubahan toko/tipe, hapus terkonfirmasi, state kosong, ID tidak valid, serta layout 320 px. TypeScript seluruh proyek dan ESLint/Biome 11 file fitur lolos tanpa diagnostic. Input dua kolom diberi `minWidth: 0` melalui props layout field untuk mencegah lebar intrinsik input web melampaui container; primitive bersama tidak diubah.

Screenshot diambil dari komponen produksi dengan harness web lokal yang memasok parameter route dan stack sederhana. Sebagian gambar menunjukkan perubahan fixture selama pengujian. Autentikasi dan navigator penuh tidak diuji oleh harness; tiga header produksi berada pada `app/(no-layout)/manage/sales-target/_layout.tsx`. Detail merupakan pelengkap alur dengan komponen proyek; metadata Figma yang tersimpan tidak menyediakan frame detail khusus.

Jalankan ulang dari root aplikasi:

```powershell
node .expo/target-model-check.cjs
node node_modules/expo/bin/cli start --port 8092 --offline --max-workers 1
```

Di terminal kedua, jalankan `node .expo/target-preview-check.cjs`. Port dapat diatur melalui `TARGET_PREVIEW_PORT`. Harness/script berada di `.expo/` sebagai artefak lokal yang diabaikan Git; Playwright memakai instalasi sementara verifikasi workspace yang sudah tersedia. Server sementara 8092 dihentikan setelah verifikasi; server sesi lain dipertahankan.

Referensi Figma: [daftar](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-38146), [form produk kosong](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-37807), [satu produk](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-37843), [beberapa produk](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-37892), [kategori kosong](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-37968), dan [kategori terisi](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-38004). OAuth terhubung, tetapi pembacaan design context baru ditolak batas MCP Starter. Implementasi menggunakan metadata tersimpan dan token proyek. Kesamaan visual penuh dengan screenshot Figma serta validasi perangkat Android/iOS belum diverifikasi.

Data merupakan fixture desain pada `constants/data/manage/sales-target.ts` dengan ID `target-demo-*` dan `target-store-*`, bukan ID backend. Zustand mempertahankan target selama aplikasi terbuka. Belum API, persistensi perangkat, penghitungan capaian transaksi, atau pengaruh terhadap laporan penjualan nyata. Model, schema, helper, state, komposisi fitur, serta layar/router dipisahkan sesuai arsitektur proyek.
