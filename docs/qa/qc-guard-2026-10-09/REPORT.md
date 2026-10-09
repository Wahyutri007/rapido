# QC SD5-004 — Guard — 9 Oktober 2026

**PASS-DELTA** untuk pembatalan frame redirect pada satu hash `hooks/useProtectedRoute.ts`. Sinyal **QC-GUARD-20261009-PASS-DELTA** tersedia untuk Senior5/QA/PM melalui workspace. Tidak ada temuan baru pada delta Guard yang diuji. Integrasi dan publikasi Git tetap ditangani PM.

## Hasil

| Pemeriksaan | Lolos | Gagal |
| --- | ---: | ---: |
| Replay developer ke folder QC | 105 | 0 |
| Tambahan integrasi QC | 46 | 0 |
| Gabungan assertion, mencakup pengujian berulang | 151 | 0 |

Runtime/React/act error dan unhandled rejection: **0**. ESLint hook: **0 error/0 warning**; Biome dan scoped diff-check exit **0**. Pemeriksaan AST/token independen membuktikan daftar public route, predicate onboarding/public/index, kondisi redirect, tujuan, serta dependency effect sama dengan baseline Git acba0d9. Perubahan hanya lifetime frame; bukan perubahan kebijakan route.

Source yang disetujui: **ffe42686c7f18ec481583d9670b96614553d4079b011555c00bde6062f0643e2**. Salinan byte tersedia di [guard.reviewed.ts.txt](guard.reviewed.ts.txt). Tipe terfokus developer: **0 diagnostic**, bukti dan fingerprint direview, tidak dijalankan ulang oleh QC. Ini bukan pemeriksaan TypeScript seluruh proyek atau provider terbaru.

## Kontrak provider dan integritas bukti

Provider di workspace sudah berubah ketika QC mulai karena Senior5 mengerjakan SD5-005. Gate fingerprint pertama berhenti sebelum replay; lihat [handoff-changes.json](handoff-changes.json). QC memakai byte produksi provider **f31182398af070ff77b84538653ec5e7ceff176965a6982a44de268f7620ae6c** yang persis tercatat di handoff Guard, dari snapshot raw QC Login yang diverifikasi ulang. Provider tersebut disimpan dalam [fixture](fixtures/AuthContext.tsx.txt). Ini bukan provider palsu, namun versi produksi historis yang terikat pada kontrak handoff.

15 dari 16 fingerprint handoff cocok dengan disk; satu provider cocok dengan fixture yang diisolasi. Selama tes hingga finalisasi, **31 berkas disk + 1 fixture provider** tetap cocok dengan snapshot. Seluruh hash modul yang dimuat cocok. Source Guard aktual dari disk dimuat pada kedua suite. Restorasi output path dan read seam provider menghasilkan runner developer persis; skenario/assertion replay tidak diubah. Provider workspace terkini **tidak diuji/disetujui** dalam keputusan ini.

## Perilaku yang diuji

Replay mencakup 72 kombinasi policy (18 route × authenticated true/false × loading true/false), serta kasus pembatalan/queue/lifetime dan integrasi provider. Tambahan QC menghubungkan Guard aktual dengan LoginScreen, shared Form, auth hook, Common, Axios, Query, dan provider handoff:

- Login melalui tombol/form asli, dua penekanan dalam satu event, satu POST dan satu token write; GET user menunggu storage. Login selesai di route privat membatalkan redirect anonymous yang masih menunggu.
- Pengguna tervalidasi pada onboarding memperoleh frame home. Pindah ke route kasir sebelum frame berjalan membatalkannya sehingga route pilihan tidak ditimpa.
- Sign-out provider asli menghapus token/query dan membatalkan frame home. ReloadAuth mengaktifkan loading, membatalkan frame lama, lalu hanya frame baru yang menavigasi sesudah validasi selesai.
- Pindah dari route privat ke maintenance public, unmount/remount Guard, dan unmount root menolak callback lama yang sengaja dikirim setelah cleanup.
- StrictMode pada subtree Guard menjalankan setup-cleanup-setup ketika diremount setelah auth loading selesai: dua ID dibuat, hanya satu tetap aktif. Callback retired ditolak dan callback aktif menavigasi sekali.

RAF adapter menyimpan antrean aktif dan riwayat secara terpisah sehingga callback yang sudah dicabut dari antrean tetap dapat dikirim setelah cleanup untuk menguji flag active. Callback normal dikirim sekali. Cleanup tidak membatalkan navigasi yang sudah terjadi sebelumnya.

13 modul produksi dimuat, termasuk provider handoff dari fixture:

- `context/AuthContext.tsx`
- `api/factory.ts`
- `api/common.ts`
- `lib/api-utils.ts`
- `hooks/usePostRequest.ts`
- `constants/Keys.ts`
- `hooks/useProtectedRoute.ts`
- `app/(onboarding)/login.tsx`
- `api/hooks/auth.ts`
- `components/common/Form.tsx`
- `constants/Colors.ts`
- `constants/Fonts.ts`
- `schema/onboarding/login.ts`

Hasil: [replay](final-results.json), [integrasi QC](independent-results.json), [quality](quality-results.json), [keputusan](DECISION.json), dan [handoff developer](../senior-5-2026-10-09/guard/HANDOFF.md).

## Batas dan tindak lanjut

Persetujuan hanya delta hook pada hash tersebut. Tidak meluluskan seluruh auth/root navigator/aplikasi atau provider SD5-005 terbaru. Root layout dibaca sebagai kontrak; tidak dieksekusi. Fixture QueryClient memakai retry:false dan staleTime/gcTime:Infinity; root produksi memakai retry:2 dan staleTime:5 menit. IO transport/storage, route/segmen/frame dan host UI memakai adapter memori. StrictMode hanya subtree Guard, bukan sertifikasi bootstrap provider dalam StrictMode.

Tidak ada sertifikasi browser/Android/iOS, frame native, SecureStore/API nyata, SSR atau parity Figma. Callable Figma tidak tersedia pada sesi QC. Tidak ada perubahan route/screen atau source aplikasi oleh QC. Tidak ada HTTP/backend/DB/persistensi nyata, Metro/server/HP, dependency install/global TypeScript, Git branch/index/commit/push, maupun perubahan laporan PDF historis.

**QC-LOGIN-001 P2 dan QC-LOGIN-002 P3 tetap OPEN** sampai recheck independen handoff koreksi SD5-005. **QC-INCOME-001/002/003 tetap OPEN**. Kelulusan Guard tidak menutup temuan paket lain. QA/PM dapat memakai keputusan satu hook ini dan memeriksa ulang provider beserta kombinasi dependency terbaru sebelum integrasi/publikasi.

Quality pertama menandai perbedaan teks karena scanner QC mempertahankan trailing comma opsional pada call some(callback,), sementara printer developer menghapusnya. Token baseline dan current sebenarnya identik. QC memperbaiki perbandingan manifest secara terbatas dan mengulang quality; bukti awal dipertahankan. Itu masalah pembandingan harness, bukan kegagalan aplikasi. Lihat [harness-notes.json](harness-notes.json).

Paket ini dibekukan sebagai bukti review; hasil ulang untuk perubahan source disimpan pada folder baru. Sinyal melalui dokumen workspace, tanpa klaim chat lain telah menerima langsung.

Execution Profile & Operator Tips: High. Hash handoff → isolasi kontrak provider → replay → integrasi frame → quality → keputusan delta → QA/PM. Recheck provider baru secara terpisah dan pertahankan bukti historis.
