# Hasil pengerjaan Member

Kelola → Member menyediakan daftar pelanggan, detail, tambah/edit, dan hapus terkonfirmasi. Data memakai CRUD Laravel `/customers/data` dengan cache TanStack Query `customers`. Owner dan karyawan dengan izin `manage customers` dapat masuk; pengguna tanpa izin diblokir sebelum query pelanggan berjalan.

## Lokasi code

| Bagian | Berkas |
| --- | --- |
| Layout dan route | [app/(no-layout)/manage/member/](../app/(no-layout)/manage/member/) |
| Daftar | [MemberListScreen.tsx](../components/feature/manage/member/MemberListScreen.tsx) |
| Detail | [MemberDetailScreen.tsx](../components/feature/manage/member/MemberDetailScreen.tsx) |
| Tambah/edit | [MemberModifyScreen.tsx](../components/feature/manage/member/MemberModifyScreen.tsx) |
| Konfirmasi hapus | [MemberDeleteDialog.tsx](../components/feature/manage/member/MemberDeleteDialog.tsx) |
| DTO | [types/api/customer.ts](../types/api/customer.ts) |
| Validasi | [schema/add/customer.ts](../schema/add/customer.ts) |
| Query/mutation | [api/hooks/customers.ts](../api/hooks/customers.ts) |
| Form/payload/tanggal | [lib/manage/members.ts](../lib/manage/members.ts) |

Route: `/manage/member`, `/manage/member/detail?id=<id>`, dan `/manage/member/modify` dengan ID opsional untuk edit. Header berada pada nested layout; parent Kelola mendaftarkan folder dengan `headerShown: false`. Pohon navigasi diperbarui pada [README dokumentasi](README.md).

## Perilaku

- Daftar menampilkan jumlah dari API, pencarian nama/telepon/email, refresh, loading/error/retry, keadaan kosong, serta sheet detail/edit/hapus.
- Nama dan telepon wajib. Email, nomor KTP, alamat, tanggal lahir, jenis kelamin, dan catatan opsional; pengosongan field dikirim sebagai `null`.
- Form memvalidasi email, panjang teks, jenis kelamin, dan tanggal kalender `YYYY-MM-DD`. Alamat dibatasi 255 karakter sesuai migration database, meskipun Request backend memperbolehkan 500.
- Prefill edit hanya dilakukan sekali per ID agar refetch tidak menimpa draft. Error umum/422 mempertahankan input. Simpan dikunci selama request dan setelah sukses untuk mencegah penambahan berulang.
- Update/hapus menginvalidasi cache daftar/detail. Hapus memerlukan konfirmasi, menampilkan hasil request, dan kembali dari detail setelah sukses.
- ID detail/edit yang hilang atau gagal dimuat menampilkan pesan; form edit gagal tidak dapat dikirim sebagai tambah.

## Desain dan batas data

Referensi file Figma `gbdKqL2EcYNenWiQXG4SRW`: daftar `1:17554`, form `1:28370`, dan detail `1:28412`. Nama frame daftar/detail tidak sesuai isinya; metadata anak diperiksa untuk menentukan layar. Akses MCP Figma tidak tersedia pada profil sesi ini saat pemeriksaan ulang; implementasi memakai metadata tersimpan dan sistem komponen Rapido. Kecocokan visual penuh dengan screenshot Figma belum diverifikasi.

Respons pelanggan belum menyediakan foto, kota, profesi, status aktif, jumlah kunjungan, poin/loyalitas, atau riwayat transaksi. Bagian tersebut belum ditampilkan. Backend Member tidak diubah pada pekerjaan ini.

## Verifikasi

- API Laravel: **26 pemeriksaan lolos**, termasuk CRUD, validasi, field opsional `null`, isolasi antar owner, karyawan berizin, pengguna tanpa izin, serta ID terhapus/tidak dikenal. Fixture dan token dibuat dalam transaksi yang di-rollback; rollback juga diperiksa.
- Browser komponen pada SDK57: **45 pemeriksaan lolos**, runtime exception 0. Termasuk CSS produksi, CTA, catatan yang dapat discroll di atas tombol simpan, dan viewport 320 px.
- Router aplikasi SDK57: **12 pemeriksaan lolos**, runtime exception 0. Klik dari Kelola menghasilkan `/manage/member`; kembali membuka Kelola. Reload daftar/edit mempertahankan URL/data/ID; owner dan karyawan berizin dapat masuk, sedangkan guard pengguna tanpa izin mencegah query pelanggan.
- TypeScript seluruh proyek pada SDK57: exit 0. Biome format dan ESLint 14 file Member bersih.

Browser menggunakan fixture kontrak API, sedangkan pemeriksaan Laravel dijalankan terpisah. Uji router memuat entry aplikasi, layout, dan guard produksi melalui adapter HTML dengan CSS hasil build; respons SSR tidak diuji. Pengujian bukan login dengan akun pengguna. Fitur Member pada perangkat native belum diuji. Screenshot dan hasil terstruktur berada di [previews/member/](previews/member/).

Verifikasi disinkronkan dengan migrasi SDK57 sesi lain, termasuk dependency TopTabs dan konfigurasi Metro terbaru. Layout Member memakai konfigurasi standar tanpa patch `setParams`, perubahan `NavList`, atau perubahan halaman Kelola. Backend, dependency, dan source Inventory sesi lain tidak diubah pada tugas Member.
