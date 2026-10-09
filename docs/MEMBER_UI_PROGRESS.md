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

## Perbaikan setelah review QC — 9 Oktober 2026

QC mengembalikan QC-MEMBER-001/002: perpindahan ID pada instance yang sama dapat membawa data tambah/edit sebelumnya dan mempertahankan lock setelah sukses. `MemberModifyScreen` kini memberi editor lifetime per identitas create/edit; defaults, hydration, lock dan modal dimulai ulang saat identitas berubah. Draft tetap bertahan pada refetch ID yang sama. Sukses/error request yang selesai setelah editor lama unmount tidak diterapkan ke editor baru.

Regresi developer: **40 lifecycle/schema/guard** serta **16 browser Expo Router** lolos. Browser mengubah parameter ID pada route produksi, termasuk edit→tambah→kembali ke edit serta respons sukses/422 tertunda setelah perpindahan ID. API/query menggunakan fixture; root/layout pengujian terisolasi, bukan uji ulang auth/navigasi utama atau Laravel. Satu resource log HTTP422 yang disengaja dicatat terpisah; exception dan console error tak terduga 0. Lint/Biome file berubah serta TypeScript terfokus editor/dependency closure lolos. Bukti/hash/perintah dan batas ada di [handoff Codex-3](qa/codex-3/HANDOFF.md). Status **READY_FOR_QA**, menunggu recheck QC; belum disetujui.

## Status QC terbaru - 9 Oktober 2026

QC-MEMBER-20261009-PASS-DELTA pada [report recheck](qa/qc-member-2026-10-09/recheck/REPORT.md) menutup QC-MEMBER-001/002 untuk MemberModifyScreen.tsx SHA-256 `48ad7ce18952d7751735ea1334108fa79d3f12288ac169b0fa0f7595ae725822`. Hash diperiksa kembali dan cocok; source Member tidak diubah pada kelanjutan SD3-003. QC melaporkan 98 eksekusi assertion lulus (cakupan berulang antarsuite), termasuk A → B → A pending success/422/500, StrictMode dan browser React DOM; lint/Biome 14 file bersih. Persetujuan terbatas delta lifecycle editor. PM menilai publikasi setelah gate integrasi; API/backend/native/Figma/aplikasi penuh tetap mengikuti batas laporan. Status READY_FOR_QA di bagian sebelumnya adalah riwayat sebelum recheck; report QC tidak diedit developer.

## SD3-006 Dialog hapus - READY_FOR_QA, 9 Oktober 2026

[MemberDeleteDialog.tsx](../components/feature/manage/member/MemberDeleteDialog.tsx) kini memisahkan modal/request per ID, memasang lock sebelum await dan memblokir ID kosong/konfirmasi tersembunyi/callback instance lama. Klik ganda pada instance yang sama mengirim satu DELETE, error dapat dicoba ulang dan close sukses berulang memanggil onDeleted sekali. Hash final cf19fc5f12d1612099e0cc84ac855d5af6f3badd6739cfa9323e6d43f5651ecb.

[Paket tiga dialog Kelola](qa/codex-3/delete-lifecycle/HANDOFF.md) melaporkan 156/156 assertion developer lolos, baseline 66 lolos/90 gagal, runtime/React/act error 0. Modal/hooks/factory/QueryClient produksi dengan Axios fixture memeriksa DELETE/encoding/cache customers+detail, error/retry/transisi/null/unmount/StrictMode; HTTP nyata 0. Lint/Biome/diff tiga source dan tipe tiga root+closure bersih. Editor Member yang telah QC PASS tidak diubah; JSX/copy/endpoint dialog tetap selain callback sukses. READY_FOR_QA lalu QC, bukan approval seluruh API/native/Figma/full app. Permintaan terkirim tidak dibatalkan; temuan shared SuccessModal viewport kecil tetap milik pemilik/PM untuk recheck visual.

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

[MemberDetailScreen.tsx](../components/feature/manage/member/MemberDetailScreen.tsx) kini mengembalikan private Content keyed `id ?? ""`; perpindahan A ke B menutup konfirmasi A, sedangkan refetch ID yang sama mempertahankan state. State parent per member sekarang selaras dengan lifetime child dialog hapus per ID. Hash final 1a3b6b16545c6a3425b320f2bd1dad9309610272f61215cf936670ef6337dfd0. Seluruh body/import/parameter/JSX/query/copy/action asli identik; hanya boundary lifetime ditambahkan.

[Paket tiga detail](qa/codex-3/detail-identity/HANDOFF.md): baseline 34 lulus/41 gagal -> 75/75 assertion developer lulus, runtime/React/act 0. Runner memuat 24 module produksi, termasuk tiga dialog/shared-modal/mutation/factory/error mapper, dengan QueryClient dan Axios fixture; GET/presentation/router adapter. Pergantian ID hilang/kosong, loading/error B, respons DELETE A terlambat, unmount, acknowledgement sekali dan route edit teruji. Lint/Biome/diff tiga source bersih; TypeScript tiga root dan declaration/import closure aktual 0 diagnostic.

[Review independen internal](qa/codex-3-internal-review/detail-identity-2026-10-09/REPORT.md): 195/195 lulus, termasuk 156 state normal/StrictMode +21 AST +18 kontrak, tanpa error/warning. INTERNAL_QA_REVIEW_PASS bukan keputusan QC eksternal. Editor yang telah QC PASS, route/dialog/shared-modal tetap. Paket SD3-006/007/008/009 frozen; hash caller detail lama menjadi snapshot historis. Overlay SD3-010 mencatat source terbaru. Tidak menguji native/browser/API nyata/full router/root auth/Figma atau mengubah server/dependency/Git publikasi; QA/QC dan PM memegang gate berikutnya.

## SD3-011 Tindakan daftar - READY_FOR_QA_QC, 9 Oktober 2026

List memakai object canonical dari query penuh dan generation per pembukaan menu, termasuk ID sama. Callback pilihan lama tidak mengubah pilihan baru; aksi ganda ditolak. Rename mengikuti data, target hilang/loading/error meretire menu/confirmation tanpa reopen saat query pulih. Child request/notice dipertahankan ketika record hilang agar own DELETE success bisa diakui. Layout/copy/search/refresh/routes/endpoints tetap.

[Paket delta](qa/codex-3/list-actions/HANDOFF.md): baseline81lulus/84gagal ->165/165developer PASS, runtime/React/act0;26module produksi dengan QueryClient/Axios DELETEfixture, GET/presentation/router/native adapter. [Review internal](qa/codex-3-internal-review/list-actions-2026-10-09/REPORT.md)277/277PASS (258state/integration+19kontrak), runtime/warning0; root menyegel completedreviewexecutions tanpa mengubah tes. ESLint/Biome/diff4source serta actualtsconfig4roots/declarations/importclosure0diagnostic. Ini READY_FOR_QA_QC, bukan keputusan eksternal/publikasiPM.

Source detail SD3-010, editor QC PASS, domain dialogs/shared/API/route tetap; paket sebelumnya frozen dan caller List lama histori. [QC SuccessModal terbaru](qa/qc-success-modal-2026-10-09/REPORT.md) CHANGES_REQUESTED: QC-STOCK-UI-001portrait CLOSED_BY_RECHECK, QC-SUCCESS-001landscape OPEN pada F90. Delta List tidak menutup temuan itu; perbaikan tinggi ditangani terpisah. Tidak browser/native/Figma/full router/backend/dependency/server/Git publikasi.

## SD3-012 dependency SuccessModal height — 9 Oktober 2026

Source dialog/list/detail domain tetap. Shared SuccessModal sekarang memakai hash7508, membatasi tinggi window dengan header/body yang dapat digulir dan footer di luar. [Height handoff](qa/codex-3/success-modal-height/HANDOFF.md) mencatat replay source sekarang: 156 lifecycle +165 list PASS, kualitas bersih. Bukti F90 paket lama tetap historis; overlay manifest utama menautkan dependency terbaru. QC-SUCCESS-001 masih OPEN menunggu recheck aplikasi/native; belum approval QC atau publikasi PM.
