# TRIAL-BALANCE-001 - Senior 8 - READY_FOR_QA

Pengguna mengarahkan fokus Back Office. Tagihan Kasir yang sedang dikerjakan ditunda dan dicatat ON_HOLD_BY_USER; scope ini hanya Akuntansi Back Office. Bug footer HP sudah mempunyai paket ACCOUNTING-BOTTOM-SAFE-001 terpisah, tidak ditulis ulang.

Modul baru **Neraca Saldo** tersedia pada Laporan -> Akuntansi -> Neraca Saldo, route `/report/accounting/trial-balance`. Menu dan header ditambahkan pada index/layout existing tanpa mengambil form/jurnal/store pemilik lain. Header menggunakan back history atau fallback ke Akuntansi ketika stack kosong. Source5file tercatat dalam manifest.

Layar membaca `useAccountingStore.accounts` secara reaktif: cari kode/nama/klasifikasi/subklasifikasi, filter klasifikasi dan mata uang, reset, daftar debit/kredit, total dan selisih hasil filter. Mata uang berbeda tidak dijumlahkan. Default IDR bila tersedia, selainnya mata uang pertama; pilihan eksplisit yang hilang tetap menghasilkan kosong sampai pengguna memilih/reset, tanpa berpindah diam-diam. Record diurutkan berdasarkan kode secara numerik.

Saldo merupakan nilai existing Akun & Saldo, termasuk seed contoh dan edit sesi, **bukan laporan per periode atau hasil posting jurnal otomatis**. Tidak melakukan konversi kurs, netting, posting, persistensi/backend atau mutasi akun. Label total dan kesamaan debit/kredit selalu menyebut hasil filter, bukan sertifikasi laporan keseluruhan. Tidak menambah fixture aplikasi.

Perhitungan memakai satuan1/100 dengan batas safe integer. Nilai finite/nonnegatif/maksimal2desimal wajib; jumlah overflow atau saldo invalid membuat total tidak tersedia, baris tetap terlihat beserta peringatan. Mata uang kosong tidak dihitung. Data kosong bukan seimbang. Presisi seperti0.29 dipertahankan, pecahan sen sangat kecil tidak disembunyikan sebagai nol. Layar memakai Wrapper/Card/Text/SearchBar/SingleSelect/DetailRow/Button bersama; footer FlatList menyertakan BottomActionInset agar baris terakhir mempunyai ruang dari navigasi HP.

## Verifikasi developer

- `node docs/qa/senior-8-2026-10-09/trial-balance/check.cjs`: **46 PASS / 0 FAIL**, runtime0. Production helper/screen/route/layout, actual Zustand/accounting store/data dengan adapter UI/router. Mencakup decimal0.1+0.2, beda0.01, mata uang terpisah, filter/empty/reset, currency hilang, saldo live, invalid/negative/nonfinite/fractional-cent/overflow, UTC tidak diperlukan, header/fallback. Data uji hanya memori proses, tidak store pengguna/backend.
- `quality.cjs`: ESLint max-warning0, Biome check dan diff exit0, TypeScript5root beserta konfigurasi/deklarasi/import closure aktual0diagnostic. Ini cek scoped; bukan full proyek. Import React default tak terpakai pada hub dibersihkan; UI hub lainnya dipertahankan.
- `manifest.cjs --check`: memastikan source, dependensi loaded dan bukti masih sesuai. `cases.cjs` adalah draft sumber awal harness; `check.cjs` adalah runner final yang mencakup tambahan precision/navigation. Hasil46 dihitung sekali, bukan ditambah hasil awal41.

## QA -> QC -> PM

QA: buka dari Back Office -> Laporan -> Akuntansi, ubah saldo pada akun sesi lalu kembali ke Neraca Saldo, cek search/classification/currency/reset/empty. Gunakan data uji terkontrol bila memeriksa saldo; jangan mengubah akun nyata untuk uji geometri. Uji font/scroll/picker/portrait-landscape/native/deep link/header back dan posisi baris terakhir. Browser penuh/physical device/Figma/auth/SSR/backend belum diverifikasi; renderer bukan bukti visual native. Figma callable tidak tersedia.

QC: periksa isolasi mata uang, batas2desimal/safe integer, total hanya hasil filter, invalid tetap terlihat dan perbedaan saldo sesi vs jurnal. Tidak ada approval publikasi atau klaim data finansial produksi. Sinyal melalui workspace belum membuktikan QA/QC menerima; PM tetap pemilik integrasi/branch/push.

Execution Profile & Operator Tips: Medium. Verifikasi hash -> replay -> actual app QA -> QC -> PM. Tidak memakai server/HP/ADB/Metro/backend/dependency/globalTS atau operasiGitpublikasi pada modul ini. Pakai source/dependency terbaru dan jangan reseal paket frozen milik sesi lain.
