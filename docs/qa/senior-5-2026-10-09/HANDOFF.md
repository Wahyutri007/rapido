# Software Developer Senior 5 / Codex-5

Identitas sesi: `CODEX_HOME=D:/Codex-5`. Tanggal 9 Oktober 2026, Asia/Jakarta. Kanal laporan QA/QC adalah dokumen workspace dan SESSION_COORDINATION.md; penerimaan atau persetujuan sesi lain tidak diklaim.

## SDK 57 — READY_FOR_QA dengan batas tercatat

Snapshot publikasi: `fa860c91a7f230e18f1eb03fd321c5d434814cba`, branch `integration/expo-sdk57`. Source aplikasi yang diuji berasal dari `79feac2273d27821a64ad6c03b47cb92d241df21`; commit sesudahnya menambahkan bukti/dokumentasi, tes cache, dan membersihkan screenshot gagal lama. Source aplikasi worktree verifikasi telah dibandingkan terhadap snapshot; hanya watchFolders junction khusus pengujian dan komentar Metro berbeda.

Scope: upgrade Expo 57.0.27 / RN 0.86.3 / React 19.2.3, compatibility navigation/NativeWind, perbaikan warning development yang menutupi CTA, cache Metro Windows, dan penggabungan hasil Income/Inventory/Pemasok/Payroll/Member/Reanimated. Hasil lengkap dan batas per fitur ada di [paket integrasi](../sdk57-integration/README.md).

- TypeScript snapshot exit 0, dependency sesuai, Expo Doctor 21/21.
- Bundle Android/Hermes development HTTP 200, 5.181 module, 22.598.806 byte; bukan APK/runtime HP.
- Empat kasus login backend nyata/registrasi pada 390 dan 1280 px: klik/fokus/ketik/scroll/validasi selesai.
- Delapan belas assertion navigator utama selesai tanpa error runtime/console. Uji lanjutan input Pemasok belum tuntas; kegagalan selector dan retry timeout sebelum login tercatat, bukan dianggap lulus.
- Cache Windows: 3.000 reads/200 writes, maksimum 64 operasi bersamaan, pemulihan antrean error dan delegasi clear; diulang kembali oleh Senior 5 pada serah terima ini dan lulus.

Review QA yang diminta: cocokkan source/commit, ulangi interaksi CTA/auth yang relevan, selesaikan input Pemasok pada navigator penuh, lalu konfirmasi runtime Android dari hasil PM. Review QC: kontrak dependency/native, geometri/navigasi/CTA, batas data fitur, serta scope lint. Lint seluruh proyek belum bersih; main tetap mengikuti gate PM.

Temuan baru [QC Member](../qc-member-2026-10-09/REPORT.md), QC-MEMBER-001, menahan persetujuan modul Member pada snapshot ini. Codex-3 telah menerima scope perbaikannya menurut koordinasi. Hasil navigasi historis tidak membatalkan temuan lifecycle tersebut. PM sedang menangani runtime HP/Metro8088; Senior 5 tidak mengambil alih perangkat/server itu. Penggabungan temuan dan perubahan sesi lain memerlukan snapshot baru serta QA/QC yang relevan.

## SD5-001 — QC PASS_DELTA_FOR_PM_REVIEW

Status terbaru: [keputusan QC-SD5-20261009-PASS-DELTA](../qc-sd5-2026-10-09/DECISION.json) meluluskan delta dua file pada hash yang tercatat. QC mengulang 61 assertion developer dan menambahkan 20 pemeriksaan independen dengan SplashScreenView/store/Zustand produksi serta adapter native/bridge: **81 lulus/0 gagal**, runtime/act error 0. Lint 0 error/warning, Biome dan diff-check lolos. Laporan developer di bawah beserta `verification.json` dipertahankan sebagai bukti historis sebelum review. Approval ini mengecualikan boot SD5-002, sertifikasi browser/native/API/Figma penuh dan izin push main; publikasi mengikuti gate PM.

Tiket lanjutan berdasarkan instruksi pengguna untuk meneruskan scope auth/SDK. File edit dibatasi pada `app/(onboarding)/onboarding.tsx` dan `components/custom/LayoutTransitionSplash.tsx`. Fokus: nilai animasi onboarding dan lifecycle overlay transisi mode. Route guard, boot `app/index.tsx`, choose-store, backend, store mode, dan visual SplashScreenView tidak termasuk edit.

Perubahan onboarding: nilai `Animated.Value` diinisialisasi melalui lazy state sekali per mount. Sebelumnya argumen `useRef(new Animated.Value(0))` membuat objek yang dibuang setiap render dan dibaca melalui ref saat render. Query, paging, layout, tombol, penanda onboarding serta tujuan login/register tetap mengikuti perilaku existing.

Perubahan overlay: state transisi diselaraskan secara bersyarat ketika flag store berubah, menggantikan effect setState. Setiap transisi baru memiliki identitas dan instance animasi baru. Callback outro stabil untuk identitas yang sama; callback dari identitas lama atau saat transisi masih aktif diabaikan. Ini mencegah outro sebelumnya menutup overlay yang baru dimulai. Waktu store 300 ms masuk + 800 ms hold, label empat mode dan tujuan route tidak diubah. JSX visual SplashScreenView tetap pada source aslinya.

Hasil developer:

- Baseline dua file: **7 error lint**, 0 warning (6 refs, 1 set-state-in-effect). Final: **0 error/0 warning**, tanpa suppression.
- [Baseline lifecycle](baseline-results.json): **52 lulus/9 gagal**, error runtime 0. Diagnostic yang gagal mencakup alokasi animasi berulang, identitas callback yang berubah, serta penutupan overlay baru oleh callback lama. Ini reproduksi pada komponen/hook, bukan klaim reproduksi klik native.
- [Regresi final](lifecycle-results.json): **61/61 lulus**, runtime error/act warning 0. Memeriksa loading, CTA Lanjutkan/Gabung/Mulai, persist flag dan tujuan login/register, lebar container, clamp scroll, data satu/kosong, remount, empat tujuan mode, guard mode sama/transisi aktif, timer, callback stabil, restart saat outro dan callback terlambat.
- Biome check dua file dan `git diff --check` scope lolos.
- [TypeScript terfokus](typecheck-results.json): dua root beserta dependency yang diimpor, **0 diagnostic**. Tidak menjalankan ulang TypeScript seluruh proyek.
- Hash source, harness dan bukti serta ringkasan lint tersedia di [verification.json](verification.json). Source belum di-commit pada batch ini; source SD5-001 berbeda dari branch SDK57 yang sudah dipublikasikan.

Harness [lifecycle.cjs](lifecycle.cjs) menjalankan komponen produksi dan initializer `appModeStore` produksi dengan Zustand vanilla serta adapter React `useSyncExternalStore`. Native controls, Animated/event, query onboarding, router, storage, persist middleware dan SplashScreenView diganti adapter; timer store dikendalikan. Filter log hanya mengabaikan peringatan deprecation react-test-renderer 19. Tidak memasang dependency aplikasi; menggunakan dependency tes terisolasi yang sudah tersedia dari Senior7. Tidak mengklaim browser/native, animasi Reanimated nyata, data onboarding jaringan, storage nyata atau seluruh guard/permission auth.

Permintaan developer sebelum review: jalankan harness pada hash yang cocok, lalu uji onboarding aktual (scroll/tombol, loading, rotasi/container) dan pergantian mode saat outro pada web/Android. QC telah meninjau delta lifecycle pada cakupan dalam keputusan di atas. Uji perangkat dan gate integrasi seluruh aplikasi mengikuti koordinasi PM; persetujuan delta bukan izin merge main.

Perintah dari root aplikasi (baseline sengaja exit 1):

```powershell
node docs/qa/senior-5-2026-10-09/lifecycle.cjs --baseline
node docs/qa/senior-5-2026-10-09/lifecycle.cjs
node docs/qa/senior-5-2026-10-09/typecheck-focused.cjs
node node_modules/eslint/bin/eslint.js "app/(onboarding)/onboarding.tsx" components/custom/LayoutTransitionSplash.tsx
node node_modules/@biomejs/biome/bin/biome check "app/(onboarding)/onboarding.tsx" components/custom/LayoutTransitionSplash.tsx
```

Harness membutuhkan React/react-test-renderer 19.2.3 di `.expo/senior7-test-tools/node_modules`; lokasi lain dapat diberikan lewat `RAPIDO_TEST_TOOLS`. File runtime itu tidak dipublikasikan dan tidak termasuk dependency aplikasi. QA yang memasang alat sendiri dapat memakai direktori terisolasi lalu mengatur variabel tersebut.

Execution Profile & Operator Tips: High untuk race callback transisi. Reproduksi -> perbaikan dua file -> pemeriksaan terfokus -> QA perilaku -> QC -> PM. Hindari typecheck global paralel dan bundle tambahan saat PM menguji HP. Tidak ada commit/push baru untuk batch developer ini.

## SD5-002 — QC PASS_DELTA

Kelanjutan hanya `app/index.tsx`: boot mengikuti hasil AuthProvider tanpa validasi token tambahan, tujuan/readiness diturunkan dari state terbaru, dan outro sekali per mount dengan identitas sesi untuk menolak callback lama setelah pending/recovery. Dokumentasi boot diselaraskan. Baseline 47 lulus/17 gagal → final developer **64/64 lulus**, runtime/act error 0; lint 0 error/warning, Biome/diff exit 0, tipe root boot+dependency 0 diagnostic. [Serah terima boot](boot/HANDOFF.md) dan [manifest developer](boot/verification.json) dipertahankan sebagai bukti sebelum review.

[QC-BOOT-20261009-PASS-DELTA](../qc-boot-2026-10-09/DECISION.json) telah dibaca: hash boot masih cocok, 64 replay + 41 pemeriksaan QC = **105 lulus/0 gagal**, runtime/React/act 0. Approval hanya delta boot, dengan adapter query/storage/router/frame/haptic dan guard pada index. Bukan sertifikasi native/browser/API/Figma/full auth atau izin push. Dependency guard kemudian berubah pada SD5-004; paket review boot tetap histori, gate snapshot baru memerlukan review delta guard tersendiri. Tidak ada commit/push baru.

## SD5-003 — temuan QC CLOSED_BY_RECHECK melalui SD5-005

[QC-LOGIN-20261009-CHANGES-REQUESTED](../qc-login-2026-10-09/DECISION.json) menemukan kegagalan validasi `/user` yang tidak diteruskan provider serta diagnostic kualitas provider existing. Replay hook74 lulus, tetapi integrasi aktual44 lulus/3 gagal; candidate satu baris47 lulus belum diterapkan saat review. Ini temuan sambungan provider existing, bukan regresi hook. Koreksi source provider ada di [SD5-005](auth-refetch/HANDOFF.md). [QC-AUTH-20261009-PASS-RECHECK](../qc-auth-refetch-2026-10-09/DECISION.json) kini menutup QC-LOGIN-001/002 sebagai CLOSED_BY_RECHECK, dengan source provider/hook/boot/guard yang tercatat. Paket login dan keputusan QC lama tetap histori. Laporan developer awal berikut tetap bukti sebelum review.

Kelanjutan hanya `useLoginRequest` dalam `api/hooks/auth.ts`: lock sinkron menahan dua ketukan/callback sebelum render loading, call/loading menunggu POST dan pembaruan auth, rejection tahap auth ditangkap, serta respons setelah unmount tidak memulai commit token atau menulis error form lama. Fungsi logout/user query dan AST modul lainnya selain import React tidak berubah; LoginScreen/tampilan/provider/factory tetap source sebelumnya. Baseline 56 lulus/18 gagal dengan dua unhandled rejection → final **74/74 lulus**, runtime/React/act/unhandled rejection 0. Lint source 0 error/warning, Biome/diff exit 0, tipe hook+caller/dependency 0 diagnostic. [Serah terima login](login/HANDOFF.md) dan [manifest](login/verification.json) mencatat source `33424d421de5d6a7ba7bdfe6adf8eca5ab0d31a39ab42f159797882cd5c9beca`, kontrak baca, adapter dan permintaan review. API/native/storage nyata tidak diuji ulang; commit auth yang telah dimulai saat mounted tidak dibatalkan. SD5-003 belum memperoleh approval QA/QC atau commit/push. Paket SD5-001/SD5-002 tetap terpisah.

## SD5-004 — QC PASS_DELTA

[QC-GUARD-20261009-PASS-DELTA](../qc-guard-2026-10-09/DECISION.json) meluluskan hash hook guard yang masih cocok:105 replay +46 integrasi QC =151 lulus/0 gagal, runtime/React/act/unhandled0. Provider f3118239 dipin sebagai kontrak handoff; provider SD5-005 terbaru tidak disetujui dalam keputusan guard ini. Persetujuan hanya delta lifetime frame, dengan publikasi/snapshot auth gabungan tetap gate PM. Laporan developer berikut dan paket guard tetap bukti historis sebelum review.

Kelanjutan hanya `hooks/useProtectedRoute.ts`: effect membersihkan frame redirect dan menahan callback yang diteruskan setelah cleanup, sehingga perubahan auth/loading/segmen atau unmount tidak menjalankan keputusan lama. Predicate publik/index/onboarding, kondisi branch, tujuan dan dependency effect tetap menurut perbandingan AST/token. Baseline 78 lulus/27 gagal → final **105/105 lulus**, runtime/React/act 0; lint 0 error/warning, Biome/diff exit 0, tipe root guard+dependency 0 diagnostic. [Handoff guard](guard/HANDOFF.md) dan [manifest](guard/verification.json) mengikat source `ffe42686c7f18ec481583d9670b96614553d4079b011555c00bde6062f0643e2`, matriks route serta integrasi provider beradapter. Ini 105 pemeriksaan developer guard yang berbeda dari 105 pemeriksaan QC boot. Paket boot/login dan bukti QC sebelumnya tidak ditimpa saat dependency guard berubah. Belum ada commit/push untuk SD5-004; runtime browser/Android dan snapshot integrasi tetap gate terpisah.

## SD5-005 — QC PASS_RECHECK

[QC-AUTH-20261009-PASS-RECHECK](../qc-auth-refetch-2026-10-09/DECISION.json) telah dibaca dan hash provider60337fb4/hook33424d42/guardffe42686/bootc06de0d4/consumer login masih cocok. QC-LOGIN-001 P2 dan QC-LOGIN-002 P3 **CLOSED_BY_RECHECK**, tanpa temuan baru. Enam suite pada source aktual:85 login-provider,64 boot,105 guard,46 integrasi guard,41 integrasi boot dan48 kasus QC baru =389 lulus/0 gagal, runtime/React/act/unhandled0. Approval hanya koreksi provider dan closure temuan pada kontrak yang diuji, belum sertifikasi root/perangkat/API/atomic auth atau izin publikasi. Paket developer provider dan bukti historis tidak ditimpa; publikasi mengikuti PM. SD5-006 pendaftaran memiliki gate terpisah.

Koreksi QC Login hanya `context/AuthContext.tsx`: `updateToken` meneruskan error `/user` dengan opsi refetch, bootstrap menggunakan loader stabil/callback Promise dengan cleanup, dan `reloadAuth` tetap mengaktifkan loading saat dipanggil. Source final `60337fb439c306e4b30344b39a0e5f8534636a9de9989c973b4bcb606a05e646`. Baseline80 lulus/5 gagal → final85/85 lulus dengan Query/Common/Form/provider produksi beradapter IO; retry sukses sampai redirect dan StrictMode provider tercakup. Regresi boot64/64 dan guard105/105 pada provider aktual, runtime0; provider lint0 error/warning, Biome/diff0, tipe lima root/dependency0 diagnostic. [Handoff](auth-refetch/HANDOFF.md) dan [manifest](auth-refetch/verification.json) dipertahankan sebagai bukti developer sebelum recheck; status OPEN/READY_FOR_QC_RECHECK di paket itu bersifat historis dan disupersede closure QC di atas. Tidak ada commit/push baru.

## SD5-006 — READY_FOR_QA

Kelanjutan dua source `api/hooks/registration.ts` dan `PersonalInfoAction.tsx`: lock dan loading pengiriman awal, pesan429/422 yang aman, lifetime sheet per pembukaan, stale response guard, snapshot data yang dikirim dan OTP navigation sekali. Text caller memakai token semantic tanpa merombak hierarchy/padding/copy. Baseline61 lulus/35 gagal +2 rejected UI action Promise → final96/96 lulus dan0 rejection/runtime/React/act; lint0 error/warning, Biome/diff0, tipe hook/sheet/Wizard consumer+closure0 diagnostic. [Handoff pendaftaran](registration-start/HANDOFF.md) dan [manifest](registration-start/verification.json) mencatat kontrak/hash/adapter/batas. Ini pengiriman `/register/start`, bukan verifikasi OTP/pendaftaran akhir; fixture memori bukan browser/Android/backend nyata. READY_FOR_QA, belum approval independen atau commit/push.

## SD5-007 — READY_FOR_QA

Scope hanya screen OTP dan hook factory baru. Resend memiliki lock sinkron, satu feedback, countdown429 tervalidasi, cleanup timer serta penolakan callback/response dari sesi lama. Child lifetime berubah bersama personal-info/verify-response; input reset pada sesi baru. Wrapper keyboard/scroll, Text semantic, busy/countdown/disabled dan pembersihan log OTP diselesaikan. Tombol Masuk lengkap memberi feedback verifikasi belum tersedia; verification server/pendaftaran akhir tetap perlu kontrak backend, tidak ada fake login.

Baseline44 lulus/61 gagal → final105/105 lulus, runtime/React/act/unhandled/action rejection0. ESLint0error/0warning, Biome/diff0 dan tipe dua root/imported closure0 diagnostic. [Handoff OTP resend](otp-resend/HANDOFF.md) dan [manifest](otp-resend/verification.json) mengikat dua hash,20 kontrak baca,15 artifact dan78 artifact historis yang tetap cocok. Bukti memori/native-host/router/clock bukan pengujian keyboard/scroll Android, API nyata atau Figma parity. Status READY_FOR_QA; belum keputusan independen/publikasi. Paket SD5-006 tidak ditimpa dan masih gate terpisah.

Catatan publikasi PM fix/auth-bootstrap-lifecycle42a3f2f telah dibaca; branch itu hanya auth/provider/boot/guard dan tidak memasukkan registration/OTP baru ini. Developer tidak melakukan commit/push/index/server/HP pada batch ini.

## SD5-008 — READY_FOR_QA

Scope satu hooks/useRegistrationForm.ts hash1ec99821cccb41a6d0c86372f083227445e7bbe1f44b30edefd0ab7c1ce4918c. Default seed validated sekali per mount, bank/password/confirmation dipulihkan, initial step mengikuti prasyarat paling awal belum lengkap. Store consent canonical; URL/draft tnc true tidak memberi acceptance otomatis. RHF subscription+guarded effect menyelaraskan true/false dua arah tanpa stale reset/echo; cleanup melindungi shared state setelah unmount. Seed berubah tidak menimpa draft/index mounted; ini bukan autosave.

Baseline24/36 → final60/60PASS, runtime/React/act/unhandled0. ESLint0error/0warning/suppression0, Biome/diff0, tipe hook+Wizard imported/declaration closure0. [Handoff pemulihan formulir](registration-form/HANDOFF.md) dan [manifest](registration-form/verification.json) mencatat15 read-only contract,14 artifact dan33 artifact historis cocok. Hook/Form/RHF/Zod/store/parser produksi dengan fixture parent/native presentation/router adapter; bukan seluruh Wizard/Terms/native/API. QA web/Android perlu memeriksa consent saat kembali dari Terms dan input stage. Terms content, OTP verification/final registration masih belum terimplementasi.

Dependency overlay SD5-006: hooks/useRegistrationForm berubah dari30302ead ke1ec99821. Packet96 registration-start tetap frozen/historis; QA/QC kombinasi Wizard terkini perlu menyertakan SD5-008, tidak mengganti manifest lama. Source/start sheet SD5-006 serta OTP/hook SD5-007 tetap cocok. Tidak commit/push/server/HP; status siap QA, belum approval independen.


## SD5-009 — READY_FOR_QA

SD5-009-CLOSING-STOCK-READY-FOR-QA. Stok Akhir kini terhubung di Inventory dengan category/name-SKU search/store-status filter/reset/empty/live material dan back/direct-link fallback. Referensi Figma penuh1:12401 dan dua SVG exact tersedia. Per-store balance tetap — dengan penjelasan; tidak ada seed/API/posting/persistensi baru.

41model+30browser=71PASS/0FAIL, runtime/console0; header4/cascade2 supplementary, scoped lint0error/warning/Biome/diff0/TS0. [Handoff Stok Akhir](closing-stock/HANDOFF.md) dan [manifest](closing-stock/verification.json) mengikat5 source owned,2 shared snapshots,133 artifact dan batas runtime/data. Header cold-link yang semula menuju Beranda telah diperbaiki dan diuji browser final. Wrapper dependency berubah oleh owner lain; drift dicatat dan tidak direvert, bukan approval otomatis terhadap integrasi terbaru. QA/QC/full-auth/Android/API parity masih pending. Tidak commit/push/server/HP; PM pemilik publikasi. Paket lama tetap frozen.


## SD5-010 — READY_FOR_QA

SD5-010-CLOSING-STOCK-FIGMA-READY-FOR-QA. [Visual handoff](closing-stock-figma/HANDOFF.md) and [comparison](closing-stock-figma/compare.html): StokAkhir1:12401 eightanchors32geometryvalues0pxdiff at390×1347, elevenexactSVGs/colors/typography corrected through opt-in shared appearance.70newchecks49browser+17scope+4back PASS, runtime/console0; ESLint/TS0, Biome0errors/2inheritedwarnings.76artifacts/18changedsource-assets frozen/match; oldSD5-009133artifacts intact and41model evidence reused, not replayed. Source/shareddependency overlay requires new QA/QC gate.320Inventorylabel truncation remains a narrow-layout observation beyond reference390; native/fullrouter/allstates still pending.

Global100%notachieved: fullPage1 metadata hit FigmaStarterlimit after currentframe retrieval. [Coverage audit](../../FIGMA_PARITY_AUDIT.md) records remainingflows. No newapplicationdummy/API/posting/persistence/backend/HP/server/Git publication. QA/QC approval pending; PM gate unchanged.

## SD5-010-NARROW — READY_FOR_QA

Supplement resolves the historical320px Inventory truncation observation above. Only Figma BottomTab gap changes to8px below360px, retaining14px at390px/wider. [Latest comparison](closing-stock-figma-narrow/compare.html), [handoff](closing-stock-figma-narrow/HANDOFF.md) and [verification](closing-stock-figma-narrow/verification.json) are authoritative for current source. Latest52browser+17scope=69PASS/0FAIL/runtime/console0, ESLint/TS0, Biome0errors/2inherited warnings. Four header checks and41model checks reused on unchanged source hashes, not executed or added to latest69.

Eight anchors/32geometry values remain0pxdiff; label fits at320/844/768. New77artifact packet and18current source/asset hashes sealed/matched. PrimarySD5-01076andSD5-009133artifacts intact;17primary source/asset hashes unchanged, BottomTab now4bf76a34267565c30484c7d58996aea83e878454a9d47bee6fd13e3b9ff9d3cb. Historical packet --source correctly rejects intentional BottomTab drift; reviewer needs this overlay. Independent QA/QC/native/fullrouter/allframes still pending; local handoff is not receipt/approval. No Git publication/server/HP/API/dummy changes.


## SD5-011 — READY_FOR_QA_QC_RECHECK

[Inventory color handoff](inventory-qc-colors/HANDOFF.md) dan [bukti gambar](inventory-qc-colors/compare.html): tiga total adjustment memakai tone status, Rusak jumlah/persentase destructive, delapan metadata transfer/purchase muted; default shared values/icons dan prior logic dipertahankan. Latest44browser+7scope=51PASS/0FAIL/runtime/console0; lint4/TSclosure/Biome/diff bersih.45artifact/source4 frozen dan matched. QC003 masih memerlukan independent recheck, QC004 partial warna dengan originalSVG/layout pending; global100% belum tercapai dan Starterlimit berlanjut. Current source memerlukan overlay ini, bukan approval otomatis caller lama. Stok Akhir narrow77artefacts/18sources intact; tidak Git/server/HP/API/dummy production changes.
