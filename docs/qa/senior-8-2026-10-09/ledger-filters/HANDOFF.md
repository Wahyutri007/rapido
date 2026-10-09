# Senior 8 — perbaikan filter Buku Besar

Pembaruan: **QC-LEDGER-FILTERS-20261009-PASS-DELTA**, kedua temuan **CLOSED** pada hash di [laporan QC](../../qc-ledger-filters-2026-10-09/REPORT.md). Setelah approval tersebut, [LEDGER-IDENTITY-001](../ledger-identity/HANDOFF.md) mengubah resolver akun pada screen; perlu QA/QC untuk hash baru. Hasil/manifest dan deskripsi source batch filter di bawah tetap merupakan bukti historis.

Lanjutan: temuan benturan ID `addLedgerEntry` kini memiliki [paket LEDGER-ID-001](../ledger-ids/HANDOFF.md). Source filter tidak berubah; dependency store berubah pada batch tersebut. Gunakan bukti integrasi/hash baru saat recheck gabungan, sambil mempertahankan hasil historis di bawah.

9 Oktober 2026, Asia/Jakarta. **READY_FOR_QA** untuk QC-S8-LEGACY-001 dan QC-S8-LEGACY-002. Ini delta lanjutan atas temuan pada [laporan QC sebelumnya](../../qc-senior8-2026-10-09/REPORT.md); belum persetujuan QC baru, publikasi atau integrasi main.

## Perubahan

- `app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx`: total debit/kredit selalu berasal dari entri yang terlihat. Hasil pencarian kosong, saldo nol dan filter satu jenis transaksi tidak lagi memakai total metadata akun sebagai pengganti. Koleksi kosong menghasilkan total 0/0.
- Filter periode kini diterapkan bersama pencarian dan jenis transaksi. Bulan/kuartal/tahun berarti **periode kalender penuh**, termasuk tanggal sesudah hari pemilihan yang masih berada pada periode tersebut. Bukan rolling 30/90/365 hari atau year-to-date.
- `lib/accounting/ledger-filter.ts`: helper murni memeriksa tanggal ISO, `DD-MM-YYYY` fixture Buku Besar, dan nama bulan Indonesia melalui helper akuntansi existing. Tanggal invalid tidak lolos periode terbatas; Semua Periode mempertahankan seluruh entri agar data lama tidak hilang diam-diam.
- Acuan kalender memakai waktu lokal perangkat saat filter dipilih. Memilih ulang periode setelah ganti bulan/tahun menghitung batas baru. Snapshot periode tetap sampai pengguna memilih ulang atau layar dimount ulang; tidak ada timer pergantian hari otomatis. Parsing tanggal entri tidak melalui konversi ISO ke UTC sehingga batas kalender tidak bergeser.

`endingBalance`/Saldo Akhir tetap merupakan saldo akun dari metadata. Angka tersebut tidak direkayasa dari selisih debit/kredit hasil pencarian; kontrak tidak menyediakan opening balance untuk menghitung saldo akhir suatu periode. Fallback akun pertama saat ID tidak ditemukan tetap merupakan perilaku lama. Geometri, primitive, route, store dan form jurnal tidak diubah.

## Reproduksi dan verifikasi

Baseline memakai snapshot source yang sudah mendapat `QC-S8-20261009-PASS-DELTA`; kelima hash paket lama cocok sebelum patch. Harness lengkap pada baseline: **11 assertion lolos, 20 gagal**; hasil di `baseline-all.json`. Kegagalan mencakup total akun muncul pada hasil kosong dan entri tahun 2020 masih lolos Bulan Ini.

Perbaikan total diserahkan terlebih dahulu melalui SESSION_COORDINATION.md setelah **15 assertion lolos** dan lint bersih; bukti snapshot tahap tersebut di `final-totals.json`. Setelah sinyal, perbaikan periode dilanjutkan pada file yang sama.

Hasil gabungan final:

| Pemeriksaan | Hasil |
| --- | --- |
| Komponen Buku Besar lengkap + Zustand produksi, fixture proses terisolasi | 31/31 assertion lolos, runtime/React error 0 |
| Helper tanggal produksi, batas 4 kuartal, bulan/tahun/kabisat/format invalid | 63/63 assertion lolos |
| ESLint dua source | Exit 0; 0 error, 0 warning |
| Biome dua source | Exit 0, bersih |
| TypeScript dua root beserta dependency closure | Exit 0; 0 diagnostic |
| `git diff --check` source | Exit 0 |

Total final **94 assertion**; 15 pemeriksaan tahap total sudah tercakup pada suite 31 dan tidak dihitung lagi. Pemeriksaan mencakup kombinasi search/type/period, entri baru dalam/luar periode melalui action store produksi, ID akun berubah, akun kosong/pulih, reset Semua Periode, pergantian bulan/tahun, serta tanggal awal/akhir kalender.

Source/harness/dependency/result hashes terikat di `verification.json`. Empat source lain dari paket lama tetap cocok dengan persetujuan QC sebelumnya. Hash Buku Besar kini berbeda dan harus diperiksa kembali; keputusan lama tidak otomatis menyetujui delta ini. Bukti lama tidak ditimpa. Hasil screenshot/native lama tidak diklaim berlaku untuk fitur periode baru.

## Menjalankan ulang

Dari root aplikasi:

```text
node docs/qa/senior-8-2026-10-09/ledger-filters/check.cjs
node docs/qa/senior-8-2026-10-09/ledger-filters/dates.cjs
node docs/qa/senior-8-2026-10-09/ledger-filters/typecheck.cjs
node docs/qa/senior-8-2026-10-09/ledger-filters/manifest.cjs
```

`check.cjs --baseline` memakai salinan lokal `.expo/senior8-ledger-filters/baseline-detail.tsx` yang dibuat sebelum patch. Snapshot tersebut tidak masuk Git; fingerprint baseline permanen ada dalam hasil JSON. Test renderer existing di `.expo/senior7-test-tools/` digunakan tanpa instalasi dependency. Tidak menjalankan server, browser, HP, API atau database. Native/presentation child diganti host adapter, callback sheet/input dipanggil langsung. Ini tes developer komponen/store, bukan uji klik/keyboard/geometri/native ataupun persetujuan QA independen. Alat Figma langsung tidak tersedia saat pemeriksaan; tidak mengklaim kesamaan desain.

## Permintaan QA → QC → PM

QA diminta mencocokkan hash, mengulang suite, lalu memeriksa interaksi filter dan ringkasan pada aplikasi. QC diminta mengonfirmasi penutupan dua temuan pada hash final, kontrak periode kalender, format tanggal, dan batas Saldo Akhir. PM memutuskan publikasi setelah gate integrasi snapshot terbaru. Tidak ada commit/push/merge atau perubahan board PM dari Senior 8.

Temuan terpisah untuk pemilik store: `addLedgerEntry` mengalokasikan ID dari `Date.now()` saja; beberapa penambahan pada milidetik identik dapat berbenturan. Tes awal dengan jam beku mengungkap duplicate React keys; jam fixture kini memisahkan tiap action satu milidetik agar pengujian filter tidak bergantung pada tabrakan ID. Store tidak diedit pada batch ini.
