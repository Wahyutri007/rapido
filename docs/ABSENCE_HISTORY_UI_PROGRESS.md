# Riwayat Mode Absensi — SD6-005

Owner: Software Developer Senior 6. Status: **READY_FOR_QA → QC → PM**, 9 Oktober 2026.

Menu Riwayat pada home sebelumnya hanya menampilkan Segera Hadir, tanpa rute. Flow baru: mode Absensi → Riwayat → daftar per tanggal → detail catatan ID → kembali. Search/status/toko/reset, live update dan missing/empty state tersedia. Header hanya layout, parent mendaftarkan child tanpa header; anchor index dan fallback tetap di mode Absensi.

Scope: tujuh source baru pada `app/(absence)/history/`, `components/feature/absence/history/`, `lib/absence-history.ts`; dua delta integrasi terbatas pada `app/(absence)/home.tsx` dan `_layout.tsx`. Shared store, helper/status Absensi Kelola, form/camera/auth dan primitive tidak diedit. Sumber existing read-only: data contoh dan catatan selama sesi aplikasi; belum server/persistensi atau pemisahan per karyawan. Tidak ada data/shift/durasi/identitas buatan atau pengiriman absensi.

AGENTS/UI/context/koordinasi dibaca. Figma callable tidak tersedia pada toolset Senior6; tidak menemukan frame tersimpan untuk flow mode ini. Komposisi memakai AGENTS_UI; belum klaim parity Figma/native/fullrouter. Baseline enam source disimpan sebelum edit. [Handoff QA](qa/senior-6-2026-10-09/absence-history/HANDOFF.md) dan [manifest](qa/senior-6-2026-10-09/absence-history/verification.json) memuat snapshot final dan sinyal `SD6-005-ABSENCE-HISTORY-READY-FOR-QA`.

Final: 36 model +25 browser +4 quality =65 kelompok PASS, tidak menjumlah ulang percobaan awal. Runtime/console/HTTP eksternal0; source/harness stabil. Full row/target44px dan detail panjang lolos pada320×640/390×844/844×390; screenshot diperiksa. ESLint9source0warning/error, Biome7sourcebaru0, TypeScript5root dan1297dependency/declaration0, diff0. Build offline sekali jalan memakai cache/output sendiri; config Metro/Babel/generatedAndroid hash tetap, tanpa server baru/restart/HP. QA/QC independen/fullrouter/native/backend/persistensi/Figma dan publikasi masih gate tersendiri.

Execution Profile & Operator Tips: Medium untuk grouping/ID/navigasi. Kontrak → implementasi → helper/router/browser dan kualitas terfokus → QA → QC → PM. Gunakan SectionList/Wrapper, SearchBar/SingleSelect/Card/CatalogItemCard/DetailRow/Text/status existing. Pertahankan scope sesi lain dan bukti frozen; jangan restart server HP/Metro, instal dependency atau melakukan Git publikasi.
