# Preview Manajemen Tempat

Implementasi UI ditinjau pada 8 Oktober 2026 (Asia/Jakarta).

- [Daftar outlet dan statistik](outlets.png)
- [Pencarian kosong](search-empty.png)
- [Detail outlet dan daftar area](store-areas.png)
- [Daftar tempat](area-places.png)
- [Form beberapa tempat](place-form.png)
- [Draft denah setelah geser](layout-draft.png)
- [Denah pada lebar 320 px](layout-narrow.png)
- [Daftar outlet pada lebar 320 px](outlets-narrow.png)
- [Form pada lebar 320 px](form-narrow.png)
- [Hasil pemeriksaan browser](results.json)
- [Hasil pemeriksaan model dan schema](model-results.json)

Alur: Kelola → Manajemen Tempat → outlet → area → daftar tempat / Layout Daerah. Form area mendukung beberapa nama baru, edit nama, dan validasi nama ganda per outlet. Form tempat mendukung beberapa tempat baru, jenis, kapasitas, status aktif, serta edit. Hapus area dan tempat memerlukan konfirmasi. Denah menggunakan tiga kolom; drag & drop menukar posisi dengan tempat tujuan. Pemilih tempat dan panah menyediakan cara alternatif untuk memindahkan posisi. Draft denah diterapkan hanya setelah Simpan Layout.

Screenshot berasal dari komponen produksi melalui harness web lokal yang memasok parameter route dan stack sederhana. Sebagian screenshot menunjukkan perubahan fixture selama pengujian. Autentikasi dan navigator penuh tidak diuji oleh harness; header produksi tetap berada di `app/(no-layout)/manage/place/_layout.tsx`.

Verifikasi: 24 pemeriksaan browser dan 25 pemeriksaan model/schema lolos; runtime exception dan console error 0. Cakupan meliputi pencarian trim, statistik dari data, validasi field wajib/nama ganda/kapasitas, simpan berulang tanpa duplikasi, edit, pembatalan dan konfirmasi hapus, isolasi outlet/area, draft dan pemulihan denah, drag, panah, jenis tempat, route area milik outlet lain, serta viewport 320 px. Pemeriksaan model juga memastikan posisi tetap unik setelah hapus lalu tambah. Hasil lengkap ada pada dua JSON di atas. TypeScript seluruh proyek, ESLint, dan Biome untuk 15 file fitur lolos tanpa diagnostic.

Jalankan ulang dari root aplikasi:

```powershell
node .expo/place-model-check.cjs
node node_modules/expo/bin/cli start --port 8091 --offline --max-workers 1
```

Di terminal kedua, jalankan `node .expo/place-preview-check.cjs`. Port dapat diatur melalui `PLACE_PREVIEW_PORT`. Harness/script merupakan artefak lokal di `.expo/` yang diabaikan Git; Playwright memakai instalasi sementara verifikasi workspace yang sudah tersedia. Server sementara 8091 dihentikan setelah verifikasi; server preview sesi lain pada 8085 dipertahankan.

Referensi Figma: [hub outlet](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-18470), [detail outlet](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-18574), [daftar tempat](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-18846), [form tempat](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-28867), [denah](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-28915), [form area](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-29235). OAuth diperiksa ulang dan terhubung, tetapi pembacaan baru ditolak batas MCP Starter. Implementasi memakai metadata tersimpan serta token proyek. Kesamaan visual penuh terhadap screenshot Figma dan validasi perangkat Android/iOS belum diverifikasi.

Data outlet/area/tempat adalah fixture desain dengan ID `place-demo-*`; perubahan disimpan pada Zustand selama aplikasi terbuka. Belum memakai API, persistensi perangkat, data tempat backend, atau denah transaksi nyata. Statistik dihitung dari fixture (5 outlet dan 74 tempat), sehingga konsisten dengan daftar; angka contoh hub Figma tidak dipakai karena tidak konsisten dengan daftar contoh outletnya. Tempat efektif aktif hanya ketika outlet dan tempatnya aktif.
