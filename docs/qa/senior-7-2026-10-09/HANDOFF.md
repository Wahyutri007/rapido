# Software Developer Senior 7 — Barcode

Tanggal: 9 Oktober 2026, Asia/Jakarta. Kanal serah terima: dokumen workspace bersama, bukan pesan langsung atau bukti QA/QC sudah menerima. Urutan: developer → QA perilaku/regresi → QC kontrak/UI/dokumentasi → publikasi branch → integrasi main setelah gate PM.

Pembaruan 9 Oktober: source Print kini dilengkapi penguncian jumlah selama proses/sukses dan prop isDisabled sesuai Button proyek. Snapshot Print lama pada verification.json dipertahankan sebagai histori dan diarahkan ke [handoff Incrementer/integrasi Print terbaru](incrementer/HANDOFF.md) serta [fingerprint final](incrementer/verification.json). Regresi Print 21 pemeriksaan dijalankan ulang; integrasi dengan Incrementer produksi menambah 18 pemeriksaan dan Incrementer sendiri 37. Harness Print menyesuaikan tiga assertion ke isDisabled; helper yang diimpor suite lain tetap. Hasil ProductPicker dan shared picker sebelumnya tetap hasil snapshot historis, bukan diklaim dijalankan ulang pada batch ini. QC yang sedang memeriksa Print snapshot lama perlu mencocokkan source terbaru dari paket tambahan ini.

## Batch 1 — PrintBarcodeModal

Status: **READY_FOR_QA** untuk scope lifecycle; belum persetujuan QA/QC. Fingerprint source dan hasil statis tersedia di [verification.json](verification.json).

Scope: `components/feature/barcode/PrintBarcodeModal.tsx`. Shell Modal tetap pada parent; state jumlah/loading/sukses dimiliki content yang dimount saat dialog terbuka. Pergantian barcode, format atau defaultCopies memulai state baru. Rerender nama produk mempertahankan draft jumlah. Effect reset dihapus; cleanup effect membatalkan timer cetak dan auto-close. Klik berulang dicegah selama proses dan setelah sukses.

Pemeriksaan lifecycle: 21 pemeriksaan React 19 test renderer lolos; hasil di [print-results.json](print-results.json), harness yang dapat diulang di [barcode-lifecycle.cjs](barcode-lifecycle.cjs). Mencakup reset/reopen, perubahan props, konfirmasi satu kali dengan jumlah yang dipilih, serta timer lama yang tidak boleh mengonfirmasi atau menutup dialog baru. ESLint final 0 error/0 warning; Biome check dan git diff --check lolos.

## Batch 2 — ProductPickerSheet

Status: **READY_FOR_QA** untuk scope lifecycle; belum persetujuan QA/QC.

Scope: `components/feature/barcode/ProductPickerSheet.tsx`. Reset state dalam effect diganti dengan content terpisah yang memakai key isOpen/selectedProductId. Shell Actionsheet tetap. Pilihan awal, draft pencarian/pilihan saat rerender data, reset ketika dibuka kembali atau selectedProductId berubah, dan callback memakai record produk terbaru dipertahankan. Produk yang sudah dihapus dari daftar tidak dikirim.

Sebanyak 20 pemeriksaan lifecycle lolos, runtime error 0, hasil [picker-results.json](picker-results.json). Mencakup pilih/batal/selesai, pencarian, refetch, perubahan pilihan saat terbuka/tertutup, reopen, daftar kosong, produk terhapus dan fallback fixture lama. ESLint final 0 error/0 warning; Biome check dan git diff --check lolos.

## Gate TypeScript dan snapshot

Satu TypeScript penuh Senior 7 sempat dimulai sebelum catatan larangan duplikasi terbaca, lalu dihentikan melalui sesi proses milik sendiri (exit 1 karena interupsi). Tidak diklaim sebagai hasil pass/fail source. Laporan Senior 8 menyebut TypeScript exit 0 pada snapshot sebelumnya, bukan bukti final Barcode. Typecheck akhir source lintas tiket tetap menunggu gate terkoordinasi PM.

Lint awal berjalan bersamaan perubahan Print sehingga bukan baseline murni: saat selesai, Print sudah 0 error dan Picker masih 1 error set-state-in-effect. Rujukan diagnostic Print sebelum perubahan berasal dari backlog PM historis. Hasil final kedua file diverifikasi setelah edit selesai. Hash SHA-256 mengikat source yang diuji; HEAD adalah konteks workspace bersama, bukan commit khusus Senior 7.

## Batas dan permintaan review

- Test menjalankan komponen produksi dengan React 19.2.3; React Native, primitive UI, BarcodePreview dan Incrementer diganti host stub. Ini pemeriksaan lifecycle, bukan browser/native/printer integration.
- Printer masih simulasi timer lama; tidak ada transport printer, backend/persistensi baru, atau bukti cetak fisik. Label status printer lama bukan deteksi hardware.
- QC perlu memeriksa animasi tutup native (content dilepas saat isOpen false), integrasi Incrementer/Actionsheet/Button aktual, dan tampilan. Figma metadata terbaru ditolak akses editor; whoami sudah diperiksa. Tidak mengklaim kecocokan Figma.
- Styling lama di komponen masih memiliki token/fractional spacing yang tidak sesuai AGENTS_UI; perbaikan lifecycle ini tidak merupakan persetujuan desain seluruh Barcode.
- Batch Barcode tidak mengubah route/layout, dependency aplikasi, source shared primitive, backend, commit atau push. Dependency test dipasang terpisah di `.expo/senior7-test-tools/`, tanpa perubahan package.json/lockfile aplikasi.
- Klaim Katalog dan Promo/Voucher dibatalkan sebelum perubahan source setelah membaca klaim Senior 8/Senior 6. Scope batch ini hanya dua komponen Barcode dan bukti ini. Setelah handoff Barcode, Senior 7 melanjutkan antrean PM SingleSelect/SortActionSheet; lihat [handoff shared picker](SHARED_PICKERS_HANDOFF.md) untuk scope dan bukti terpisah.

## Mengulang pemeriksaan

Dari root aplikasi:

```powershell
npm install --prefix .expo/senior7-test-tools --no-audit --no-fund --package-lock=false react@19.2.3 react-test-renderer@19.2.3
node docs/qa/senior-7-2026-10-09/barcode-lifecycle.cjs print
node docs/qa/senior-7-2026-10-09/barcode-lifecycle.cjs picker
node node_modules/eslint/bin/eslint.js components/feature/barcode/PrintBarcodeModal.tsx components/feature/barcode/ProductPickerSheet.tsx
node node_modules/@biomejs/biome/bin/biome format components/feature/barcode/PrintBarcodeModal.tsx components/feature/barcode/ProductPickerSheet.tsx
# TypeScript penuh dijalankan sekali oleh pemilik gate integrasi terkoordinasi:
node node_modules/typescript/bin/tsc --noEmit --pretty false
```

Execution Profile & Operator Tips: Medium. Selesaikan pemeriksaan Print → sinyal QA → implementasi/pemeriksaan Picker → sinyal QA. QA menguji perilaku/regresi; QC mencocokkan kontrak dan batas. Status siap QA bukan izin integrasi main.
