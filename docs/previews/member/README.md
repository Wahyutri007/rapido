# Preview Member

Screenshot memakai komponen produksi, font aplikasi, primitive bersama, dan fixture respons pelanggan. Data contoh bukan akun pelanggan pengguna.

| Layar | Gambar |
| --- | --- |
| Daftar | [list.png](list.png) |
| Detail | [detail.png](detail.png) |
| Tambah | [create.png](create.png) |
| Validasi | [validation.png](validation.png) |
| Form lengkap | [form-complete.png](form-complete.png) |
| Catatan dan tombol simpan | [form-notes.png](form-notes.png) |
| Daftar 320 px | [narrow.png](narrow.png) |
| Daftar pada router aplikasi | [app-route.png](app-route.png) |

[results.json](results.json) mencatat **45 pemeriksaan SDK57 lolos**, runtime exception 0: pencarian, daftar kosong/retry, detail, prefill edit, draft saat refetch, field opsional `null`, validasi, kegagalan/422, simpan berulang, cache, sheet, konfirmasi/kegagalan/hapus berhasil, ID tidak tersedia, CSS produksi, scroll catatan di atas CTA, dan viewport 320 px. Screenshot diambil ulang setelah CSS hasil build dan animasi sheet selesai dimuat.

[api-results.json](api-results.json) mencatat 26 pemeriksaan Laravel terpisah, seluruhnya lolos dan fixture di-rollback. Meliputi CRUD/validasi, isolasi owner, karyawan dengan izin, dan penolakan pengguna tanpa izin.

[routing-results.json](routing-results.json) mencatat **12 pemeriksaan router aplikasi SDK57 lolos**, runtime exception 0. Termasuk navigasi Kelola → Member → detail → edit, kembali ke Kelola, reload daftar/edit, form tambah kosong, dan guard owner/karyawan berdasarkan izin. URL daftar benar `/manage/member` sejak masuk pertama.

Harness lokal yang diabaikan Git: `.expo/member-preview-entry.jsx`, `.expo/member-preview.cjs`, `.expo/member-routing.cjs`, dan `.expo/member-api-check.php`. Preview komponen memakai stack sederhana. Script routing memakai entry aplikasi/Expo Router/auth guard produksi dengan respons API fixture dan adapter HTML yang memuat CSS build; respons SSR tidak diuji.

Pengujian komponen dan Laravel terpisah, bukan login dengan akun pengguna. Fitur Member pada perangkat native dan pencocokan screenshot Figma penuh belum diuji. Rincian code, desain, serta kontrak ada di [MEMBER_UI_PROGRESS.md](../../MEMBER_UI_PROGRESS.md).
