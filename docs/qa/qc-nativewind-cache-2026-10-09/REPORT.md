# QC startup cache dan alert kuning HP

9 Oktober 2026, Asia/Jakarta. **QC-NATIVEWIND-CACHE-20261009-CHANGES-REQUESTED**. Perilaku guard cache/config lulus 41 pemeriksaan; reproduksi dan proposal peringatan rute lulus 10 pemeriksaan tambahan. Persetujuan publikasi paket startup ditahan karena scoped Biome check memiliki **4 error**. Ini bukan temuan kegagalan guard pada 41 pemeriksaan tersebut.

## Jawaban alert kuning

Log Metro Android aktif `.expo/senior7-startup/metro.out.log` mencatat empat pesan nonfatal: `InteractionManager has been deprecated` dan tiga `No route named ... exists` untuk `menu/search`, `menu`, serta `catalog/menu`. Screenshot kedua developer diperiksa QC: Beranda Back Office terlihat, dengan banner warning kuning di bawah. Banner tersebut merupakan LogBox development; startup yang ditunjukkan tetap berhasil. Screenshot memuat overlay aplikasi lain sehingga tidak dipublikasikan.

Observasi perangkat QC hanya `adb devices`, `pidof` dan screenshot, tanpa membuka ulang/navigasi aplikasi. Expo masih berjalan pada vivo1918 serial35b9a8aa, PID3305, tetapi Rapido bukan aplikasi foreground saat observasi QC. Karena isi banner yang dilaporkan pengguna belum dikonfirmasi, empat pesan log merupakan sumber warning yang terverifikasi; belum diklaim mengetahui pesan mana yang sedang dipilih pada banner pengguna. Pertanyaan teks opsional telah dikirim kepada pengguna.

**QC-HP-WARNING-001 — P3 OPEN, registrasi route lama.** `app/(no-layout)/_layout.tsx` mendaftarkan tiga nama yang bukan anak langsung. `catalog/menu` benar-benar ada, tetapi sudah dimiliki `catalog/_layout.tsx`; search berada di `(cashier)/catalog/search.tsx`. Sorter produksi expo-router57 `getSortedChildren` direproduksi dengan AST registrasi dan anak layout dari filesystem: tiga warning muncul, valid screens tetap tersedia. [routing-warning.patch](routing-warning.patch) menghapus tiga deklarasi salah dan memindahkan header Cari ke Screen `search` di layout yang benar. Proposal menghasilkan nol warning sorter dan mempertahankan seluruh route valid, ESLint stdin dua calon layout 0 error/warning, `git apply --check` lolos. Patch belum diterapkan ke aplikasi dan belum diuji pada HP. Developer pemilik routing perlu menerapkan, mengikuti AGENTS_UI, menyelaraskan docs/README.md untuk perubahan layout, memformat/lint dan memeriksa navigasi/header aktual serta hilangnya tiga warning pada HP. Tidak ada suppression LogBox.

**QC-HP-WARNING-002 — P3 OPEN, dependency memakai API usang.** Getter React Native yang terpasang mengeluarkan warning deprecation saat `InteractionManager` diakses. Source `expo-router/build/react-navigation/stack/views/Stack/Card.js` memakai `createInteractionHandle`/`clearInteractionHandle`; pencarian app/components/hooks/lib tidak menemukan pemakaian lokal langsung. Ini sumber dependency yang teridentifikasi, bukan hasil tracing stack banner secara langsung. Ditujukan ke pemilik integrasi SDK/router; jangan mengedit node_modules atau mengganti handle transisi secara mekanis dengan scheduler hanya untuk menghilangkan warning. Paket ini tidak mengganti versi dependency.

## Gate gaya paket startup

**QC-STARTUP-CACHE-001 — P3 OPEN.** [style-findings.json](style-findings.json), exit1: formatter pada `metro.config.js`, `scripts/verify-metro-cache.cjs` dan `scripts/verify-nativewind-cache.cjs`, serta `lint/correctness/noUnsafeFinally` untuk throw pengecekan direktori pada finally di harness initializer. Formatter Metro mencakup gaya existing file, bukan bukti regresi fungsi baru; gate file yang berubah tetap belum bersih. Ada juga satu warning `useArrowFunction` pada helper dan satu info `useTemplate` pada harness; dicatat terpisah dari empat error.

[startup-style.patch](startup-style.patch) telah dibuat pada salinan sendiri. Proposal memformat tiga file dan memindahkan validasi target cleanup ke sesudah mkdtemp, sebelum try/finally, sehingga recursive cleanup tetap memakai target yang sudah diperiksa. AST Metro produksi dan harness queue identik dengan source sebelum format; helper produksi tidak berubah. Proposal scoped Biome check exit0/error0, menyisakan satu warning dan satu info tadi; sepuluh tes initializer terpasang juga lolos pada salinan. Kedua patch lolos `git apply --check`, belum di-apply. Bukti [patch-results.json](patch-results.json) dan [style-proposal-initializer-results.json](style-proposal-initializer-results.json).

Developer Senior7 diminta menutup empat error, ulang scoped Biome/ESLint/diff dan tes initializer/queue, lalu menyerahkan manifest hash final. Jika body Metro/helper tetap sama dan hanya gaya/harness safety guard berubah, QC dapat recheck terfokus pada AST/gate serta initializer; tidak perlu membuat bundle/Metro tambahan hanya untuk gaya. Persetujuan QC belum diberikan pada source proposal.

## Verifikasi yang selesai

| Pemeriksaan | Hasil |
| --- | --- |
| Rerun harness dependency CSS Interop0.2.7 produksi di direktori sementara terisolasi | 10/10 |
| QC batas guard native path, relative path, Buffer/options, missing/empty, error, nested call, async dan restoration | 16/16 |
| QC config produksi dengan Expo/NativeWind adapters: FIFO, sync/async failure, receiver, queue drain, Windows/non-Windows, opsi pipeline dan restoration | 15/15 |
| QC sorter produksi/registrasi/filesystem dan proposal perbaikan rute | 10/10 |
| Rerun queue developer di VM tanpa bundle/shared-cache writes | 3000 read +200 write; maksimum64, pulih sesudah error |
| Queue QC tambahan | 258 read; maksimum64, semuanya settle sesuai kontrak termasuk dua failure fixture |
| ESLint empat file config/helper/harness | 0 error/warning |
| Scoped git diff --check | exit0; pemberitahuan konversi LF/CRLF saja |
| Source/dependency/handoff evidence fingerprints | 17 cocok manifest/snapshot dan stabil selama QC |
| Cache Android aktif, observasi read-only sebelum/sesudah | 193003 byte, hash sama, flag class dark ada |
| Scoped Biome check source saat ini | **exit1, 4 error, 1 warning, 1 info** |

41 pemeriksaan cache/config dan 10 pemeriksaan route dihitung terpisah dari jumlah operasi queue serta tes proposal. Tidak ada error runtime tak terduga pada tes yang lolos; failure fixture adalah error yang sengaja diuji.

## Hash paket yang diperiksa

| File | SHA-256 |
| --- | --- |
| metro.config.js | dc362fab1b6d885b38d4cc7ef3d20dbfe34678ed2b731f8c4f32e3c755480160 |
| scripts/preserve-nativewind-cache.cjs | 5bb311ea0ca8d118e825e82a09b8b61297615c9549195b02be2a9b889a8773ed |
| scripts/verify-nativewind-cache.cjs | ccaec6e8e705d72a4610db3a43d6149b70b0f3169ce23d886ff2ef92cc6f8274 |
| scripts/verify-metro-cache.cjs | 65dc3f195fd2cce0826b79cdcb3cd5ed5513e4b3ecfb7aa49a2eeb1c55214d1f |

Snapshot [review-before.json](review-before.json)/[review-after.json](review-after.json) juga mengikat dependency initializer `96e413fe...`, enam artefak handoff developer dan source layout/Tailwind/NativeWind/router relevan. Approval cache lama atau source aplikasi modul lain tidak diperluas ke paket ini.

## Batas dan serah terima

Guard hanya berlaku pada empty string write sinkron ke lima cache native yang sudah terisi selama inisialisasi konfigurasi proyek. Buffer kosong, URL/fd, compiler async/nonempty dan konfigurasi NativeWind terpisah bukan bagian perlindungan tersebut. Initializer terpasang memakai string path + empty string secara sinkron; versi dependency lain perlu recheck. Fs selalu dikembalikan melalui finally pada cakupan yang diuji.

Dua cold launch, dua pemuatan config dari proses kedua dan bundle native berasal dari bukti developer; hash bukti cocok dan screenshot kedua ditinjau, tetapi QC tidak mengulang cold launch/proses kedua pada runtime aktif. Log baru tidak memuat theme error/ERROR pada stdout; stderr masih berisi warning manifest assets/certificate offline, sehingga aset/font/native seluruh aplikasi tidak disertifikasi. Tidak melakukan full typecheck, verifikasi UI/Figma/API/auth/storage/root startup Senior5 ataupun operasi fitur native lengkap.

Paket ditujukan ke developer untuk koreksi dan PM untuk melihat gate yang masih terbuka melalui SESSION_COORDINATION. Tidak mengklaim pesan langsung ke percakapan lain telah diterima. Source aplikasi/dependency/backend/harness developer tidak diedit; Metro8088/8096, Expo dan data HP tidak direstart atau dihapus; tidak ada commit/push/merge/ubah branch/index. Perangkat hanya diamati dan screenshot penuh disimpan lokal di .expo.

Catatan harness QC: reporter JSON eksperimental Biome Windows mengeluarkan backslash path yang belum di-escape; raw stdout/stderr dipertahankan, normalisasi terbatas pada field path dilakukan sebelum parsing. Pembanding AST awal memasukkan text SourceFile (seluruh whitespace), lalu diperbaiki agar membandingkan kind/child serta literal/identifier. Ini koreksi harness pembuktian proposal, bukan perubahan source aplikasi atau kegagalan fungsi cache.

Execution Profile & Operator Tips: Medium. Developer memperbaiki gate gaya -> manifest final -> QC recheck -> PM gate integrasi. Route warning menjadi tindak lanjut terpisah dengan verifikasi header/navigasi dan docs sinkron; gunakan server USB8088 existing, tanpa LogBox suppression atau bundle tambahan untuk perubahan gaya murni.
