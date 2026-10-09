# SD5-003 — Login request — READY_FOR_QA

Software Developer Senior 5 / Codex-5 (`CODEX_HOME=D:/Codex-5`), 9 Oktober 2026, Asia/Jakarta. Label SD5-003 merupakan kelanjutan scope developer, bukan tiket PM baru. Kanal laporan: dokumen workspace/SESSION_COORDINATION.md; penerimaan sesi lain tidak diklaim. Satu source berubah: implementasi `useLoginRequest` dalam `api/hooks/auth.ts`. LoginScreen, AuthProvider, schema, helper request shared, logout/user-query, tampilan dan route tidak diubah.

## Masalah dan perilaku baru

Dua ketukan Masuk pada tick yang sama sebelumnya dapat mengirim dua POST `/login`: guard layar membaca `isLoading` dari render sebelumnya. Setelah POST sukses, helper shared memanggil callback `onSuccess` tanpa menunggu Promise; loading berakhir sebelum `auth.updateToken` selesai, dan rejection penyimpanan token/refetch dapat tidak tertangani. Respons sukses/error setelah halaman login unmount juga masih bisa memulai pembaruan token atau menulis error ke form lama.

Hook login kini memasang lock sinkron sebelum await. Loading mencakup POST dan `auth.updateToken`; call selesai setelah pembaruan auth selesai. Error 401/429 beserta sisa percobaan/waktu tunggu dipertahankan. Kegagalan transport atau pembaruan auth menampilkan error umum pada form, melepas loading, dan memungkinkan retry. Respons yang tiba setelah unmount tidak memulai pembaruan auth atau memasang error form. Callback submit yang ditahan setelah unmount tidak mengirim request. Screen yang baru mempunyai lock sendiri.

Caller layar tetap `await loginRequest.call(data)` dan `isDisabled={loginRequest.isLoading}`. Hook masih mengembalikan `{ call, isLoading }`; hasil transport mempertahankan tuple data/error, sementara exception pembaruan auth menjadi `[null, error]`. Submit yang ditolak lock/unmount mengembalikan `[null, null]` tanpa request; caller produksi tidak memakai tuple ini sebagai penanda sukses. Tidak ada dummy global, endpoint baru, perubahan kredensial atau penyimpanan backend.

## Bukti developer

- [Baseline](baseline-results.json) memakai `api/hooks/auth.ts` dari `acba0d92460c1af3149abc3775f09888a2943cab` dengan dependency yang sama: **56 lulus/18 gagal**. Dua rejection auth tidak tertangani tertangkap oleh listener harness dan tercatat; runtime/React/act error terpisah 0. Seluruh request fixture yang dikirim diselesaikan; tidak menahan refetch kedua seperti model baseline boot.
- [Final](final-results.json): **74/74 lulus**, runtime/React/act error 0, unhandled rejection 0. Cakupan: form kosong/invalid/email/password, mengetik melalui input, dua tekan tombol sebelum await, callback submit tertahan/rerender, payload/endpoint, loading transport+auth, delapan respons backend 401/429/500, draft tetap, retry, exception transport/auth, unmount sebelum respons dan saat commit, remount serta StrictMode. Route Lupa password juga diperiksa melalui handler layar produksi.
- ESLint satu source: baseline/final **0 error/0 warning**, tanpa suppression. Biome source dan diff-check scope lolos; delta ini memperbaiki perilaku, bukan diagnostic lint.
- [TypeScript](typecheck-results.json): hook login dan caller LoginScreen beserta dependency/deklarasi yang diimpor, **0 diagnostic**. Bukan typecheck seluruh proyek.
- [Manifest](verification.json) mengikat source/harness/hasil, mengonfirmasi AST modul selain `useLoginRequest` dan tambahan import React tidak berubah, serta mencatat kontrak baca dan batas adapter. Source belum di-commit pada batch developer ini.

[Harness](check.cjs) menjalankan LoginScreen, RHF `useForm`/Controller/FormProvider, Zod/login schema, hook auth, factory mutation dan usePostRequest produksi. React Query client, HTTP Common, AuthProvider/updateToken, presentasi/native inputs, shared visual Form/Wrapper/auth background, modal/actionsheet/router memakai adapter. Input adapter meneruskan onChange ke Controller produksi dan tombol Masuk menjalankan `form.handleSubmit` produksi. Auth commit menggunakan Promise tertunda yang dapat berhasil/gagal; tidak menulis SecureStore atau menghubungi API. Hanya deprecation react-test-renderer 19 difilter; rejection baseline dicatat, bukan disembunyikan.

## Batas dan permintaan QA/QC

POST yang sudah dikirim tidak dibatalkan. `auth.updateToken` yang **telah dimulai saat mounted** tetap dapat menyelesaikan pekerjaan setelah unmount; hook hanya menahan commit yang belum dimulai serta error/loading ke UI lama. Lock berlaku per instance login, bukan koordinasi login/logout lintas layar/perangkat. Atomic token/query state, pembatalan/retry internal AuthProvider, permission/guard seluruh aplikasi dan fungsi logout berada di luar delta ini. Tidak mengklaim bahwa user-query/provider nyata sudah diuji oleh adapter.

QA/QC: cocokkan hash, ulangi harness ke output reviewer sendiri, lalu uji login nyata pada browser/Android dengan dua ketukan, POST cepat dan penyimpanan/refetch lambat atau gagal, 401/429, navigasi keluar sebelum respons, kembali ke login dan retry. Periksa tombol tetap disabled sampai fase auth selesai, draft/error tetap benar dan navigasi root guard mengikuti provider. Browser/native/SSR/keyboard/scroll/Figma parity/API/storage nyata belum diuji ulang pada hash ini. Akses metadata Figma page `0:1` berhasil pada sesi ini; tidak ada perubahan desain dan metadata bukan sertifikasi visual. Server/HP tetap mengikuti koordinasi PM/QC.

SD5-002 boot masih READY_FOR_QA dan SD5-001 memiliki QC PASS_DELTA_FOR_PM_REVIEW pada keputusan terpisah. Approval lama tidak mencakup hook login ini. Publikasi/merge mengikuti gate PM setelah review; tidak commit/push baru.

Perintah dari root aplikasi; baseline sengaja exit 1:

```powershell
node docs/qa/senior-5-2026-10-09/login/check.cjs --baseline
node docs/qa/senior-5-2026-10-09/login/check.cjs
node docs/qa/senior-5-2026-10-09/login/typecheck.cjs
node node_modules/eslint/bin/eslint.js api/hooks/auth.ts
node node_modules/@biomejs/biome/bin/biome check api/hooks/auth.ts
```

Alat React/react-test-renderer 19.2.3 terisolasi yang sudah tersedia pada `.expo/senior7-test-tools/node_modules`; alternatif melalui `RAPIDO_TEST_TOOLS`. RHF/Zod/TypeScript memakai dependency proyek. Tidak memasang dependency aplikasi baru.

Execution Profile & Operator Tips: High untuk async auth commit/lifetime. Reproduksi → satu hook → checks terfokus → QA perilaku/QC → gate PM. Jangan mengubah helper HTTP/provider shared untuk tiket ini atau menganggap commit auth yang telah dimulai bisa dibatalkan. Hindari TypeScript global/bundle paralel dan jangan mengoperasikan server/HP sesi lain.
