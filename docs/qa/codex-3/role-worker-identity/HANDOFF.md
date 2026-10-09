# SD3-004 — identitas editor Role dan Karyawan

Pemilik **Codex-3**, profil `D:/Codex-3`; 9 Oktober 2026, Asia/Jakarta. Status **READY_FOR_QA**, kemudian QC. Serah terima melalui workspace bersama; penerimaan langsung oleh sesi lain dan persetujuan publikasi belum diklaim.

Saat route tetap terpasang, edit → tambah dapat membawa draft dari record lama. Respons simpan yang selesai setelah berpindah ID juga dapat mengolah modal/error milik editor yang sudah ditinggalkan. Pada Karyawan, penyiapan gambar berlangsung sebelum request dan membutuhkan pemeriksaan identitas setelah selesai.

Dua source berubah: [RoleModifyScreen.tsx](../../../../components/feature/manage/roles/RoleModifyScreen.tsx) dan [WorkerModifyScreen.tsx](../../../../components/feature/manage/workers/WorkerModifyScreen.tsx). Wrapper membuat lifetime form berdasarkan `create` atau `edit:<id>`; refetch ID yang sama mempertahankan draft, perpindahan identitas memulai form baru. ID kosong yang diberikan tetap mode edit gagal, sehingga tidak membuka form tambah.

Guard pending dipasang sebelum await untuk menahan dua submit pada event yang sama. Guard saved bertahan setelah modal sukses ditutup sampai navigasi kembali; editor baru memiliki lock/modal baru. Setup/cleanup mounted kompatibel dengan replay effect StrictMode. Respons sukses/422/500 editor lama tidak diproses pada UI lama; callback submit yang tersimpan setelah unmount tidak mengirim request. Pada Karyawan, guard tambahan setelah `workerFormData` mencegah request jika gambar baru selesai disiapkan setelah meninggalkan editor. Request yang sudah dikirim tetap mengikuti mutation factory dan invalidasi cache existing; patch ini tidak membatalkan request server.

Route, layout/header/guard owner, API hooks/factory, schema, permission editor, helper pemetaan/multipart dan primitive tidak diubah. Binding `handleSubmit` dijalankan saat event. Pembandingan AST JSX membuktikan komposisi editor tetap selain binding submit dan kondisi disabled CTA setelah sukses. Tidak ada perubahan geometri atau screenshot baru.

## Bukti terfokus

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Sebelum perbaikan, dua editor | 75 lolos / 31 gagal, 106 assertion | [baseline.json](baseline.json), snapshot sebelum edit |
| Setelah perbaikan, dua editor | **106/106 lolos**, runtime/act error 0 | [results.json](results.json), [check.cjs](check.cjs) |
| ESLint dua source | 0 error / 0 warning, exit 0 | [quality-results.json](quality-results.json) |
| Biome check dan diff-check dua source | Exit 0 | [quality-results.json](quality-results.json) |
| JSX sebelum/sesudah | Kedua editor sama di luar dua props CTA yang disengaja | [quality.cjs](quality.cjs) |
| TypeScript dua root + imported dependency closure | 0 diagnostic, exit 0 | [typecheck-results.json](typecheck-results.json), [typecheck.cjs](typecheck.cjs) |
| Hash source hasil tes dan snapshot awal | Cocok terhadap source final / baseline | [verification.json](verification.json) |

106 merupakan jumlah gabungan, bukan 106 per modul. Cakupan mencakup A → B → tambah → B, prefill/default semua field, refetch mempertahankan draft, create tidak mengkloning data edit, array ID pertama, ID hilang/kosong dan recovery, pending sukses/422/500 A → B → A, retry 422, agregasi `permissions.0`, payload create/edit, saved lock setelah modal ditutup, callback editor lama, StrictMode, serta gambar Karyawan tertunda/gagal dan retry multipart.

Harness menjalankan route/editor produksi, React, React Hook Form, Zod, helper Role dan `workerFormData` asli dalam proses Node terisolasi. Query/mutation, error mapper, Expo Router, komponen RN/presentasi dan fetch gambar memakai adapter. FormData/Blob Node dipakai untuk jalur web helper asli; PNG fixture berada dalam memori. Tidak ada HTTP/backend write. API hook difingerprint sebagai kontrak baca, bukan dieksekusi sebagai bukti Query/Axios/invalidation. JSX FormField/picker/uploader native tidak diinteraksikan oleh harness.

ESLint selesai terlebih dahulu dengan output `.expo/codex-3-role-worker-lint.json`; runner quality dijalankan memakai `--reuse-eslint` pada hash dua source yang sama. Flag itu tidak diperlukan untuk pengulangan QA; perintah tanpa flag menjalankan ESLint baru. Typecheck terfokus memakai opsi/deklarasi proyek; tidak menggandakan gate global PM.

## Pengulangan dan batas review

Jalankan dari root aplikasi dengan Node 22 dan dependency proyek. React serta react-test-renderer dibaca dari `.expo/senior7-test-tools/node_modules` tanpa mengubah dependency aplikasi atau instalasi sesi tersebut. Jika direktori lokal itu belum tersedia pada mesin QA lain, sediakan React 19.2 dan renderer yang cocok di lokasi tersebut secara terisolasi terlebih dahulu.

```powershell
node docs/qa/codex-3/role-worker-identity/check.cjs
node docs/qa/codex-3/role-worker-identity/typecheck.cjs
node docs/qa/codex-3/role-worker-identity/quality.cjs
node docs/qa/codex-3/role-worker-identity/verify.cjs
```

Jangan menjalankan `check.cjs --baseline` pada source final karena akan mengganti hasil reproduksi awal. Untuk review independen, salin output ke paket QA sendiri. `verify.cjs --update-main` hanya untuk sinkronisasi manifest developer setelah seluruh gate cocok; mode default hanya menyusun manifest supplement ini.

QA diminta memeriksa terutama perpindahan ID pada route yang sama, dua submit sebelum render berikutnya, callback lama setelah unmount, replay StrictMode, serta penyelesaian persiapan gambar sebelum API. QC kemudian mencocokkan source/payload/dokumentasi dan memutuskan delta; PM tetap pemilik publikasi/integrasi.

[Role](../../../ROLES_UI_PROGRESS.md) dan [Karyawan](../../../WORKERS_UI_PROGRESS.md) tetap terhubung ke API produksi. Bukti browser/router/Laravel 8 Oktober pada laporan tersebut merupakan histori, tidak dijalankan ulang atau diatribusikan pada dua hash editor baru. Batch ini tidak memverifikasi browser/full navigator/root auth, native, HTTP/API nyata, cancellation server, SSR, aksesibilitas atau parity Figma. Discovery tool Figma pada profil aktif tidak menemukan tool callable; patch lifecycle ini mempertahankan komposisi existing.

Scope dua editor tidak mengambil Jurnal/store/ledger, boot/auth, MultiSelect, runtime cache HP, backend atau server sesi lain. Tidak ada Metro/browser/proses pengujian Codex-3 yang tersisa; tanpa commit/push/merge atau perubahan branch/index.

## Execution Profile & Operator Tips

- **Recommended Effort Level: Medium** — identitas form dan hasil async melintasi unmount serta persiapan multipart sebelum mutation.
- **Suggested Batching / Chunking:** reproduksi dua editor → lifetime/guard → regresi payload/identitas → checks terfokus → QA/QC delta.
- **Operator Tips & Watchouts:** gunakan hash supplement terbaru untuk dua editor; hasil API/browser lama tidak membuktikan lifecycle baru. Pertahankan POST `_method=PUT`, field error dan permission lama sesuai kontrak existing.
