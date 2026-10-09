# SD5-009 — READY_FOR_QA

Software Developer Senior 5 / Codex-5, 9 Oktober 2026. Menu **Stok Akhir** yang sebelumnya belum terhubung kini membuka laporan kategori dengan pencarian nama/SKU, filter toko/status, reset, keadaan kosong dan pembaruan bahan baku langsung. Siap QA perilaku → QC kontrak/visual → PM; belum approval independen.

Referensi [Figma 1:12401](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-12401) bernama metadata Stok Sekarang, dengan heading Stok Akhir. Full design context dan screenshot berhasil diakses; tersimpan pada figma-context.txt dan figma-reference.png. Dua SVG filter diekspor persis, bukan gambar ulang. Card/header kategori/kolom mengikuti referensi dan token Rapido. Chrome Header/SearchBar/SingleSelect/BottomTab existing tetap membutuhkan perbandingan native; tidak ada klaim pixel parity.

Quantity nol berwarna destructive merah, stok menipis/unknown muted. Prioritas warna dibatasi pada Text quantity agar foreground default shared primitive tidak menimpanya; shared Text tidak diedit. Tombol kembali memakai index stack Inventory lokal: riwayat lokal kembali seperti biasa, sedangkan direct link kembali ke Persediaan. canGoBack parent tab sebelumnya dapat membawa direct link ke Beranda; kegagalan nyata dan koreksi tersimpan pada attempt-1791512255376.

## Data dan scope

Layar membaca produk Inventory existing dan material store live. Tidak menambah dummy aplikasi, seed, endpoint, posting stok atau persistensi. Produk tanpa minimum tidak diberi threshold buatan; Tersedia mencakup semua jumlah positif, Menipis memakai minimum bahan yang diketahui, Habis hanya nol valid. Angka pecahan dan satuan dipertahankan tanpa menjumlahkan satuan berbeda.

Pilihan toko memfilter bahan yang mempunyai membership toko tersebut. Jumlah per toko ditampilkan **—** disertai penjelasan karena membership/lokasi gudang tidak menyediakan balance. Produk tidak mempunyai membership toko dan tidak dikarang ke dalam filter. Data aggregate existing bukan ledger historis atau balance backend. Integrasi balance produk/per toko memerlukan kontrak API tersendiri.

Edit source milik SD5: helper, feature screen, route dan dua SVG. Integrasi shared hanya href Stok Akhir serta header/fallback; semua sepuluh link Inventory termasuk billing/movement milik developer lain dipertahankan. Snapshot shared bukan approval seluruh file. Dependency drift sesi lain dicatat dalam verification.json dan tidak dikembalikan.

## Hasil developer

- **41 model + 30 browser = 71 pemeriksaan berbeda lulus/0 gagal.** Replay intermediate tidak dijumlah ulang. Browser runtime exception/console error 0.
- Browser menjalankan feature/routes/tab/layout/shared controls/material store produksi dalam ExpoRoot khusus tes, melalui Metro Expo CLI terkonfigurasi existing. Auth/API dilewati; mutasi stok dan material QA hanya pada store memori halaman terisolasi. Stylesheet produksi dari Tailwind CLI diinjeksikan untuk menghindari kompilasi NativeWind bersama.
- Uji klik hub/back/direct link, fokus/ketik/search/reset, picker status/toko searchable, SVG load, live edit/remove/saveMaterial dan decimal unit. Viewport 390×844, 320×640, 844×390 dan 768×1024; tiga ukuran terakhir tidak overflow horizontal dan baris terakhir dapat dijangkau. Screenshots menjadi bukti RNWeb, bukan gesture Android.
- Supplement cascade CSS **2/2** lulus untuk red zero/muted low. Generated stylesheet dan build guard dicatat pada style-build.json/color-cascade-results.json; bukan dua pengujian aplikasi tambahan.
- ESLint lima root **0 error/0 warning**, Biome/diff-check exit0; TypeScript lima root dengan imported source/declaration closure **0 diagnostic**. Bukan lint/TypeScript seluruh proyek.
- Empat pemeriksaan callback header tambahan lulus pada layout produksi dengan adapter JSX/router/navigation; scope ini dicatat terpisah dari 71 model/browser. Bundle receipt membuktikan kode header lokal baru benar-benar termuat setelah runtime bersama kembali tersedia. Senior5 tidak me-restart server. Raw offline Metro fallback gagal pada konfigurasi native bridge; itu kegagalan harness diagnostik, bukan hasil passing aplikasi.

## Hash dan replay

| Owned source | SHA256 |
| --- | --- |
| `lib/inventory-closing-stock.ts` | `093ed466a2d8bfe73a52839d973766318aedf3b603e86f19d5f0a3374cae3fee` |
| `components/feature/inventory/closing-stock/ClosingStockScreen.tsx` | `36b0e45c59fa77f7ed7c41a60d2b08c3ef1fc36a5cba42062d07460345a9fe4f` |
| `app/(back-office)/inventory/closing-stock.tsx` | `4f03af99dd9206197ee8c654554180483853a665b224ba80680108053ea8ce00` |
| `assets/images/inventory/closing-stock/store.svg` | `6c3d9ae4527437e6a4ed8b1d8e51a3ae2936687619fa1cf58bace78b7f5b2255` |
| `assets/images/inventory/closing-stock/status.svg` | `43ec6f67b519c7fbb6cc3b1d863359febbfbca9e1321fa9bc79b0e931af2ff88` |

verification.json menyimpan hasil, scope, shared snapshot dan kontrak baca. artifacts.json menyegel seluruh packet, termasuk kegagalan historis. Verifier default hanya membaca artifact frozen; opsi --source juga membandingkan lima source owned pada workspace saat ini.

```powershell
node docs/qa/senior-5-2026-10-09/closing-stock/verify-packet.cjs --source
```

Untuk replay, **salin seluruh packet ke folder reviewer baru** terlebih dahulu. Runner menulis output di foldernya sendiri; jangan menjalankannya di packet frozen. Jalankan dari root aplikasi:

```powershell
node docs/qa/<folder-reviewer>/check-model.cjs
node docs/qa/<folder-reviewer>/check-header.cjs
node docs/qa/<folder-reviewer>/setup-browser-fixture.cjs
node docs/qa/<folder-reviewer>/check-browser.cjs --own-style
node docs/qa/<folder-reviewer>/check-quality.cjs
```

Node dengan fetch/WebSocket dan Edge terpasang diperlukan. Fixture hanya dipulihkan pada namespace .expo/sd5-closing-preview bila file belum ada atau sama; tidak menimpa fixture berbeda. Sesuaikan executable browser pada salinan reviewer jika perlu. Browser memerlukan Metro8088 terkonfigurasi dan bebas antrean; jangan mengubah server/cache/root config milik operator lain. generated-web-style.css adalah snapshot produksi yang diuji, bukan bukti styling source baru setelah drift.

## Permintaan QA/QC dan batas

QA: ulangi menu dalam router/auth aplikasi lengkap dan Android; keyboard, scroll, safe area/tab bar, skala font, picker search, status warna, update stok dan back/deep link. QC: periksa fidelity terhadap reference, aturan threshold/unit/unknown/per-store, scope shared integration dan hash. Belum ada sertifikasi Android/full auth/backend balances/persistence/transaction posting atau keputusan penerima. Sinyal handoff lewat workspace belum membuktikan QA/QC membacanya.

Tidak menjalankan Git stage/commit/push, restart server, operasi HP/ADB, dependency install atau perubahan shared primitive oleh Senior5. Publikasi mengikuti PM. Paket SD5-001 sampai SD5-008 tetap frozen dan mempunyai gate masing-masing.

Execution Profile & Operator Tips: Medium untuk data/filter dan nested back. Hash → replay di packet reviewer → QA aktual → QC → PM. Hindari bundle berat paralel; bedakan current aggregate dari stock per toko dan browser fixture dari runtime HP.
