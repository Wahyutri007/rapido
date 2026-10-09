# SD3-010 detail Role, Karyawan dan Member

Pemilik: **Codex-3**, profil `D:/Codex-3`. Status: **READY_FOR_QA_QC**, 9 Oktober 2026. Review internal terpisah lulus; keputusan QC eksternal dan gate publikasi tetap melalui PM.

Saat layar detail berpindah dari ID A ke B, state konfirmasi hapus milik parent sebelumnya masih terbuka. Child dialog sudah memiliki lifetime per ID, tetapi target B mewarisi konfirmasi A. Pencarian hak akses Role juga terbawa ke role berikutnya. Ketiga default screen sekarang mengembalikan private Content dengan `key={id ?? ""}`. Semua hook dan body asli berada di Content. ID berbeda, hilang atau kosong memulai state baru; refetch ID yang sama mempertahankan konfirmasi dan pencarian.

Source yang berubah:

| Source | SHA-256 final |
| --- | --- |
| [RoleDetailScreen.tsx](../../../../components/feature/manage/roles/RoleDetailScreen.tsx) | `47f049ce90f45aadadd1589945e4afab0551baec16ece34940fe195522a3f5c2` |
| [WorkerDetailScreen.tsx](../../../../components/feature/manage/workers/WorkerDetailScreen.tsx) | `7ac2a60ab639388ac78f401b51a2d4f26f9d7eb0af7efc31552c32de348ebc46` |
| [MemberDetailScreen.tsx](../../../../components/feature/manage/member/MemberDetailScreen.tsx) | `1a3b6b16545c6a3425b320f2bd1dad9309610272f61215cf936670ef6337dfd0` |

Reproduksi developer menggunakan 75 assertion yang sama: baseline **34 lulus/41 gagal**, final **75/75 lulus**, runtime/React/act error 0. Cakupan meliputi konfirmasi A ke B dan kembali, ID hilang/kosong, loading/error data B, refetch ID sama, respons DELETE sukses/gagal yang terlambat, unmount, acknowledgement sukses sekali, route edit dan pencarian hak akses. Kegagalan baseline berulang per domain, bukan 41 cacat berbeda.

Runner memuat 24 module produksi: tiga detail, tiga dialog hapus, shared modal, useAlertModal, helper/error, mutation hook, factory dan error mapper. React StrictMode, QueryClient dan Axios menjalankan DELETE melalui adapter lokal. GET query state diatur oleh adapter eksplisit; presentation, router, RoleWorkers dan avatar adalah fixture. Permintaan fixture A yang sudah dimulai tetap selesai, tetapi hasil atau callback lama tidak mengubah B ataupun menavigasi. Ini bukan pengujian pembatalan transport atau sertifikasi query GET/backend.

[Review independen internal](../../codex-3-internal-review/detail-identity-2026-10-09/REPORT.md) melaporkan **195/195 lulus**: 156 pemeriksaan state normal/StrictMode, 21 proof AST dan 18 fingerprint kontrak. Baseline independen memakai 156 state assertion yang sama: 122 lulus/34 gagal. Runtime/error/warning 0. Suite reviewer mengisolasi parent dengan adapter child dialog/query; hasilnya melengkapi suite developer dan tidak dihitung sebagai pengujian request baru. Statusnya **INTERNAL_QA_REVIEW_PASS**, `externalQcApproval:false`.

[Quality](quality-results.json) lulus: ESLint tiga source tanpa cache dengan max-warnings 0, Biome penuh tanpa diagnostic, scoped diff-check bersih, TypeScript tiga root dan declaration/import closure dari tsconfig aktual menghasilkan 0 diagnostic. AST body, parameter dan import asli identik. Menghapus boundary baru menghasilkan seluruh source baseline yang identik setelah normalisasi LF; JSX, copy, endpoint, loading/error, action dan public props tetap.

[Manifest](verification.json) membekukan fingerprint source, kontrak, input dan artefak. `baseline-first-results.json` disimpan untuk transparansi: runner awal memakai default argument yang membuat panggilan explicit undefined mempertahankan ID lama. Helper runner diperbaiki sebelum perubahan source; `baseline-results.json` adalah baseline sah untuk perbandingan final. Hasil awal 31/44 bukan baseline final dan tidak dijumlahkan ke hasil lulus.

Tidak ada pemeriksaan browser/native/HP/full router/root auth/Figma atau API nyata pada delta ini. Callable Figma tidak tersedia. Editor yang telah QC PASS, route, shared modal dan dialog domain tidak diedit. Paket SD3-006 sampai SD3-009 tetap histori frozen; fingerprint caller detail lama dalam inventaris modal tidak dianggap current setelah perubahan ini. Gunakan overlay SD3-010 untuk source detail terbaru, dan SD3-009 untuk bukti geometri/shared-modal sebelumnya. Tidak ada server restart, dependency install, stage, commit, push atau publikasi.

Execution Profile & Operator Tips: Medium untuk state per identitas dan respons asynchronous. Urutan hash match -> replay ke output baru -> QA perilaku -> QC kontrak -> PM. Bedakan pergantian ID dengan refetch ID sama; jangan menimpa paket frozen untuk replay.
