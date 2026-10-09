# Senior 7 - SingleSelect: opsi berubah dan kontrol dinonaktifkan

9 Oktober 2026, Asia/Jakarta. Status **READY_FOR_QA**, belum approval QA/QC untuk delta ini. Scope source hanya `components/common/SingleSelect.tsx`; `Form.tsx` dan pemanggil dibaca/diuji tanpa diedit. Kelanjutan primitive yang ditugaskan kepada Senior7, setelah paket Barcode mendapat [QC-BARCODE-20261009-PASS-DELTA](../../qc-barcode-2026-10-09/REPORT.md).

## Masalah dan hasil

Ketika picker sudah terbuka lalu parent memberi `disabled=true`, opsi dan tombol Selesai sebelumnya tetap dapat mengubah/mengirim draft. Selain itu, pilihan yang dihapus atau dinonaktifkan oleh pembaruan `items` masih bisa dikonfirmasi. Baseline pada hash `e967d1ef` mencatat 7 pemeriksaan lolos dan 19 gagal, mencakup gejala serta akibat kedua masalah ini, bukan 19 akar bug terpisah.

Handler pilihan kini menolak aksi saat kontrol dinonaktifkan. Opsi meneruskan disabled ke BouncyPressable; Selesai memakai disabled, accessibilityState, opacity dan guard handler. Konfirmasi memeriksa bahwa draft masih ada dan boleh dipilih dalam daftar terbaru. Draft yang sementara tidak tersedia dipertahankan, tetapi tidak dikirim; pengguna dapat memilih opsi lain, membatalkan, atau melanjutkan setelah opsi tersedia kembali. Batal/backdrop tetap berfungsi. Nilai undefined tetap mengikuti kontrak lama: menutup tanpa callback.

Tidak mengubah signature props, reset nilai eksternal, timer dismiss 150ms, geometri atau warna. Perubahan visual terbatas pada opacity state disabled. Gaya legacy lain belum ditata ulang. Pemilihan langsung tetap mengirim nilai tanpa memerlukan konfirmasi saat kontrol aktif.

## Bukti developer

| Pemeriksaan | Hasil |
| --- | --- |
| [Availability](availability-results.json), komponen SingleSelect produksi | 26 lolos |
| [Regresi lifecycle sebelumnya](../single-select-results.json), dijalankan ulang | 30 lolos |
| [Integrasi FormSelect/RHF](form-results.json) produksi | 26 lolos |
| Total | **82 lolos**, runtime/act error 0 |
| ESLint source final | 0 error, 0 warning |
| Biome dan scoped diff-check | Lolos |
| [TypeScript terfokus](typecheck-results.json), SingleSelect + Form dan dependency closure | 0 diagnostic |

Integrasi menjalankan Form, FormField, FormItem, FormSelect, SingleSelect dan react-hook-form produksi, bukan menyalin logika wrapper. Mencakup initial value, draft/cancel, reset saat terbuka, dirty state, validasi RHF, label legacy menjadi value, opsi hilang/kembali, disabled/re-enable, mode immediate dan field lain yang tetap utuh. Sinyal QA pertama diberikan sesudah 56 pemeriksaan komponen/regresi, lalu batch integrasi ini dilanjutkan.

Fingerprint source, dependency RHF, harness, hasil dan baseline tersedia pada [verification.json](verification.json). Manifest shared sebelumnya mempertahankan bukti historis dan mengarahkan SingleSelect ke supplement ini. SortActionSheet dan tiga source Barcode yang sudah disetujui QC tetap sama; tidak diklaim diuji ulang dalam batch ini.

## Permintaan QA lalu QC

QA: cocokkan hash, ulangi runner, lalu uji picker pada aplikasi sebenarnya saat disabled berubah, daftar diperbarui, Batal/Selesai, form reset dan pemilihan langsung. QC: periksa kontrak callback, draft yang ditahan ketika opsi tak tersedia, props penonaktifan native dan batas pengujian. Persetujuan Barcode tidak mencakup perubahan SingleSelect ini.

RN, Actionsheet, BouncyPressable, SearchBar, ikon dan haptic masih adapter host. Belum menguji browser/native, fokus, animasi, screen reader, layar/navigator lengkap atau API. Implementasi BouncyPressable dibaca dan meneruskan disabled ke AnimatedPressable. Figma metadata diperiksa kembali namun ditolak akses editor; whoami diperiksa, tidak ada klaim kecocokan desain. TypeScript penuh dan integrasi akhir tetap gate PM. Tidak mengubah dependency aplikasi, server/HP, branch/index, commit/push atau source developer lain.

## Mengulang

Dari root aplikasi, dengan dependency test terisolasi yang sudah tersedia:

```powershell
node docs/qa/senior-7-2026-10-09/select-availability/availability.cjs
node docs/qa/senior-7-2026-10-09/shared-picker-lifecycle.cjs single-select
node docs/qa/senior-7-2026-10-09/select-availability/form-integration.cjs
node node_modules/eslint/bin/eslint.js components/common/SingleSelect.tsx
node node_modules/@biomejs/biome/bin/biome check components/common/SingleSelect.tsx
node docs/qa/senior-7-2026-10-09/select-availability/typecheck.cjs
```

Jangan gunakan `--baseline` pada source final; hasil baseline mengikat source sebelum perbaikan. Sinyal melalui dokumen workspace, bukan klaim pesan langsung diterima.

Execution Profile & Operator Tips: Medium. Reproduksi dan perbaikan satu primitive -> pemeriksaan/sinyal QA -> integrasi form -> handoff final. Pertahankan scope sesi lain dan jangan menggandakan gate TypeScript penuh.
