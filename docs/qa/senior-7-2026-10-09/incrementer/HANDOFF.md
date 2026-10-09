# Senior 7 — Incrementer dan jumlah cetak Barcode

Tanggal: 9 Oktober 2026, Asia/Jakarta. Scope: `components/custom/Incrementer.tsx` serta props disabled/isDisabled pada `components/feature/barcode/PrintBarcodeModal.tsx`. Status: **READY_FOR_QA**; belum approval QA/QC. Ini kelanjutan backlog lint Incrementer dan paket Barcode Senior 7 setelah permintaan pengguna untuk lanjut. Sinyal QA batch Incrementer diberikan sebelum pengujian gabungan Print/Incrementer.

## Masalah dan perubahan

1. Incrementer sebelumnya menginisialisasi jumlah dari initialValue/min meskipun pemanggil memberi value. Pada contoh form jumlah 12, React meng-commit tampilan 1 kemudian 12 melalui effect. Baseline gagal tersimpan di [baseline-results.json](baseline-results.json). State kini diinisialisasi dari controlled value; perubahan nilai eksternal direkonsiliasi sebelum children dirender, sehingga jumlah 12 langsung tampil. Perpindahan ke state lokal mempertahankan nilai eksternal terakhir seperti sebelumnya.
2. Pengujian gabungan menemukan tombol tambah masih dapat mengubah jumlah menjadi 4 setelah pekerjaan 3 lembar dijadwalkan. Baseline perilaku gagal di [print-integration-baseline.json](print-integration-baseline.json). Incrementer mendapat prop `disabled?: boolean` dengan default false, diteruskan ke dua Button dan dijaga pada handler. Print memberi disabled selama isPrinting/printedSuccess. Jumlah pada tampilan tetap sama dengan jumlah pekerjaan yang dikonfirmasi; pembukaan kembali mengaktifkan kontrol.

Kontrak initialValue, min/max, callback pada batas, kedua varian, ukuran dan className tetap. Nilai eksternal yang di luar batas tidak dinormalisasi diam-diam; validasi nilai pemanggil tetap tanggung jawab pemanggil. Incrementer meneruskan disabled melalui isDisabled sesuai API Button proyek. Tombol Batal/Cetak Print juga memakai isDisabled agar state UI mengikuti handler. Perubahan JSX hanya props penonaktifan; tidak mendesain ulang styling lama.

## Pemanggil yang diperiksa

Empat penggunaan langsung ditemukan melalui pencarian seluruh source dan dibaca:

| Pemanggil | Kontrak yang dijaga |
| --- | --- |
| PrintBarcodeModal | State copies terkontrol; min 1/max 999; reset per dialog/barcode; disabled selama proses/sukses |
| generate-barcode/modify | RHF field label_count, default 12, min 1/max 999; source form tidak diubah |
| cashier/catalog/detail — ExtraSelector | amount dari field extras; callback memperbarui item yang tepat; source Kasir tidak diubah |
| cashier/catalog/detail — Jumlah Pembelian | Jumlah lokal dengan min 1; source Kasir tidak diubah |

## Bukti developer

- [lifecycle-results.json](lifecycle-results.json): 37 pemeriksaan komponen produksi dengan React 19 test renderer; initial commit, external reset, controlled/local, callback, min/max/0, perubahan props, perpindahan mode dan disabled pada kedua varian.
- [print-integration-results.json](print-integration-results.json): 18 pemeriksaan PrintBarcodeModal dan Incrementer produksi bersama. Tombol tambah/kurang aktual mengubah state Print, jumlah terkunci saat proses/sukses, callback cocok, reopen/min/max/pergantian barcode/unmount aman.
- Regresi [print-results.json](../print-results.json) dijalankan ulang pada source Print terbaru: 21 pemeriksaan lama lolos. Jadi batch ini menjalankan 55 pemeriksaan tambahan serta 21 regresi, seluruhnya tanpa runtime error/act warning.
- Lint sebelum perubahan: 1 error `react-hooks/set-state-in-effect` pada Incrementer. ESLint final kedua source 0 error/0 warning; Biome check dua file dan git diff --check scope ini lolos. Hasil dan fingerprint source/harness tersedia di [verification.json](verification.json).
- TypeScript root Incrementer dan PrintBarcodeModal beserta dependency closure memakai konfigurasi proyek: 0 diagnostic pada source final. Ini bukan TypeScript seluruh proyek; gate integrasi akhir tetap milik PM.

## Batas dan permintaan QA → QC

React Native, Button, Text, ikon dan BarcodePreview masih berupa adapter host pada harness. Test gabungan kini memakai Incrementer produksi, mempersempit batas stub paket sebelumnya, tetapi belum menguji animasi/fokus/accessibility native, perangkat printer, navigator Kasir atau form RHF produksi secara menyeluruh. Implementasi Button produksi dibaca: isDisabled mengatur primitive, opacity dan haptic/animation gating. QA perlu mencoba tambah/kurang, reset form serta cetak/buka ulang pada aplikasi nyata; QC mencocokkan hash source, props opsional, kontrak callback dan batas fitur.

Alur cetak tetap simulasi timer lama, belum koneksi printer. Figma metadata terbaru masih ditolak akses editor setelah whoami diperiksa. Styling legacy dan integrasi data Kasir/Barcode di luar delta ini. Tidak ada perubahan route/layout, dependency aplikasi, API, source pemanggil lain, commit/push atau pengendalian server/HP milik PM.

## Mengulang

Dari root aplikasi, memakai dependency test terpisah yang sudah dicatat di [handoff Barcode](../HANDOFF.md):

```powershell
node docs/qa/senior-7-2026-10-09/incrementer/lifecycle.cjs
node docs/qa/senior-7-2026-10-09/incrementer/print-integration.cjs
node docs/qa/senior-7-2026-10-09/barcode-lifecycle.cjs print
node node_modules/eslint/bin/eslint.js components/custom/Incrementer.tsx components/feature/barcode/PrintBarcodeModal.tsx
node node_modules/@biomejs/biome/bin/biome check components/custom/Incrementer.tsx components/feature/barcode/PrintBarcodeModal.tsx
node docs/qa/senior-7-2026-10-09/incrementer/typecheck.cjs
```

Flag --baseline pada harness dipakai sebelum perbaikan; jangan menimpa bukti historis dengan source final. Hash pada hasil baseline mengidentifikasi source lama. Persetujuan tetap developer → QA → QC → PM; sinyal melalui workspace bukan bukti pesan langsung diterima atau disetujui.

Execution Profile & Operator Tips: Medium. Batch Incrementer → pemeriksaan/sinyal QA → integrasi Print → perbaikan terfokus/regresi → handoff. Typecheck terfokus saja; hindari pekerjaan di route/server milik sesi lain.
