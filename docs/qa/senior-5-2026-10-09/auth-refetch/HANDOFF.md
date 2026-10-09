# SD5-005 — koreksi provider setelah QC Login

Software Developer Senior 5 / Codex-5 (`D:/Codex-5`), 9 Oktober 2026. **READY_FOR_QC_RECHECK** melalui dokumen workspace untuk QA/QC/PM. QC-LOGIN-001 dan QC-LOGIN-002 tetap OPEN pada keputusan QC sampai review source koreksi; developer tidak menutup keputusan independen atau menyetujui publikasi.

Saat POST login berhasil tetapi validasi `/user` gagal, provider sebelumnya menyelesaikan `updateToken` tanpa error. Form berhenti loading tanpa memberi penjelasan. `updateToken` kini memakai `refetch({ throwOnError: true })`, sehingga hook login yang sudah ada menampilkan pesan kesalahan dan melepas tombol untuk mencoba kembali. Retry lengkap sampai autentikasi dan redirect aktual teruji.

Source aplikasi yang berubah hanya [context/AuthContext.tsx](../../../../context/AuthContext.tsx). Loader stabil memakai dependency `refetch` yang bound oleh QueryObserver, bukan keseluruhan object query yang berubah tiap render. Callback Promise storage memuat token dan menyelesaikan loading; initial loading sudah true, sedangkan `reloadAuth` mengaktifkannya dari caller. Effect memakai dependency loader dan cleanup menandai pembacaan bootstrap lama tidak aktif. Hasil storage dari effect StrictMode yang dibersihkan atau provider yang unmount tidak memulai validasi user. Token/query yang sudah diproses sebelum cleanup tidak di-rollback.

Tidak memakai suppression lint atau timer penundaan. `getItemAsync` native dan web pada source terpasang keduanya async/Promise; loading diselesaikan lewat callback Promise eksternal. Public type/useAuth, role/permission helpers, JSX context value, signOut/cache-clearing dan updateToken selain opsi refetch identik baseline setelah normalisasi EOL. Hook login, caller/shared Form, boot dan guard tetap pada source sebelumnya. Hash dan pemeriksaan batas delta ada di [verification.json](verification.json).

## Bukti developer

| Pemeriksaan | Baseline | Final |
| --- | --- | --- |
| Login/Form/Query/provider dan lifecycle tambahan | 80 lulus / 5 gagal | **85/85 lulus** |
| Boot dengan provider dan guard saat ini | Bukti lama dipertahankan | **64/64 lulus** |
| Guard dengan provider saat ini | Bukti lama dipertahankan | **105/105 lulus** |
| ESLint provider | 1 error / 2 warning | **0 error / 0 warning** |
| Biome provider | Diagnostic existing dalam paket QC | **exit 0** |
| TypeScript lima root dan dependency/deklarasi yang diimpor | — | **0 diagnostic** |
| Diff-check source/dokumentasi scope | — | **exit 0** |

Hasil [baseline](baseline-results.json), [integrasi final](final-results.json), [boot](boot-regression/final-results.json), [guard](guard-regression/final-results.json), [tipe](typecheck-results.json) dan [quality](quality-results.json). Runtime/React/act error serta unhandled rejection integrasi **0**; boot/guard runtime **0**. Assertion suite tumpang tindih; jumlah tersebut bukan persentase proyek atau pemeriksaan independen QC baru.

Lima kegagalan baseline: tiga gejala QC-LOGIN-001, GET dari hasil storage effect StrictMode yang sudah dibersihkan, dan GET setelah provider unmount sebelum storage selesai. Menambah dependency loader tanpa memastikan identitas stabil akan mengulang bootstrap; pemeriksaan rerender dan completion query memastikan satu pembacaan/validasi untuk bootstrap normal. Kasus sukses, 401/429, storage commit tertunda/gagal, `/user` gagal, retry lengkap dan double press, form draft, login unmount/remount, bootstrap token valid/hilang/kedaluwarsa/storage reject, reloadAuth sukses/hilang/storage reject/query error, signOut/cache, helpers owner dan StrictMode provider tercakup.

Implementasi awal berbasis async try/finally lolos perilaku tetapi masih ditandai lint set-state-in-effect. Snapshot dan hasilnya di [intermediate/](intermediate/); itu bukan source final. Pemrosesan akhirnya memakai callback Promise storage dan lolos quality tanpa suppression. Source final kembali diuji oleh ketiga suite.

## Kontrak harness dan batas

[check.cjs](check.cjs) berasal dari runner QC Login yang disalin dan diadaptasi; [harness-provenance.json](harness-provenance.json) mencatat asal dan perubahan. Runner mengeksekusi 13 modul produksi termasuk LoginScreen/shared Form/RHF/Zod, hook/factory/usePostRequest, Common/error mapper dan AuthProvider. Axios serta TanStack React Query/core adalah library aktual; request Axios dan SecureStore memakai adapter memori, native/presentation memakai host adapter. Query fixture memakai `retry:false`, `staleTime:Infinity`, `gcTime:Infinity`; retry jaringan/background production belum disertifikasi.

Guard **aktual SD5-004** dipakai pada kedua mode, dengan RAF yang mengembalikan ID dan bisa dibatalkan. Baseline hanya mengganti provider dengan snapshot sebelum koreksi, tidak memakai guard lama yang dibekukan QC. Suite ini adalah pemeriksaan developer, bukan keputusan QC baru. StrictMode tambahan mencakup provider/subtree; efek bootstrap yang dibersihkan tetap boleh melakukan read storage, tetapi hasilnya tidak dipakai untuk GET/commit state. Panggilan reloadAuth/updateToken yang sudah berjalan tidak dibatalkan sebagai transaksi global.

Replay boot/guard disimpan dalam folder supplement ini; paket lama tidak diubah. Adapter query guard diselaraskan agar `refetch` stabil seperti bindMethods QueryObserver aktual. Boot memakai adapter stabil yang sudah ada. Browser/native/SSR, keyboard/scroll/layout/Figma parity, HTTP/backend/SecureStore nyata, full navigator/role/store, concurrency lintas instance/login-logout dan atomic token/query tidak diuji di batch ini. Gagal `/user` dapat meninggalkan token tersimpan sesuai kontrak existing; perubahan ini meneruskan kegagalan ke form dan tidak menambahkan rollback token/cache.

## Recheck yang diminta

QC diminta mencocokkan hash provider/kontrak, replay ke output sendiri, memeriksa QC-LOGIN-001 dan quality QC-LOGIN-002 pada source aktual, lalu memeriksa bootstrap/reloadAuth/signOut/StrictMode dengan guard baru. QA perlu memeriksa error/retry/loading pada browser/Android aktual dan validasi penyimpanan token/perpindahan halaman. Paket SD5-001/boot/login/guard serta keputusan QC historis tetap utuh; approval boot lama tidak meluluskan dependency provider/guard baru. PM tetap pemilik integrasi/publikasi.

Jalankan dari root aplikasi, baseline sengaja exit 1:

```powershell
node docs/qa/senior-5-2026-10-09/auth-refetch/check.cjs --baseline
node docs/qa/senior-5-2026-10-09/auth-refetch/check.cjs
node docs/qa/senior-5-2026-10-09/auth-refetch/boot-regression/check.cjs
node docs/qa/senior-5-2026-10-09/auth-refetch/guard-regression/check.cjs
node docs/qa/senior-5-2026-10-09/auth-refetch/typecheck.cjs
node node_modules/eslint/bin/eslint.js context/AuthContext.tsx
node node_modules/@biomejs/biome/bin/biome check context/AuthContext.tsx
```

Alat React/react-test-renderer 19.2.3 terisolasi di `.expo/senior7-test-tools/node_modules` sudah tersedia. Tidak memasang dependency aplikasi atau mengoperasikan backend/Metro/server/HP, branch/index/commit/push pada batch ini.

Execution Profile & Operator Tips: High untuk shared auth lifecycle dan kontrak refetch. Baseline -> provider -> Query integration/lifecycle -> boot/guard -> quality terfokus -> QA/QC recheck -> PM. Cocokkan snapshot/hash, jaga output/harness lama dan sertifikasi perangkat terpisah dari hasil fixture.
