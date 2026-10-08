# Karyawan

Dikerjakan Codex-3 pada 8 Oktober 2026. Scope mengikuti [SESSION_COORDINATION.md](SESSION_COORDINATION.md); Target Penjualan, auth, Inventory, Struk, dan Manajemen Tempat mengikuti sesi pemiliknya.

## Layar dan screenshot

| Layar | Route | Referensi Figma | Screenshot |
| --- | --- | --- | --- |
| Daftar Karyawan | `/manage/workers` | `1:17473` | [Daftar](previews/workers/list.png) |
| Detail Karyawan | `/manage/workers/detail?id=<id>` | `1:17623` | [Detail](previews/workers/detail.png) |
| Tambah / Edit | `/manage/workers/modify`; `?id=<id>` untuk edit | `1:17410` | [Form](previews/workers/create.png) |
| Unggah foto / KTP | Form Karyawan | `1:17410` | [Lampiran](previews/workers/uploads.png) |
| Akun pengguna Role | Detail Role | `1:17831` | [Akun Role](previews/workers/role-accounts.png) |
| Viewport 320 px | Daftar Karyawan | — | [Lebar sempit](previews/workers/narrow.png) |

Screenshot memakai komponen produksi dan fixture API khusus pengujian browser, bukan akun pengguna. Foto/KTP pada pengujian adalah PNG kecil buatan pengujian. Data aplikasi berasal dari API; fixture tidak dimasukkan ke source fitur.

Akses Figma file `gbdKqL2EcYNenWiQXG4SRW` diperiksa kembali: OAuth terhubung, pembacaan MCP tertahan batas Starter. Referensi berasal dari metadata ukuran/hierarki tersimpan serta `AGENTS_UI.md`. Screenshot/style Figma terbaru dan kesamaan visual penuh belum diverifikasi.

## Code dan perilaku

- Route tipis berada di [app/(no-layout)/manage/workers/](../app/(no-layout)/manage/workers/index.tsx). Header dan guard owner berada pada `_layout.tsx`; parent mendaftarkan `workers` tanpa header kedua. Anchor daftar menjaga URL/ID dan riwayat saat detail dibuka dari Role.
- Komposisi berada di [components/feature/manage/workers/](../components/feature/manage/workers/WorkerListScreen.tsx): daftar, detail, form, avatar, dialog hapus, dan retry query.
- DTO: [types/api/worker.ts](../types/api/worker.ts); schema: [schema/add/worker.ts](../schema/add/worker.ts); factory hooks: [api/hooks/workers.ts](../api/hooks/workers.ts); pemetaan form dan multipart: [lib/manage/workers.ts](../lib/manage/workers.ts).
- Pencarian mencakup nama, email, telepon, Role, dan toko. Jumlah berasal dari daftar API. Sheet menyediakan detail/edit/hapus; daftar mempunyai refresh dan keadaan kosong/gagal.
- Detail menampilkan informasi pribadi, Role, tanggal bergabung, toko yang ditugaskan, foto, dan scan KTP jika tersedia.
- Form memakai React Hook Form dan Zod. Nama/email/telepon di-trim; Role dan toko wajib. Tanggal opsional memakai format `YYYY-MM-DD` dan pemeriksaan tanggal nyata. Password minimal delapan karakter beserta konfirmasi hanya pada tambah; edit mempertahankan password.
- Foto/KTP menerima PNG/JPG/WebP berukuran diketahui, lebih dari nol, maksimal 2 MB. Gambar lama bisa diganti; tombol hapus gambar lama tidak ditampilkan karena endpoint tidak memiliki kontrak penghapusan media. Props `removable` pada shared `ImageUploader` opsional dan default-nya tetap `true`.
- Draft edit bertahan saat refetch. Error 422 tampil pada field tanpa membuang input; sukses ditampilkan setelah API berhasil. Hapus memakai konfirmasi dan memperbarui cache setelah berhasil. Role/toko kosong memblokir simpan serta menyediakan tautan membuat prasyarat.
- [RoleWorkers](../components/feature/manage/roles/RoleWorkers.tsx) memakai query Karyawan yang sama, menyaring semua ID Role pekerja, menampilkan jumlah sebenarnya, dan membuka detail Karyawan. Edit/hapus Role pada [api/hooks/roles.ts](../api/hooks/roles.ts) memperbarui cache Karyawan agar label dan penugasan Role tidak tertinggal. Tidak perlu menambahkan endpoint atau akun contoh pada respons Role.

## API dan backend

CRUD owner: `GET/POST /contents/workers`, `GET/PUT/DELETE /contents/workers/{id}`. Pilihan Role memakai `/contents/roles`, toko `/stores`. Upload edit dikirim sebagai multipart POST dengan `_method=PUT` agar Laravel membaca berkas. Gambar URL yang sudah tersimpan serta password tidak dikirim saat edit.

Tiga berkas backend lokal `rapido-backend-dev/rapido-backend-dev` diperbaiki:

- `app/Domain/User/Policies/UserPolicy.php`: policy owner dan kepemilikan pekerja menggantikan trait konten yang tidak dimiliki User; sebelumnya edit/hapus gagal 500.
- `app/Domain/Store/Controllers/StoreWorkerController.php`: eager load Role, transaksi simpan, `syncRoles` mengganti Role lama, field User dibatasi, dan profil lama yang belum tersedia dibuat saat edit. Media yang tidak dikirim dipertahankan.
- `app/Domain/Store/Resources/WorkerResource.php`: respons menyertakan `role_id` dan ringkasan `roles` untuk daftar/prefill; atribut internal relasi dibuang.

Kontrak satu Role dan satu toko mengikuti API. Status aktif/nonaktif, banyak outlet, rekening bank, riwayat login/IP, reset password, serta penghapusan gambar tersimpan belum didukung endpoint ini dan tidak disimulasikan oleh UI. Pekerja lama yang memiliki beberapa Role diberi keterangan bahwa penyimpanan menggunakan satu Role terpilih.

## Verifikasi

- Biome dan ESLint: 18 berkas fitur/komponen terkait lolos tanpa diagnostic. TypeScript seluruh proyek `tsc --noEmit --pretty false` exit 0. Syntax PHP tiga berkas backend lolos.
- [35 pemeriksaan browser](previews/workers/results.json): pencarian, detail/sheet, form wajib, fokus saat mengetik, tanggal/password, pemilihan Role/toko, file chooser dan multipart upload, create/edit/cache, draft saat refetch, error 422, batal/gagal/berhasil hapus, akun Role, pembaruan label/penugasan saat Role diedit/dihapus, schema gambar, retry, prasyarat Role/toko, dan viewport 320 px. Runtime exception 0.
- [10 pemeriksaan router aplikasi utama](previews/workers/routing-results.json): owner/non-owner, detail/edit melalui Expo Router, tautan akun Role dengan ID, muat ulang detail, serta guard yang mencegah query Karyawan untuk non-owner. API memakai fixture browser; runtime exception 0.
- [29 pemeriksaan API Laravel](previews/workers/api-results.json): CRUD, multipart POST override, simpan/ganti/hapus media, password hashed dan tetap saat edit, pergantian Role/toko, kontak duplikat, isolasi antar pemilik, larangan akses pekerja, pencabutan token setelah hapus, serta edit pekerja tanpa profil lama. Fixture/token berada dalam transaksi yang di-rollback. Berkas gambar menggunakan direktori sementara terisolasi yang dibersihkan; akun pengguna tidak diubah.

Harness lokal diabaikan Git: `.expo/workers-preview-entry.jsx`, `.expo/workers-preview.cjs`, `.expo/workers-routing.cjs`, `.expo/workers-api-check.php`. Browser memakai Metro sesi lain pada 8085; server backend/Expo sesi lain dipertahankan. Pengujian browser dan API dilakukan terpisah, belum end-to-end memakai kredensial pengguna. Perangkat Android/iOS fisik belum diuji.
