# SD5-010-NARROW — READY_FOR_QA

9 Oktober 2026, Software Developer Senior 5 / Codex-5. [Perbandingan terkini](compare.html), [manifest hasil](verification.json) dan [audit cakupan](../../../FIGMA_PARITY_AUDIT.md).

Observasi screenshot setelah packet utama SD5-010 disegel menemukan label Inventory terpotong pada 320 px. Supplement ini hanya mengubah columnGap BottomTab pada appearance Figma menjadi 8 px di bawah 360 px; frame acuan 390 px dan layar lebih lebar tetap 14 px. Default appearance, pilihan tab, callback navigasi, store/API dan modul pemilik lain tidak diubah. Label kini utuh pada screenshot 320 px; natural text width juga diuji pada 320/844/768 px.

## Hasil terkini

**52 browser + 17 scope = 69 pemeriksaan ulang PASS/0 FAIL**, runtime/console 0. Jumlah ini menggantikan cohort browser/scope terakhir, tidak dijumlah dengan 70 hasil utama sebagai tes unik. Empat back callback pada layout yang hash-nya tetap sama dipakai ulang; 41 model helper dari SD5-009 juga dipakai ulang pada hash yang sama, bukan replay baru.

Delapan anchor/32 nilai posisi dan ukuran tetap berselisih 0 px terhadap metadata 390×1347. Sebelas SVG exact/root dimensions/slot tetap diverifikasi. Search/SKU typing, reset/empty, status/store picker/search, unknown per-store quantity, live data, tab/header dispatch, final-row clearance, dividers dan tidak ada horizontal overflow lulus. Referensi Figma dipakai pada comparison fixture saja; interaction regression kembali ke data Inventory existing. Viewports 390×1347, 390×844, 320×640, 844×390 dan 768×1024.

ESLint sembilan root 0 error/warning, scoped TypeScript root+imported/declaration closure 0 diagnostic, Biome 0 error dengan dua noExplicitAny warnings existing, diff exit 0. Bundle/input hashes sembilan root sama dengan quality dan source saat seal. Own one-shot build/output/cache/profile pada D; namespace output supplement berbeda, cache transform milik Senior5 dipakai ulang. Root Metro/Babel/Tailwind/global CSS before/after identik; tidak listener/server/HP/ADB/dependency baru.

Packet utama closing-stock-figma **76 artefak** dan SD5-009 **133 artefak** masih cocok byte/hashes, tidak ditulis ulang. Tujuh belas source/asset utama tetap identik; BottomTab terbaru berhash **4bf76a34267565c30484c7d58996aea83e878454a9d47bee6fd13e3b9ff9d3cb**. Source-final memuat snapshot 18 source/asset saat pemeriksaan terbaru. Header-results.json di sini identik dengan packet utama; attempt/intermediate/before artifacts disalin sebagai konteks historis, tidak dianggap hasil terbaru. Parent verifier --source kini harus menolak BottomTab drift yang memang disengaja; supplement ini menjadi overlay yang harus direview.

## Gate QA/QC dan batas 100%

QA diminta memeriksa aplikasi/router lengkap dan Android, keyboard, safe area, font scale, picker/state/cold link. QC diminta perbandingan frame dan asset/default consumer setelah delta shared. Handoff lewat workspace adalah sinyal lokal, belum bukti penerima membaca atau menyetujui. Global 100% belum tercapai: akses Page1 berikutnya gagal Starter limit; frame/state lainnya belum dibandingkan penuh. Tidak identitas byte piksel lintas renderer. Data per-store masih unknown, tanpa balance/seed/posting/persistensi baru.

Tidak Git stage/commit/push/branch, backend atau server/HP/cache bersama; publikasi milik PM. [Audit QC lintas layar](../../qc-figma-audit-2026-10-09/REPORT.md) adalah gate independen dan tidak otomatis ditutup oleh satu frame ini.

## Verifikasi reviewer

Default verifier read-only memeriksa packet; --source juga memeriksa 18 source/asset terkini. **Jangan replay ke packet frozen.** Salin seluruh packet ke namespace reviewer baru, ubah output/cache/browser profile reviewer pada runner, jaga relative path font sesuai kedalaman, baru jalankan build/browser/scope/quality. CSS adalah snapshot produksi saat build; perubahan source/style memerlukan cohort baru. Header/model reuse bukan sertifikasi dependency/runtime masa depan.

```powershell
node docs/qa/senior-5-2026-10-09/closing-stock-figma-narrow/verify-packet.cjs --source
```

Execution Profile & Operator Tips: Medium. Manifest read-only → reviewer namespace → QA Android → QC visual/default callers → PM. Pulihkan akses referensi penuh sebelum menyatakan cakupan semua Figma; jangan reseal histori atau mentransfer approval shared otomatis.
