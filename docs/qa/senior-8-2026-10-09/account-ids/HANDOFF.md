# ACCOUNT-ID-001 - ID akun tidak berbenturan

9 Oktober 2026. **READY_FOR_QA -> QC -> PM**; belum approval independen. Scope hanya initializer `addAccount` dalam `store/accountingStore.ts`.

Dua akun yang ditambahkan pada milidetik sama sebelumnya mendapat ID yang sama. Akibatnya detail akun kedua menampilkan akun pertama, dan update/reset/delete berdasarkan ID mengenai kedua record. Action kini menambahkan suffix pertama yang belum dipakai jika ID timestamp sudah ada, mengikuti pola action Expense/Income/Ledger existing. Format tanpa collision tetap timestamp string; payload, append order, return ID dan action lain tetap. Manifest membuktikan source di luar initializer addAccount identik baseline setelah normalisasi EOL.

Bukti produksi:

- Baseline store **12 lulus/13 gagal** -> **25/25 lulus**: collision, suffix/gap, jam mundur, input frozen, burst 50, subscriber reentrant, serta isolasi update metadata/saldo/reset/delete dan totals.
- Baseline integrasi **31 lulus/8 gagal** -> **39/39 lulus**, runtime/React error 0: 30 regresi detail akun + 9 assertion penambahan dua akun dengan clock tetap dan mutasi independen. Total **64 eksekusi assertion**, termasuk cakupan berulang.
- ESLint/Biome/diff-check store exit 0; TypeScript root store + dependency closure 0 diagnostic. Layar detail sudah mendapat focused types pada batch sebelumnya; source layar tidak berubah di sini.
- [verification.json](verification.json) mencatat fingerprint baseline/source/loaded dependencies/shared harness/bukti. Snapshot store baseline `af135733...` memuat patch Ledger sebelumnya.

Reproduksi dari root aplikasi:

```powershell
node docs/qa/senior-8-2026-10-09/account-ids/store-check.cjs --baseline
node docs/qa/senior-8-2026-10-09/account-ids/integration.cjs --baseline
node docs/qa/senior-8-2026-10-09/account-ids/store-check.cjs
node docs/qa/senior-8-2026-10-09/account-ids/integration.cjs
node docs/qa/senior-8-2026-10-09/account-ids/quality.cjs
node docs/qa/senior-8-2026-10-09/account-ids/manifest.cjs
```

Baseline sengaja exit 1. Runner menggunakan loader/writer historical Ledger dan regresi detail akun dengan anchor tervalidasi, mengganti setup/skema fixture/clock/baseline dan output folder; tidak mengubah source aplikasi yang dimuat. QA/QC simpan replay di output sendiri. Tidak memasang dependency.

Uniqueness berlaku terhadap akun yang masih ada dalam satu store memori. Bukan global/distributed ID, tombstone atau migrasi duplicate ID historis. Runtime Date.now tetap pada fixture; tidak ada data pengguna/API/persistensi/backend. Screen memakai host/router/formatter adapter, bukan tes UI native/browser/Figma/full router. Tidak mengambil action jurnal/Income/Expense/ledger atau source sesi lain, tidak mengubah server/HP/Metro/dependency/fullTS/branch/index/commit/push.

Dependency store berubah untuk paket sebelumnya. Bukti ACCOUNT-DETAIL-001 dan LEDGER-ID/IDENTITY/FILTERS tetap snapshot historis; approval setiap delta perlu hash masing-masing, bukan otomatis lolos dari regresi batch ini.

Execution Profile & Operator Tips: Medium untuk identitas record/mutasi. QA cocokkan hash -> create same-clock -> edit/reset/delete masing-masing -> QC -> PM integrasi. Jangan menganggap suffix ID sebagai pencegah double-submit: dua panggilan add tetap menciptakan dua record berbeda.
