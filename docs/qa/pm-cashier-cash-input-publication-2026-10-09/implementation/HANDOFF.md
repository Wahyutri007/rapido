# SD5-015 Kasir: tampilan Uang Diterima

Software Developer Senior 5 / Codex-5, 9 Oktober 2026. **READY_FOR_QA**. Sinyal: `SD5-015-CASHIER-CASH-INPUT-FIGMA-READY-FOR-QA`.

Layar `/cart/input-money` kini mengikuti frame resmi [Kasir29:25047](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=29-25047): nominal32px, pengisian cepat dari total pesanan/Rp200.000, keypad, backspaceSVG asli32px, Header Figma existing dan tombol **Bayar**. Nominal panjang mengecil sesuai lebar aktual; konten bisa digulir pada layar pendek/landscape dengan footer tetap terlihat. Bayar tetap memvalidasi RHF/Zod dan membuka konfirmasi existing dengan nominal/total, termasuk guards stale/focus/double-submit/retry dari SD5-014.

[Perbandingan gambar](compare.html), [hasil browser](browser/results.json), [observasi dan batas](visual-observations.json), [hash/verifikasi](verification.json). Referensi live full context dan screenshot berhasil dibaca; [sumber resmi yang disimpan](../../../figma/cashier/sd5-20261009/cash-input/README.md). Screenshot hanya dokumentasi, bukan aset UI. Dua varian lain masih Starterlimited.

## Scope dan hasil

- Enam source/aset pada `verification.json`: input-money, Keypad cash appearance opt-in, satu Header call pada cart layout, dua helper/theme lokal, satu backspaceSVG. Schema dan default Keypad/PIN/refund tetap; empat header route cart lain sama secara AST. Source checkout/cart-index, confirm/payment, shared Header/primitive/theme global dan module peer tidak diubah.
- **169/169 fungsi**, runtime/action rejection0: actual screen/Keypad/Form/utils/RHF/Zod/schema; native presentation, router/focus/safe-area/theme adapters. Default Keypad dirender dan dibanding baseline; tiga caller PIN/refund dibuktikan hash, bukan tiga alur navigator penuh.
- **28/28 browser**, runtime/console/request-block0: komponen/fonts/CSS produksi melalui RN Web; 390×844,320×568,844×390, long16digit. Dua belas nilai geometry utama sesuai acuan dalam toleransi0,6px; warna/font/teks Bayar, pengisian cepat, BACK/C, navigation dan akses row terakhir diperiksa. Bootstrap/router/focus/stack selection/inset0/HTTP aset adalah fixture terisolasi.
- **9/9 AST/aset**: urutan route, empat option header lain, seluruh handler navigasi tervalidasi, schema dan dua SVG exact.
- ESLint5root0error/0warning, BiomePASS, scoped TypeScript1284file imported/declaration closure0diagnostic, source diffPASS. Bukan seluruh aplikasi TS; warning LF/CRLF Git bersifat informasi, tidak menjalankan Git mutation.
- Build final mengikat enam owned source dan70 project/fixture source, protected config/runtime0drift; satu worker/private cache, tanpa appserver. Laporan152candidate dan28browser replay bukan skenario unik tambahan. Packet SD5-01426artefak dan SD5-01314artefak tetap identik.

## Review yang masih diperlukan

Ini bukti developer. Independent QA/QC belum menerima enam hash baru. SD5-014 sebelumnya lulus27reviewer checks dan diterima PM untuk behavior; approval itu historis dan tidak otomatis berlaku pada overlay visual ini. `cashier-cash-input/verify-packet.cjs --source` akan menemukan intentional input/Keypad overlay; packet lama tidak disegel ulang.

Header existing memakai title line height21px, sedangkan konteks20,8px; pusat berbeda0,1px. Font aplikasi Inter_24pt dipertahankan, bukan font binary yang diberikan Figma. Glyph width/raster antar renderer belum identik piksel. QA perlu memeriksa Android font scale, safe area, haptics, fokus dan navigator aktual serta route datang/kembali. **Seluruh Kasir/Figma100% belum disertifikasi**; frame/state lainnya mempunyai gate terpisah.

Confirm existing masih `API Here`/`wait(1000)`/alert; quote checkout/BayarNow belum tersambung end-to-end. Tombol Bayar di sini membuka konfirmasi tervalidasi dan belum membuktikan pembayaran selesai. Tidak menambahkan dummy order, fake success, API atau backend. PM mengatur publikasi setelah review; batch ini tidak commit/push atau mengubah runtime/HP.

## Replay tanpa menulis packet

Jalankan dari root aplikasi; ganti nama output setiap replay. Runner baca produksi aktual. Regression memerlukan renderer tools existing `.expo/senior7-test-tools/node_modules` atau `RAPIDO_TEST_TOOLS` yang sesuai. Browser memerlukan Node dengan WebSocket dan Edge existing, private hidden profile; tidak mengambil Chrome/HP/shared Metro.

```powershell
node docs/qa/senior-5-2026-10-09/cashier-cash-input-figma/verify-packet.cjs --source
node docs/qa/senior-5-2026-10-09/cashier-cash-input-figma/check-regression.cjs --output D:/Rapido-QA-temp/sd5-015-review/regression.json
node docs/qa/senior-5-2026-10-09/cashier-cash-input-figma/check-scope.cjs --output D:/Rapido-QA-temp/sd5-015-review/scope.json
node docs/qa/senior-5-2026-10-09/cashier-cash-input-figma/check-quality.cjs --output D:/Rapido-QA-temp/sd5-015-review/quality.json
node docs/qa/senior-5-2026-10-09/cashier-cash-input-figma/build-browser.cjs --output D:/Rapido-QA-temp/sd5-015-review/build
node docs/qa/senior-5-2026-10-09/cashier-cash-input-figma/check-browser.cjs --preview D:/Rapido-QA-temp/sd5-015-review/build --output D:/Rapido-QA-temp/sd5-015-review/browser
```

`history/` mempertahankan initial preview toolchain failures (native resolver, export condition dan stack adapter), runner syntax correction serta real narrow-long-number failure sebelum koreksi. Tidak memakai hasil awal untuk menyetujui hash final. Build artifact besar/cache tetap D/temp; laporan/hash/screenshots disimpan di packet.

Execution Profile & Operator Tips: Medium. Current six hashes -> independent QA/native/visual review -> QC -> PM. Gunakan namespace review baru dan gate module ini; jangan mempublikasikan seluruh working tree atau menganggap satu frame membuktikan semua state.
