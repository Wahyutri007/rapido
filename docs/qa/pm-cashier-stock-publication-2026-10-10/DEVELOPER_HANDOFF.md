# Perbaikan Kasir dari arsip Figma — SD5-019

Software Developer Senior 5 / Codex-5. Empat source produksi selesai diperbaiki dan siap direview untuk scope ini. Integrasi ukuran header masih memerlukan keputusan pemilik Header/PM; hasil keseluruhan belum dinyatakan identik Figma.

Stok Habis memakai label asli “Celana Katun Biasa”, termasuk nama aksesibilitas. Nama pada Semua tetap “Celana Katun Biasa yang Nyaman”. Bingkai tombol filter tetap biru10% sesuai Semua/Habis/Menipis. Semua21 record, stok, kategori, filter/search/draft/reset/apply dan SVG asli dipertahankan.

Uang Diterima memakai batas tepi sistem untuk nominal/keypad, nominal panjang memperhitungkan fontScale, tombol nominal cepat membungkus dan tumbuh mengikuti teks. Area nominal dapat tumbuh sebelum keypad supaya validasi pada layar pendek tidak tertutup. RHF/Zod, guard fokus/duplikasi, parsing, navigasi Bayar serta Keypad tidak diubah.

[Perbandingan visual](compare.html), [delta empat source](source-delta.patch), [hasil browser](browser/results.json), [kualitas](quality.json), [kontrak](contracts.json), [temuan integrasi](integration-findings.json).

- Uji RNWeb aktual: **37 PASS/0 FAIL**; baseline2 PASS/6 FAIL membuktikan label/border Stok dan nominal cepat font2x sebelum repair. Lebar240/320/390/844, landscape, inset, nominal16digit, validasi, quick/backspace/C/Bayar serta filter/reset diuji. Runtime/console/permintaan eksternal gagal0. FontScale/inset/router/header selection memakai adapter eksplisit, bukan uji HP Android.
- Kontrak source/acuan/aset: **25 PASS/0 FAIL**. Dua SVG Cash dan tujuh SVG Stok identik ekspor asli; context+PNG kelima frame utuh.
- TypeScript empat root dan1124 file closure:0 diagnostic; ESLint0 error/0 warning, Biome/diff lulus. Tidak ada sertifikasi global aplikasi.
- Regresi form/guard/Keypad: **166 pemeriksaan fungsional PASS/0 FAIL**. Laporan mentah tetap mencatat3 kegagalan hash caller PIN/refund dari baseline lama; peer telah mengubah consumer itu. Hash lama tidak ditimpa dan consumer tidak direvert.
- QC independen47 PASS menerima hash Cash yang sama; [receipt QC](../../qc-cash-input-offline-layout-2026-10-09/REPORT.md). Receipt tetap historis untuk dependency lama dan tidak mengesahkan Stock baru/header gabungan.

## Selisih header yang harus ditindaklanjuti

Replay acuan390 dengan dependency terbaru: **27 PASS/1 FAIL**. Nominal y153; Figma29:25047 mensyaratkan y177. Perubahan CartLayout oleh pemilik QC header memakai toolbar48 pada inset0 menggantikan heading72. Ini menggeser nominal24px; quicky420, keypad, footer Bayary766 dan warna/aset tetap lulus. [Screenshot/angka terbaru](reference-current-header/results.json) dan [replay sebelum header baru28 PASS](history/reference-original-header/results.json) dipertahankan terpisah. Header/layout bukan source SD5 dan tidak diubah untuk menyembunyikan selisih. Pemilik header dan PM perlu menyelaraskan permintaan header ringkas dengan acuan asli lalu menguji cohort baru.

StockFilterSheet peer SD4-013 aec3506b55fdcf1366b89dfa02f2374f23439b9dc2d0c9f620ff270bc66a7139 dikonsumsi read-only pada build gabungan; filter asli390 dan apply/reset lulus. QA/QC tetap perlu mereview delta Stock dan implementasi native.

## Source yang diserahkan

- app/(no-layout)/(cashier)/cart/input-money.tsx — 202b8c4fc5a39482ecfe32ea3da53ac83462256ee43f3df6cd84f4b27b5bacbc
- components/feature/cashier/stock/CashierStockScreen.tsx — a6c44b35ddc2af5c0454b36a68789d49736095be90ea1d78fdbe84f80265829b
- components/feature/cashier/stock/StockGroupCard.tsx — 5b9a469bb24cefa7b60e05f83fa690965aaca597228e04ff1f7516c6a6cb88e6
- constants/data/cashier-stock-preview.ts — 066f3470cf1d32c5beb9a09a10c894540f0e6215a28106f7d82bf2384c311d95

Acuan resmi gbdKqL2EcYNenWiQXG4SRW: Cash29:25047 dan Stock29:27153/27290/27343/27391. Percobaan konteks terbaru terkena kuota Starter; pekerjaan memakai full context/screenshot/aset lokal yang terverifikasi. Arsip seluruh file Figma/.fig, Home artwork/prototype dan seluruh Kasir100% belum lengkap. Tidak ada claim native/fullRouter/API/pembayaran/publikasi. Source/data/API/shared primitive/peer scopes di luar empat path dipertahankan. Git, Metro/Chrome/HP/backend/config/package bersama tidak diubah.

Execution Profile & Operator Tips: Medium. QA empat delta -> pemilik Header menyelesaikan selisih acuan -> build integrasi baru -> native/current Figma -> QC/PM. Gunakan aset asli dan semantic components; pertahankan packet lama. Source lease empat path SD5 dilepas untuk QA/QC/PM setelah seal.
