# QC recheck Jurnal — 9 Oktober 2026

**QC-JOURNALS-20261009-PASS-DELTA**. Temuan **QC-JOURNAL-001 P2 CLOSED** pada source final aplikasi. Indikator Seimbang kini mensyaratkan setiap nominal debit/kredit finite dan nonnegatif, sebelum memeriksa total finite/positif/seimbang. Dua hash final persis proposal QC sebelumnya; helper validator tetap sama.

| Source yang diperiksa | SHA-256 |
| --- | --- |
| `app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx` | `2d9373eb79548d4b4aa1b64c1cabe4164bcbad852c774110862f62338c074771` |
| `app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx` | `8e0d6a99c876cd4a40aae5c03762419e24404e014a4d27f9b91e2a81e148b32d` |
| `lib/accounting/journal-validation.ts` | `8ca27116734714fe2e37cf50ebdfd16cf4fc957f4d75f024ca52c6c4405ca8ca` |

Baseline dua route developer cocok hash yang diperiksa QC saat menemukan masalah. QC membandingkan seluruh AST: hanya initializer `isBalanced` berubah. Import, JSX, handler, schema/payload/validator dan kontrak lainnya tetap. Manifest final developer, bukti/proposal awal QC serta seluruh 36 fingerprint source/kontrak/artefak yang direkam cocok dan stabil; hash hasil tes cocok snapshot akhir.

## QA/QC pada source aplikasi final

| Pemeriksaan ulang QC | Hasil |
| --- | --- |
| Regresi validasi developer, output QC tersendiri | 187/187 |
| Regresi lifecycle developer, output QC tersendiri | 55/55 |
| Kasus QC independen, runner QC asli pada source final | 41/41 |
| Runtime/React error | 0 |
| ESLint tiga source, max-warnings 0 | Exit 0; 0 error/warning |
| Biome check/format dan diff-check | Exit 0 |
| JSX editor dibanding baseline | Sama |

Total **283 eksekusi assertion lulus**, termasuk cakupan regresi berulang. Seluruh tes memakai source aplikasi; **tidak memakai flag proposal**. Dua badge negatif melalui input/parser produksi dan dua badge NaN dari fixture store kini tidak menampilkan Seimbang. Simpan tetap menolak data invalid, menjaga draft dan lock; setelah nilai diperbaiki, badge benar, simpan satu kali berhasil dan ID baris/payload terjaga. Kalender dibatalkan, callback record yang dihapus, validasi salinan trim yang dibekukan, identitas editor/refetch/submit ganda juga lulus.

Runner developer disalin byte-identik, runner QC awal disalin byte-identik ke direktori recheck. Bukti/harness developer, hasil awal 279 lulus/4 gagal, dan hasil proposal dipertahankan. Laporan/keputusan awal CHANGES_REQUESTED adalah histori; [CURRENT_STATUS.md](../CURRENT_STATUS.md) menunjuk keputusan ini. Hasil developer 283 bukan digabungkan/dihitung ulang bersama 283 QC.

Percobaan awal recheck sudah lulus seluruh tes dan scoped checks, tetapi tracker QC belum memuat `JournalFormNotFound.tsx` yang dicatat runner lifecycle. Tracker dilengkapi memakai fingerprint hasil developer; seluruh suite diulang dan final cocok. Snapshot metadata awal disimpan pada `verification-incomplete-tracker.json`; tidak ada perubahan source aplikasi untuk koreksi tracker tersebut.

## Persetujuan dan batas PM

QA/QC delta lifecycle/validasi/indikator Jurnal lulus pada tiga hash dalam [DECISION.json](DECISION.json). PM dapat menilai publikasi setelah gate integrasi snapshot akhir. Ini menutup QC-JOURNAL-001; keputusan Role/Karyawan berada pada [paket terpisah](../../qc-role-worker-2026-10-09/REPORT.md), dan temuan startup/HP tetap gate lain.

Komponen route, React, Zustand, schema Zod dan parser/formatter produksi dijalankan dengan native/UI/modal/router/calendar adapters. Jurnal masih state contoh tanpa API/persistensi atau posting Buku Besar. Browser/native/root-auth/SSR/aksesibilitas/Figma/UI legacy/precision/ID global/default tanggal/kalender web/full aplikasi belum disertifikasi. Store ID patch Senior8 hanya dependency, bukan approval paket ID. Typecheck terfokus developer direview sebagai bukti, tidak diulang QC atau digandakan menjadi gate global.

Tidak mengubah source aplikasi/backend/dependency/harness developer, server/HP, branch/index, commit/push atau PDF snapshot lama. Sinyal melalui workspace, tanpa klaim percakapan langsung sudah diterima oleh Codex-3/PM. Bukti [verification.json](verification.json), [independent-results.json](independent-results.json), [results.json](results.json), [regression-results.json](regression-results.json), [quality-results.json](quality-results.json) dan [check.cjs](check.cjs) tersedia.
