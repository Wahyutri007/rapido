# QC SD6-002 — Batas Stok

9 Oktober 2026, Asia/Jakarta. **CHANGES_REQUESTED untuk integrasi fitur**: QC-STOCK-001 P1 OPEN. Delta layar menjaga pasangan jenis/ID dan lulus pemeriksaan terfokus, tetapi kebijakan pengecualian belum sesuai dengan backend. PM belum memperoleh persetujuan QC untuk menyatakan fitur Batas Stok siap dipublikasikan.

Source layar yang diperiksa: `app/(no-layout)/manage/pos-settings/stock-limit.tsx`, SHA-256 `1e0d3195772926d05f7f26c9325f494a2e27074a26edf1441993db374e7dc666`. Persetujuan SD6-001 sebelumnya hanya mencakup hash lama `3a69d2f5…`; tidak otomatis berlaku pada delta ini. [Keputusan terstruktur](DECISION.json), [fingerprint awal](fingerprints-before.json), [fingerprint akhir](fingerprints-after.json).

## Temuan yang menahan approval

**QC-STOCK-001 P1 — kebijakan hybrid backend berlawanan dengan pengecualian pada layar.** Pemilik tindak lanjut: PM dan pemilik backend, dengan koordinasi Senior6 untuk kontrak layar. Ini ditemukan pada dependency backend existing; bukan regresi pasangan jenis/ID yang diperbaiki Senior6.

Layar menyatakan “Terapkan ke: Semua Produk”, “Kecuali Produk/Kategori” dan ID “dikecualikan”. Backend `Menu::isStockManaged()` di `app/Domain/Catalog/Models/Menu.php:67`, khususnya baris 83, justru mengembalikan `true` bila menu mempunyai `stockSettingDetail`. Ia juga tidak memakai `content_type` atau `category_id` saat mode hybrid. `TransactionRequest::after()` di `app/Domain/Order/Requests/TransactionRequest.php:52` mengumpulkan kebutuhan stok hanya bila accessor tersebut bernilai true, kemudian memeriksa ketersediaan pada baris 66.

Dengan batas stok aktif, stok nyata fixture 0 dan kuantitas permintaan 1:

| Konfigurasi tersimpan | Produk fixture | Harus dibatasi menurut copy layar | Accessor aktual | Validasi stok aktual |
| --- | --- | --- | --- | --- |
| item, kecuali menu-1 | menu-1 terpilih | Tidak | true | Ditolak karena stok kurang |
| item, kecuali menu-1 | menu-2 tidak terpilih | Ya | false | Guard stok dilewati |
| item, kecuali menu-1 | menu tanpa kategori tidak terpilih | Ya | false | Guard stok dilewati |
| category, kecuali category-1 | menu-1 pada category-1 | Tidak | false | Diizinkan, sesuai pengecualian |
| category, kecuali category-1 | menu-2 pada category-2 | Ya | false | Guard stok dilewati |
| category, kecuali category-1 | menu tanpa kategori | Ya | false | Guard stok dilewati |

Ada **lima kombinasi yang salah**, masing-masing diuji pada accessor dan after-rule: **10 kegagalan assertion dari satu temuan kebijakan**. Kontrol mode all memblokir ketiga produk stok 0; enabled=false mengizinkan ketiganya. Ketiadaan konfigurasi mengembalikan null sebagai kontrol perilaku existing, bukan persetujuan kebijakan default.

Reproduksi tidak mengandalkan payload buatan untuk konfigurasi: empat payload berasal dari handler layar produksi pada rerun QC. `StockSettingRequest`, validasi ownership, `StockSettingController::store()/index()`, resource dan relasi Eloquent produksi menyimpan serta membaca konfigurasi di SQLite `:memory:`. Keempat roundtrip lulus dan membuktikan jenis/ID tersimpan benar. `Menu` produksi lalu membaca relasi dari database memory tersebut; `StockService::getStockInStore()` produksi menghitung 0 dari tabel inventori fixture kosong; `TransactionRequest::after()` produksi dijalankan dengan graph keranjang terisi. Hanya pengambilan keranjang dan `Cart::load()` diadaptasi untuk memasok graph yang sudah dimuat. Shift terbuka diperiksa oleh accessor/SQL Store produksi pada tabel memory.

Tidak ada HTTP, transaksi penjualan yang dibuat, atau perubahan database aplikasi. Hasil membuktikan kesalahan guard stok produksi pada fixture terisolasi; tidak mengklaim ada penjualan stok minus yang benar-benar disimpan pada toko pengguna.

Reproduksi dari root aplikasi:

```powershell
php docs/qa/qc-stock-contract-2026-10-09/stock-policy.php
```

Expected saat temuan masih ada: **20/30 lulus, 10 gagal, exit 1**. [Runner](stock-policy.php) dan [hasil, payload, roundtrip, SQL, hash backend](stock-policy-results.json) menyediakan bukti lengkap.

## Hasil review layar dan kontrak Request

| Pemeriksaan QC | Lulus | Gagal |
| --- | ---: | ---: |
| Rerun lifecycle developer, layar produksi/React DOM | 31 | 0 |
| Rerun Request/ownership backend, 19 payload layar + 6 kontrol negatif | 25 | 0 |
| Tambahan layar QC, React StrictMode + SearchBar produksi | 24 | 0 |
| Tambahan ownership QC, ID sama pada namespace menu/kategori | 6 | 0 |
| Tambahan controller/accessor/guard stok QC | 20 | 10 |
| **Total eksekusi pemeriksaan, termasuk cakupan berulang** | **106** | **10** |

31 rerun memakai runner developer byte-identik; hanya `__dirname` output diarahkan ke paket QC. Browser Edge headless milik runner ditutup. UI/query/router memakai adapter, tanpa Metro atau server. [Hasil](results.json), [payload yang benar-benar dikirim handler](payloads.json), [wrapper rerun](rerun.cjs). PHP rerun memakai salinan byte-identik runner developer dan membaca payload rerun QC; seluruh query validasi memakai memory database. [Hasil backend](backend-results.json).

24 pemeriksaan independen menjalankan layar serta SearchBar produksi. ID teks yang sama tidak mencampur jenis ketika server berganti item/kategori saat picker terbuka; Cancel memakai data server terbaru bila belum ada draft; commit menjaga pasangan; SearchBar nyata memfilter segera/case-insensitive dan reset saat buka ulang. Toggle beberapa pilihan atau pilihan yang sama dalam satu batch tidak kehilangan update; error/refetch/daftar kosong tidak menghapus draft yang telah diterapkan. Handler langsung diblokir saat initial settings pending/error atau mutation pending; data cache masih dapat disimpan saat background error. Flag disabled/loading CTA, URL gambar menu dan route detail tetap sesuai kontrak. [Runner](independent-screen.cjs), [hasil](independent-screen-results.json). React/runtime error 0.

6 pemeriksaan Request independen menggunakan ID yang sama di tabel menu/kategori dengan owner berbeda dan dengan owner sama. Kepemilikan dinilai pada model sesuai `content_type`; ID asing pada namespace yang benar tetap ditolak dan ID yang dimiliki pada kedua namespace menghasilkan morph type yang berbeda. [Runner](domain-identity.php), [hasil](domain-identity-results.json).

50 fingerprint source/dependency/handoff/harness cocok dan stabil selama review; 24 fingerprint tambahan runner kebijakan backend juga stabil. Handoff developer belum menyediakan manifest scoped final baru; binding source hasil31 dan hash backend/payload hasil25 dicocokkan langsung. Supplement integrasi Query/Axios Senior6 masih disebut akan disusulkan pada handoff yang diperiksa, sehingga tidak dihitung sebagai bukti QC.

ESLint satu source: 0 error/0 warning. Biome check dan git diff --check source: exit 0. Tidak menjalankan full-project TypeScript atau duplikasi typecheck global; klaim TypeScript scoped 0 diagnostic berasal dari handoff developer, bukan rerun QC. [ESLint](eslint.json), [rekaman gate kualitas](quality-results.json).

## Tindak lanjut developer dan PM

1. Selaraskan kebijakan domain dengan copy layar. Bila daftar tetap bermakna pengecualian, mode hybrid harus membatasi produk di luar daftar, mengevaluasi namespace item/category yang benar, dan menjaga cakupan owner/setting. Inversi boolean menu saja tidak menyelesaikan kasus kategori.
2. Pertahankan perbaikan pasangan `content_type` + ID pada layar; jangan mengirim ID kategori sebagai item untuk melewati masalah backend. Rekam kontrak untuk respons legacy tanpa content_type dan produk tanpa kategori serta dampak terhadap konfigurasi yang telah tersimpan.
3. Ulang suite30 kebijakan ini pada koreksi backend, ditambah kasus namespace/ownership dan regresi all/disabled. Serahkan source hash baru, bukti persistensi/validasi stok dan supplement Query/Axios yang sudah final untuk recheck QC. Temuan ditutup oleh QC setelah perilaku sesuai; keputusan publikasi tetap milik PM.

Delta layar **PASS_DELTA secara terbatas** untuk state/draft/jenis/ID/loading/error/Request. Keputusan keseluruhan paket **CHANGES_REQUESTED** karena fitur terintegrasi belum menerapkan kebijakan yang dijelaskan ke pengguna. Tidak ada patch aplikasi/backend yang diterapkan oleh QC.

Native/gesture/animasi/aksesibilitas/header/auth middleware, jaringan/API/database nyata, penciptaan transaksi, bundling, Figma dan styling legacy/full-app belum disertifikasi. Tool Figma callable tidak tersedia saat discovery profil ini. Startup cache/alert kuning tetap paket terpisah dengan temuan terbuka, tidak ditutup oleh hasil Batas Stok.

[Catatan koreksi harness](harness-notes.json) memisahkan kegagalan persiapan fixture/ekspektasi runner dari 10 kegagalan produk final. QC tidak mengubah source aplikasi/backend/dependency/harness developer/branch/index, commit/push, Metro/server/HP atau laporan PDF snapshot. Sinyal untuk developer/PM disampaikan melalui workspace dan SESSION_COORDINATION.md; tidak mengklaim percakapan lain telah menerima pesan langsung.
