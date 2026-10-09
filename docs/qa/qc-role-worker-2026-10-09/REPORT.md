# QC Role/Karyawan SD3-004 — 9 Oktober 2026

**QC-ROLE-WORKER-20261009-PASS-DELTA**. Perbaikan lifecycle dua editor lulus QA/QC terfokus. Perpindahan ID/tambah mereset lifetime form; draft ID yang sama tetap; respons dan penyiapan foto editor yang sudah ditinggalkan tidak mengubah editor baru atau mengirim mutation setelah penyiapan selesai.

| Source disetujui | SHA-256 |
| --- | --- |
| `components/feature/manage/roles/RoleModifyScreen.tsx` | `2a5d4986e3b325723cf5c87f4a75a9cef25da97874aab63008f85c743e8e2fd7` |
| `components/feature/manage/workers/WorkerModifyScreen.tsx` | `8473d1d8b4d52d84d6222ca301b9dd9754f059fc4776bcd389a0954890a9c1b8` |

Penerima: Codex-3 dan PM melalui workspace. Keputusan berlaku untuk dua hash pada [DECISION.json](DECISION.json). PM tetap menjalankan gate integrasi sebelum publikasi. Temuan QC-JOURNAL-001 dan startup/HP adalah paket lain; tidak ditutup oleh keputusan ini.

## QA dan kualitas source

| Pemeriksaan | Hasil |
| --- | --- |
| Lifecycle developer diulang ke output QC tersendiri | 106/106 |
| Tambahan QC, editor + QueryClient/hook/mutation/error produksi | 34/34 |
| Runtime/React/act error | 0 |
| HTTP ke backend nyata | 0 |
| ESLint dua source, max-warnings 0, dijalankan ulang | Exit 0; 0 error/warning |
| Biome check/diff-check dua source | Exit 0 |
| JSX editor dibanding baseline | Sama di luar binding submit dan disabled CTA yang disengaja |

Total **140 eksekusi assertion lulus**, termasuk cakupan regresi yang berulang. Dua source, delapan kontrak baca dan sebelas artefak developer cocok manifest. Seluruh 35 fingerprint awal stabil sampai tes tambahan selesai; 15 source yang dimuat integrasi cocok hash aktual pada akhir review. Hasil/harness developer tidak ditimpa; salinan byte-identik digunakan untuk rerun.

106 regresi mencakup A → B → tambah → B, semua defaults/draft, error/recovery/array ID, submit ganda, saved lock, StrictMode, respons sukses/422/500 A → B → A, callback lama dan gambar tertunda/gagal/retry. Komponen/form/query/picker visual memakai adapter sesuai batas handoff developer.

Tambahan [production-hooks.cjs](production-hooks.cjs) menjalankan route/editor, React/RHF/Zod, QueryClient/useQuery, hooks Role/Karyawan/Toko, factory API, `api/common.ts`, `usePostRequest`, error mapper dan helper multipart **produksi**. Axios memakai custom adapter yang menangani seluruh request dalam proses; client auth/SecureStore produksi tidak dijalankan. Foto memakai Blob/FormData Node dan fixture fetch memori. Tidak ada HTTP/network/backend write atau data pengguna.

Integrasi mengonfirmasi:

- Query detail dan prasyarat memakai path produksi serta menghidrasi form. Loading mutation benar-benar menonaktifkan aksi saat request berjalan.
- PUT Role A tetap menargetkan A sesudah route berpindah B; invalidasi asli `roles`, detail A dan `workers` berjalan. Refetch tidak menimpa draft B dan respons A tidak membuka modal/lock B.
- Resolver produksi men-trim nama dan menghapus duplikasi hak akses. Error Axios 422 diproses mapper asli; `permissions.0` terkumpul pada field permissions. Retry ganda menghasilkan satu mutation dan sukses mengunci editor.
- Dua submit Karyawan sebelum foto selesai hanya melakukan satu persiapan. Berpindah B sebelum foto A selesai menghasilkan nol mutation dari editor A.
- Update Karyawan B memakai POST endpoint B, multipart `_method=PUT`, kedua foto dan role/toko yang sesuai; password tidak dikirim pada update. Berpindah ke tambah saat request B berjalan mempertahankan draft tambah; invalidasi detail B tetap berjalan tanpa mengubah modal/lock editor baru.
- Create Karyawan memakai POST koleksi, password/konfirmasi dan tanpa override; satu mutation dan saved lock sesuai kontrak.

Percobaan awal runner integrasi berhenti ketika import relatif `./axios` belum diarahkan ke transport fixture, sehingga VM tidak menyediakan `process` untuk konfigurasi environment. Loader diperbaiki untuk menangani import relatif serta alias. Tidak ada perubahan source aplikasi atau request nyata pada percobaan tersebut. Hasil 34/34 berasal dari eksekusi lengkap setelah koreksi adapter; tidak diklaim sebagai kegagalan produk.

## Batas persetujuan dan serah terima

Form controls/permission editor/uploader visual, modal, navigation params, auth dan fetch foto memakai adapter. Dua route produksi dipakai, tetapi layout owner/root navigator/browser/native/SSR/keyboard/aksesibilitas/Figma tidak diuji. Axios adapter membuktikan kontrak path/method/payload/error/cache; bukan bukti server menerima payload, bearer auth, persistence atau upload native. Bukti browser/Laravel Oktober 8 tetap histori pada hash editor lama.

Request yang sudah dikirim tetap dapat selesai dan menginvalidasi cache sesuai kontrak. Guard mencegah efek UI editor lama dan request setelah persiapan foto yang terlambat; tidak membatalkan transaksi server. TypeScript terfokus developer cocok bukti/manifest dan direview, tidak dijalankan ulang QC/global paralel. PM tetap perlu gate tipe/lint integrasi snapshot akhir.

Tidak ditemukan temuan P1/P2 baru pada cakupan delta yang diuji. Source aplikasi/backend/dependency/harness developer, server/HP, branch/index, commit/push dan PDF snapshot sebelumnya tidak diubah QC. Bukti sendiri tersedia pada [verification.json](verification.json), [results.json](results.json), [production-hooks-results.json](production-hooks-results.json) dan [quality-results.json](quality-results.json). Sinyal lewat workspace, tanpa klaim sesi lain menerima percakapan langsung.
