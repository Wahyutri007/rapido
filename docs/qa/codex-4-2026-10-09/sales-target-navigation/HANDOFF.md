# Codex-4 / Software Developer Senior 4 — SD4-005 Target Penjualan

9 Oktober 2026, Asia/Jakarta. **READY_FOR_QA_SHARED_RECHECK**: delta layout selesai, komponen bersama yang berubah sesudah tes masih membutuhkan recheck. Belum keputusan QA/QC/desain/publikasi. Handoff melalui workspace, bukan bukti penerimaan sesi lain.

Satu source aplikasi berubah: `app/(no-layout)/manage/sales-target/_layout.tsx`, SHA256 `8e2b5dd7052d22587f83f640a0b96ecc1e8009fffe4e9cf17bec330b9261f574`. Daftar menjadi anchor untuk child direct link. Kembali memakai riwayat, lalu replace ke daftar/Kelola saat riwayat kosong. Header mengikuti fokus dengan style terdaftar. Judul Tambah/Edit mengambil ID route form tersebut. Detail/form/list/schema/helper/store dan primitive bersama tidak diedit; parent tetap headerShown:false.

Browser sebelum restart CI menyelesaikan lima skenario lalu gagal kembali dari detail setelah edit karena DOM lain menghalangi klik. [Bukti awal](before/browser-failure.json) dipertahankan. Layout diedit saat cold bundle; bukti browser awal tidak diklaim terikat tepat ke hash baseline. [Baseline callback](before/navigation-results.json) terikat snapshot layout55e364:6PASS/12FAIL. Kegagalan ini adalah assertions anchor/fallback/fokus/judul, bukan dua belas temuan QC independen.

| Pemeriksaan final developer | Hasil |
| --- | --- |
| Entry/providers/guard/Expo Router produksi di Edge | [17/17 PASS](browser-results.json), runtime/console0, mutasi API0 |
| Layout dan Header produksi, adapter router/fokus/presentation | [18/18 PASS](navigation-results.json) |
| TypeScript empat root Target, declaration/import closure | [1.310 source, diagnostic0](typecheck-results.json) |
| ESLint satu layout, max-warnings0 | [Error/warning0](eslint-results.json) |
| Biome satu layout; diff-check layout/dokumentasi | Exit0 |
| Identitas bukti/source/dependency saat suite final selesai | [7 PASS](proof-results.json),43selected inputs stabil pada waktu pemeriksaan |

Browser mencakup Kelola→list/search→detail produk→edit/prefill/simpan pada ID sama→kembali dengan pencarian utuh→tambah tanpa ID/draft lama→kategori target kedua→Kelola; direct detail/edit/add, reload, dua ID hilang, browser back/forward,320×844,844×390, dan redirect login tanpa token. [List sempit](list-320x844.png) dan [form landscape](add-844x390.png) ditinjau visual; CTA dapat diklik. Screenshot belum dibandingkan dengan Figma. HTML/CSS boot adapter, fixture auth/API browser dan state sesi Target digunakan; bukan SSR/backend/login pengguna/persistensi/native certification.

Suite pertama juga17PASS. Enam input eksternal berubah saat tes: Header/SearchBar/SingleSelect/theme Figma Stok/BO layout/generated CSS. Hasil/input/gambar/quality awal dipertahankan pada before/first-browser-pass; [delta](before/dependency-delta.json) dicatat. Recheck final sesudah restart own8097 memakai layout Codex4 persis sama dan43input stabil. Assertion berulang dihitung hanya sekali. Source bersama tetap milik sesi lain, dengan gate review sendiri.

**Perubahan sesudah tes:** proof tujuh pemeriksaan sempat PASS, lalu source bersama berubah lagi sebelum seal. [post-test-dependency-delta.json](post-test-dependency-delta.json) mencatat perubahan yang belum diuji; source layout milik Codex4 tetap identik. Hasil PASS berlaku pada tested inputs di source-inputs.json, bukan persetujuan working tree komponen terbaru. Gate bersama menunggu owner stabil dan QA/QC recheck; tidak mengulang suite setiap kali sesi lain mengedit. Seal mengikat layout dan artefak historis; `seal.cjs --runtime`/input-check/proof tetap menolak drift. Freeze proof mengikat delta yang diketahui tanpa menyatakannya lolos fungsi. Jangan reseal histori untuk mengganti tested hashes.

Referensi metadata: [daftar1:38146](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-38146),produk1:37807/37843/37892,kategori1:37968/38004,file pengguna gbdKqL2EcYNenWiQXG4SRW. Frame detail khusus belum tersedia pada metadata sebelumnya. Current Figma tool tidak callable, URL web gagal akses; plugin AVAILABLE/not installed telah disarankan, belum terhubung. Ini kelanjutan navigasi dengan komponen/token/acuan sebelumnya, bukan slicing frame baru atau100%parity. [Audit Figma QC](../../qc-figma-audit-2026-10-09/) terpisah; perlu context/screenshot penuh. Model41/browser20 historis tidak diulang atau dihitung di sini.

Replay dari root aplikasi dengan Metro khusus8097:

```powershell
$env:EXPO_OFFLINE='1'
$env:CI='1'
node node_modules/expo/bin/cli start --go --localhost --port 8097 --max-workers 1
```

Terminal lain menjalankan browser-check.cjs,navigation-check.cjs,typecheck.cjs,input-check.cjs pada folder paket ini. QA menyalin runner ke namespace sendiri; jangan menimpa hasil frozen atau reseal histori. seal.cjs default read-only. Playwright existing `.expo/payroll-qa-tools/node_modules/playwright`,Edge existing; tidak instalasi dependency. ORIGIN/PLAYWRIGHT_MODULE/BROWSER_PATH dapat mengganti lingkungan tes. CI perlu restart own server setelah source berubah.

[SETUP_NOTES](SETUP_NOTES.md) membedakan timeout startup, kesalahan adapter, cold bundle, reproduksi dan recheck. Own8097 dihentikan, cache sementaraD dipertahankan. MetroHP8088/backend8001 tetap aktif dan tidak direstart pada tugas ini. Tidak dependency/backend/HP/Gitindex/branch/commit/push atau paket historis/PDF diubah.

QA: actual/native direct-link/back/fokus/keyboard/picker/scroll terakhir/draft. QC: delta layout/hash, kontrak shared terbaru dan gate Figma terpisah. PM: integrasi/publikasi setelah keputusan. SD4-004 Penerimaan tetap gate QC tersendiri, paketnya tidak ditulis ulang.

Execution Profile & Operator Tips: Medium untuk stack/fokus/ID. Fingerprint→QAactual→QCbehavior/desain→PM. Scope satu layout; gunakan komponen/header existing, pisahkan fungsi dan visual serta pertahankan ownership/histori.
