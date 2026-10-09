# SD6-002 / QC-STOCK-UI-002 — Batas Stok

9 Oktober 2026, Asia/Jakarta. Software Developer Senior 6. **READY_FOR_QA → QC_RECHECK → PM** melalui workspace. Ini hasil developer; keputusan QA/QC independen dan publikasi tetap terpisah.

Scope aplikasi hanya `app/(no-layout)/manage/pos-settings/stock-limit.tsx`. SHA-256 final **`0b61bef95fe023f1aa685560151c716c4c58faed9164509cd70546262878cc9d`**. [Manifest](verification.json) mengikat hasil, runner, snapshot dan screenshot. Hash SD6-002 sebelum koreksi token `1e0d3195772926d05f7f26c9325f494a2e27074a26edf1441993db374e7dc666` disimpan pada [stock-before.txt](ui-recheck/stock-before.txt); baseline SD6-001 `3a69d2f54477dfb46dc342a8820c71747899ab75cb096c28820c1693660edac4` pada [stock-limit.baseline.txt](stock-limit.baseline.txt). Approval tiket lama tidak otomatis mencakup hash baru.

## Perilaku akhir

Konfigurasi kategori memakai daftar kategori dan mempertahankan `content_type: category` bersama ID kategori. Produk memakai menu dan `item`. Jenis dan ID disimpan sebagai satu draft; picker membekukan pasangan saat dibuka sehingga refetch yang mengganti jenis tidak mencampur ID. Batal mengikuti data server yang belum diedit, Selesai menerapkan draft, dan gagal simpan mempertahankan pilihan. ID existing yang tidak muncul dalam daftar tetap dipertahankan.

Daftar memakai data query, tanpa ID `prod-*` atau jumlah stok contoh. Loading, error, kosong, pencarian kosong dan Muat Ulang memiliki keadaan tersendiri. Simpan/pembukaan picker diblokir saat settings awal belum tersedia; respons sukses `data: null` dapat membuat konfigurasi default. Mode `all` mengabaikan detail lama. Respons lama menginferensi kategori bila seluruh detail memang kategori. Layar mengikuti jenis existing; kontrol penggantian jenis secara manual belum ditambahkan.

**QC-STOCK-UI-002:** 15 occurrence token dikoreksi: delapan spacing pecahan, lima kelas zinc, override padding Card, dan override background SearchBar. Spacing mengikuti kelipatan empat, warna memakai token semantik, primitive mempertahankan default. Padding horizontal row mengikuti Card untuk menjaga lebar pada 320px. [Audit](ui-recheck/token-audit.json) menemukan **0** occurrence tersisa dalam empat kategori QC; AST setelah menghapus atribut className identik dengan source sebelum koreksi token. Logika, copy dan hierarki tetap.

**QC-STOCK-UI-001:** memakai SuccessModal produksi hasil Codex-3, hash `f90eec3d8d4b95ad5a5b1b6ff7cc354e9097fe5d232eef4c0d020ebb61f4e495`. Senior6 tidak mengedit modal bersama. Tombol Mengerti terlihat pada 320×640 dalam replay layar stok. Penutupan temuan shared modal tetap wewenang [QC recheck](../../qc-success-modal-2026-10-09/); hasil pemakai stok ini tidak meluluskan semua pemakai modal.

Hook/DTO, endpoint, backend, primitive, route, dependency aplikasi, Printer dan Pembulatan tidak diedit dalam batch ini.

## Verifikasi pada hash final

| Pemeriksaan | Hasil | Cakupan |
| --- | --- | --- |
| [Browser UI](ui-recheck/browser-results.json) | **36/36 PASS**, runtime/console error 0 | Source screen, RN-web, primitive, font, modal dan provider produksi; viewport 320×640, 360×780, 390×844, 768×1024; transport fixture dan layout Expo Router terisolasi |
| [Lifecycle](results.json) | **32/32 PASS**, runtime/console error 0 | Source screen + React DOM; adaptor UI/query/router. Baseline **6 PASS / 26 FAIL** pada 32 skenario yang sama |
| [Query/Axios](query-http-results.json) | **12/12 PASS**, runtime/console error 0 | Hook/factory/Common/usePostRequest/React Query/Axios produksi; HTTP diintersepsi, adaptor host UI/storage/router |
| [Audit token/AST](ui-recheck/token-audit.json) | **15 → 0**, AST non-className identik | Empat kategori QC-STOCK-UI-002; bukan audit seluruh primitive atau literal props warna ikon/Switch |
| [Quality](quality-results.json) | Semua exit **0** | ESLint 0 error/0 warning, Biome bersih, scoped diff-check bersih, TypeScript satu root + dependency closure 0 diagnostic |

34 fingerprint kontrak UI sebelum/sesudah replay stabil. Setelah replay, dua layout routing read-only berubah pada pekerjaan Senior7 QC-HP-WARNING-001; [observasi drift](ui-recheck/context-drift.json) mencatat hash lama/baru. Entry browser menyediakan layout virtual sendiri dan tidak menjalankan dua layout aplikasi itu. 32 fingerprint UI lainnya, source stok/modal, serta 62 fingerprint source/library Query tetap cocok saat manifest akhir. Hasil ini tidak mengesahkan perubahan routing Senior7; router penuh tetap gate terpisah. Daftar fingerprint bukan seluruh dependency graph Metro. Screenshot [layar 320](ui-recheck/main-320.png), [picker 320](ui-recheck/picker-320.png), [kategori 320](ui-recheck/category-320.png), [sukses 320](ui-recheck/success-resize-320.png) dan [gagal simpan](ui-recheck/save-error-320.png) diperiksa visual.

Runner browser mengulang 36 pemeriksaan QC ke folder developer sendiri. Percobaan pertama berhenti setelah tiga pemeriksaan saat Playwright menunggu navigasi setelah klik yang hanya membuka picker; screenshot menunjukkan picker sudah terbuka. Runner memakai `noWaitAfter` dan tetap menunggu keadaan UI yang diminta. Kegagalan setup disimpan di [interim](ui-recheck/interim/), tidak dihitung sebagai PASS. Kesalahan path fingerprint `lib/utils.ts` dibetulkan menjadi direktori modul sebelum replay final. Warning RN-web existing tercatat pada hasil; tidak ada console error. Tidak menimpa bukti/runner/keputusan QC.

## Reproduksi reviewer

Jalankan dari root aplikasi, gunakan output reviewer sendiri bila mengulang agar paket final tetap frozen:

```powershell
node docs/qa/senior-6-2026-10-09/stock-contract/lifecycle.cjs
node docs/qa/senior-6-2026-10-09/stock-contract/query-http.cjs
node docs/qa/senior-6-2026-10-09/stock-contract/ui-recheck/audit.cjs
Copy-Item docs/qa/senior-6-2026-10-09/stock-contract/scoped-tsconfig.json .expo/senior6-stock-tsconfig.json
node docs/qa/senior-6-2026-10-09/stock-contract/quality.cjs
Copy-Item docs/qa/senior-6-2026-10-09/stock-contract/ui-recheck/ui-entry.jsx .expo/senior6-stock-ui-entry.jsx
# Browser memakai Metro 127.0.0.1:8088 yang sudah ada; jangan memulai/restart server milik sesi lain.
node docs/qa/senior-6-2026-10-09/stock-contract/ui-recheck/browser.cjs
# verify hanya membaca paket yang sudah disegel; tidak menimpa manifest.
node docs/qa/senior-6-2026-10-09/stock-contract/verify.cjs
```

## Status backend dan batas review

Mengikuti [arah pengguna terbaru](../../qc-stock-contract-2026-10-09/CURRENT_STATUS.md), fokus UI; backend akan diganti. Backend QC-STOCK-001 tetap **DEFERRED**, bukan CLOSED dan bukan gate UI. Tidak melanjutkan proposal/backend persistence. [26 pemeriksaan Request/ownership](backend-results.json), 20 payload + enam kontrol negatif, serta GET `data: null` pada SQLite `:memory:` selesai sebelum pengarahan UI. Bukti ini disimpan sebagai histori, tidak diulang pada hash token final dan tidak mengesahkan backend/persistensi.

QA menguji interaksi layar pada hash final, kategori/produk, search/batal/selesai/refetch, loading/error/kosong/retry dan modal 320px. QC menilai ulang QC-STOCK-UI-002 pada hash final serta shared modal melalui pemiliknya. PM menjalankan gate integrasi/publikasi. Native/HP, keyboard/accessibility, router/auth penuh, Figma parity, API/database nyata dan seluruh pemakai modal belum disertifikasi. Akses Figma callable tidak tersedia.

Browser Senior6 selesai. Metro 8088 existing dipakai untuk bundle entry sendiri tanpa start/restart/stop; tidak mengambil HP/ADB, source pemilik lain, config/cache Android, branch/index atau commit/push/merge. Paket SD6-001 dan keputusan QC sebelumnya tetap histori.

Execution Profile & Operator Tips: Medium untuk pasangan jenis/ID dan geometry picker. Cocokkan hash → QA interaksi → QC token/modal → PM; gunakan folder reviewer terpisah dan pertahankan server bersama.
