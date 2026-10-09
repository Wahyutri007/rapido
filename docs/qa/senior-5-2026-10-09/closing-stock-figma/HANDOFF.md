# SD5-010 — READY_FOR_QA

Software Developer Senior5 / Codex-5, 9 Oktober2026. Menindaklanjuti instruksi pengguna agar tampilan sama dengan Figma. Scope koreksi visual Stok Akhir1:12401, bukan approval100% seluruh aplikasi. [Perbandingan gambar](compare.html) / [audit cakupan](../../../FIGMA_PARITY_AUDIT.md).

Full current designcontext/screenshot/metadata berhasil dibaca. Search y88/h48, filters y152/h48, card y216/w357, header h50, category groups333×388/333×268 dan nav h93 tepat sesuai metadata390×1347; seluruh32nilai geometri delapan anchor berselisih0px. Header/back/search/filter asset slots, text colors/#2c2c2c/#8f8f8f/#dc2626/blue tint, nav font12InterRegular dan eleven SVG source/root/effective dimensions diverifikasi. SVG tidak digambar ulang/di-inline. Divider tetap309×1, diulang dan diclip untuk lebar berbeda; ukuran asli dipertahankan.

Kategori kini netral hitam, spacing/font/line-height/padding/border/shadow sesuai referensi, filter default Status Stok, nav label utuh dengan ikon asli. Shared Header/SearchBar/SingleSelect/Card/BottomTab memperoleh appearance opt-in; BO layout hanya memilihnya pada /inventory/closing-stock. Caller default lain dan logic pencarian/picker/back/tab dipertahankan; Text/Wrapper/modal/store/API/globaltokens tidak diedit. Ukuran14px gap,1px border compensation dan card357 dari Figma mengikuti instruksi exact visual pengguna di atas grid lokal umum.

## Verifikasi

49 browser +17 behavior AST/appearance isolation +4 actuallayout back callbacks = **70 pemeriksaan baru PASS/0FAIL**, runtime/console0. Viewports390×1347 reference,390×844,320×640,844×390,768×1024; no horizontal overflow, last grouped row GulaPasir bebas bar dan divider memenuhi container tanpa scaling. Search/focus/type/empty/reset/status/store picker search/unknown quantity/live zero/back/tab dispatch tercakup. Callback navigation beradapter; empat layout checks memastikan cold fallback/local/live-history/hub tetap benar. Full router/browser cold-link test71 lama tidak dinyatakan sebagai replay source baru.

ESLint9root0error/warning, TypeScript9root imported/declaration closure0diagnostic, Biome/diff exit0. Dua Biome noExplicitAny warnings dalam filter hidden-tab existing tetap; tidak suppression/refactor logic di luar visual. First browser failure menemukan focus spring memperbesar asset Inventory; Figma appearance kini scale1. Second failure locator mengira AyamFillet terakhir, padahal kategori akhir GulaPasir sudah terlihat; selector dikoreksi, bukan dianggap aplikasi gagal scroll. Kedua attempt disimpan. Pembaruan tile responsive diuji ulang; intermediate PASS tidak dijumlah ulang.

Own one-shot Metro build/cache/browser profile pada D, tanpa listener/rootMetrorequire/restart server/HP. Produksi UI/store/font dengan router transport adapter; CSS dibangun dari config/global produksi ke output sendiri. Bundle receipt mengikat9source yang sama saat before/after build dan quality. Sample rows Figma hanya pada visual-entry.jsx; interaction regression kembali ke Inventory existing. Tidak seed aplikasi/API/network mutasi/dependency baru.

41model unchanged-hash dari SD5-009 dipakai ulang, bukan tes baru;133artifact packet lama cocok dan tidak ditulis ulang. Source visual/shared dependency berubah; QA/QC caller/integrasi memerlukan overlay SD5-010, bukan memperluas approval lama. verification.json/artifacts.json mengikat hasil dan source. Source source-final berisi snapshot byte yang diuji.

## Batas100% dan QA/QC

Panggilan metadata seluruh Page1 berikutnya ditolak Starter limit (access-limit.txt). Seluruh frame/state belum terinventarisasi atau dibandingkan, sehingga **global100% belum tercapai**. QA diminta perbandingan Android/fullrouter/auth/keyboard/safearea/fontscale/picker/empty/loading reference. QC periksa visual frame, setiapasset/slot, semantic default isolation dan data limits. Screenshot Figma diturunkan resolusinya oleh layanan; HTML overlay menampilkan pada ukuran frame. Bukan identitas byte pixel lintas renderer atau sertifikasi perangkat.

Data actual tetap produk/SKU/material existing; tidak mengganti database menjadi dummy atau memalsukan variant contoh. Per-store membership bukan balance; quantity— dan penjelasan tetap. No backend/persistensi/posting/auth work. No Gitstage/commit/push/branch/HP/cache bersama; PM publikasi. Handoff workspace bukan bukti penerima membaca/approve.

## Replay reviewer

Default verifier read-only; --source memeriksa18source/asset owned yang berubah. Salin **seluruh packet ke folder reviewer baru** sebelum menjalankan runner karena hasil ditulis di direktori runner. Build membutuhkan node_modules aplikasi, cache D:/Codex-5/tmp/closing-stock-figma (ubah namespace di salinan reviewer) dan Edge headless. Fixture font relative path menyesuaikan kedalaman folder reviewer. Build/styles/source berubah membutuhkan snapshot baru, jangan reseal packet histori.

```powershell
node docs/qa/senior-5-2026-10-09/closing-stock-figma/verify-packet.cjs --source
node docs/qa/<folder-reviewer>/build-browser.cjs
node docs/qa/<folder-reviewer>/check-browser.cjs
node docs/qa/<folder-reviewer>/check-scope.cjs
node docs/qa/<folder-reviewer>/check-header.cjs
node docs/qa/<folder-reviewer>/check-quality.cjs
```

Stylesheet generated-web-style.css adalah snapshot source produksi yang diverifikasi, bukan jaminan style source masa depan. Rebuild CLI dengan config/global current ke output reviewer bila ada delta. Model/approval native/caller lain tetap gate masing-masing.

Execution Profile & Operator Tips: Medium. Fullreference→scoped variants/assets→geometry/interaction→QA Android→QC→PM. Akses fullframe berikutnya perlu pulih. Jangan menyatakan seluruhFigma100% dari satu frame atau mentransfer approval shared dependency secara otomatis.
