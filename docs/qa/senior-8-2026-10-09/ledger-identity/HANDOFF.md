# LEDGER-IDENTITY-001 - akun pada detail Buku Besar

9 Oktober 2026. **READY_FOR_QA**, kemudian QC dan gate PM. Label batch lanjutan Senior 8 atas batas legacy yang dicatat [QC filter](../../qc-ledger-filters-2026-10-09/REPORT.md), bukan tiket PM atau persetujuan independen baru.

ID yang hilang/tidak dikenal sebelumnya menampilkan header, transaksi dan saldo akun pertama. Layar sekarang memakai state existing **Akun tidak ditemukan**. ID valid memilih akun tepat; menghapus akun yang sedang dilihat tidak menggantikannya dengan akun lain. Parameter `string[]` memakai elemen pertama mengikuti pola route modify Jurnal dan Penyesuaian; elemen pertama kosong tidak mencari alternatif berikutnya. Pencocokan ID tetap persis, tanpa trim atau perubahan kapitalisasi.

Scope source hanya `app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx`: tipe parameter, normalisasi ID, dan resolver account. Imports serta seluruh source mulai deklarasi rawEntries sampai akhir identik dengan baseline setelah normalisasi line ending. JSX/not-found copy/filter/totals/store/navigation tidak diedit. Pelanggaran UI legacy tidak direfaktor dalam patch perilaku ini; callable Figma tidak tersedia dan tidak ada klaim parity.

## Bukti

- Baseline hash `f8411152...` sama dengan source yang mendapat QC-LEDGER-FILTERS-20261009-PASS-DELTA: **39 lulus, 12 gagal**.
- Final: **51/51 assertion lulus**, 0 error runtime/React. Termasuk 31 regresi filter sebelumnya dan 20 pemeriksaan identitas akun; cakupan berulang dihitung sebagai eksekusi assertion.
- Screen lengkap dan Zustand produksi pada React StrictMode, Date.now tetap. Kasus: ID tidak dikenal/hilang/kosong/whitespace/array, A ke B, koleksi berubah urutan, akun dipindah/hilang/dipulihkan, entri tanpa akun, koleksi kosong lalu terisi, pencarian lintas akun. Semua snapshot memeriksa header, row dan summary agar data akun lain tidak muncul sebagai pengganti.
- ESLint satu source: 0 error/warning. Biome check dan git diff-check source: exit 0 (Git memberi pemberitahuan konversi LF/CRLF).
- TypeScript roots store + screen dan dependency closure: 0 diagnostic. Bukan full-project gate.
- [verification.json](verification.json) merekam SHA-256 source yang benar-benar dimuat, baseline, dependency, shared harness, runner dan hasil. `manifest.cjs` memastikan source tes sama dengan disk serta source di luar resolver tidak berubah.

## Reproduksi

Jalankan dari root aplikasi:

```powershell
node docs/qa/senior-8-2026-10-09/ledger-identity/check.cjs --baseline
node docs/qa/senior-8-2026-10-09/ledger-identity/check.cjs
node docs/qa/senior-8-2026-10-09/ledger-identity/typecheck.cjs
node node_modules/eslint/bin/eslint.js 'app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx' --max-warnings 0 --format json --output-file docs/qa/senior-8-2026-10-09/ledger-identity/lint.json
node docs/qa/senior-8-2026-10-09/ledger-identity/manifest.cjs
```

Baseline sengaja exit 1. Runner memakai historical `../ledger-filters/check.cjs` dengan anchor yang wajib unik, mengganti path baseline, clock, StrictMode, dan menambah skenario; tidak mentransformasi source aplikasi. Hasil tersimpan hanya di folder ini. QA/QC perlu menyalin output ke folder sendiri agar bukti developer tidak ditimpa. Runtime renderer memakai tooling lokal `.expo/senior7-test-tools`; tidak memasang dependency baru.

Parameter router, RN/common/presentation children adalah adapter; assertion memeriksa props yang diteruskan screen, bukan klik navigasi/visual native. State fixture proses Node terisolasi, tidak memakai data pengguna/API/DB/persistensi. Browser, geometri, accessibility, Figma, otorisasi backend dan full app belum diverifikasi.

Approval filter lama berlaku pada hash lama. Hash screen baru perlu review tersendiri. Dependency store `af135733...` berasal dari [LEDGER-ID-001](../ledger-ids/HANDOFF.md) dan tetap punya gate QA/QC sendiri. Bukti paket sebelumnya dipertahankan. Tidak ada perubahan server/HP/Metro/config/dependency, commit/push/merge atau operasi branch/index.

Execution Profile & Operator Tips: Medium untuk sinkronisasi akun dan route. QA cocokkan hash -> replay isolated -> QC perilaku -> PM integrasi. Bedakan not-found karena parameter/koleksi dari otorisasi; jangan menyamakan tes fixture ini dengan bukti router native atau persetujuan seluruh keuangan.
