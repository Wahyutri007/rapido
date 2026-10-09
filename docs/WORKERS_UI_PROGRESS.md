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

## Kelanjutan 9 Oktober 2026 — SD3-004 READY_FOR_QA

Codex-3 memperbaiki hanya [WorkerModifyScreen.tsx](../components/feature/manage/workers/WorkerModifyScreen.tsx) pada modul Karyawan. Lifetime form/modal/lock sekarang per ID atau mode tambah, sehingga draft edit tidak terbawa ke tambah; refetch ID yang sama tetap menjaga input. Pending/saved guard menahan submit ganda dan simpan ulang setelah modal sukses ditutup. Callback/respons editor yang telah unmount tidak memengaruhi editor baru; pemeriksaan setelah helper `workerFormData` juga menghentikan request ketika gambar baru selesai disiapkan setelah meninggalkan editor. Request yang sudah dikirim tetap mengikuti kontrak mutation/cache existing. ID kosong yang diberikan memblokir form. Route, schema/helper multipart/API, uploader, password/gambar tersimpan dan tampilan existing tidak diubah.

[Paket gabungan Role/Karyawan](qa/codex-3/role-worker-identity/HANDOFF.md): baseline 75 lolos/31 gagal → final **106/106 assertion gabungan lolos**, runtime/act error 0. Kasus Karyawan mencakup pending persiapan gambar selesai/gagal setelah ID berpindah, retry gambar saat ini, payload create/password dan edit POST `_method=PUT`. Helper multipart/RHF/Zod/editor/route produksi digunakan dengan query/API/native/presentasi/fetch adapter; FormData/Blob Node dan gambar fixture memori, tanpa HTTP/backend write. ESLint dua editor 0 error/warning, Biome check/diff bersih, TypeScript dua root + dependency closure 0 diagnostic; JSX tetap selain binding submit dan disabled CTA setelah sukses. [Hash final](qa/codex-3/role-worker-identity/verification.json) menggantikan hash editor lama untuk review delta.

Status developer READY_FOR_QA, kemudian QC; belum approval. Bukti browser/router/Laravel dan full-project TypeScript sebelumnya merupakan histori 8 Oktober, tidak diulang atau diatribusikan pada hash editor baru. Batch ini tanpa browser/Metro/native/root auth/Figma atau gate integrasi global. Serah terima melalui workspace; PM tetap pemilik publikasi.

## Keputusan QC 9 Oktober 2026 — PASS-DELTA

[QC Role/Karyawan](qa/qc-role-worker-2026-10-09/REPORT.md) meluluskan delta dua editor pada hash Worker `8473d1d8b4d52d84d6222ca301b9dd9754f059fc4776bcd389a0954890a9c1b8` dan Role `2a5d4986e3b325723cf5c87f4a75a9cef25da97874aab63008f85c743e8e2fd7`, yang masih cocok saat sinkronisasi. **140 eksekusi assertion QC gabungan lolos** termasuk cakupan berulang: 106 replay developer +34 integrasi QueryClient/hooks/mutation/error mapper/multipart produksi dengan Axios fixture. Karyawan menyiapkan foto sekali saat double submit, hasil foto editor lama menghasilkan nol mutation; edit POST `_method=PUT` dua gambar/password tidak dikirim, create password/konfirmasi tanpa override, invalidasi dan draft per identitas teruji. Runtime/act error 0, HTTP nyata 0, lint/Biome/diff dua source bersih.

Ini hasil QC, bukan rerun Codex-3 atau bukti Laravel menerima upload/native/auth/full app. Paket developer sebelumnya tetap histori READY_FOR_QA. [DECISION.json](qa/qc-role-worker-2026-10-09/DECISION.json) membatasi approval pada dua hash editor; PM menjalankan gate integrasi/publikasi.

## SD3-006 Dialog hapus - READY_FOR_QA, 9 Oktober 2026

[WorkerDeleteDialog.tsx](../components/feature/manage/workers/WorkerDeleteDialog.tsx) kini memberi lifetime per ID, lock sebelum await serta guard mounted/dialog aktif/ID kosong. Klik konfirmasi ganda mengirim satu DELETE pada instance yang sama; respons/callback lama tidak menutup dialog target baru. Modal/loading direset saat ID berubah, error tetap dapat dicoba ulang dan penutupan sukses menavigasi sekali. Hash final 1b0fccc994853b350ad3c78b493801e2f57a6ac3ceacd6797655b81d2c255b1a.

[Paket tiga dialog Kelola](qa/codex-3/delete-lifecycle/HANDOFF.md): 156/156 assertion developer lolos dari baseline 66/90, runtime/React/act error 0. Komponen/modal/hooks/factory/error mapper/QueryClient produksi dengan Axios fixture, DELETE/encoding/cache workers+detail teruji, HTTP nyata 0. Lint/Biome/diff tiga source bersih, tipe tiga root+closure 0 diagnostic. JSX/copy/endpoint tetap selain guard callback sukses; editor Karyawan yang telah QC PASS tetap. Ini READY_FOR_QA lalu QC, bukan approval native/API/full app. Permintaan terkirim tidak dibatalkan; shared SuccessModal kecil mengikuti temuan/recheck pemilik/PM terpisah.

## SD3-007 Ukuran modal sukses - READY_FOR_QC_RECHECK, 9 Oktober 2026

Shared [SuccessModal.tsx](../components/common/SuccessModal.tsx) memperbaiki batas gambar dan lebar window: Image176px/100%, margin16px/max380 tetap, resize mengikuti window tanpa props berubah. Hash final f90eec3d8d4b95ad5a5b1b6ff7cc354e9097fe5d232eef4c0d020ebb61f4e495. Source editor dan dialog domain tidak berubah; callback/public props/copy/remaining JSX shared tetap. QC-STOCK-UI-001 P2 masih OPEN sampai keputusan recheck.

[Paket terbaru](qa/codex-3/success-modal-size/HANDOFF.md): 36 browser stok +51 browser shared modal/varian/resize +156 regresi tiga dialog =243 eksekusi assertion final lolos termasuk cakupan berulang. Runtime/console/React/act0, HTTP API nyata0. Lint/Biome/diff satu source dan tipe satu root+closure bersih; 88caller/inventory props masih cocok. Screenshot data contoh Role/Karyawan/Member320px tersedia, bukan screenshot native pengguna. Paket SD3-006 asli tetap histori sebelum dependency shared berubah; hasil replay156 terbaru ada di supplement SD3-007. Native/88layar/Figma/root auth/full app belum disertifikasi; PM memegang gate publikasi.

## SD3-008 Konfirmasi hapus responsif - READY_FOR_QA_QC, 9 Oktober 2026

Shared [DeleteConfirmModal.tsx](../components/common/DeleteConfirmModal.tsx) kini membatasi Image176px/content width dan mengikuti window aktif; margin16/max380, dua tombol Batal/Hapus, props/callback/loading/copy/style lainnya tetap. Hash final dabc8e26e3aa79ded2127a36d2a6ee33cc6b020bdf7fff76afe93c29ad9a2818. Source editor dan tiga dialog domain yang sudah diserahkan tetap.

[Paket terbaru](qa/codex-3/delete-modal-size/HANDOFF.md): baseline72lolos/43gagal ->115/115browser +156/156lifecycle =271eksekusi developer termasuk cakupan berulang, runtime/console/React/act/HTTP API nyata0. Lint/Biome/diff satu source dan tipe satu root+closure bersih. Screenshot data contoh320px menampilkan Batal/Hapus utuh, termasuk teks panjang. Inventaris63caller adalah audit prop/hash, bukan eksekusi seluruh layar. [Review internal](qa/codex-3-internal-review/delete-modal-2026-10-09/REPORT.md) melaporkan53pemeriksaan mandiri lulus; bukan keputusan QC eksternal. SD3-006/007 tetap frozen dengan shared dependency lama, replay156 terbaru tersedia pada SD3-008. QC-STOCK-UI-001 tetap OPEN, native/Figma/root auth/full app belum disertifikasi; QA/QC dan gate PM terpisah.

## SD3-009 Dialog peringatan bersama - READY_FOR_QA_QC, 9 Oktober 2026

[AlertModal.tsx](../components/common/AlertModal.tsx) mengikuti window aktif dan membatasi image opsional ke 128 px/content width, tetap cover dengan maximum primitive510. Private type AlertModalProps menghilangkan warning redeclaration tanpa perubahan emittedJS. Hash final 76b6330071a9bbec718f3fed21945c09fe7dfa81146ee02e7e471a8ebf5fe39e. Callback/children/message/footer serta cancel aktif saat loading tetap. Source modul/domain yang telah diserahkan tidak berubah.

[Paket terbaru](qa/codex-3/alert-modal-size/HANDOFF.md): baseline108PASS/6FAIL ->114/114browser +156/156lifecycle =270 eksekusi developer final termasuk cakupan berulang, runtime/console/React/act/HTTP API nyata0. Lint/Biome/diff satu source dan tipe satu root+closure bersih; AST empat geometri+alias privat sama, emittedJS sama versi geometri-only. [Review internal final](qa/codex-3-internal-review/alert-modal-final-2026-10-09/REPORT.md): 60 renderer +4 type-only proof =64PASS, tanpa error. Inventaris71file/78pemakaian adalah audit props/hash, bukan seluruh layar dijalankan. Screenshot contoh pesan Bantuan/modal bergambar320px tersedia; parent message/children fixture, bukan sertifikasi seluruh layar.

SD3-006/007/008 dan review a1d8 tetap frozen dengan dependency sebelumnya; replay156 pada ketiga shared modal saat ini ada pada SD3-009. Keputusan QC source-only sebelumnya tidak meluluskan dependency Alert baru. Interim lint warning/type-rename/formatting tersimpan, bukan dihitung final. QA/QC eksternal masih diperlukan, QC-STOCK-UI-001 tetap OPEN dan PM memegang gate publikasi. Native/Figma/root auth/backend/full app belum disertifikasi; tidak mengoperasikan HP atau server/API data pengguna.

## SD3-010 Detail per identitas - READY_FOR_QA_QC, 9 Oktober 2026

[WorkerDetailScreen.tsx](../components/feature/manage/workers/WorkerDetailScreen.tsx) kini mengembalikan private Content keyed `id ?? ""`; perpindahan A ke B menutup konfirmasi A, sedangkan refetch ID yang sama mempertahankan state. State parent per karyawan sekarang selaras dengan lifetime child dialog hapus per ID. Hash final 7ac2a60ab639388ac78f401b51a2d4f26f9d7eb0af7efc31552c32de348ebc46. Seluruh body/import/parameter/JSX/query/copy/action asli identik; hanya boundary lifetime ditambahkan.

[Paket tiga detail](qa/codex-3/detail-identity/HANDOFF.md): baseline 34 lulus/41 gagal -> 75/75 assertion developer lulus, runtime/React/act 0. Runner memuat 24 module produksi, termasuk tiga dialog/shared-modal/mutation/factory/error mapper, dengan QueryClient dan Axios fixture; GET/presentation/router adapter. Pergantian ID hilang/kosong, loading/error B, respons DELETE A terlambat, unmount, acknowledgement sekali dan route edit teruji. Lint/Biome/diff tiga source bersih; TypeScript tiga root dan declaration/import closure aktual 0 diagnostic.

[Review independen internal](qa/codex-3-internal-review/detail-identity-2026-10-09/REPORT.md): 195/195 lulus, termasuk 156 state normal/StrictMode +21 AST +18 kontrak, tanpa error/warning. INTERNAL_QA_REVIEW_PASS bukan keputusan QC eksternal. Editor yang telah QC PASS, route/dialog/shared-modal tetap. Paket SD3-006/007/008/009 frozen; hash caller detail lama menjadi snapshot historis. Overlay SD3-010 mencatat source terbaru. Tidak menguji native/browser/API nyata/full router/root auth/Figma atau mengubah server/dependency/Git publikasi; QA/QC dan PM memegang gate berikutnya.

## SD3-011 Tindakan daftar - READY_FOR_QA_QC, 9 Oktober 2026

List memakai object canonical dari query penuh dan generation per pembukaan menu, termasuk ID sama. Callback pilihan lama tidak mengubah pilihan baru; aksi ganda ditolak. Rename mengikuti data, target hilang/loading/error meretire menu/confirmation tanpa reopen saat query pulih. Child request/notice dipertahankan ketika record hilang agar own DELETE success bisa diakui. Layout/copy/search/refresh/routes/endpoints tetap.

[Paket delta](qa/codex-3/list-actions/HANDOFF.md): baseline81lulus/84gagal ->165/165developer PASS, runtime/React/act0;26module produksi dengan QueryClient/Axios DELETEfixture, GET/presentation/router/native adapter. [Review internal](qa/codex-3-internal-review/list-actions-2026-10-09/REPORT.md)277/277PASS (258state/integration+19kontrak), runtime/warning0; root menyegel completedreviewexecutions tanpa mengubah tes. ESLint/Biome/diff4source serta actualtsconfig4roots/declarations/importclosure0diagnostic. Ini READY_FOR_QA_QC, bukan keputusan eksternal/publikasiPM.

Source detail SD3-010, editor QC PASS, domain dialogs/shared/API/route tetap; paket sebelumnya frozen dan caller List lama histori. [QC SuccessModal terbaru](qa/qc-success-modal-2026-10-09/REPORT.md) CHANGES_REQUESTED: QC-STOCK-UI-001portrait CLOSED_BY_RECHECK, QC-SUCCESS-001landscape OPEN pada F90. Delta List tidak menutup temuan itu; perbaikan tinggi ditangani terpisah. Tidak browser/native/Figma/full router/backend/dependency/server/Git publikasi.

## SD3-012 dependency SuccessModal height — 9 Oktober 2026

Source dialog/list/detail domain tetap. Shared SuccessModal sekarang memakai hash7508, membatasi tinggi window dengan header/body yang dapat digulir dan footer di luar. [Height handoff](qa/codex-3/success-modal-height/HANDOFF.md) mencatat replay source sekarang: 156 lifecycle +165 list PASS, kualitas bersih. Bukti F90 paket lama tetap historis; overlay manifest utama menautkan dependency terbaru. QC-SUCCESS-001 masih OPEN menunggu recheck aplikasi/native; belum approval QC atau publikasi PM.
