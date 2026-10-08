# Role / Hak Akses

Dikerjakan Codex-3 pada 8 Oktober 2026. Modul ini melanjutkan Bantuan. Pembagian scope dan perubahan komponen bersama tercatat di [SESSION_COORDINATION.md](SESSION_COORDINATION.md).

## Layar dan screenshot

| Layar | Route | Referensi Figma | Screenshot |
| --- | --- | --- | --- |
| Daftar Role | `/manage/roles` | `1:17762` | [Daftar](previews/roles/list.png) |
| Detail Role | `/manage/roles/detail?id=<id>` | `1:17831` | [Detail dan akun](previews/workers/role-accounts.png) |
| Tambah / Edit Role | `/manage/roles/modify?id=<id>`; tanpa ID untuk tambah | `1:18380` | [Form](previews/roles/create.png) |
| Pemilihan permission | Form Role | `1:18380` | [Hak akses](previews/roles/permissions.png) |
| Validasi | Form Role | — | [Field wajib](previews/roles/validation.png) |
| Viewport 320 px | Daftar Role | — | [Lebar sempit](previews/roles/narrow.png) |

Screenshot dirender dari komponen aplikasi dengan fixture API khusus browser. Nama dan jumlah role pada screenshot adalah data pengujian. Fixture tidak menjadi sumber data pada aplikasi.

File Figma `gbdKqL2EcYNenWiQXG4SRW`, halaman `0:1`. Akses MCP diperiksa kembali; OAuth terhubung, tetapi batas panggilan Starter tercapai. Implementasi memakai metadata hierarki/ukuran tersimpan dan aturan `AGENTS_UI.md`. Screenshot/style Figma baru belum dapat dibandingkan; kesesuaian penuh dan perangkat Android/iOS belum diverifikasi.

## Implementasi dan lokasi code

- Rute menggunakan folder lama [app/(no-layout)/(back-office)/manage/roles/](../app/(no-layout)/(back-office)/manage/roles/index.tsx). Placeholder lama diganti; detail ditambahkan. Tidak ada folder Role kedua yang bersaing untuk `/manage/roles`. Header dan guard owner berada di `_layout.tsx`; parent lama sudah mendaftarkan folder tanpa header tambahan.
- Komposisi layar ada di [components/feature/manage/roles/](../components/feature/manage/roles/RoleListScreen.tsx): daftar, detail, form, editor permission, dialog hapus, dan retry query.
- Kontrak data di [types/api/role.ts](../types/api/role.ts), validasi di [schema/add/role.ts](../schema/add/role.ts), hook factory di [api/hooks/roles.ts](../api/hooks/roles.ts), dan pemetaan permission di [lib/manage/roles.ts](../lib/manage/roles.ts).
- Daftar mendukung pencarian nama/label akses, refresh, empty state, dan sheet detail/edit/hapus. Detail menampilkan permission serta pencarian di dalamnya.
- Form memakai React Hook Form dan Zod. Nama wajib, trim, maksimal 255 karakter; minimal satu permission. Error 422 dipetakan ke field, termasuk `permissions.0`; input tetap tersedia setelah gagal simpan.
- Akses Kasir, Order, Kitchen, Absensi, dan fitur Back Office memakai nama permission backend. Back Office awalnya mengaktifkan Dashboard. Semua Fitur dan semua permission kategori dapat dipilih; menonaktifkan anak menghapus grant kategori/global yang mencakupnya sambil menjaga izin lainnya. Grant agregat yang sudah tersimpan tampil sebagai pilihan aktif.
- Edit mempertahankan permission lama yang tidak ada di daftar referensi, kecuali pengguna menonaktifkannya. Refetch tidak menimpa draft edit. Penghapusan memerlukan konfirmasi; pembatalan tidak mengirim DELETE. Sukses hanya muncul setelah API berhasil, lalu cache daftar/detail diperbarui.
- Tambahan bersama: Gluestack [Switch](../components/ui/switch/index.tsx), `density="compact"` pada `CatalogItemCard`, dan perbaikan pembagian lebar `DetailBottomActions` agar tombol `xl` tetap setinggi 48 px. Tidak ada perubahan dependency pada pengerjaan Role.

## API dan perbaikan backend

CRUD menggunakan endpoint owner `GET/POST /contents/roles` dan `GET/PUT/DELETE /contents/roles/{id}`. Pilihan kategori menggunakan `GET /reference-data/permissions`; endpoint `/permissions` dibatasi untuk lingkungan lokal sehingga tidak dipakai oleh form.

Dua bug backend ditemukan lewat request nyata dan diperbaiki pada workspace `rapido-backend-dev/rapido-backend-dev`:

- `app/Domain/Auth/Requests/RoleRequest.php`: pengecualian ID pada pemeriksaan nama unik membaca parameter route. Sebelumnya atribut role baru terisi setelah validasi, sehingga edit permission dengan nama yang sama gagal 422. Nama milik role lain tetap ditolak dan role tetap dibatasi pada pemiliknya.
- `app/Enums/PermissionEnum.php`: label `manage order types` ditambahkan. Sebelumnya enum match tidak lengkap dan endpoint referensi permission gagal 500.

Daftar/jumlah akun kini dibaca melalui query `/contents/workers`, lalu disaring berdasarkan ID Role pekerja. Detail menampilkan loading/retry/keadaan kosong, jumlah sebenarnya, dan kartu menuju detail Karyawan. [Screenshot akun Role](previews/workers/role-accounts.png) dan pengujian integrasinya tercatat di [WORKERS_UI_PROGRESS.md](WORKERS_UI_PROGRESS.md). Respons Role sendiri tetap berisi data Role dan permission.

## Verifikasi

- Biome dan ESLint pada 17 file fitur/komponen bersama: lolos tanpa warning/error.
- TypeScript seluruh proyek: `tsc --noEmit --pretty false`, exit 0.
- [25 pemeriksaan browser](previews/roles/results.json): daftar, sheet, pencarian, detail, form kosong, perubahan permission agregat, payload create/edit, cache, permission lama, error 422, batal/gagal/berhasil hapus, retry query, viewport 320 px, dan tinggi tombol detail 48 px. Runtime exception 0.
- [7 pemeriksaan router aplikasi utama](previews/roles/routing-results.json): HTTP 200 untuk owner/non-owner, placeholder terganti, detail dan edit melalui Expo Router nyata, guard non-owner mencegah query Role. API menggunakan fixture browser; runtime exception 0.
- [18 pemeriksaan API Laravel nyata](previews/roles/api-results.json): akses anonim, referensi permission, CRUD, edit tanpa mengganti nama, persistensi permission, validasi duplikat/permission, dan larangan baca/edit/hapus role pemilik lain. Semua fixture dan token sementara berada dalam transaksi yang di-rollback; tidak mengubah akun pengguna.

25 pemeriksaan browser dan tujuh pemeriksaan router Role dijalankan ulang setelah integrasi Karyawan dan kembali lolos. Preview Role memakai daftar akun kosong; contoh dengan akun, pengujian jumlah/filter akun, sinkronisasi label setelah Role berubah, serta navigasi Role → Karyawan dan muat ulang detail tersedia di hasil Karyawan.

Harness lokal yang diabaikan Git tersedia di `.expo/roles-preview-entry.jsx`, `.expo/roles-preview.cjs`, `.expo/roles-routing.cjs`, dan `.expo/roles-api-check.php`. Preview memanfaatkan Metro sesi Codex-5 pada port 8085; proses tersebut tidak dihentikan. Pemeriksaan browser dan backend dilakukan terpisah, bukan klaim uji end-to-end memakai kredensial pengguna.
