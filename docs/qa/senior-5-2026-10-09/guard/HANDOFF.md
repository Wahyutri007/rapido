# SD5-004 — Guard redirect — READY_FOR_QA

Software Developer Senior 5 / Codex-5 (`CODEX_HOME=D:/Codex-5`), 9 Oktober 2026, Asia/Jakarta. Label SD5-004 merupakan kelanjutan developer, bukan tiket PM baru. Satu source berubah: `hooks/useProtectedRoute.ts`. Dokumentasi guard pada `docs/README.md` diselaraskan. AuthProvider/root layout/boot/login/navigation/mode/permission/storage dan UI tidak diedit. Laporan melalui workspace, tanpa klaim penerimaan percakapan langsung. Source belum di-commit pada batch ini.

## Masalah dan perubahan

Guard sebelumnya menjadwalkan pengalihan melalui `requestAnimationFrame` tanpa cleanup. Bila login selesai, auth menjadi loading, segmen route berganti, atau guard unmount sebelum frame, callback dari effect lama tetap dapat mengirim pengguna ke login/back-office. StrictMode replay juga meninggalkan dua frame aktif. Kasus ini direproduksi pada hook produksi dan integrasi AuthProvider beradapter.

Jadwal pengalihan sekarang mengembalikan cleanup yang membatalkan frame sekaligus menandai callback tidak aktif. Pembatalan antrean menahan frame yang belum dikirim; penanda aktif menahan callback yang telah terlepas dari antrean dan baru diteruskan setelah cleanup. Effect baru menentukan pengalihan dari state auth/segmen terbaru. Aturan loading, route publik, onboarding, pengecualian index dan tujuan dua branch tetap mengikuti source sebelumnya. Guard masih mengarahkan pengguna terautentikasi dari auth/onboarding ke back-office; resolusi mode per role/toko tetap tugas hook navigasi terpisah, tidak diubah oleh delta ini.

## Bukti developer

- [Baseline](baseline-results.json) guard dari `acba0d92460c1af3149abc3775f09888a2943cab`, dengan dependency yang sama: **78 lulus/27 gagal**, runtime/React/act error 0. Gagal mencakup frame/callback usang saat auth/halaman berubah, unmount, StrictMode, serta updateToken/signOut/reloadAuth produksi.
- [Final](final-results.json): **105/105 lulus**, runtime/React/act error 0. Cakupan: 72 kombinasi dari 18 route × authenticated true/false × loading true/false, frame tertunda, rerender stabil, masuk ke halaman publik, perubahan route privat, hasil auth terbaru, callback setelah cancel/unmount, StrictMode, bootstrap provider, updateToken/signOut/reloadAuth.
- Lint satu source: baseline/final **0 error/0 warning**, tanpa suppression. Biome satu source dan diff-check scope lolos; perubahan ini memperbaiki perilaku.
- [TypeScript terfokus](typecheck-results.json): root guard dengan dependency/deklarasi yang diimpor, **0 diagnostic**. Bukan typecheck seluruh aplikasi/root layout.
- [Manifest](verification.json) mengikat source/harness/hasil dan kontrak baca. Perbandingan AST memastikan public routes, predicate onboarding/publik/index/loading, kondisi dua branch dan dependency effect tetap; tujuan schedule baru dibandingkan dengan tujuan router baseline.

[Harness](check.cjs) menjalankan guard produksi melalui React. Kasus integrasi juga menjalankan AuthProvider dan Keys produksi, dengan state query Zustand/useSyncExternalStore. Route/auth sederhana pada matriks, antrean RAF/cancel, router, storage, query-client/refetch dan transport memakai adapter. Callback dari history sengaja dapat diteruskan setelah cancel untuk menguji guard cleanup. StrictMode diterapkan pada subtree guard; tidak meluluskan keseluruhan lifecycle provider dalam StrictMode. Tidak menjalankan HTTP, SecureStore atau data pengguna. Hanya deprecation react-test-renderer 19 difilter.

## Permintaan QA/QC dan batas

Cocokkan hash lalu ulangi suite ke output reviewer sendiri. Uji browser/Android aktual: login selesai ketika redirect anonim masih tertunda, auth reload/loading, sign-out pada auth route, pindah halaman publik/privat sebelum frame dan root unmount/remount. Periksa satu pengalihan dari keputusan effect terbaru dan callback lama tidak mengubah halaman setelah cleanup. Verifikasi root layout dan navigasi mode tetap bekerja dengan provider nyata.

Pembatalan berlaku pada lifecycle cleanup effect. Navigasi yang sudah selesai sebelum cleanup tidak dapat diurungkan; router/transport/provider global tidak diberi mekanisme transaksi atau pembatalan baru. Hasil adapter bukan sertifikasi native frame, timing concurrent commit, router penuh, browser, Android, SSR, permission seluruh aplikasi, API/storage nyata atau Figma parity. [Akses metadata Figma](figma-access.json) berhasil dibaca pada sesi ini; tidak ada implementasi desain/visual baru.

ACK [QC boot](../../qc-boot-2026-10-09/DECISION.json): hash `app/index.tsx` masih cocok, 64 replay + 41 tambahan = 105 assertion lulus menurut QC. Angka itu merupakan paket SD5-002 terpisah, bukan suite guard di atas. Keputusan boot dan SD5-001 tidak mengesahkan SD5-004. Guard kini berbeda dari fingerprint dependency pada paket boot/login sebelumnya; bukti lama dipertahankan sebagai histori dan integrasi snapshot baru memerlukan review delta guard ini. Login SD5-003 masih READY_FOR_QA pada pembacaan awal sesi. Publikasi mengikuti gate PM; tidak ada commit/push baru.

Perintah dari root aplikasi; baseline sengaja exit 1:

```powershell
node docs/qa/senior-5-2026-10-09/guard/check.cjs --baseline
node docs/qa/senior-5-2026-10-09/guard/check.cjs
node docs/qa/senior-5-2026-10-09/guard/typecheck.cjs
node node_modules/eslint/bin/eslint.js hooks/useProtectedRoute.ts
node node_modules/@biomejs/biome/bin/biome check hooks/useProtectedRoute.ts
```

React/react-test-renderer 19.2.3 memakai alat terisolasi existing `.expo/senior7-test-tools/node_modules`, alternatif melalui `RAPIDO_TEST_TOOLS`. TypeScript/Zustand memakai dependency proyek; tidak memasang dependency aplikasi baru.

Execution Profile & Operator Tips: High untuk lifetime pengalihan auth root. Baseline → satu hook → policy/race regression → QA perilaku/QC → gate PM. Bedakan callback setelah cleanup dari navigasi yang telah selesai, dan approval boot dari guard baru. Hindari full TypeScript/bundle paralel; server/HP dan source sesi lain tetap milik pemilik scope.
