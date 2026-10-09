# Senior 7 — QC-HP-WARNING-001

9 Oktober 2026. **READY_FOR_QA** untuk delta registrasi dua layout; closure temuan tetap keputusan QC.

Parent `(no-layout)` mendaftarkan `menu/search`, `menu` dan `catalog/menu`, padahal ketiganya bukan anak langsungnya. Router mengeluarkan tiga warning setiap parent tersebut dirender. Proposal `routing-warning.patch` QC diterapkan setelah memastikan dua layout tidak memiliki diff atau klaim sesi lain. Registrasi salah dihapus dan header `Cari` dengan tombol kembali dipasang di `(no-layout)/(cashier)/catalog/_layout.tsx` untuk screen `search`.

Seluruh anak layout yang valid tetap dapat dirutekan. Header Katalog, Detail Pesanan, Syarat & Ketentuan dan aturan parent `headerShown: false` dipertahankan. Tidak ada file rute baru, pemindahan URL atau perubahan screen pencarian. Dua layout diformat dan import React tidak terpakai dihapus; dokumentasi tree `docs/README.md` menyebut kepemilikan header pada layout katalog Kasir.

## Verifikasi source

- Baseline: 17/20 lulus; kegagalan mereproduksi tiga warning parent, header Cari belum terdaftar pada child, dan deklarasi legacy masih ada.
- Final: **20/20 lulus** pada fungsi layout produksi, sorter `getSortedChildren` Expo Router terpasang, dan anak layout dari filesystem. JSStack/Header memakai adapter; ini bukan full navigator.
- ESLint dua layout: 0 error/warning. Biome dua layout: tanpa diagnostic. Scoped diff-check bersih.
- TypeScript dua root layout beserta dependency closure: 0 diagnostic; bukan pemeriksaan global.
- Snapshot awal di `before/`; hash akhir dan bukti pada `verification.json`.

```powershell
node docs/qa/senior-7-2026-10-09/route-warning/verify.cjs
node docs/qa/senior-7-2026-10-09/route-warning/typecheck.cjs
node node_modules/eslint/bin/eslint.js 'app/(no-layout)/_layout.tsx' 'app/(no-layout)/(cashier)/catalog/_layout.tsx'
node node_modules/@biomejs/biome/bin/biome check 'app/(no-layout)/_layout.tsx' 'app/(no-layout)/(cashier)/catalog/_layout.tsx'
```

## Perangkat dan batas

Hasil perangkat dicatat terpisah di `native-results.json`; jangan menyimpulkan full navigasi/native lulus dari suite 20 pemeriksaan. Launcher pertama melewati timeout backend; pemeriksaan ulang `/api/health` HTTP200 online dan launcher berikut berhasil memakai Metro8088 existing. Sampel log diambil sejak offset tersimpan, bukan menghapus log lama. Screenshot/dump penuh hanya `.expo/senior7-route-warning/`, untuk menghindari publikasi overlay aplikasi lain.

Figma metadata diperiksa ulang dan ditolak akses editor; tidak ada klaim parity visual. QC-HP-WARNING-002 InteractionManager masih ada pada dependency dan tidak disembunyikan. Cache style-recheck tetap paket terpisah yang menunggu keputusan QC. Root auth/boot Senior5, launcher, config/runtime server, dependency, backend dan screen domain tidak diedit. Tidak ada clear data, API mutation, commit/push/merge atau perubahan branch/index.

QA berikutnya memeriksa hasil perangkat serta header/back dari jalur Kasir aktual, lalu QC menilai delta dan memberi closure jika sesuai. Sinyal melalui SESSION_COORDINATION, bukan klaim percakapan QA/QC menerima langsung.

Hasil native akhir: dump UIAutomator Expo pada vivo35b9a8aa memuat satu header Cari, Cari Produk, Pencarian Terakhir dan daftar pencarian. Public URL /catalog/search berhasil setelah cold reopen. URL uji pertama yang memasukkan group ter-encode masuk not-found; perbaikan URL uji dicatat, bukan disembunyikan sebagai sukses. Dua bundle native222ms/171ms tercatat sejak marker, route warning baru0/theme error0/Metro ERROR0; warning InteractionManager masih ada. Tombol back hadir pada dump tetapi belum ditekan: saat screenshot berikutnya perangkat sudah berada di launcher, sehingga interaksi dihentikan. Native status PARTIAL_PASS; full jalur Kasir/back tetap QA berikutnya. Cold reopen hanya Expo, tanpa clear data. Server8088PID9200 dan backend8001PID24116 tetap.
