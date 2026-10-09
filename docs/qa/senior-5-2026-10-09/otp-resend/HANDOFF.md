# SD5-007 — READY_FOR_QA

Software Developer Senior 5 / Codex-5 (`D:/Codex-5`), 9 Oktober 2026. Kelanjutan instruksi pengguna; label developer, bukan tiket PM baru. Dua source saja: screen `app/(onboarding)/otp.tsx` dan hook baru `api/hooks/otp.ts`. Status siap QA perilaku → QC kontrak → PM, belum approval independen.

Sebelumnya resend memakai callback dan handler yang sama-sama menampilkan alert. Loading dari render tidak mengunci dua ketukan dalam satu batch. Response lama masih menulis OTP sesudah unmount atau perpindahan sesi, sementara429 hanya menampilkan detik tanpa menahan retry. Screen juga mencatat response/token/kode ke console dan tombol Masuk dengan empat digit berhenti tanpa feedback.

Sekarang resend dikunci sinkron per instance, memiliki disabled/loading/accessibility state, dan menghasilkan satu feedback. Request menggunakan factory aplikasi untuk POST `/register/start`, method/name/DTO yang sama; tidak menambahkan endpoint backend. Identitas personal-info/verify-response membuat child lifetime baru, mereset input/cooldown ketika sesi berubah. Pemeriksaan store saat callback dan setelah await menolak hasil dari sesi lama, termasuk callback tersimpan. Success aktif hanya mengubah verify-response sekali; personal-info tetap. POST yang sudah dikirim tidak dibatalkan dan lifetime baru boleh mengirim request baru.

429 memakai angka detik positif finite dari server. Deadline dicek sebelum request, angka pecahan dibulatkan ke atas untuk teks, countdown berakhir berdasarkan waktu aktual dan timer dibersihkan saat unmount. Nilai hilang/string/nol/negatif/Infinity atau perkalian yang overflow memakai pesan coba nanti tanpa timer buatan. Error, kegagalan jaringan dan response sukses tanpa data mempertahankan sesi untuk retry. Batas ini lokal; bukan dedup global, persist cooldown lintas unmount, atau transaksi backend.

Screen memakai Wrapper produksi untuk keyboard/scroll dan Text semantic. Padding/group/theme/four-digit input/copy inti tetap. Container, busy/countdown labels, disabled Masuk dan feedback sesi invalid adalah delta UI yang disengaja. Sesi invalid menghasilkan satu alert/back per mount termasuk StrictMode. Log OTP dihapus. Masuk dengan kode belum lengkap disabled; callback langsung tetap meminta kode. Dengan empat digit, feedback menyatakan verifikasi belum tersedia. **Verifikasi server dan pendaftaran akhir belum diimplementasikan**; tidak membandingkan input dengan kode response atau menavigasi seolah berhasil. Wizard akhir juga di luar scope. Kontrak verification/submit backend diperlukan untuk pekerjaan tersebut.

## Bukti developer

- Baseline final pada snapshot source sebelum edit: **44 lulus/61 gagal dari105**, runtime/React/act/unhandled/action rejection0. Reproduksi kegagalan ada di `baseline-results.json`.
- Final pada hash screen `93bc98c42e0a031e6e4f8547945640771436421ea2ea832868941a9daa852c5e` dan hook `90f8dd8ae73ba51c0455a0954000510d09b80abc4540114fb8a4bc02f25bce07`: **105/105 lulus**, runtime/React/act/unhandled/action rejection0.
- Kasus double press, endpoint/payload, busy, one-feedback success/error500/422/network, retry,429 valid/pecahan/malformed/overflow, empty success, deadline/teardown, late success/failure, pergantian sesi saat pending, callback lama, input reset/rerender, invalid session dan StrictMode tercakup.
- ESLint screen baseline0error/12warning → dua source final0error/0warning, suppression0. Biome dua source exit0, tracked diff-check exit0 dan whitespace hook baru0. Peringatan konversi LF/CRLF Git dicatat; bukan kegagalan whitespace.
- TypeScript terfokus: screen/hook dan imported/declaration closure, diagnostic0. Hash setiap source yang dibaca cocok disk selama check; bukan TypeScript seluruh proyek.
- `verification.json` mengikat source, read-only contracts, runtime library, artifact dan pemeriksaan78 artifact historis. `scope-proof.json` memeriksa endpoint/method/name/generic DTO serta empat digit/theme/autofocus dan copy inti. Parent status mutable terpisah; paket lama tidak ditimpa.

Harness menjalankan screen/Wrapper/store OTP/factory/Common/usePostRequest/error helper/QueryClient/Axios produksi. Baseline memakai query legacy produksi pada salinan screen awal. Native hosts dan OtpInput, Text/Button presentation, router, clock/interval, haptic dan HTTP diganti adapter lokal. Transport menggunakan Axios instance aktual dengan adapter Promise memori; semua payload `.test` adalah fixture tes. Tidak mengubah data aplikasi menjadi dummy atau memakai API/storage/backend nyata. React/react-test-renderer19.2.3 memakai alat terisolasi Senior7; dependency aplikasi tidak dipasang/diubah.

Preparasi harness yang sempat belum lengkap, penambahan edge overflow/null, dan diagnostic format intermediate dicatat dalam `harness-notes.json`. Hasil lengkap105 adalah baseline/final yang digunakan untuk gate; run98 sebelumnya tidak dijumlahkan.

## Permintaan QA/QC

Periksa hash/manifest dahulu. Replay harus menulis ke folder reviewer sendiri: salin `check.cjs`, `typecheck.cjs` dan subfolder `before` ke folder baru, lalu jalankan dari root aplikasi. Kedua runner menulis hasil ke direktori runner; jangan menjalankan default runner frozen langsung bila hasil akan ditimpa. Lokasi alat tes alternatif melalui `RAPIDO_TEST_TOOLS`.

```powershell
node docs/qa/<folder-reviewer>/check.cjs --baseline
node docs/qa/<folder-reviewer>/check.cjs
node docs/qa/<folder-reviewer>/typecheck.cjs
node node_modules/eslint/bin/eslint.js "app/(onboarding)/otp.tsx" api/hooks/otp.ts
node node_modules/@biomejs/biome/bin/biome check "app/(onboarding)/otp.tsx" api/hooks/otp.ts
```

Baseline sengaja exit1. Reviewer perlu menguji screen aktual pada web/Android: keyboard, scroll viewport pendek, four-digit input/focus, busy/countdown, retry, back/remount dan sesi baru. Konfirmasi pengalaman alert native dan tombol Masuk yang belum dapat memverifikasi. Wrapper host assertion bukan bukti scroll/keyboard perangkat. Deep link tanpa history, background/foreground, root navigation, API/storage nyata, native animation serta Figma parity tidak disertifikasi. Akses Figma yang dibuktikan hanya metadata halaman.

Tidak ada perubahan server/Metro/HP/backend/dependency/Git index/commit/push pada batch ini. Publikasi modul auth/boot/guard oleh PM pada branch terpisah tidak memasukkan registration/OTP ini. PM tetap pemilik gate publikasi.

Execution Profile & Operator Tips: High untuk request/identitas sesi/cooldown. Hash → replay reviewer terpisah → QA web/Android → QC → PM. Pertahankan source/histori pemilik lain; verifikasi OTP/pendaftaran akhir memerlukan kontrak backend yang terkonfirmasi, jangan fake success memakai kode response.
