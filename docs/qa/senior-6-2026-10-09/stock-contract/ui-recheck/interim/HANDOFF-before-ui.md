# SD6-002 — Kontrak pengecualian Batas Stok

9 Oktober 2026, Asia/Jakarta. Software Developer Senior 6. **READY_FOR_QA** untuk delta source; belum approval QA/QC. Sinyal disampaikan melalui workspace. Setelah kode dan pemeriksaan terfokus selesai, Senior6 melanjutkan batch integrasi Query/Axios tanpa Metro; bukti tambahan disusulkan.

Scope aplikasi hanya `app/(no-layout)/manage/pos-settings/stock-limit.tsx`. SHA-256 final `1e0d3195772926d05f7f26c9325f494a2e27074a26edf1441993db374e7dc666`; baseline QC SD6-001 `3a69d2f54477dfb46dc342a8820c71747899ab75cb096c28820c1693660edac4` disimpan dalam [stock-limit.baseline.txt](stock-limit.baseline.txt). Persetujuan QC tiket sebelumnya tidak otomatis mencakup perubahan ini. Printer dan Pembulatan tidak diedit pada batch ini.

## Masalah dan hasil

Simpan konfigurasi `content_type: category` sebelumnya mengirim `item` dengan ID kategori. Backend memvalidasi ID item pada Menu, sedangkan ID kategori pada Category milik owner. Picker juga memberi ID `prod-*` dan jumlah stok contoh saat menu belum tersedia, termasuk ketika query kosong/gagal.

Jenis dan ID sekarang disimpan sebagai satu draft. Category memakai query kategori, item memakai query menu; jenis picker terkunci bersama daftar ID ketika dibuka. Refetch jenis/data saat picker terbuka tidak mencampur ID kategori/menu. Batal mengikuti data server yang belum diedit; Selesai menerapkan pasangan draft. Draft yang sudah diterapkan dan switch bertahan saat refetch/gagal mutation. Daftar kosong tidak menghapus ID existing. Tidak ada ID atau angka stok contoh pada picker.

Mode `all` mengabaikan detail pengecualian lama. Respons lama tanpa content_type memakai stockable_type kategori jika seluruh detail memang kategori; menu/default memakai item. Loading/error/empty/search kosong memiliki pesan Indonesia dan error memiliki Muat Ulang. Simpan serta pembukaan picker diblokir saat settings awal masih pending atau gagal tanpa data; respons sukses tanpa konfigurasi existing tetap dapat membuat default all.

Layar mengikuti jenis existing; pilihan untuk mengganti item ↔ kategori secara manual belum ditambahkan. Tidak mengubah hook/DTO, endpoint, primitive, route, dependency aplikasi atau backend.

## Verifikasi developer

- [Lifecycle](results.json): baseline **6 lolos/25 gagal**, final **31/31 lolos**, runtime/console error 0. [Runner](lifecycle.cjs) menjalankan screen produksi dan React DOM, dengan adaptor UI/router/query; bukan native/UI penuh. 25 kegagalan baseline merupakan skenario terdampak, bukan 25 akar bug terpisah.
- [Kontrak backend](backend-results.json): **25/25 lolos**, 19 payload handler screen + enam kontrol negatif. StockSettingRequest, validated(), ValidUserContent dan query kepemilikan produksi dijalankan pada SQLite `:memory:` terisolasi. ID salah jenis, owner lain, ID contoh dan ID hilang ditolak. Hasil stockables sesuai polymorphic `menu`/`category`; all tidak membuat stockables. [Runner](backend-contract.php), [payload](payloads.json). Tidak mengakses HTTP atau mengubah database aplikasi.
- [ESLint](eslint.json): satu file 0 error/0 warning. Biome bersih setelah format; git diff --check bersih.
- TypeScript terfokus satu root dan dependency closure: exit 0, 0 diagnostic. [Config](scoped-tsconfig.json) dijalankan dari `.expo/senior6-stock-tsconfig.json`; bukan full-project gate PM.

Perintah dari root aplikasi:

```powershell
node docs/qa/senior-6-2026-10-09/stock-contract/lifecycle.cjs --baseline
node docs/qa/senior-6-2026-10-09/stock-contract/lifecycle.cjs
php docs/qa/senior-6-2026-10-09/stock-contract/backend-contract.php
node node_modules/eslint/bin/eslint.js 'app/(no-layout)/manage/pos-settings/stock-limit.tsx' --no-cache --max-warnings 0
node node_modules/@biomejs/biome/bin/biome check 'app/(no-layout)/manage/pos-settings/stock-limit.tsx'
Copy-Item docs/qa/senior-6-2026-10-09/stock-contract/scoped-tsconfig.json .expo/senior6-stock-tsconfig.json
node node_modules/typescript/bin/tsc --noEmit --project .expo/senior6-stock-tsconfig.json
```

## Serah terima dan batas

QA: cocokkan hash, uji item/category, ID yang sama pada jenis berbeda, penggantian jenis server selama picker, search/refetch/batal/selesai/clear, settings loading/error, daftar kosong/error/retry, dan gagal simpan. QC: tinjau pasangan jenis/ID dan kontrak backend beserta hasil QA. PM: gate snapshot akhir sebelum publikasi.

UI/browser penuh, navigator/auth, API/database produksi, controller persistence, native/HP, Figma dan styling legacy belum disertifikasi. Tidak memulai Metro tambahan selama perbaikan cache HP Senior7 aktif. API menentukan kepemilikan/keberadaan ID akhir; ID existing yang tidak tampak pada query daftar dipertahankan dan dapat ditolak backend bila memang sudah dihapus. Hasil ini tidak mengesahkan fitur Printer atau applyTo Pembulatan.

Tidak commit/push/merge, mengubah branch/index, mengambil shared source atau mengendalikan server/HP sesi lain. Bukti dan hasil developer terpisah dari keputusan QA/QC.
