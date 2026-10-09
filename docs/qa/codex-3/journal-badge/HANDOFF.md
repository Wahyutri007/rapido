# Koreksi QC-JOURNAL-001 — READY_FOR_QC_RECHECK

Pemilik **Codex-3**, profil `D:/Codex-3`; 9 Oktober 2026, Asia/Jakarta. Menindaklanjuti [report QC](../../qc-journals-2026-10-09/REPORT.md) dan DECISION CHANGES_REQUESTED. Temuan P2 tetap OPEN sampai QC memutuskan recheck; developer tidak mengklaim CLOSED/APPROVED.

Input `-500` pada baris ketiga dapat menutup selisih debit 1.500/kredit 1.000 hingga total 1.000/1.000; badge sebelumnya menampilkan **Seimbang**. NaN pada fixture baris juga tersembunyi oleh reducer `value || 0`. Simpan sudah menolak keduanya, tetapi status balance bertentangan dengan validasi.

Koreksi hanya initializer `isBalanced` pada dua route modify Jurnal Umum/Penyesuaian: setiap debit/kredit wajib finite dan nonnegatif sebelum guard total finite/positif/sama existing. Dua file bertambah tujuh baris masing-masing. Source awal dicocokkan terhadap tiga hash QC, snapshot disimpan; hasil akhir mentah cocok dua hash proposal QC. Seluruh AST tetap selain initializer tersebut, termasuk import/handler/validator/payload/JSX. Helper/schema/store tidak diubah.

## Bukti pada source aplikasi final

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| Replay kasus QC sebelum patch | 37 lolos / 4 gagal | [baseline.json](baseline.json) |
| Replay kasus QC sesudah patch | **41/41 lolos**, runtime/React error 0 | [independent-results.json](independent-results.json), [qc-replay.cjs](qc-replay.cjs) |
| Regresi validasi developer | **187/187 lolos** | [results.json](results.json), [validation.cjs](validation.cjs) |
| Regresi lifecycle developer | **55/55 lolos** | [regression-results.json](regression-results.json), [regression.cjs](regression.cjs) |
| ESLint tiga source | 0 error/warning, exit 0 | [quality-results.json](quality-results.json) |
| Biome check/format/diff dan JSX | Exit 0, JSX tetap | [quality.cjs](quality.cjs) |
| TypeScript tiga root + imported closure | 0 diagnostic, exit 0 | [typecheck-results.json](typecheck-results.json) |
| Hash proposal, source hasil tes, baseline, AST | Cocok | [verification.json](verification.json) |

**283 eksekusi assertion lolos**, termasuk cakupan berulang; 41 replay kasus QC adalah hasil developer pada source aplikasi, bukan approval QC baru atau pengulangan proposal. Runner QC disalin ke paket ini dengan metadata owner/origin developer; kasus/loader tidak diubah. Empat runner developer disalin byte-identik dari SD3-003; hasil/harness/keputusan QC dan paket developer sebelumnya tidak ditimpa.

Kasus QC mencakup dua badge NaN dan dua badge negatif lewat parser produksi, mutation invalid tetap 0, draft/lock/retry setelah koreksi, ID baris, date-picker dismissed, callback simpan record yang dihapus, serta validasi payload beku/trim-copy dalam StrictMode. Renderer menjalankan route, schema/Zustand dan deklarasi parser/formatter produksi dari AST; native/UI/modal/router/calendar tetap adapter. Tanpa API/persistensi/posting Buku Besar, browser/native/root auth/SSR/aksesibilitas/Figma atau full-project gate.

Store `accountingStore.ts` milik Senior8 hanya dependency: hash hasil suite terbaru dicatat, tidak mengesahkan patch alokasi ID atau mengambil pekerjaannya. Batas manual UI, precision/global ID, default tanggal fixture dan kalender web tetap mengikuti [handoff SD3-003 historis](../journal-validation/HANDOFF.md). Penjumlahan total UI existing dipertahankan; guard baru khusus kebenaran badge.

## Pengulangan dan permintaan recheck

Jalankan dari root aplikasi dengan Node/dependency proyek serta React 19.2.3/renderer di `.expo/senior7-test-tools/node_modules`, yang dibaca read-only oleh bootstrap lifecycle. Mode normal menjalankan source aplikasi; jangan memakai `--proposal` atau mengganti baseline.

```powershell
node docs/qa/codex-3/journal-badge/validation.cjs
node docs/qa/codex-3/journal-badge/regression.cjs
node docs/qa/codex-3/journal-badge/qc-replay.cjs
node docs/qa/codex-3/journal-badge/quality.cjs
node docs/qa/codex-3/journal-badge/typecheck.cjs
node docs/qa/codex-3/journal-badge/verify.cjs
```

QC diminta mencocokkan hash proposal/final, memeriksa empat kegagalan badge dan guard mutation/retry, lalu memutuskan penutupan QC-JOURNAL-001. PM tetap pemilik publikasi/integrasi. Sinyal melalui workspace, tanpa klaim penerimaan percakapan langsung.

Tidak mengubah source/harness QC, store/helper/schema/payload/layout/primitive/backend/dependency, menjalankan Metro/server/browser/HP/full TS, commit/push/merge atau branch/index. Tidak ada proses pengujian Codex-3 tersisa.

## Execution Profile & Operator Tips

- **Recommended Effort Level: Low** untuk predicate dua file; **Medium** untuk replay bukti batas nominal dan status renderer.
- **Suggested Batching / Chunking:** hash/snapshot → guard tiap nominal → 242 regresi + 41 replay → checks/AST → QC recheck.
- **Operator Tips & Watchouts:** approval source sebelum patch belum ada; gunakan manifest supplement ini. Bedakan status badge dari validasi Simpan dan approval store ID/API/native.
