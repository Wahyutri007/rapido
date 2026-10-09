# SD4-004 — Koreksi QC Penerimaan Back Office

Owner Software Developer Senior4 / Codex-4, 9 Oktober2026 Asia/Jakarta. **READY_FOR_QC_RECHECK** setelah verifikasi developer. QA perilaku → QC keputusan temuan → PM publikasi. QC-INCOME-001/002/003 belum ditandai CLOSED oleh developer.

Prioritas pengguna adalah Back Office dan perintah QC; pengembangan Kasir baru ditunda. Acuan [REPORT QC](../../qc-income-2026-10-09/REPORT.md) dan [DECISION](../../qc-income-2026-10-09/DECISION.json).

## Koreksi pada source aplikasi

| Temuan | Koreksi |
| --- | --- |
| QC-INCOME-001 P2 | CashEntryForm menolak submit dari instance unmount, termasuk callback setelah validasi tertunda. Guard dijalankan sebelum validasi dan sebelum penulisan lokal. |
| QC-INCOME-002 P2 | Detail memakai child keyed per ID; konfirmasi baru dimulai tertutup. Konfirmasi aktif/mounted diperiksa dan dikonsumsi sebelum hapus. Batal, pindah ID dan unmount menonaktifkan callback lama serta navigasinya. |
| QC-INCOME-003 P3 | Lock pending sinkron menahan tekan Simpan kedua selama validasi/simpan. savedId menggunakan ref agar simpan normal berikutnya memperbarui record pertama tanpa error duplikat palsu. Lock dilepas melalui finally. |

Hanya dua source diedit:

- app/(no-layout)/manage/income/detail.tsx — SHA256 a5be980c7cb61175a3d3311a7b9b4f45d752d7c7578260b6e8d94a1ad3abb201.
- components/feature/accounting/CashEntryForm.tsx — SHA256 c85159482a162b3d4f443d1929b7de1fd55de3970ea2f987effc7215831f2c50.

Keduanya persis proposal QC yang diuji; telah diterapkan pada aplikasi, bukan hanya salinan proposal. Shared form dipakai IncomeForm dan ExpenseForm; route Expense tetap keyed per ID. Prefill, draft ID sama, validation, simpan berulang dan penghapusan normal dipertahankan. Header, rute, tampilan, data/helper/store, geometry footer Akuntansi dan primitive modal tidak diubah. Tidak mengambil scope aktif pemilik lain.

## Bukti

- Baseline actual source mereproduksi24PASS/12FAIL, runtime0; tersimpan di before/.
- Setelah koreksi36/36 lifecycle Penerimaan PASS,6/6 expense-kind shared form PASS; runtime/React/act error0. Tanpa --proposal. Semua12 assertion milik tiga temuan berubah dari FAIL kePASS.
- Proof7 pemeriksaan PASS,24runtime source fingerprints masih cocok,38artefak QC histori byte-identik. Exact two-source hashes cocok proposal QC.
- ESLint empat source terkait0error/warning; Biome/diff exit0. Scoped TypeScript Income modify/detail dan Expense modify beserta1219source dependencies:0diagnostic. Bukan globalTS.

Runner QC disalin ke folder sendiri; logika assertion36 dan6 dipertahankan. Adapter host RN hanya ditambah useWindowDimensions360×800 agar DeleteConfirmModal versi saat ini dapat dijalankan; owner/result metadata expense diubah dari proposal menjadi aplikasi. Paket QC lama, proposal dan laporan keputusan tidak ditulis ulang. Model43 dan browser25 histori tidak dijalankan ulang/dijumlah. Perubahan ini mengoreksi callback/lifetime, bukan geometri; native/browser/router penuh dan Figma tidak disertifikasi.

## Replay dan QA/QC

Dari root aplikasi: `node docs/qa/codex-4-2026-10-09/income-qc-fixes/seal.cjs` memverifikasi paket read-only. Jangan menjalankan runner yang menulis hasil di paket frozen. Salin runner dan before/ ke folder reviewer sendiri, lalu jalankan `node <folder>/lifecycle.cjs`, `node <folder>/expense-lifecycle.cjs`, `node <folder>/typecheck.cjs`, `node <folder>/proof.cjs` dari app root. Proof tetap membaca paket QC asli. Playwright/browser tidak dibutuhkan; react-test-renderer terisolasi existing .expo/senior7-test-tools dipakai, tanpa dependency baru.

Harness menjalankan route/wrapper/CashEntryForm/Form/DeleteConfirmModal/RHF/Zod/helper/Zustand produksi, memakai host RN/picker/router/presentasi detail/SuccessModal adapters dan batas Promise validasi. Seluruh data hanya di proses tes, tanpa HTTP/backend/database/persistensi/jurnal/saldo posting atau mutasi data HP.

QA diminta menguji navigasi asli/HP, double press, edit A→B/create, validasi tertunda, Batal/hapus/back dan regresi Pengeluaran. QC diminta meninjau hash/source terbaru dan mengeluarkan keputusan recheck tiga temuan. Gate visual DeleteConfirmModal/SuccessModal dan scope footer milik pemilik/reviewer terpisah; hasil ini tidak menutupnya. PM pemilik integrasi/commit/push. Sinyal melalui workspace, belum klaim reviewer menerima langsung atau menyetujui. Metro/backend/HP tetap; tidak restart/ADB/dependency/index/branch/Git publication/PDF/PowerPoint atau source Kasir pada tugas ini.

Execution Profile & Operator Tips: Medium. Cocokkan hash → QA perilaku aktual → QC recheck → PM. Utamakan penutupan temuan Back Office; pertahankan ownership shared source dan jangan memakai status developer sebagai closure QC.
