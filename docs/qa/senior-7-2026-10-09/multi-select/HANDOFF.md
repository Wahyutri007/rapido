# Senior 7 — MultiSelect lifecycle

Tanggal 9 Oktober 2026. **FINAL READY_FOR_QA**, belum persetujuan QA/QC atau PM.

## Masalah dan perubahan

Ketika panel MultiSelect terbuka, perubahan nilai dari form (`reset`, `setValue`, atau pergantian data) sebelumnya hanya memperbarui pill. Draft panel tetap lama, sehingga Selesai dapat menimpa nilai form yang baru. Baseline integrasi RHF: reset dari `[a,b]` menjadi `[c]` masih mengirim `[a,b,c]` setelah konfirmasi dan membuat form dirty lagi.

`components/common/MultiSelect.tsx` kini membandingkan isi `selectedValues` lewat JSON, lalu menyelaraskan draft sebelum child dirender. Array baru dengan isi/urutan sama tetap mempertahankan draft pengguna. JSON juga menjaga ID berisi delimiter tidak bertabrakan. Toggle individual dan Pilih Semua memakai updater fungsional; perubahan dalam batch yang sama membaca pilihan terbaru dan tidak menambahkan duplikat dari stale closure.

Source final SHA-256: `0afa7aa7faa366fed7bbac063db6aec695a76f1b4aba72193454ec10ad6fbdc1`.
Baseline: `c6d6cb13a86e1c0a7ff178abd1e28492521171059f88c49c24785519df392f72`, snapshot `MultiSelect.before.txt`.

Props publik, JSX, styling dan routing tetap. Selesai adalah commit; Batal/backdrop membuang draft; hapus pill langsung mengirim nilai. Pencarian/Pilih Semua hanya mengubah opsi yang terlihat dan menjaga pilihan tersembunyi. ID committed yang belum tersedia di `items` tetap dipertahankan, agar refetch sementara kosong tidak menghapus relasi form.

## Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Baseline lifecycle | 19 lulus / 6 gagal dari 25 |
| Baseline RHF | 10 lulus / 5 gagal dari 15 |
| Final lifecycle StrictMode | 28/28 lulus; 3 kasus batch tambahan sesudah baseline |
| Final react-hook-form Controller/useForm produksi | 15/15 lulus |
| Error runtime/act tidak diharapkan | 0 |
| ESLint source | 0 error / 0 warning |
| Biome check source | Lulus tanpa perubahan format |
| TypeScript terfokus | MultiSelect + 9 file pemanggil dan dependency closure, 0 diagnostic |
| git diff --check terfokus | Lulus |

Seluruh perintah dijalankan dari root aplikasi:

```powershell
node docs/qa/senior-7-2026-10-09/multi-select/lifecycle.cjs lifecycle
node docs/qa/senior-7-2026-10-09/multi-select/lifecycle.cjs integration
node node_modules/eslint/bin/eslint.js components/common/MultiSelect.tsx
node node_modules/@biomejs/biome/bin/biome check components/common/MultiSelect.tsx
node docs/qa/senior-7-2026-10-09/multi-select/typecheck.cjs
git diff --check -- components/common/MultiSelect.tsx docs/qa/senior-7-2026-10-09/multi-select
```

Harness memakai React/test-renderer 19.2.3 yang sudah tersedia di `.expo/senior7-test-tools`; tidak memasang dependency aplikasi. `lifecycle.cjs` memakai helper React dari `../barcode-lifecycle.cjs`, adapter host RN/UI/SearchBar, dan source produksi MultiSelect. Suite integration memuat RHF terpasang dengan React yang sama. Seluruh `useState`/Controller/reset/setValue/onChange asli; tidak meniru algoritma komponen. Satu warning deprecation react-test-renderer yang dikenal disaring oleh helper; warning lain dikumpulkan. Baseline JSON memiliki 40 assertion; final menambahkan tiga kasus batch sehingga 43. Bukti historis tidak ditulis ulang.

## Pemanggil dan batas

Sembilan file / sebelas penggunaan: katalog Voucher, Extra Menu, Promo (toko/hari), Pembayaran, Tipe Pesanan, Menu (tipe/tambahan), Diskon, Bundling, dan SalesTargetForm. Semua pemanggil dibaca dan typechecked; tidak diedit. Pemakai memberikan array terkontrol lewat RHF field, watch/setValue, atau rows target. Identitas sumber sebelum/sesudah typecheck stabil dan dicatat di `typecheck-results.json`.

Belum menguji seluruh layar/form, browser, native/gesture/animasi/aksesibilitas, API, backend, atau payload domain masing-masing. Figma metadata diperiksa ulang dan ditolak akses editor; perubahan ini khusus lifecycle, tanpa klaim pencocokan visual. Native startup yang sudah diperbaiki dan sedang ditinjau QC adalah paket terpisah. Tidak memulai Metro/bundle atau mengoperasikan HP/server dalam batch ini. TypeScript penuh tetap gate integrasi PM.

## Sinyal proses

QA: ulang baseline/regresi, external reset ketika open, array ekuivalen saat draft, pilih semua hasil pencarian, Batal/Selesai dan RHF dirty/value. QC: review kontrak props/JSX, cakupan caller, fingerprint final, dan batas adapter. Sesudah QA dan QC lulus, serahkan kepada PM untuk gate integrasi/publikasi. Sinyal dicatat di SESSION_COORDINATION.md; bukan klaim pesan telah dibaca sesi lain. Tidak ada commit/push/merge/perubahan branch atau index oleh Senior7.
