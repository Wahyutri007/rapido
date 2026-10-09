# Senior 7 — Shared picker lifecycle

Tanggal: 9 Oktober 2026 (Asia/Jakarta). Pekerjaan berikut dari antrean PM_TASK_BOARD, diterima setelah dua komponen Barcode diserahkan. Scope per batch: SingleSelect, kemudian SortActionSheet. File pemanggil tidak diedit.

Pembaruan 9 Oktober: SingleSelect dilengkapi penjagaan opsi/konfirmasi ketika disabled atau daftar opsi berubah. Lihat [handoff terbaru](select-availability/HANDOFF.md) dan [fingerprint final](select-availability/verification.json): 26 pemeriksaan tambahan, 30 regresi lama dijalankan ulang, serta 26 integrasi FormSelect/RHF produksi lolos. Bagian SingleSelect di bawah adalah histori delta lifecycle awal; klaim JSX tidak berubah berlaku pada batch awal saja. SortActionSheet tidak berubah pada batch lanjutan.

## SingleSelect

Status: **READY_FOR_QA**, 30 tes lifecycle lolos; ESLint final 0 error/0 warning. Belum approval QA/QC. Fingerprint source ada di [shared-verification.json](shared-verification.json).

Perubahan hanya sinkronisasi draft pada external value. Effect setDraftSelected diganti penjagaan previousValue dengan Object.is; saat value berubah, state komponen diperbarui sebelum children dirender. Rerender dengan committed value yang sama mempertahankan draft lokal. Reset ke undefined, nilai numerik 0, pencarian, callback, confirm/cancel dan timer dismiss 150ms tetap bekerja. JSX/props/stylesheet tidak diubah.

Seluruh 31 penggunaan JSX langsung di app/components ditinjau dalam [picker-callers.json](picker-callers.json), termasuk wrapper FormSelect yang meneruskan nilai RHF. FormSelect memakai form.watch dan form.setValue dengan shouldDirty/shouldValidate; kontrak itu dipertahankan. Pemakai filter/pilihan terkontrol mencakup laporan, Income/Expense, POS, Pemasok, Inventory, Katalog, Barcode, Tempat dan Payroll. Dua pemilih tambah item Inventory tidak memberi value; perilakunya tetap action picker yang mengirim callback dan mempertahankan placeholder, bukan penyimpanan nilai otomatis. Tidak menambah API uncontrolled/defaultValue baru.

Hasil: [single-select-results.json](single-select-results.json), 30 pemeriksaan dengan React 19.2.3 test renderer. Mencakup update/refetch props, draft, reset, cancel/reopen/save, description search, disabled item/trigger, mode confirm/immediate, action picker tanpa value, generic numeric, empty list dan pembatalan timer. Tidak ada runtime error atau act warning. Biome check dan git diff --check lolos.

## SortActionSheet

Status: **READY_FOR_QA**, 15 tes lifecycle lolos; ESLint final 0 error/0 warning. Belum approval QA/QC. Satu pemanggil langsung ialah SearchBar; ia mengirim isSortOpen, sortBy, onSortChange dan onClose. Batch dimulai setelah sinyal QA SingleSelect.

Effect reset draft diganti penjagaan previousProps pada komponen yang sama. Saat dibuka kembali atau value eksternal berubah ketika terbuka, draft diselaraskan sebelum children dirender. Rerender judul atau value sama mempertahankan draft. Perubahan value saat tertutup digunakan pada pembukaan berikutnya. Nilai default newest, callback Selesai, pembatalan lewat Batal/backdrop serta JSX/props/stylesheet tetap.

[sort-results.json](sort-results.json) mencatat 15 pemeriksaan, runtime error 0. Meliputi default, draft lokal, rerender, save/cancel/backdrop, callback echo, reset value, perubahan saat tertutup/terbuka dan reopen. Biome check dan git diff --check lolos. Hash kedua source shared serta kedua harness tercatat di shared-verification.json dan dicocokkan kembali setelah verifikasi akhir.

## Batas pengujian dan gate

Harness [shared-picker-lifecycle.cjs](shared-picker-lifecycle.cjs) menjalankan komponen produksi dengan React test renderer; RN/Actionsheet/BouncyPressable/SearchBar/icon/haptic memakai host stub. Ini bukan uji seluruh layar pemanggil, interaksi web/native, RHF integration, layout atau animasi. QA perlu memeriksa pemakai representatif pada aplikasi sebenarnya, khususnya reset FormSelect, tambah item Inventory dan filter laporan. QC perlu mengikat hash source, kontrak props, geometri JSX yang tetap dan batas ini. Token/fractional spacing lama bukan cakupan perbaikan lifecycle.

Tidak menjalankan ulang TypeScript penuh; gate akhir lintas tiket terkoordinasi oleh PM. Tidak commit/push, mengubah branch, dependency aplikasi atau file pemanggil. Sinyal workspace tidak membuktikan QA/QC telah membaca atau menyetujui.

Mengulang dari root aplikasi setelah memasang dependency test seperti pada [handoff Barcode](HANDOFF.md):

```powershell
node docs/qa/senior-7-2026-10-09/shared-picker-lifecycle.cjs single-select
node docs/qa/senior-7-2026-10-09/shared-picker-lifecycle.cjs sort
node node_modules/eslint/bin/eslint.js components/common/SingleSelect.tsx components/common/SortActionSheet.tsx
node node_modules/@biomejs/biome/bin/biome check components/common/SingleSelect.tsx components/common/SortActionSheet.tsx
```

Execution Profile & Operator Tips: High untuk primitive shared. Audit pemanggil → perbaikan satu primitive → regresi/lint → sinyal QA → primitive berikut. Pertahankan props, draft dan perilaku form; TypeScript global mengikuti PM.
