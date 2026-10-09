# PM-CASHIER-PRICE-001 — harga item dan subtotal keranjang

Status: **developer selesai → QA independen → QC → keputusan PM**. QA independen sudah ditugaskan oleh root; hasilnya belum diterima dalam handoff developer ini. Ini perbaikan cacat source terbatas; bukan implementasi checkout lengkap atau persetujuan kesamaan Figma.

Sebelumnya `CartItem` dan ringkasan menampilkan `Rp -1`; perhitungan yang dikomentari memakai `menu.price` yang tidak ada pada tipe saat ini. Sekarang harga item memakai snapshot katalog `discount.price ?? sell_price`, menambahkan harga varian per unit, lalu mengalikan jumlah. Semua kelompok `cart.details` ikut subtotal. Snapshot contoh yang sudah ada menghasilkan item Rp 43.000 dan Rp 100.000, subtotal Rp 143.000. Persentase/value diskon tidak dihitung ulang; ini mengikuti semantik katalog existing.

API murni di `lib/cashier-cart-pricing.ts`:

- `getCartItemPricing(item: CartDetailItem | null | undefined)` menghasilkan `{ unitPrice, lineTotal }` atau `null`.
- `getCartSubtotal(cart: Cart | null | undefined)` menghasilkan subtotal item atau `null`; keranjang kosong valid menghasilkan `0`, keranjang belum tersedia menghasilkan `null`.

Jumlah wajib integer positif yang aman. Harga yang dipakai wajib integer Rupiah nonnegatif yang aman; nilai negatif, pecahan, `NaN`, tak hingga, string, nilai hilang atau overflow penjumlahan/perkalian menghasilkan `null`. Item invalid membuat seluruh subtotal tidak tersedia, sehingga UI tidak diam-diam menghitung sebagian item. Diskon nol dan varian nol tetap valid; diskon invalid tidak diabaikan demi memakai harga dasar. Snapshot nullish hanya boleh fallback ke harga jual yang diketahui dan valid.

`CartItem` menampilkan `jumlah × harga unit` dan harga baris. Nilai invalid menampilkan **Harga tidak tersedia**, subtotal invalid **Tidak tersedia**. Pajak, biaya lain dan kedua Total menjadi `-`, dengan keterangan **Total pembayaran belum tersedia.** Tidak ada asumsi pajak 10%, biaya nol, diskon pesanan atau total yang wajib dibayar. Komentar perhitungan lama, konstanta `TAX`, import dan fungsi yang sudah tidak dipakai dibuang. Typography/spacing pada baris yang disentuh mengikuti primitive/tokens proyek; tidak ada desain ulang luas.

Validasi developer:

- [developer-tests.json](developer-tests.json): **51 kasus PASS, 0 FAIL**, menguji harga jual, snapshot diskon termasuk nol dan beda terhadap persentase, varian per unit, quantity, multi-kelompok, kosong/null, invalid, overflow dan input tidak dimutasi. Runner [pricing-tests.cjs](pricing-tests.cjs) memakai TypeScript/Node lokal; input `NaN`/Infinity tidak dipindah lewat JSON.
- [developer-typecheck.json](developer-typecheck.json): tiga root source, **1.030 berkas import closure, 0 diagnostic**, `skipLibCheck`, tanpa emit atau incremental cache. Ini pemeriksaan terfokus, bukan TypeScript seluruh proyek.
- ESLint tiga source dan Biome source/runner diperiksa terfokus; hasil final dicatat pada `developer-quality.json` dan `developer-eslint.json`.
- Fingerprint sebelum/sesudah ada pada [source-fingerprints.json](source-fingerprints.json); `before: null` berarti helper baru.

Replay dari root aplikasi, gunakan namespace hasil reviewer agar bukti developer tidak ditimpa:

```powershell
$env:CASHIER_PRICING_RESULT = 'D:/reviewer/cashier-pricing-tests.json'
node --max-old-space-size=256 docs/qa/pm-cashier-pricing-2026-10-09/pricing-tests.cjs
$env:CASHIER_PRICING_TYPECHECK_RESULT = 'D:/reviewer/cashier-pricing-typecheck.json'
node --max-old-space-size=1024 docs/qa/pm-cashier-pricing-2026-10-09/focused-typecheck.cjs
```

Folder output reviewer harus sudah tersedia. Tanpa kedua environment variable, runner hanya membaca source dan menulis hasil ke stdout.

Batas yang perlu dinilai reviewer: schema katalog existing memakai `number().min(0)` dan belum mewajibkan integer. Perbaikan ini menolak harga pecahan daripada membulatkan diam-diam melalui `formatRp`, yang menampilkan nol angka desimal. Kebijakan harga pecahan/fixed-point membutuhkan kontrak uang tersendiri. Cart/DTO masih placeholder dan layar masih membaca `CART` existing, bukan order API. `Bayar Sekarang` tetap callback kosong; `Bayar Nanti` tetap simulasi delay/alert/fixture lama. Perbaikan ini tidak mengubah atau mengesahkan kedua alur tersebut. Endpoint, fixture aplikasi baru, rute/layout, package, dependency, browser, server/HP dan Git tidak diubah. Tidak ada uji native atau perbandingan frame Figma; QA/QC perlu menilai display aktual dan kontrak checkout pada pekerjaan berikutnya.

Execution Profile & Operator Tips: **Medium** untuk kalkulasi finansial dan validation boundary. Batch tunggal tiga source; reviewer memeriksa hash → replay model → display aktual. Jangan menyamakan subtotal dengan total pembayaran atau memakai receipt QA source lama untuk source baru.
