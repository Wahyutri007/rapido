# QA independen scoped — Navbar Kasir

Tanggal: 2026-10-09. Status: **PASS_SCOPED** untuk implementasi navbar Kasir, inset footer Katalog, dan guard tampilan DevFab pada source fingerprint yang dicatat di `verification.json`.

Paket QC diverifikasi read-only sebelum replay: 17 input dan 21 artefak, tanpa mismatch. Empat source yang diuji cocok byte dengan receipt QC. Replay mandiri memakai JSX `BottomTab`, opsi aktual dari layout Kasir, serta mount React layar Katalog; hasilnya **17 pemeriksaan terkelompok lulus, 0 gagal**. Coverage mencakup lima label/tab dan icon beserta status aksesibilitas/selected; navigasi custom Katalog, navigasi tab lain dan haptic; tab tersembunyi; bounds style untuk lebar 320/844 dan inset bawah 0/48; mode default dan Figma BO; footer Katalog pada inset 0/24/48 serta route checkout; render stabil setelah init effect; dan truth table guard `__DEV__` + opt-in env.

Pemeriksaan style menghitung prop layout saja, bukan pixel/native layout. Empat pesan React `act(...)` yang berasal dari update fixture async disaring sebagai diagnostik adapter; tidak ada error renderer tak terduga. Test fixture Katalog memakai adapter lokal untuk menu/subkomponen, bukan backend/menu live.

Lima SVG Kasir cocok dengan fingerprint receipt QC dan sumber aset Figma lokal. Import mode Back Office pada `BottomTab` bergantung pada lima file `assets/images/figma/back-office/{home,report,catalog,inventory,manage}.svg`; semuanya ada di workspace ini. Status tracking/publikasi file itu tidak diperiksa karena tidak menjalankan Git.

Hash `app/(cashier)/_layout.tsx` yang diuji mencakup perubahan header Tempat milik peer pada workspace bersama. Root menyatakan kandidat publikasi mengecualikan delta peer tersebut sambil mempertahankan baseline `headerShown: false` untuk tab Tempat; karena itu hash current workspace ini tidak boleh dianggap sebagai approval terhadap delta header tersebut. Handoff memakai compatibility candidate terpisah bila root memintanya.

Receipt ini hanya QA UI scoped; bukan persetujuan seluruh Kasir, visual parity Figma, native/browser/HP, full Router, backend atau pembayaran. Tidak mengulang 27 pemeriksaan developer/QC maupun quality tooling.

## Replay compatibility candidate root

Setelah root menyiapkan candidate terisolasi berbasis `main42fb621`, harness yang sama dijalankan dengan source-root override. Hasil candidate juga **17/17 PASS_SCOPED**; data tersimpan di `candidate-compatibility-results.json` dan `candidate-compatibility.stdout.txt`. Tiga source non-layout tetap memiliki hash yang sama; candidate `app/(cashier)/_layout.tsx` ber-hash `6b4830502a069134df5e1c362e2d13ae540e4ce11893d1670f94d6699d1ffe8c`, menggantikan delta header peer dan mempertahankan perilaku tab Tempat baseline sebagaimana dijelaskan root. Candidate ini lolos kompatibilitas replay perilaku scoped, bukan full QA untuk seluruh source atau approval publikasi.
