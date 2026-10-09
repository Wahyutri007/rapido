# QC recheck cache startup — 9 Oktober 2026

**QC-NATIVEWIND-CACHE-20261009-PASS-RECHECK**. Temuan **QC-STARTUP-CACHE-001 P3 CLOSED_BY_RECHECK** pada empat file CJS final Senior 7. Gate yang sebelumnya berisi empat error Biome, satu warning, dan satu info kini bersih. Keputusan ini meloloskan delta cache/config/harness tersebut untuk review integrasi PM; warning rute dan dependency tetap mempunyai gate terpisah.

## Hasil yang menjadi dasar keputusan

| Pemeriksaan QC | Lulus | Gagal |
| --- | ---: | ---: |
| Initializer CSS Interop terpasang, cache sementara | 10 | 0 |
| Batas guard path, isi, kegagalan dan pemulihan filesystem | 16 | 0 |
| Queue/config produksi dalam VM dengan adapter Expo/NativeWind | 15 | 0 |
| Tambahan kegagalan harness dan cleanup di filesystem memori | 3 | 0 |
| Kesetaraan AST dan batas perubahan fungsi pembungkus | 5 | 0 |
| **Total pemeriksaan** | **49** | **0** |

Ada **44 pemeriksaan perilaku** dan **5 pemeriksaan kontrak AST**. Jumlah operasi queue tidak dimasukkan ke total assertion: stress menjalankan 3000 read + 200 write, maksimum 64 bersamaan, dan pulih setelah error; suite batas queue menjalankan 258 read tambahan. Kegagalan fixture adalah error yang sengaja diuji. Tidak ada kegagalan runtime tak terduga pada replay.

ESLint empat source **0 error/0 warning**, Biome dengan `--error-on-warnings` **exit 0 tanpa diagnostic**, pemeriksaan syntax empat file **exit 0**, dan scoped `git diff --check` **exit 0**. QC menjalankan pemeriksaan tersebut pada source aktual. TypeScript tidak dijalankan karena delta hanya CJS.

Rincian: [replay-results.json](replay-results.json), [independent-results.json](independent-results.json), dan [quality-results.json](quality-results.json).

## Perubahan yang diperiksa

`metro.config.js` dan `scripts/verify-metro-cache.cjs` mempunyai AST semantik utuh yang sama dengan snapshot sebelum koreksi; hanya format berubah. Seluruh AST helper guard tetap sama setelah menormalkan satu function expression menjadi arrow. Body pembungkus tidak menangkap `this`, `arguments`, `super`, atau `new.target`; delegasi ke filesystem tetap memakai receiver `fs` secara eksplisit.

Pada `scripts/verify-nativewind-cache.cjs`, kondisi dan throw validasi direktori tetap sama, kini langsung sesudah `mkdtemp`, sebelum try/finally. Penulisan JSON berubah menjadi template literal yang menghasilkan isi yang sama. Perbandingan AST seluruh file mengizinkan tepat dua perubahan tersebut; bukan sekadar membandingkan potongan fungsi.

Tiga pemeriksaan baru menjalankan harness produksi dengan adapter filesystem/initializer di memori:

- Target sementara yang tidak memenuhi validasi gagal sebelum initializer, write, atau cleanup.
- Error dari initializer yang dibungkus guard mempertahankan identitas error awal; filesystem dipulihkan dan cleanup dijalankan.
- Kegagalan penulisan hasil setelah sepuluh check selesai mempertahankan error awal dan tetap melakukan cleanup.

Ketiga kasus ini memeriksa harness/cleanup; uji initializer dependency asli tetap sepuluh kasus terpisah di direktori sementara. Guard tetap terbatas pada empty string write sinkron ke lima file cache native yang sudah berisi, selama inisialisasi konfigurasi. Buffer kosong serta write async, nonempty, atau di luar periode inisialisasi tetap mengikuti filesystem asli. Perubahan versi dependency perlu recheck.

## Source yang diloloskan

| File | SHA-256 |
| --- | --- |
| `metro.config.js` | `f9d846ce33d2b7e9e0694e637053326138c802c50cc9161aa47c4d9501a2f367` |
| `scripts/preserve-nativewind-cache.cjs` | `6c499b8f751f28be7b6178c8e04b77fdca7fc552f3b7ef6459c818ade830c956` |
| `scripts/verify-nativewind-cache.cjs` | `0d5146864121ff56a8a6ca261134af9268a876a27ca29dc566d16d56de366529` |
| `scripts/verify-metro-cache.cjs` | `55bd6d366887d4815fec99b548d8582c68e504cea2812291c28adc33e69bf0be` |

Initializer dependency yang diuji: CSS Interop **0.2.7**, `dist/metro/index.js` hash `96e413fea6134f9dc3aa9841e03d9e07e1bcf3fbb8552f0e817efe8f7527946a`.

## Integritas dan batas verifikasi

17 fingerprint handoff final cocok sebelum replay. Empat snapshot source awal cocok dengan keputusan QC lama. 33 input source/dependency/config/handoff tetap stabil selama recheck, dan 37 entri fingerprint bukti historis tetap cocok. Paket developer dan QC lama tidak ditimpa. Runner guard dan queue disalin byte-identik ke folder QC baru dengan kedalaman direktori yang sama; output ditulis hanya ke folder reviewer. Source aplikasi tidak diedit QC.

Cache Android aktif tetap **193003 byte**, hash `056c153e8c69e6815a4afef0d77c5cfc6bc38adc7ea5dd21b76bcca74f11aa6b`, dengan flag class dark. Cache dibaca sebelum/sesudah dan tidak menjadi target write pengujian. Observasi proses setelah pemeriksaan disimpan dalam [runtime-observation.json](runtime-observation.json); QC tidak mengatur ulang proses server atau HP.

Metadata replay awal menyimpan daftar argumen tanpa field exit code walaupun assertion dan semua child command telah lulus. Metadata diperbaiki pada runner sendiri dan 41 pemeriksaan diulang pada source yang sama, dihitung sekali. Hasil awal dipertahankan dalam [initial-replay-metadata.json](initial-replay-metadata.json); ini koreksi pelaporan QC, bukan kegagalan aplikasi.

Recheck tidak memuat root Metro melalui require nyata, membuat bundle/server, menggunakan ADB/HP, memanggil API/backend, mengubah dependency, atau melakukan operasi branch/index/commit/push/merge. Queue/config memakai source produksi dalam VM dengan adapter; initializer dependency asli memakai cache sementara. Dua cold launch dan config load proses kedua dari paket developer lama **tidak diulang** pada hash baru. Full app/native, Figma, auth, route, persistensi dan integrasi seluruh SDK tidak disertifikasi.

## Serah-terima

Closure temuan cache tercatat dalam [DECISION.json](DECISION.json); keputusan lama [CHANGES_REQUESTED](../qc-nativewind-cache-2026-10-09/DECISION.json) tetap histori. **QC-HP-WARNING-001** menunggu keputusan independen atas koreksi routing/native Senior 7, dan **QC-HP-WARNING-002** tetap terbuka untuk pemilik integrasi dependency. **QC-SUCCESS-001 P2** pada modal mendatar juga tetap terpisah; kelulusan cache tidak menutupnya.

PM dapat menilai integrasi/publikasi delta empat file yang hash-nya cocok dengan keputusan ini. Bukti native terdahulu dan keputusan modul lain tetap dibatasi cakupannya. Kode diserahkan melalui `docs/SESSION_COORDINATION.md`; tidak mengklaim pesan di percakapan lain sudah diterima.

Paket disegel sekali dengan [artifact-manifest.json](artifact-manifest.json). Verifikasi baca saja dari root aplikasi: `node docs/qa/qc-nativewind-cache-recheck-2026-10-09/verify-artifacts.cjs`.
