# SD3-005 — lampiran dan lifetime form Bantuan

Pemilik **Codex-3**, profil `D:/Codex-3`, 9 Oktober 2026 (Asia/Jakarta). **READY_FOR_QA**, kemudian QC. Laporan melalui workspace bersama; penerimaan langsung dan approval belum diklaim.

Dua ketukan sebelum render berikutnya sebelumnya membuka dua document picker. Ketika lampiran dihapus saat picker masih berjalan, hasil lama dapat menambahkannya kembali; hasil valid/error setelah unmount tetap memanggil parent atau modal. Form bersama juga membawa draft/modal/error ketika prop mode Feedback/Pengajuan Fitur berubah.

Hanya [SupportAttachmentInput.tsx](../../../../components/feature/support/SupportAttachmentInput.tsx) dan [SupportFormScreen.tsx](../../../../components/feature/support/SupportFormScreen.tsx) berubah. Ref pending mengunci picker sebelum await; token hasil dibatalkan secara lokal saat hapus atau unmount. Hapus langsung meneruskan `null`, tetap menjaga lock sampai picker selesai, lalu membolehkan retry. Hasil/error lama diabaikan dan callback picker/hapus editor lama ditahan. Ini tidak membatalkan dialog native yang sudah dibuka.

Wrapper form memiliki key per mode; draft/default/modal/error/attachment terpisah ketika mode berubah, dan rerender mode yang sama menjaga draft. Cleanup menahan callback submit form lama; binding RHF dijalankan saat event. Setup mounted tetap benar setelah replay StrictMode. Form valid tetap menjelaskan pengiriman belum tersedia dan menjaga input; batch ini tidak menambahkan HTTP/upload atau sukses pengiriman.

Route/layout/header, schema JPG/PNG/PDF 5 MB, type, Hero/FAQ, primitive/modal dan dependency tidak berubah. AST kedua returned JSX sama kecuali binding remove dan deferred submit; geometri/teks/picker options existing dipertahankan, tanpa screenshot baru.

## Bukti developer

| Pemeriksaan | Hasil | Artefak |
| --- | --- | --- |
| Baseline sebelum source berubah | 90 lolos / 24 gagal dari 114 | [baseline.json](baseline.json), dua snapshot `.before.tsx.txt` |
| Source final | **114/114 lolos**, runtime/act error 0 | [results.json](results.json), [check.cjs](check.cjs) |
| ESLint dua source | 0 error / 0 warning, exit 0 | [quality-results.json](quality-results.json) |
| Biome check / diff-check / JSX comparison | Exit 0 / sama pada dua source | [quality.cjs](quality.cjs) |
| TypeScript dua root + imported closure | 0 diagnostic, exit 0 | [typecheck-results.json](typecheck-results.json) |
| Hash hasil tes, baseline dan kontrak baca | Cocok | [verification.json](verification.json) |

Reproduksi pertama 93 lolos/21 gagal dipertahankan pada [baseline-initial.json](baseline-initial.json) dan [check-initial.cjs](check-initial.cjs). Tiga assertion queued picker diperketat dengan menangkap callback sebelum busy, sehingga baseline final 90/24 pada source awal yang sama. Ini revisi harness, bukan kegagalan source baru setelah patch.

Cakupan: double press satu event, busy lock, hasil valid/invalid/error setelah hapus atau unmount, remount, callback lama, cancel/missing asset/retry, batas 5 MB/extension/MIME/URI/ukuran, pilihan lama, StrictMode, validasi wajib, draft/modal/error per mode, picker tertunda melintasi mode, serta kedua route produksi dan RHF Controller attachment.

Harness menjalankan dua komponen dan route produksi, React, RHF `useForm`/Controller/FormProvider, serta Zod/schema asli. Native DocumentPicker memakai promise/asset fixture terkontrol; RN/presentasi/radio/textarea/Hero/modal memakai adapter. Tidak menjalankan native OS picker, browser/Expo Router navigator/root auth/SSR/Figma atau HTTP/API. Error modal diuji melalui state dan event adapter. Browser/screenshot/Figma/full TypeScript pada [laporan Bantuan](../../../SUPPORT_UI_PROGRESS.md) merupakan histori, tidak diulang pada hash baru; pengiriman form masih belum terhubung di source.

## Pengulangan QA

Dari root aplikasi, Node 22 dan dependency proyek. React 19.2.3/renderer dibaca read-only dari `.expo/senior7-test-tools/node_modules`; sediakan instalasi terisolasi yang cocok di lokasi tersebut bila belum ada. Tidak mengubah dependency aplikasi/server/HP.

```powershell
node docs/qa/codex-3/support-attachment/check.cjs
node docs/qa/codex-3/support-attachment/typecheck.cjs
node docs/qa/codex-3/support-attachment/quality.cjs
node docs/qa/codex-3/support-attachment/verify.cjs
```

Jangan gunakan `--baseline` pada source final. QA independen menulis hasil ke paket sendiri. `verify.cjs --update-main` hanya menyinkronkan manifest developer setelah bukti cocok. QA diminta memeriksa terutama remove saat pending, event ganda sebelum render, unmount/remount dan pemisahan mode; QC kemudian memutuskan delta pada hash final. PM tetap pemilik gate publikasi.

Tidak mengoperasikan Metro/browser/HP/server, menjalankan full typecheck global, mengubah backend/dependency/branch/index atau commit/push/merge. Tool Figma callable tidak ditemukan pada discovery profil aktif. Tidak ada proses tes Codex-3 tersisa. Koreksi temuan Jurnal QC-JOURNAL-001 diprioritaskan sebelum finalisasi dokumen ini dan diserahkan sebagai [paket terpisah](../journal-badge/HANDOFF.md).

## Execution Profile & Operator Tips

- **Recommended Effort Level: Medium** — hasil native picker dan validasi form dapat selesai setelah pilihan dihapus atau editor ditinggalkan.
- **Suggested Batching / Chunking:** baseline → token/cleanup → lifetime per mode → regresi terisolasi → checks → QA/QC.
- **Operator Tips & Watchouts:** hash dua komponen lama adalah histori; pertahankan cancel/retry/validasi schema. Native picker dan pengiriman API belum disertifikasi oleh adapter.
