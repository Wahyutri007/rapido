# SD6-004 — Riwayat Mutasi Stok

**READY_FOR_QA · 9 Oktober 2026 · Software Developer Senior 6.**

Sinyal workspace: **SD6-004-STOCK-MOVEMENT-READY-FOR-QA**. Alur berikutnya QA perilaku → QC kontrak/UI → PM integrasi/publikasi. Source dilepas untuk review; ini hasil developer, belum approval QA/QC atau publikasi.

Menu Riwayat Mutasi Stok sebelumnya tidak memiliki href atau layar. Sekarang `/inventory/stock-movement` membuka daftar per tanggal, tab Bahan Baku/Produk, pencarian nama/SKU/referensi/toko/jenis, filter tanggal/jenis/lokasi, reset dan kondisi kosong. Detail memakai `/inventory/stock-movement/detail?id=<opaque-event-id>`, dengan metadata, jumlah bertanda/satuan dan tombol transaksi sumber bila ada. Header berada di layout, dengan fallback daftar/hub saat history kosong. Detail mengikuti pergantian ID dan perubahan sumber; ID kosong/array/tidak ditemukan atau transaksi yang dihapus menampilkan fallback.

Data dibaca dari inventoryStore/inventoryMaterialStore existing, tanpa koleksi data contoh baru atau mutasi store. Pembelian hanya completed menjadi masuk; waiting/cancelled dikecualikan. Transfer menghasilkan keluar dari toko asal dan masuk ke tujuan, masing-masing mempunyai ID sendiri; tujuan hilang tidak dibuat-buat. Adjustment merupakan penyusutan sesuai form sumber. Nama, kategori, SKU dan satuan transaksi memakai snapshot baris sumber. ID mencakup domain/operasi/transaksi/item/urutan kemunculan/leg; tidak menganggap ID sumber sebagai ID ledger backend.

Catatan material tersimpan tidak memiliki tanggal/lokasi; field itu dinyatakan belum tersedia. Satuan yang tidak direkam tidak diambil dari katalog yang mungkin sudah berubah. Identitas catatan material mengikuti katalog saat ini; detail menjelaskannya. Catatan dapat merujuk referensi transaksi yang sama, sehingga tidak ada penjumlahan kuantitas/balance lintas catatan atau satuan. **Stok akhir historis selalu belum tersedia**, tidak dihitung dari stok saat ini. Sumber masih pratinjau sesi aplikasi; API/persistensi/posted ledger ditangguhkan sesuai arah pengguna.

## Source final

| Owned source | SHA-256 |
| --- | --- |
| `lib/inventory-stock-movement.ts` | `5222b7534e6fa667b8070a445041fc6a1126ba70d0dad80794df5706781ff583` |
| `components/feature/inventory/stock-movement/StockMovementList.tsx` | `e102d0212493f8ffc312b57f254ebf5bc482f9649cf1d9a8815526d5d3f73dca` |
| `components/feature/inventory/stock-movement/StockMovementDetail.tsx` | `9809627e56bd9c3d5a227d0c6c3ce20d51ff9f4596a0b7c1d9ca3dab19dd3dba` |
| `components/feature/inventory/stock-movement/useStockMovements.ts` | `339c24b3157c02a3184385dbc43140bd483c6cc4fac1f093901fc7bf3e3a8027` |
| `app/(no-layout)/inventory/stock-movement/index.tsx` | `e0657c1f2a38cf500e870bfa1640bd63a90a765b0533b9c570ffa4d03afe1b8e` |
| `app/(no-layout)/inventory/stock-movement/detail.tsx` | `14c11320e092f0093e371c6555ccea23cd4c803a161dcc58d1463bc4e29bff69` |
| `app/(no-layout)/inventory/stock-movement/_layout.tsx` | `fd03398a5c750c5f6d3fb44d2483488666cc0f8db6f276266a96c9fdbf7e50db` |

Integrasi terfokus: satu href pada hub `(back-office)/inventory/index.tsx` dan satu child `headerShown:false` pada `(no-layout)/inventory/_layout.tsx`. Codex-2 menambahkan bill-payments pada dua file bersama saat verifikasi; Senior5 memiliki closing-stock. Semua link tersebut dipertahankan. Audit membandingkan baseline sambil mengizinkan hanya tambahan billing yang tercatat. Hash lengkap kedua file adalah konteks baca dalam browser-results/verification, bukan kepemilikan seluruh file atau approval flow billing/closing.

## Verifikasi developer

- **20/20 helper**: status pembelian, transfer dua toko, penyusutan, metadata/satuan tidak tersedia, namespace/ID stabil, baris duplikat, snapshot setelah katalog berubah, jenis per baris, finite/positive quantities, kalender invalid, tujuan transfer hilang, urutan, pencarian/filter/reset, pecahan kecil dan sumber tidak termutasi.
- **9/9 audit**: delta hub/parent terkoordinasi, token semantic/grid4, primitive reuse/tanpa header inline, peta route, serta empat back-handler pada layout produksi dengan navigator/stack/header mock. Ini bukan full Expo Router integration.
- **33/33 browser**: source screen/hook/helper/Zustand/primitives/Header/font/NativeWind produksi, dengan navigator/params dan transport aset browser lokal. Ukuran 320×640, 360×780, 390×844 dan 768×1024; nama panjang, overflow, row target ≥44, detail/source CTA dapat digulir. Search/tab/picker/reset, metadata tidak tersedia, link source dan ID opaque, same-mounted params, perubahan katalog, source deletion/live empty/add, missing IDs dan filter lokasi yang sumber terakhirnya hilang diuji. Runtime/console error **0**, request backend/eksternal **0**, **40 fingerprint** before/after cocok. Screenshot list/detail 320 diperiksa visual; kesamaan Figma belum disertifikasi.
- **4/4 quality commands**: ESLint sembilan source 0 error/warning; Biome exit0; TypeScript flow baru + dua shared roots/dependency closure exit0; scoped whitespace exit0. Guard hash final before/after cocok. Bukan global TypeScript/lint/backend/native pass.

Total 66 kelompok pemeriksaan final. Run antara tidak ditambahkan ke total. Semuanya ada dalam helper-results, audit-results, browser-results dan quality-results; snapshot tujuh source tersimpan byte-identik.

Metro8088 PID9200 existing tidak merespons /status dalam10s dan permintaan entry dalam180s; run itu memiliki **0 assertion UI**. Server tidak direstart/ditambah/dihentikan. Fallback memakai Metro API sekali jalan, transform/file-map cache di `.expo/senior6-stock-movement-offline`, konfigurasi Expo default dan resolver/polyfill web dari CLI terpasang, tanpa require root Metro config/NativeWind Metro plugin. Bundle 11.215.553 byte disajikan seluruhnya melalui Playwright route.fulfill, termasuk aset lokal; tidak ada listener baru. Stylesheet Tailwind tersimpan, provider/font produksi. Tiga hash yang ditrack pada build—Metro config, Babel config dan generated Android cache—tidak berubah. Script replay membaca entry frozen dan menulis output hanya ke `.expo`; validasi syntax dilakukan setelah adaptasi lokasi entry.

Interim disimpan: server tidak tersedia; dua setup crawl root; resolusi Node builtins/config web yang belum lengkap; guard quality yang mendeteksi integrasi billing bersamaan; locator tanggal yang juga cocok heading, locator label Pembelian yang juga cocok catatan, argumen evaluate yang belum dikirim, dan ekspektasi jumlah setelah delete yang lupa satu catatan. Runner diperbaiki dan suite33 diulang pada source aplikasi sama. Tidak ada perubahan app tambahan untuk menyembunyikan kegagalan runner.

## QA/QC dan replay

QA: buka dari hub dan direct link, periksa back/header melalui router aplikasi sebenarnya; replay filter/scroll/detail, perubahan sumber, satuan dan metadata tidak tersedia pada native. QC: cocokkan tujuh hash dan dua kontrak integrasi, review proyeksi read-only/ID/snapshot/semantik. PM menentukan gate integrasi dan publikasi setelah keputusan independen. Figma hanya metadata frame1:30149/30441/30733/30871; callable Figma tidak tersedia pada sesi ini. Native/full auth/router/accessibility/keyboard/theme gelap/Figma parity/API/persistensi/performa volume besar belum disertifikasi.

Run dari root aplikasi:

```powershell
node docs/qa/senior-6-2026-10-09/stock-movement/verify.cjs
```

Perintah itu baca saja; **jangan reseal** paket. Reviewer menyalin packet/runner ke folder review sendiri pada kedalaman yang sama, menyesuaikan lokasi output/cache/config browser sebelum menjalankan ulang. build-offline.cjs menggunakan dependency terpasang; browser.cjs memakai Playwright di `.expo/senior6-tools/node_modules` dan Edge. Quality memakai scoped config di `.expo`; salinan config disertakan sebagai referensi. Evidence/log baru wajib ke folder reviewer, bukan menimpa hasil frozen. Initial seal hanya dilakukan sekali oleh developer.

Paket SD6-001/002/003 dan shared primitive/modal/store/API/backend tidak diedit. Tidak melakukan operasi HP/ADB, server, dependency instalasi, Git index/branch/commit/push/merge atau publikasi.

Execution Profile & Operator Tips: Medium. Hash → QA interaksi/native → QC proyeksi/token → PM. Pertahankan sumber sesi existing dan perubahan billing/closing pemilik lain; jangan menafsirkan data sesi sebagai ledger persediaan.
