# QC Member — 9 Oktober 2026

Status terbaru: [pemeriksaan ulang](recheck/REPORT.md) menutup temuan QC-MEMBER-001/002 pada hash editor final dan memberi sinyal QC-MEMBER-20261009-PASS-DELTA. Laporan di bawah merupakan histori pemeriksaan pertama.

**Keputusan: PERLU PERBAIKAN / klarifikasi lifecycle rute. Belum disetujui QC untuk publikasi.**

Penerima: Codex-3 (pemilik Member), QA dan Projek Manager. Serah terima melalui dokumen workspace; tidak mengklaim pesan langsung diterima sesi lain.

## Snapshot dan scope

- Frontend HEAD saat pemeriksaan: `acba0d92460c1af3149abc3775f09888a2943cab`.
- Scope: empat berkas route `app/(no-layout)/manage/member/`, enam komponen `components/feature/manage/member/`, `api/hooks/customers.ts`, `schema/add/customer.ts`, `types/api/customer.ts`, `lib/manage/members.ts` (14 berkas).
- `git diff daf1334 -- <scope di atas>` kosong: source khusus Member identik dengan checkpoint navigasi yang disebut pada handoff. Ini tidak membuktikan shared dependencies/backend identik dengan waktu pengujian historis.
- SHA-256 source Member dan dependency bersama yang relevan disimpan pada [results.json](results.json). Primitive `SingleSelect` sedang dimiliki Senior 7; hasil ini bukan persetujuan untuk perubahan primitive tersebut.
- Tidak mengubah source aplikasi/backend, dependency, branch, commit, push, atau server.

## Temuan QC-MEMBER-001 — P2, state form tidak dibatasi per identitas editor

Lokasi: `components/feature/manage/member/MemberModifyScreen.tsx:99`, `:105`, `:116`, `:234`; pemanggil `app/(no-layout)/manage/member/modify.tsx:6` meneruskan ID tanpa React key.

**Prasyarat:** parameter ID berganti pada instance route/editor yang tetap terpasang. Ini dibuktikan dengan merender route produksi dan memperbarui hasil `useLocalSearchParams` pada instance yang sama. Belum dibuktikan melalui klik/deep link di navigator aplikasi penuh; jalur normal yang me-remount editor dapat terhindar dari masalah ini.

Reproduksi pertama:

1. Buka editor ID A, lalu ubah parameter ke ID B pada instance yang sama. Prefill B benar.
2. Hapus ID sehingga editor berada pada mode tambah. Nama/telepon B masih berada dalam form karena effect hanya menangani `id` yang truthy.
3. Tekan Simpan tanpa mengisi data baru. Harness menangkap satu panggilan create/POST berisi data B; harapan form tambah kosong dan tidak mengirim request.

Reproduksi kedua:

1. Simpan edit A dengan respons sukses, sehingga `saved` menjadi true.
2. Ubah parameter ke ID B pada instance yang sama.
3. Prefill B diperbarui, tetapi field/tombol Simpan tetap dikunci oleh `saved` dari A.

Dampak: mode tambah dapat mengirim duplikasi data pelanggan lama, atau editor pelanggan berikutnya tidak dapat disimpan, jika identitas editor berubah tanpa remount. API dalam uji ini dimock; tidak ada pelanggan nyata dibuat.

Tindak lanjut Codex-3: batasi lifecycle editor menurut ID/mode (misalnya remount editor berdasarkan identitas yang sudah dinormalisasi), atau reset state form/sukses/error secara lengkap ketika identitas berubah. Pertahankan draft untuk refetch dengan ID yang sama. QA perlu menguji edit A → edit B, edit → tambah, serta sesudah simpan melalui navigasi aktual. Bila arsitektur router menjamin remount untuk seluruh jalur yang didukung, berikan bukti router tersebut untuk menilai apakah perbaikan komponen diperlukan; jangan menyebut reproduksi komponen sebagai reproduksi klik aplikasi.

## Pemeriksaan independen QC

| Pemeriksaan | Hasil |
| --- | --- |
| ESLint scope Member | Exit 0; 14 berkas, 0 error, 0 warning |
| Biome check scope Member | Exit 0; 14 berkas, tanpa perbaikan otomatis |
| React lifecycle/schema/guard | 27 assertion: 24 lulus, 3 gagal terkait satu temuan di atas; runtime error 0 |
| Source vs `daf1334` | Tidak ada diff pada 14 berkas Member |
| Kontrak frontend/backend | Ditinjau read-only; field CRUD, nullable, permission dan ownership selaras dengan source yang dibaca |
| UI | Review source token/primitive/layout dan screenshot historis `docs/previews/member/narrow.png` (320 px); bukan screenshot baru |

Perintah dari root aplikasi:

```text
node docs/qa/qc-member-2026-10-09/check.cjs
node node_modules/eslint/bin/eslint.js "app/(no-layout)/manage/member" components/feature/manage/member api/hooks/customers.ts lib/manage/members.ts schema/add/customer.ts types/api/customer.ts --format json
node node_modules/@biomejs/biome/bin/biome check "app/(no-layout)/manage/member" components/feature/manage/member api/hooks/customers.ts lib/manage/members.ts schema/add/customer.ts types/api/customer.ts
```

[Harness QC](check.cjs) memakai React 19 test renderer yang sudah tersedia di `.expo/senior7-test-tools/`; tidak memasang dependency. Route, form, react-hook-form, resolver dan schema Zod produksi dieksekusi. Native primitives, query/API, sumber parameter router, modal dan field renderer dimock; mapping 422 memakai adapter kecil. Tes ini tidak menggantikan browser/native atau integrasi jaringan. Exit 1 disengaja karena tiga assertion gagal, bukan crash harness.

Hal yang lulus: validasi wajib/email/gender/tanggal kalender/batas alamat, trim dan null payload, prefill edit, mempertahankan draft saat refetch ID sama, prefill antar-ID, target mutation edit, penguncian sesudah sukses pada ID sama, ID tidak ditemukan/retry, draft dan field error 422, serta guard yang tidak merender child navigator ketika auth loading/izin ditolak.

Review API: factory melakukan invalidasi `customers` dan detail setelah update/delete; create menginvalidasi list. Backend lokal dibaca pada `CustomerRequest`, `CustomerController`, `CustomerPolicy`, model `Customer`, dan trait `HasContentAccessPolicy`. Request mengizinkan alamat 500 karakter, sementara frontend membatasi 255 sesuai batas database yang sudah disebut dalam laporan pembuat. Tidak ada perubahan backend dan tidak menjalankan request ke database pada batch QC ini.

## Bukti historis dan batas

Bukti developer tetap berstatus historis: 45 browser komponen, 12 router dan 26 API Laravel pada `docs/previews/member/`. Identitas source khusus Member sudah cocok dengan checkpoint, tetapi hasil tersebut bukan tes ulang QC dan tidak mencakup kondisi pergantian parameter tanpa remount di atas. Inventaris PM juga mencatat fingerprint bukti historis belum lengkap.

TypeScript penuh tidak digandakan sesuai koordinasi PM; hasil lintas sesi tidak diklaim hasil QC. Browser/router aplikasi penuh, SSR, API Laravel, perangkat native dan Figma tidak diuji ulang. Tidak ada tool Figma langsung tersedia pada sesi QC ini. Pemeriksaan screenshot historis tidak memberi persetujuan kesamaan penuh Figma atau rendering snapshot terbaru.

## Serah terima ke PM

Status Member: **CHANGES_REQUESTED / belum QC approved**. Kembalikan QC-MEMBER-001 ke Codex-3 untuk perbaikan atau bukti jaminan remount, kemudian QA menguji jalur router dan QC mengulang pemeriksaan pada hash baru. Jangan mengubah gate integrasi main berdasarkan hasil lint Member saja. Bantuan/Role/Karyawan tetap antrean terpisah; laporan ini tidak menyetujui modul tersebut maupun tiket developer lain yang baru diserahkan.
