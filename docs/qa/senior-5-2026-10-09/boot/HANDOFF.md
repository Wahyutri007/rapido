# SD5-002 — Boot routing — READY_FOR_QA

Software Developer Senior 5 / Codex-5 (`CODEX_HOME=D:/Codex-5`), 9 Oktober 2026, Asia/Jakarta. Laporan melalui dokumen workspace; tidak mengklaim penerimaan langsung sesi lain. Label SD5-002 menandai kelanjutan scope developer, bukan tiket PM baru. Satu source diedit: `app/index.tsx`; dokumentasi boot pada `docs/README.md` diselaraskan. Source belum di-commit pada batch ini.

Boot sekarang mengikuti hasil validasi kredensial milik `AuthProvider`. Sebelumnya boot bisa memanggil `reloadAuth` lagi setelah provider selesai tanpa user, lalu menunggu validasi kedua. Tujuan navigasi kini diturunkan dari health, loading/auth provider, dan snapshot onboarding, dengan minimum splash tetap 850 ms. Error/offline menuju maintenance; pengguna anonim menuju onboarding atau start, sedangkan pengguna terautentikasi tetap memakai `useNavigateAuthenticated` produksi untuk mode/role/toko.

Callback outro stabil pada sesi yang sama, menggunakan keputusan terakhir yang telah commit, dan menavigasi sekali. Pending health/auth serta unmount membatalkan completion. Ketika readiness dibatalkan, instance splash baru menggantikan animasi yang mungkin sudah memudar; identitas sesi menolak callback splash lama setelah readiness pulih. Perubahan tujuan saat readiness tetap aktif memakai tujuan terbaru. Snapshot onboarding dibaca ulang saat boot render; subscription kosong **bukan** pemantauan realtime perubahan storage native.

## Bukti developer

- [Baseline](baseline-results.json) menggunakan boot dari `acba0d92460c1af3149abc3775f09888a2943cab` dengan dependency produksi yang sama: **47 lulus/17 gagal**, runtime/act error 0. Refetch kedua yang tidak diharapkan sengaja ditahan pending untuk membatasi reproduksi; angka ini tidak membuktikan perilaku retry jaringan nyata.
- [Regresi final](final-results.json): **64/64 lulus**, runtime/act error 0. Cakupan: minimum timer, token kosong/valid/expired, kegagalan storage/user query, onboarding tersimpan selama boot, pending/recovery health, prioritas maintenance, callback sebelum siap/berulang/terlambat/unmount, sign-out selama validasi/outro, instance splash baru, dan sepuluh kombinasi role/mode/toko.
- Lint satu source: baseline **2 error/1 warning**, final **0 error/0 warning**, tanpa suppression. Biome satu source dan `git diff --check` scope boot/dokumentasi exit 0.
- [TypeScript terfokus](typecheck-results.json): root boot beserta dependency yang diimpor dan deklarasi proyek, **0 diagnostic**. Bukan typecheck seluruh proyek.
- [Manifest](verification.json) mengikat hash source, kontrak baca, harness dan hasil. Hash boot final: `c06de0d4822c97e4eaa18733ef0632fc707ff2fb5bb244ee28160b43adfe7b5c`.

Harness [check.cjs](check.cjs) mengeksekusi Boot, AuthProvider, Keys, `useNavigateAuthenticated` dan `useProtectedRoute` produksi. React Query/query client, transport, storage, router, binding mode/toko, timer/RAF dan visual/animasi SplashScreenView memakai adapter. Guard memakai segment `index`, sehingga suite ini tidak meluluskan seluruh protected route. React/react-test-renderer 19.2.3 memakai alat terisolasi yang sudah tersedia, tanpa dependency aplikasi baru. Hanya warning deprecation test renderer yang difilter.

## Permintaan QA/QC

Cocokkan fingerprint lalu ulangi regresi. Review boot aktual dengan token valid/expired dan kegagalan baca storage/user query; pastikan provider tidak mendapat permintaan validasi tambahan dari boot. Uji perubahan health/loading saat outro, callback lama setelah recovery, sign-out, dan tujuan per mode/role/toko. Pada browser/Android, periksa splash tampil penuh setelah readiness dibatalkan dan navigasi terjadi setelah outro. Native frames, worklet, SSR, API/storage nyata, login/register interaksi penuh, Figma parity serta seluruh aplikasi belum diuji ulang untuk hash boot ini. Kontrak AuthProvider/navigation/guard/store/API dan JSX SplashScreenView tidak diedit.

SD5-001 terpisah sudah memiliki [QC-SD5-20261009-PASS-DELTA](../../qc-sd5-2026-10-09/REPORT.md): 61 replay developer + 20 pemeriksaan QC = 81 lulus. Manifest boot memastikan dua hash SD5-001 masih cocok. Keputusan tersebut **mengecualikan SD5-002**. Status boot tetap READY_FOR_QA; persetujuan QA/QC boot dan publikasi main mengikuti gate PM.

Perintah dari root aplikasi; baseline sengaja exit 1:

```powershell
node docs/qa/senior-5-2026-10-09/boot/check.cjs --baseline
node docs/qa/senior-5-2026-10-09/boot/check.cjs
node docs/qa/senior-5-2026-10-09/boot/typecheck.cjs
node node_modules/eslint/bin/eslint.js app/index.tsx
node node_modules/@biomejs/biome/bin/biome check app/index.tsx
```

Alat tes default: `.expo/senior7-test-tools/node_modules`; lokasi alternatif lewat `RAPIDO_TEST_TOOLS`. Direktori alat tidak dipublikasikan atau ditambahkan sebagai dependency aplikasi.

Execution Profile & Operator Tips: High untuk lifecycle auth/splash dan callback terlambat. Reproduksi terbatas → perbaikan satu source → checks terfokus → QA perilaku → QC → gate PM. Hindari global TypeScript/bundle paralel; runtime/Metro/backend/HP tetap milik sesi PM/QC. Branch/index Git dan source modul sesi lain tidak diambil; tidak ada commit/push baru pada batch ini.
