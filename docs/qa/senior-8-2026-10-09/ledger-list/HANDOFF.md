# LEDGER-LIST-001

READY_FOR_QA -> QC -> PM. Tombol Lihat Semua kini menampilkan seluruh hasil; Tampilkan Sedikit kembali ke preview lima akun. Lima adalah pilihan implementasi developer untuk review, bukan klaim spesifikasi Figma. Tombol disembunyikan jika hasil paling banyak lima; separator mengikuti baris terakhir yang terlihat. Search/category/sort bekerja pada seluruh koleksi sebelum preview; expanded preference tetap saat filter/store berubah. Summary metadata dan route detail tetap.

Baseline 22 lulus/14 gagal; final 36/36 lulus, runtime/React error 0, screen lengkap + Zustand produksi dengan adapter host/presentation/router. ESLint/Biome/diff exit 0; focused TypeScript 0 diagnostic. Hasil berada di baseline.json, final.json dan quality.json. Reproduksi dari root aplikasi: `node docs/qa/senior-8-2026-10-09/ledger-list/check.cjs` dan `node docs/qa/senior-8-2026-10-09/ledger-list/quality.cjs`. Baseline memakai flag --baseline, sengaja gagal. Simpan output QA terpisah.

Tidak ada tes visual/native/Figma/API/full-app atau approval independen. Source hanya general-ledger/index.tsx; store/detail/primitive milik sesi lain tidak diubah. Tanpa server/HP/dependency/Git publikasi. Pekerjaan sempat terinterupsi sebelum handoff; sesi pemeriksaan telah selesai exit 0.
