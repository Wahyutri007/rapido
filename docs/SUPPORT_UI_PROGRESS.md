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

## Kelanjutan 9 Oktober 2026 — SD3-005 READY_FOR_QA

Codex-3 memperbaiki hanya [SupportAttachmentInput.tsx](../components/feature/support/SupportAttachmentInput.tsx) dan [SupportFormScreen.tsx](../components/feature/support/SupportFormScreen.tsx). Lock picker dipasang sebelum await, sehingga dua ketukan dalam event yang sama hanya membuka satu picker. Hapus saat picker berjalan meneruskan `null` dan mengabaikan hasil/error lama; callback setelah unmount tidak memanggil parent/modal. Lock dilepas setelah picker selesai agar retry tersedia. Form memiliki lifetime per mode Feedback/Pengajuan Fitur; draft/modal/error/lampiran direset saat mode berubah, rerender mode yang sama menjaga input, callback submit form lama ditahan. Ini tidak membatalkan dialog native yang sudah dibuka.

[Paket bukti](qa/codex-3/support-attachment/HANDOFF.md): baseline final 90 lolos/24 gagal → **114/114 assertion lolos**, runtime/act error 0. Percobaan baseline pertama 93/21 tetap tersimpan; tiga callback picker kemudian diuji dari handler yang ditangkap sebelum busy. React/RHF Controller/FormProvider/Zod/route/komponen produksi dengan document-picker/native/presentasi/modal adapter digunakan. ESLint dua source 0 error/warning, Biome check/diff bersih, TypeScript dua root + dependency closure 0 diagnostic. AST returned JSX tetap selain binding remove/submit. [Manifest hash](qa/codex-3/support-attachment/verification.json) menjadi acuan dua komponen terbaru.

Route/layout/schema/Hero/FAQ/primitive/backend/dependency tidak diubah. Form valid tetap menjelaskan pengiriman belum tersedia; tanpa HTTP/API/upload atau sukses palsu. Screenshot/browser/Figma/TypeScript penuh pada bagian sebelumnya merupakan histori 8 Oktober dan tidak diulang pada hash baru; native/root auth/SSR/full app belum disertifikasi oleh batch ini. Status developer READY_FOR_QA, kemudian QC; laporan melalui workspace, PM pemilik publikasi. Tidak menjalankan Metro/HP/server atau commit/push/merge.

## Keputusan QC SD3-005 - 9 Oktober 2026

[QC-SUPPORT-20261009-PASS-DELTA](qa/qc-support-2026-10-09/REPORT.md) menyetujui delta SupportAttachmentInput `f8285db03bb38e40fc229015ff21f0cbf65a7622872c0786afed06e336e8f098` dan SupportFormScreen `9981ca3fa593ddb1940aad08ed16a53f771bae8d5e2a4a3f4c32ffe8396982de`. Kedua hash masih cocok saat sinkronisasi. QC melaporkan 114 replay +61 independen =**175 eksekusi assertion lolos**, termasuk cakupan berulang, runtime/React/act error 0. Form controls/modal/routes/RHF/Zod produksi diintegrasikan dengan host/picker adapter; lint/Biome/diff dua source bersih. Bukti tipe scoped developer direview, bukan rerun QC.

Ini keputusan QC pada dua hash, bukan rerun Codex-3 atau approval pengiriman API/native/browser/Figma/full app. Form valid tetap menjelaskan belum dikirim. Paket developer di atas tetap snapshot READY_FOR_QA sebelum keputusan; hasil/screenshot historis dipertahankan. PM memegang gate integrasi akhir/publikasi; main handoff/manifest dan navigation guide disinkronkan tanpa perubahan source Bantuan.

## SD3-009 Dialog peringatan bersama - READY_FOR_QA_QC, 9 Oktober 2026

[AlertModal.tsx](../components/common/AlertModal.tsx) mengikuti window aktif dan membatasi image opsional ke 128 px/content width, tetap cover dengan maximum primitive510. Private type AlertModalProps menghilangkan warning redeclaration tanpa perubahan emittedJS. Hash final 76b6330071a9bbec718f3fed21945c09fe7dfa81146ee02e7e471a8ebf5fe39e. Callback/children/message/footer serta cancel aktif saat loading tetap. Source modul/domain yang telah diserahkan tidak berubah.

[Paket terbaru](qa/codex-3/alert-modal-size/HANDOFF.md): baseline108PASS/6FAIL ->114/114browser +156/156lifecycle =270 eksekusi developer final termasuk cakupan berulang, runtime/console/React/act/HTTP API nyata0. Lint/Biome/diff satu source dan tipe satu root+closure bersih; AST empat geometri+alias privat sama, emittedJS sama versi geometri-only. [Review internal final](qa/codex-3-internal-review/alert-modal-final-2026-10-09/REPORT.md): 60 renderer +4 type-only proof =64PASS, tanpa error. Inventaris71file/78pemakaian adalah audit props/hash, bukan seluruh layar dijalankan. Screenshot contoh pesan Bantuan/modal bergambar320px tersedia; parent message/children fixture, bukan sertifikasi seluruh layar.

SD3-006/007/008 dan review a1d8 tetap frozen dengan dependency sebelumnya; replay156 pada ketiga shared modal saat ini ada pada SD3-009. Keputusan QC source-only sebelumnya tidak meluluskan dependency Alert baru. Interim lint warning/type-rename/formatting tersimpan, bukan dihitung final. QA/QC eksternal masih diperlukan, QC-STOCK-UI-001 tetap OPEN dan PM memegang gate publikasi. Native/Figma/root auth/backend/full app belum disertifikasi; tidak mengoperasikan HP atau server/API data pengguna.
