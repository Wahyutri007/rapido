# Bantuan: FAQ, Pengajuan Fitur, Feedback

Dikerjakan Codex-3 pada 8 Oktober 2026. Pembagian scope dan perubahan komponen bersama dicatat di [SESSION_COORDINATION.md](SESSION_COORDINATION.md). Inventory milik Codex-2; halaman Kelola milik Codex-5. Perubahan mereka dipertahankan.

## Layar dan acuan

| Layar | Route | Frame Figma | Preview | Referensi |
| --- | --- | --- | --- | --- |
| FAQ | `/manage/faq` | `1:19624` | [Render](previews/support/faq.png) | [Figma](previews/support/faq-figma.png) |
| Pengajuan Fitur | `/manage/feature-request` | `1:19565` | [Render](previews/support/feature-request.png) | [Figma](previews/support/feature-request-figma.png) |
| Feedback | `/manage/feedback` | `1:19672` | [Render](previews/support/feedback.png) | [Figma](previews/support/feedback-figma.png) |

File Figma: `gbdKqL2EcYNenWiQXG4SRW`, halaman `0:1`. Screenshot dan design context ketiga frame sudah dibaca melalui MCP; dua ilustrasi asli disimpan lokal. Ejaan placeholder dan pertanyaan dirapikan. Ukuran, warna, font, dan spacing mengikuti primitive serta token `AGENTS_UI.md`; ikon FAQ memakai registry aplikasi sehingga bentuk/tint tertentu belum identik dengan Figma.

## Implementasi

- FAQ mendukung pencarian, filter kategori, jawaban yang dapat dibuka/tutup, dan keadaan tanpa hasil. Jawaban berupa panduan lokal, bukan respons server.
- Pengajuan Fitur dan Feedback berbagi `SupportFormScreen`, `SupportHero`, dan `SupportAttachmentInput`; route tetap tipis, header berada di layout.
- Form menggunakan React Hook Form dan Zod. Judul/deskripsi wajib, whitespace dibersihkan, panjang dibatasi. Lampiran satu berkas JPG/PNG/PDF maksimal 5 MB; berkas kosong atau tanpa ukuran ditolak, pembatalan picker menjaga pilihan sebelumnya.
- Shared `Card` memperoleh density compact, `Textarea` memperoleh variant outline dan preset tinggi. Default pemakai lama tetap tersedia. Factory SVG meneruskan className untuk warna token pada web.
- Registrasi layout dan navigation tree di `docs/README.md` sudah diperbarui.
- Dependency `query-string` dan sebelas paket `@react-aria/*` yang diimpor Gluestack dinyatakan langsung agar bundle tidak bergantung pada hoisting dari subtree paket lain. Versi React Aria mengikuti lockfile yang tersedia; dialog `3.5.30` cocok dengan versi utils/overlays/interactions tersebut. `package-lock.json` diperbarui melalui npm setelah instalasi lain selesai; `bun.lock` tidak ditulis ulang.

## Verifikasi

- ESLint pada seluruh file Bantuan dan shared component yang diubah: lolos, termasuk pemeriksaan ulang sesudah instalasi dependency terbaru.
- Biome pada file Bantuan: lolos. Factory ikon masih memiliki warning `any` yang sudah ada sebelum perubahan ini.
- TypeScript terfokus: 19 file root, dependency closure serta deklarasi global; 0 error. TypeScript seluruh proyek juga lolos pada pemeriksaan akhir setelah perbaikan source proyek dari sesi lain.
- Validasi schema: 13 pemeriksaan lolos untuk field wajib, trim, enum, tipe berkas, batas ukuran, dan berkas kosong/tidak diketahui ukurannya.
- Interaksi browser: [13 pemeriksaan lolos](previews/support/interactions.json), termasuk pemeriksaan ulang setelah pemulihan dependency, mencakup FAQ, validasi form, jenis Feedback, penyimpanan isi form setelah modal ditutup, dan tidak ada runtime exception.
- Bundle dan preview ketiga layar berhasil setelah pemulihan dependency. Screenshot final pada lebar 390 px sudah diperbarui dan diperiksa secara visual terhadap referensi Figma.

## Pekerjaan integrasi yang masih diperlukan

Backend lokal yang disiapkan sesi lain sudah berjalan di `http://127.0.0.1:8000/api`. Source backend memiliki POST `/feature-requests`, tetapi hanya menerima dan menyimpan `email`, `phone`, `description`. Form Figma memerlukan judul dan lampiran; Feedback juga memerlukan jenis serta halaman terkait. Tidak ditemukan endpoint untuk Feedback atau unggah lampiran Bantuan. Kontrak pengiriman lengkap perlu disepakati agar data form tidak dibuang diam-diam.

Saat ini tombol valid membuka penjelasan bahwa data belum dikirim; isi form tetap tersedia selama halaman terbuka. Kontak Support belum dikonfigurasi. Tidak ada sukses palsu, alamat kontak rekaan, atau endpoint yang ditebak.

Masalah import React Aria pada core/utils Gluestack sudah dipulihkan. Pemindaian semua import kedua paket kini tidak menemukan dependency yang gagal di-resolve, dan bundle Bantuan sukses. Pemasangan dependency bersama perlu satu pemilik dan verifikasi bundle setelahnya. Lockfile yang sebelumnya lama sudah diperbarui; jangan menimpanya dengan snapshot lama.

Belum ada verifikasi Android/iOS atau perbandingan piksel dari perangkat native; kesamaan 100% belum diklaim. Full web app pada pemeriksaan terakhir tetap tertahan import native `react-native-pager-view`, terpisah dari preview Bantuan; masalah ini dicatat untuk sesi yang menangani perbaikan seluruh proyek.
