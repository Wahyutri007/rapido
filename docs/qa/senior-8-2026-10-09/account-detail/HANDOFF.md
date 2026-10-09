# ACCOUNT-DETAIL-001 - identitas detail Saldo Awal Akun

9 Oktober 2026. **READY_FOR_QA -> QC -> PM**. Kelanjutan developer Senior 8; belum approval independen.

Detail akun kini menampilkan **Akun tidak ditemukan** ketika ID tidak ada/tidak cocok atau akun yang dilihat dihapus. Sebelumnya kasus tersebut menampilkan akun pertama beserta saldonya. Parameter array memakai elemen pertama, sesuai pola route modify akuntansi; tanpa trim atau fallback ke elemen berikutnya. Scope hanya `app/(no-layout)/(back-office)/report/accounting/accounts/detail.tsx`.

Ringkasan tetap total seluruh koleksi saldo awal sesuai kontrak existing, bukan total akun terpilih. Update akun lain memperbarui total, update/reset akun terpilih memperbarui nominal, dan restore koleksi memulihkan akun yang benar. Imports serta token source mulai kalkulasi totals sampai akhir tidak berubah; hanya resolver/parameter dan format Biome. JSX/UI legacy tidak direfaktor. Tidak menambah atau mengganti route/layout.

Bukti: baseline **19 lulus/11 gagal** -> final **30/30 lulus**, React/runtime error 0. Screen lengkap + Zustand dan action update/reset/delete produksi, React StrictMode, route/host/formatter adapter. ESLint/Biome/diff-check source exit 0; focused TypeScript screen + dependency closure 0 diagnostic. Hash loaded-source/dependency, hasil, runner dan source scope ada di [verification.json](verification.json). `manifest.cjs` juga membandingkan token di luar resolver dengan snapshot baseline.

Reproduksi dari root aplikasi:

```powershell
node docs/qa/senior-8-2026-10-09/account-detail/check.cjs --baseline
node docs/qa/senior-8-2026-10-09/account-detail/check.cjs
node docs/qa/senior-8-2026-10-09/account-detail/quality.cjs
node docs/qa/senior-8-2026-10-09/account-detail/manifest.cjs
```

Baseline sengaja exit 1. QA/QC gunakan output sendiri; jangan menimpa bukti developer. Renderer tooling existing `.expo/senior7-test-tools`, tanpa pemasangan dependency. FormatRp adapter mengekspos angka untuk observasi, bukan sertifikasi rupiah produksi. Tidak ada browser/native/router nyata, API/backend, data pengguna, Figma parity, full-project TS atau approval seluruh modul keuangan. Figma callable tidak tersedia. Tidak mengubah store/source pemilik lain, server/HP/Metro/dependency, branch/index/commit/push.

Execution Profile & Operator Tips: Medium untuk lifecycle akun/route. Hash -> regresi not-found/valid/update/reset/delete -> QA -> QC -> PM. Bedakan ringkasan global existing dari nominal akun terpilih; store-ID dan screen Buku Besar tetap gate terpisah.
