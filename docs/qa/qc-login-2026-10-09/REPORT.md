# QC SD5-003 — Login — 9 Oktober 2026

**CHANGES_REQUESTED** untuk integrasi Login. Sinyal **QC-LOGIN-20261009-CHANGES-REQUESTED** untuk Senior5/QA/PM lewat workspace. Review QC selesai; dua temuan provider masih **OPEN**. Kelulusan fixture hook developer tidak menyelesaikan sambungan provider aktual. PM tetap pemilik integrasi/push Git.

## Hasil

| Pemeriksaan | Lolos | Gagal |
| --- | ---: | ---: |
| Replay developer pada source saat ini | 74 | 0 |
| Integrasi QC dengan provider/query/Form produksi | 44 | 3 |
| Gabungan eksekusi source saat ini, termasuk cakupan berulang | 118 | 3 |
| Kandidat satu baris provider pada salinan | 47 | 0 |

Runtime/React/act dan unhandled rejection dua hasil final: **0**. Kandidat TypeScript terfokus dengan hook/screen dan dependency yang diimpor: **0 diagnostic**. Kandidat belum diterapkan dan belum lolos quality provider; angka assertion bukan persentase progres proyek. Bukti [replay](final-results.json), [integrasi](integration-results.json), [kandidat](proposal-results.json), [tipe kandidat](proposal-typecheck-results.json).

## Temuan

**QC-LOGIN-001 — P2 OPEN:** POST /login berhasil lalu token disimpan, tetapi GET /user gagal500. React Query menjadi error/idle; provider tetap anonymous. Form berhenti loading tanpa pesan error dan call hook mengembalikan tuple data/null. Reproduksi memakai provider/Common/Query aktual, termasuk tombol Masuk/FormMessage produksi. Tiga assertion gagal berasal dari satu masalah ini. Observasi Query, endpoint, token tersimpan, hasil call dan form tersedia dalam integration-results.json.

Source penyebab ada di context/AuthContext.tsx:78. await userQuery.refetch() menyelesaikan Promise dengan hasil query error tanpa melempar pada opsi default. Hook menangani rejection, tetapi provider tidak meneruskannya. Source provider sama dengan baseline Git setelah normalisasi EOL: **temuan existing pada sambungan provider, bukan regresi perubahan hook**. Tidak ada navigasi home palsu yang ditemukan; provider tetap anonymous dalam reproduksi.

**QC-LOGIN-002 — P3 OPEN:** provider memiliki ESLint **1 error/2 warning** (set-state-in-effect, exhaustive-deps, unused variable), serta Biome **1 error/1 warning** (dependency effect dan unused variable). Baseline dan kandidat sama; patch fungsional tidak menambah diagnostic atau membersihkan diagnostic lama. Pemilik perlu memperbaikinya dengan regresi lifecycle provider; jangan menambahkan dependency loadToken yang belum stabil secara otomatis.

## Usulan fungsional

[auth-refetch.patch](auth-refetch.patch) mengubah satu panggilan di updateToken menjadi `await userQuery.refetch({ throwOnError: true });`. Dengan opsi itu, hook existing menerima error lalu menampilkan pesan umum dan melepas loading untuk retry. [Salinan provider](proposal/AuthContext.tsx) lolos47 pemeriksaan, termasuk success, dua tekan, storage tertunda/gagal, GET gagal, 401/429, draft, hasil setelah unmount/remount, dan StrictMode subtree Login.

Patch belum di-apply. Hash kandidat: `f5cd57ee8a6eb4bcad41e056c8aa25ff4d8bf0a263246b1a16115b63c7c51ec0`. Hanya satu panggilan berubah; return/JSX dan logika loadToken/sign-out tidak diubah. apply --check exit0. Type kandidat0diagnostic. **Quality provider masih gagal:** ESLint1/2 dan Biome1/1 sama dengan baseline. Ini usulan fungsional untuk pemilik, bukan persetujuan source provider/publikasi.

## Quality, hash, dan koordinasi

Hook login ESLint **0 error/0 warning**, Biome/diff exit0. AST modul auth selain useLoginRequest dan import React cocok baseline; logout, user-query, schema error, endpoint dan DTO tetap. [Quality](quality-results.json) membedakan pemeriksaan bukti yang valid dari provider yang belum bersih.

| Source reviewed | SHA-256 |
| --- | --- |
| api/hooks/auth.ts | `33424d421de5d6a7ba7bdfe6adf8eca5ab0d31a39ab42f159797882cd5c9beca` |
| context/AuthContext.tsx | `f31182398af070ff77b84538653ec5e7ceff176965a6982a44de268f7620ae6c` |

17 fingerprint handoff cocok sebelum replay. Snapshot30 berkas dibuat sebelum tes;29 tetap cocok saat final. Guard berubah sesudah integrasi47 oleh Senior5 SD5-004. Byte guard yang benar-benar diuji (0a8913f8...) direkonstruksi persis dari Git ke fixture sendiri, dan kandidat memakai byte tersebut. **Guard baru ffe42686... tidak direview/disetujui oleh paket ini.** Source/hash hook/provider, bukti developer lain serta13 modul produksi yang diuji tetap cocok. Paket lama dan hasil awal dipertahankan; lihat [harness-notes](harness-notes.json).

Integrasi memuat LoginScreen, shared Form/Input/Field/Message/RHF/Zod, hook auth, factory/usePostRequest/Common/error mapper, AuthProvider serta Query/Axios produksi. Primitive/native, auth background, router/RAF dan SecureStore memakai adapter memori. Query fixture retry:false/staleTime:Infinity/gcTime:Infinity; bukan sertifikasi retry jaringan/background produksi. StrictMode hanya subtree Login; provider berada di luar. Tidak HTTP/API/backend/DB/persistensi nyata.

## Handoff

Senior5/pemilik AuthProvider dan PM diminta menilai koreksi shared provider, menyelesaikan dua temuan, menjalankan regresi token/loadToken/updateToken/reloadAuth/sign-out/boot yang sesuai, lalu mengirim hash/bukti baru. QC menutup temuan setelah source aktual diperiksa ulang; uji regresi dengan guard terbaru melalui paket guard terpisah. Pertahankan paket QC ini, jalankan ulang runner ke folder bukti baru.

Boot tetap keputusan delta source yang terpisah; Penerimaan tiga temuan OPEN belum dikoreksi. Source aplikasi/backend/dependency/harness developer, Metro/server/HP, Git branch/index/commit/push dan PDF historis tidak diubah. Figma callable tidak tersedia di sesi QC; tanpa visual/browser/HP/SSR/full auth/full app approval. Call/token/query atomicity dan login/logout lintas instance tidak disertifikasi.

Execution Profile & Operator Tips: High. Koordinasi pemilik provider -> hash baru -> validasi sambungan Query/error -> regresi lifecycle -> quality -> recheck QC -> PM. Pisahkan patch fungsional47PASS dari source aktual dan quality yang masih terbuka.
