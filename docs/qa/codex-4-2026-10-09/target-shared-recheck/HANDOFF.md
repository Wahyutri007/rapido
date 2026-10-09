# SD4-006 — Target Penjualan shared recheck

9 Oktober 2026, Codex-4 / Software Developer Senior4. **READY_FOR_QA**. Recheck developer atas perubahan SearchBar/SingleSelect selesai pada hash tercatat; keputusan QA/QC, native dan visual Figma tetap terpisah.

Tidak ada source aplikasi yang diubah. Layout Target tetap `8e2b5dd7052d22587f83f640a0b96ecc1e8009fffe4e9cf17bec330b9261f574`. Overlay sumber yang diuji: SearchBar `0e44eed89a277f3604d4686642448fd71a7751e586b4ebbb34a4f3b361a1476f`, SingleSelect `ab53b5359a4637e3a276e402478c06c4713ffa6687719c49130629f63a13194b`, keduanya milik perubahan opt-in Senior5. Default appearance digunakan oleh Target.

| Pemeriksaan | Hasil |
| --- | --- |
| Entry/providers/guard/Expo Router produksi, Edge | [24/24 PASS](browser-results.json), runtime/console0, mutasi API0 |
| TypeScript empat root Target, declaration/import closure | [1.310 source, diagnostic0](typecheck-results.json) |
| Identitas sumber, overlay dan bukti | [6 PASS](proof-results.json);44source+CSSsnapshot cocok |
| Callback18 dan lint layout sebelumnya | Dipakai ulang pada hash layout/Header identik; bukan tes baru |

Suite final mengulang17skenario navigasi SD4-005 dengan dependency baru dan menambah7skenario: pencarian kosong/reset; picker toko mereset produk asing dan mempertahankan draft nama; kembali ke toko awal serta bulk-search/batal; bulk-commit mempertahankan nilai dan menyimpan ke ID sama; perubahan tipe kategori/removal quantity/saved detail/isolasi target kedua; picker portrait320×844 dan landscape844×390. Nilai detail6unit/Rp100.000 dan kategoriRp123.400 berasal dari input tes browser, bukan data baru aplikasi/backend. Tidak menjumlahkan hasil suite lama/percobaan gagal ke24.

[Picker portrait](picker-320x844.png), [picker landscape](picker-844x390.png), dan [rincian hasil simpan](product-detail-recheck.png) tersedia. Kedua picker ditinjau visual dan option selection/close/CTA diuji tanpa force-click. Screenshot ini belum dibandingkan dengan full reference Figma.

Input snapshots menyimpan44source terpilih dan stylesheet produksi yang dihasilkan setelah Metro startup. HTML memakai byte CSSsnapshot `input-snapshots/42-web.css`, SHA `f70257118535252a64a8c0993e48f02984f5d023a8773edaa7267eb2ace1b5fb`; cache generated global tidak dibekukan. Batas graph terpilih, bukan semua modul impor. [SETUP_NOTES](SETUP_NOTES.md) memisahkan percobaan awal: locator NasiGoreng mengenai pill dan baris sekaligus; di-scope ke baris, tanpa perubahan aplikasi. Snapshot/bukti percobaan disimpan di interim.

[Paket fungsi sebelumnya](../sales-target-navigation/HANDOFF.md) dan [status supplement](../sales-target-navigation-status/HANDOFF.md) tetap frozen,44+3fingerprint cocok. Shared gate sebelumnya memiliki bukti recheck developer di paket ini; bukan pernyataan QC menutup gate. Penerimaan serta audit Figma global tidak diambil alih. Current Figma tool tidak callable; acuan Target tetap metadata frame daftar/produk/kategori pada file pengguna gbdKqL2EcYNenWiQXG4SRW. Full reference/native/SSR/backend/persistensi belum disertifikasi.

Replay harus ke namespace reviewer sendiri agar tidak menimpa hasil frozen. Dari root app, mulai own Metro8097 dengan EXPO_OFFLINE=1,CI=1 dan `node node_modules/expo/bin/cli start --go --localhost --port 8097 --max-workers 1`; lalu browser-check.cjs/typecheck.cjs/input-check.cjs/proof.cjs dalam salinan paket. Playwright/Edge existing, ORIGIN/PLAYWRIGHT_MODULE/BROWSER_PATH dapat diganti. Pertahankan CSSsnapshot untuk replay cohort ini; source/style berubah memerlukan cohort baru.

Verifier `seal.cjs` default read-only; --source juga membandingkan source dan CSSsnapshot yang diuji. Own8097 dihentikan sesudah tes, cache process-localD dipertahankan; HP8088/backend8001 tidak direstart. Tidak instalasi/dependency/HP/ADB/Git index/branch/commit/push/PDF historis diubah.

QA: native/full-auth, keyboard/fontscale/picker, direct-link/back dan draft. QC: overlay/default consumer serta Figma per frame; PM menentukan integrasi/publikasi. Handoff lewat workspace, bukan bukti penerimaan sesi lain atau approval independen.

Execution Profile & Operator Tips: Medium. Manifest→QAactual→QCbehavior/visual→PM. Scope recheck satu alur; preserve ownership dan paket historis, pisahkan kelulusan fungsi dari kecocokan Figma penuh.
