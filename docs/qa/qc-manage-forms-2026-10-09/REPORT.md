# QC empat form Kelola — 9 Oktober 2026

**Status terbaru:** [recheck QC](recheck/REPORT.md) lulus dengan sinyal **QC-MANAGE-FORMS-20261009-PASS-DELTA**; QC-MANAGE-FORMS-001 CLOSED pada hash final di recheck/results.json. Laporan berikut adalah snapshot sebelum koreksi import; hasil dan temuan historis dipertahankan.

**QC-MANAGE-FORMS-20261009-CHANGES-REQUESTED** untuk penyelesaian urutan import. Perilaku empat form lulus pemeriksaan; seluruh gate kualitas belum bersih karena `biome check` masih menghasilkan tujuh diagnostic `assist/source/organizeImports`.

Penerima: Codex-3 dan Project Manager melalui dokumen workspace. Scope: empat route modify Biaya Tambahan, Tipe Pesanan, Metode Pembayaran dan Pajak, serta enam komposisi `components/feature/manage/settings/`. Sepuluh hash source cocok dengan handoff dan tetap sama sebelum/sesudah pemeriksaan.

## QA perilaku dan review

**54 regresi browser developer dijalankan ulang dan 38 assertion tambahan QC lulus: 92/92**, runtime/console error 0 dan request API yang menulis data 0.

Tes menggunakan Edge, Expo Router, empat route dan form produksi, RHF/Zod, NativeWind/Gluestack serta font aplikasi. Layout/header dan daftar entry dibuat sebagai fixture terisolasi; data form berasal dari konstanta contoh produksi. Root/auth aplikasi penuh, SSR, API, perangkat native dan kesamaan Figma tidak diuji.

Regresi mencakup prefill dan label pilihan, draft saat parameter tidak terkait berubah, dialog validasi yang menyatakan perubahan belum disimpan, edit/tambah, validasi wajib, ID hilang/kosong, kembali ke daftar yang sesuai, perpindahan dua ID pesanan dan CTA pada viewport 320×640. Tambahan QC memakai `router.setParams` pada route tetap terpasang: seluruh draft teks/angka bertahan pada ID sama; pindah ke tambah mereset draft/modal; array ID mengambil elemen pertama; error validasi lama dibersihkan; ID kosong memblokir form dan ID valid memulihkannya.

Screenshot Pembayaran dan Pajak 320px diperiksa: CTA berada pada bagian bawah viewport, field/picker memakai primitive proyek, tidak ada overflow horizontal pada pemeriksaan. Screenshot header berasal dari fixture; header layout aplikasi hanya direview melalui source. Screenshot, runner, hasil dan fingerprint tersimpan di direktori ini.

Route kini memisahkan lifetime form per ID. Mapping pilihan pembayaran `bank_transfer`, bank lowercase dan pilihan pajak selaras dengan fixture/schema yang dibaca. Dokumentasi `docs/README.md` menjelaskan bahwa **Periksa Data** hanya memvalidasi pratinjau. Tidak ada endpoint simpan pada empat komposisi ini; laporan ini tidak menyetujui fitur CRUD/persistensi sebagai selesai.

## QC-MANAGE-FORMS-001 — P3, urutan import

`biome.json` mengaktifkan `assist.actions.source.organizeImports`. Pemeriksaan lengkap pada sepuluh source memberikan tujuh error urutan import pada:

- Route `manage/order-type/modify.tsx`, `payment-method/modify.tsx`, `tax/modify.tsx`.
- Komposisi `ExtraModifyScreen.tsx`, `OrderTypeModifyScreen.tsx`, `PaymentMethodModifyScreen.tsx`, `TaxModifyScreen.tsx`.

Ini temuan kualitas source; tidak ditemukan kegagalan runtime terkait import pada tes browser. Klaim formatter developer sesuai hasil `biome format` yang lulus. Formatter dan pemeriksaan lengkap Biome berbeda cakupannya.

| Gate | Hasil |
| --- | --- |
| ESLint sepuluh source, max-warnings 0 | Exit 0, 0 error/warning |
| `biome format` | Exit 0 |
| `biome check` | Exit 1, 7 organizeImports error |
| `git diff --check` scope | Exit 0 |

Patch saran [organize-imports.patch](organize-imports.patch) disiapkan dari salinan file; **belum diterapkan pada aplikasi**. Patch lolos `git apply --check`. AST non-import dan binding import sebelum/sesudah proposal sama. Rincian ada di `style-findings.json` dan `biome-check.json`; output CLI asli juga disimpan. Reporter JSON Biome yang terpasang mengeluarkan separator path Windows tanpa escape; artefak JSON ternormalisasi hanya memperbaiki representasi path reporter.

Codex-3 dapat menerapkan patch atau merapikan import dengan Biome, lalu menyerahkan hash final dan hasil scoped `biome check`/ESLint/diff-check. Pemeriksaan browser tidak perlu diulang hanya karena urutan import jika AST executable/binding tetap sama dan tidak ada perubahan lain; jika ada perubahan perilaku, ulang skenario yang relevan.

## Snapshot runtime dan batas integrasi

Sembilan belas dari dua puluh fingerprint dependency yang direkam tetap sama. `metro.config.js` berubah oleh perbaikan cache startup HP Senior7 selama pemeriksaan. Tes ini memakai konfigurasi sebelum perubahan tersebut dan tidak mengesahkan wrapper cache baru. Jangan menganggap hasil form sebagai bukti startup HP sudah pulih; handoff runtime Senior7 perlu QA/QC terpisah.

Metro tes sendiri port8111/PID24080 dan child40388 dihentikan setelah identitas diperiksa; port8111 terkonfirmasi closed. Browser tes ditutup. Tidak ada source aplikasi/backend/dependency, branch/index, commit/push atau kendali HP yang diubah QC. Source/layout/runtime developer lain dipertahankan. Tidak menjalankan TypeScript global; gate integrasi akhir tetap milik PM. Tool Figma tidak tersedia pada sesi ini.

## Keputusan untuk PM

Perilaku delta lifecycle empat form **lulus** pada sepuluh hash di `source-before.json`. Publikasi batch dari QC ini menunggu penutupan QC-MANAGE-FORMS-001 dan fingerprint final. Tidak ada temuan P1/P2 baru pada perilaku yang diuji. Member telah memiliki keputusan QC terpisah; persetujuannya tidak otomatis berlaku pada paket ini atau runtime/shared config baru.
