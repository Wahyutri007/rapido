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

## Kelanjutan 9 Oktober 2026 — SD3-004 READY_FOR_QA

Codex-3 memperbaiki hanya [RoleModifyScreen.tsx](../components/feature/manage/roles/RoleModifyScreen.tsx) pada modul Role. Form/modal/lock sekarang mengikuti ID atau mode tambah; refetch ID yang sama tetap menjaga draft. Perpindahan edit → tambah atau kembali ke ID membuka instance baru. Guard pending menahan submit ganda; saved lock bertahan sampai navigasi kembali. Callback/respons editor yang telah unmount tidak mengirim submit baru atau memasang sukses/422/500 pada editor baru. ID kosong yang diberikan tetap gagal edit. Route, permission editor, schema/helper/API dan tampilan existing tidak diubah.

[Paket gabungan Role/Karyawan](qa/codex-3/role-worker-identity/HANDOFF.md): baseline 75 lolos/31 gagal → final **106/106 assertion gabungan lolos**, runtime/act error 0. ESLint dua editor 0 error/warning, Biome check/diff bersih, TypeScript dua root + dependency closure 0 diagnostic; AST JSX tetap selain binding submit dan kondisi disabled CTA setelah sukses. React/RHF/Zod/route/editor/helper produksi digunakan dengan query/API/native/presentasi adapter. Hash final ada di [verification.json](qa/codex-3/role-worker-identity/verification.json).

Status developer READY_FOR_QA, kemudian QC; belum approval. Bukti browser/router/API dan full-project TypeScript pada bagian sebelumnya merupakan histori 8 Oktober, tidak diulang atau diatribusikan kepada hash editor baru. Batch ini tanpa browser/Metro, HTTP/backend write, native/root auth/Figma atau gate integrasi global. Serah terima melalui workspace; PM pemilik publikasi.

## Keputusan QC 9 Oktober 2026 — PASS-DELTA

[QC Role/Karyawan](qa/qc-role-worker-2026-10-09/REPORT.md) meluluskan delta dua editor pada hash Role `2a5d4986e3b325723cf5c87f4a75a9cef25da97874aab63008f85c743e8e2fd7` dan Worker `8473d1d8b4d52d84d6222ca301b9dd9754f059fc4776bcd389a0954890a9c1b8`, yang masih cocok saat sinkronisasi. **140 eksekusi assertion QC gabungan lolos** termasuk cakupan berulang: 106 replay developer +34 integrasi QueryClient/hooks/mutation/error mapper/multipart produksi dengan Axios fixture. Role PUT tetap menargetkan ID asal, invalidasi role/detail/workers berjalan, refetch menjaga draft baru, 422/permission indexed dan retry mengikuti mapper asli. Runtime/act error 0, HTTP nyata 0, lint/Biome/diff dua source bersih.

Ini hasil QC, bukan rerun Codex-3 atau approval seluruh modul/API/native/browser/root auth/Figma. Paket developer sebelumnya dipertahankan sebagai histori READY_FOR_QA. [DECISION.json](qa/qc-role-worker-2026-10-09/DECISION.json) membatasi persetujuan pada dua hash; PM tetap pemilik gate integrasi/publikasi.

## SD3-006 Dialog hapus - READY_FOR_QA, 9 Oktober 2026

[RoleDeleteDialog.tsx](../components/feature/manage/roles/RoleDeleteDialog.tsx) kini memiliki lifetime per ID, lock sebelum await serta guard mounted/dialog aktif/ID kosong. Dua callback konfirmasi sebelum render mengirim satu DELETE; hasil/callback target lama diabaikan, modal direset saat berpindah ID dan penutupan sukses memanggil onDeleted sekali. Error melepas lock untuk retry. Hash final 0e0078d0db6f29e1ad6c099a10648ca7dbb59beeaa64fe43b536d37b8ea18207.

[Paket tiga dialog Kelola](qa/codex-3/delete-lifecycle/HANDOFF.md): baseline 66/90 -> 156/156 assertion developer lolos, runtime/React/act error 0, memakai 16 modul produksi dan QueryClient/Axios fixture. DELETE/encoding ID/cache roles+detail+workers teruji; HTTP nyata 0. Lint/Biome/diff tiga source bersih, tipe tiga root+closure 0 diagnostic. JSX/copy/endpoint tetap selain guard callback sukses; editor Role yang telah QC PASS tidak diubah. Status READY_FOR_QA lalu QC, bukan approval seluruh modul. Permintaan terkirim tidak dibatalkan; native/browser/visual/Figma/full app belum diuji dan temuan shared SuccessModal viewport 320x640 masih gate pemilik/PM.

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

[RoleDetailScreen.tsx](../components/feature/manage/roles/RoleDetailScreen.tsx) kini mengembalikan private Content keyed `id ?? ""`; perpindahan A ke B menutup konfirmasi A, sedangkan refetch ID yang sama mempertahankan state. Pencarian hak akses direset pada pergantian role, tetapi bertahan saat refetch ID yang sama. Hash final 47f049ce90f45aadadd1589945e4afab0551baec16ece34940fe195522a3f5c2. Seluruh body/import/parameter/JSX/query/copy/action asli identik; hanya boundary lifetime ditambahkan.

[Paket tiga detail](qa/codex-3/detail-identity/HANDOFF.md): baseline 34 lulus/41 gagal -> 75/75 assertion developer lulus, runtime/React/act 0. Runner memuat 24 module produksi, termasuk tiga dialog/shared-modal/mutation/factory/error mapper, dengan QueryClient dan Axios fixture; GET/presentation/router adapter. Pergantian ID hilang/kosong, loading/error B, respons DELETE A terlambat, unmount, acknowledgement sekali dan route edit teruji. Lint/Biome/diff tiga source bersih; TypeScript tiga root dan declaration/import closure aktual 0 diagnostic.

[Review independen internal](qa/codex-3-internal-review/detail-identity-2026-10-09/REPORT.md): 195/195 lulus, termasuk 156 state normal/StrictMode +21 AST +18 kontrak, tanpa error/warning. INTERNAL_QA_REVIEW_PASS bukan keputusan QC eksternal. Editor yang telah QC PASS, route/dialog/shared-modal tetap. Paket SD3-006/007/008/009 frozen; hash caller detail lama menjadi snapshot historis. Overlay SD3-010 mencatat source terbaru. Tidak menguji native/browser/API nyata/full router/root auth/Figma atau mengubah server/dependency/Git publikasi; QA/QC dan PM memegang gate berikutnya.

## SD3-011 Tindakan daftar - READY_FOR_QA_QC, 9 Oktober 2026

List memakai object canonical dari query penuh dan generation per pembukaan menu, termasuk ID sama. Callback pilihan lama tidak mengubah pilihan baru; aksi ganda ditolak. Rename mengikuti data, target hilang/loading/error meretire menu/confirmation tanpa reopen saat query pulih. Child request/notice dipertahankan ketika record hilang agar own DELETE success bisa diakui. Layout/copy/search/refresh/routes/endpoints tetap.

[Paket delta](qa/codex-3/list-actions/HANDOFF.md): baseline81lulus/84gagal ->165/165developer PASS, runtime/React/act0;26module produksi dengan QueryClient/Axios DELETEfixture, GET/presentation/router/native adapter. [Review internal](qa/codex-3-internal-review/list-actions-2026-10-09/REPORT.md)277/277PASS (258state/integration+19kontrak), runtime/warning0; root menyegel completedreviewexecutions tanpa mengubah tes. ESLint/Biome/diff4source serta actualtsconfig4roots/declarations/importclosure0diagnostic. Ini READY_FOR_QA_QC, bukan keputusan eksternal/publikasiPM.

Source detail SD3-010, editor QC PASS, domain dialogs/shared/API/route tetap; paket sebelumnya frozen dan caller List lama histori. [QC SuccessModal terbaru](qa/qc-success-modal-2026-10-09/REPORT.md) CHANGES_REQUESTED: QC-STOCK-UI-001portrait CLOSED_BY_RECHECK, QC-SUCCESS-001landscape OPEN pada F90. Delta List tidak menutup temuan itu; perbaikan tinggi ditangani terpisah. Tidak browser/native/Figma/full router/backend/dependency/server/Git publikasi.

## SD3-012 dependency SuccessModal height — 9 Oktober 2026

Source dialog/list/detail domain tetap. Shared SuccessModal sekarang memakai hash7508, membatasi tinggi window dengan header/body yang dapat digulir dan footer di luar. [Height handoff](qa/codex-3/success-modal-height/HANDOFF.md) mencatat replay source sekarang: 156 lifecycle +165 list PASS, kualitas bersih. Bukti F90 paket lama tetap historis; overlay manifest utama menautkan dependency terbaru. QC-SUCCESS-001 masih OPEN menunggu recheck aplikasi/native; belum approval QC atau publikasi PM.
