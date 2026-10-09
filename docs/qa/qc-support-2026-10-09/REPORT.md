# QC Bantuan SD3-005 - 9 Oktober 2026

**QC-SUPPORT-20261009-PASS-DELTA**. Dua perubahan lifecycle lampiran/form lulus QA/QC terfokus. Ketukan ganda membuka satu picker; hapus saat picker tertunda tetap mengosongkan lampiran. Hasil dan error dari halaman yang ditinggalkan tidak mengubah form baru. Pergantian mode Feedback/Pengajuan Fitur memulai draft, error dan modal baru; rerender mode sama mempertahankan draft.

| Source disetujui | SHA-256 |
| --- | --- |
| `components/feature/support/SupportAttachmentInput.tsx` | `f8285db03bb38e40fc229015ff21f0cbf65a7622872c0786afed06e336e8f098` |
| `components/feature/support/SupportFormScreen.tsx` | `9981ca3fa593ddb1940aad08ed16a53f771bae8d5e2a4a3f4c32ffe8396982de` |

## Bukti yang dijalankan QC

| Pemeriksaan | Hasil |
| --- | --- |
| Replay runner developer pada source final, output sendiri | 114 lolos / 0 gagal |
| Integrasi independen dua route, Form controls dan modal produksi, StrictMode | 61 lolos / 0 gagal |
| Total eksekusi assertion, termasuk cakupan berulang | **175 lolos / 0 gagal** |
| Runtime/React/act error | 0 |
| ESLint dua source, tanpa cache | 0 error / 0 warning |
| Biome check dan scoped diff-check | Exit 0, tanpa fix |
| Returned JSX dibanding snapshot awal | Sama selain binding hapus dan deferred submit |
| Manifest final developer / fingerprint sebelum-sesudah | 19 cocok / 33 berkas stabil |
| Snapshot baseline / kontrak schema, type dan route | 2 cocok / 4 tetap |
| Hash source pada replay, integrasi, quality dan bukti tipe developer | Seluruhnya cocok source final |

Runner independen [production-controls.cjs](production-controls.cjs) menjalankan sepuluh modul produksi: dua route, dua komponen Bantuan, `schema/support.ts`, `Form.tsx`, `AlertModal.tsx`, `useAlertModal.ts`, serta konstanta Colors/Fonts. React, react-hook-form dan Zod asli digunakan. Berbeda dari replay yang memakai adapter FormInput/modal, integrasi tambahan mengirim event melalui FormInput, textarea, radio, Controller lampiran dan tombol konfirmasi AlertModal produksi.

Kasus tambahan membuktikan error wajib tampil melalui FormMessage, title dirty/touched dan watch mengikuti input, copy pengiriman menjelaskan form belum dikirim, konfirmasi menutup modal tanpa kehilangan draft, lampiran terlalu besar mempertahankan pilihan lama, hapus/retry bekerja melalui RHF, serta ketukan ganda dan status busy sesuai. Urutan A -> B -> A dengan dua picker tertunda diselesaikan terbalik: callback hapus/submit lama, hasil valid dan rejection lama tidak mengganggu draft/lampiran/modal instance terbaru. Submit validasi async saat transisi mode juga menjaga defaults/modal mode baru.

Baseline developer 90 lolos/24 gagal dan reproduksi awal 93/21 merupakan histori source sebelum perbaikan; keduanya tidak ditimpa. Runner lifecycle QC byte-identik dengan developer. Salinan runner quality hanya mengalihkan berkas scratch ESLint ke folder QC agar artefak developer tetap utuh. Label owner Codex-3 pada output replay menunjukkan asal runner; eksekusi dilakukan QC. TypeScript dua root beserta imported dependency closure, 0 diagnostic, direview dari bukti developer dengan hash cocok; tidak dijalankan ulang QC/global.

## Batas persetujuan dan serah terima

Native DocumentPicker memakai promise/asset fixture, RN dan primitive UI memakai host adapter. Ini belum menguji dialog picker OS, Expo Router navigator lengkap, HP/browser, auth/root boot, SSR, keyboard/aksesibilitas atau Figma. Tool Figma callable tidak tersedia pada profil sesi. Komposisi Form/modal produksi diuji, tampilan primitive serta kesesuaian Figma belum disertifikasi. JSX tidak mengalami perubahan geometri pada delta ini.

Pengiriman Bantuan tetap **belum tersedia** pada source. Submit valid menampilkan penjelasan yang benar dan mempertahankan input; tidak ada upload, HTTP, penyimpanan backend atau keberhasilan pengiriman yang disahkan. Picker native yang sudah dibuka tidak dibatalkan; token lokal mengabaikan hasil lama. Schema/format JPG-PNG-PDF/batas 5 MiB tetap.

Tidak ditemukan temuan baru yang menghalangi dua delta yang diuji. Keputusan [DECISION.json](DECISION.json) mengesahkan hanya dua hash di atas. PM tetap memegang gate integrasi akhir dan push Git; persetujuan ini tidak meluluskan keseluruhan aplikasi. Temuan stok **QC-STOCK-001 P1 OPEN** dan gate startup/cache tetap keputusan paket pemeriksa lain; lihat [keputusan stok](../qc-stock-contract-2026-10-09/DECISION.json).

Source aplikasi/backend/dependency/harness developer, server/HP, branch/index, commit/push dan PDF snapshot sebelumnya tidak diubah QC. Bukti [verification.json](verification.json), [results.json](results.json), [production-controls-results.json](production-controls-results.json), [quality-results.json](quality-results.json) dan [artifact-manifest.json](artifact-manifest.json) disimpan sendiri. Sinyal melalui workspace, tanpa klaim sesi lain menerima percakapan langsung.
