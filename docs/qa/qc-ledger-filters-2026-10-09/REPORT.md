# QC recheck filter Buku Besar — 9 Oktober 2026

**QC-LEDGER-FILTERS-20261009-PASS-DELTA**. Temuan **QC-S8-LEGACY-001 dan QC-S8-LEGACY-002 CLOSED** pada dua hash di [DECISION.json](DECISION.json). Ringkasan debit/kredit mengikuti entri yang terlihat, termasuk hasil kosong/nol; filter bulan/kuartal/tahun benar-benar diterapkan bersama pencarian dan jenis transaksi.

| Source yang disetujui | SHA-256 |
| --- | --- |
| `app/(no-layout)/(back-office)/report/accounting/general-ledger/detail.tsx` | `f841115249a9ae1bcd3391b4fb9996539d452fa345ee6fcab26ac25f01db705f` |
| `lib/accounting/ledger-filter.ts` | `60a7676101678e0ee0fff8b808b175adeba9cd6605a4e25e2332f624bd5a8a48` |

QC mencocokkan source dan seluruh artefak manifest READY_FOR_QA Senior8 sebelum tes. Empat source Katalog/kartu saldo dari persetujuan lama tetap cocok, tetapi tidak dites ulang pada batch ini. Seluruh fingerprint source/dependency/handoff yang direkam tetap sama sampai tes tambahan selesai; hash source yang benar-benar dimuat runner cocok dengan snapshot akhir.

## Verifikasi QA/QC

| Pemeriksaan | Hasil |
| --- | --- |
| Regresi developer, screen lengkap + Zustand produksi, diulang ke output QC | 31/31 |
| Regresi helper tanggal developer, diulang ke output QC | 63/63 |
| QC independen, screen/sheet periode/sheet jenis/summary produksi + Zustand, StrictMode | 30/30 |
| QC independen, batas kalender lokal pada empat zona waktu | 32/32 |
| Runtime/React error pada tes komponen | 0 |
| ESLint dua source, max-warnings 0 | Exit 0; 0 error/warning |
| Biome check dua source | Exit 0 |
| Git diff-check dua source | Exit 0 |

Total **156 eksekusi assertion lulus**, termasuk cakupan regresi yang berulang. Rerun memakai salinan byte-identik harness developer pada direktori QC; hasil developer tidak ditimpa. Bukti [verification.json](verification.json), [final-all.json](final-all.json), [date-results.json](date-results.json), [independent-results.json](independent-results.json) dan [timezone-results.json](timezone-results.json) tersedia bersama runner/output CLI.

Tes tambahan memakai **komponen sheet periode, sheet jenis dan summary produksi**, bukan pengganti callback sheet. Tombol produksi membuka sheet; pilihan dan Reset menutupnya, memperbarui filter dan menjaga filter lainnya. Hasil kosong benar-benar meneruskan debit/kredit 0 ke summary. Ketika waktu beralih Oktober ke November dan store berubah, pilihan Oktober tetap memakai snapshot lama; memilih ulang Bulan Ini mengambil November dan menghitung ulang total. Perubahan total metadata akun tidak menimpa hasil filter; perubahan saldo metadata tetap muncul pada Saldo Akhir.

Empat proses terisolasi memakai Asia/Jakarta, America/Los_Angeles, Pacific/Honolulu dan Pacific/Kiritimati. Instant UTC yang sama jatuh pada bulan/kuartal/tahun lokal berbeda; helper mengikuti kalender lokal secara konsisten. Bulan/kuartal/tahun adalah **periode kalender penuh**, termasuk hari sesudah tanggal pemilihan. Tanggal ISO, DD-MM-YYYY dan nama bulan Indonesia didukung. Tanggal invalid dikeluarkan pada periode terbatas, dipertahankan pada Semua Periode.

Pada pengembangan harness QC, selector awal menemukan dua tombol berlabel Bulan Ini ketika sheet terbuka; selector dibatasi ke sheet aktif. Percobaan berikutnya menghasilkan satu mismatch urutan fixture: QC mengharapkan entri baru di belakang, sedangkan action store produksi sejak awal menambah di depan. Ekspektasi disesuaikan setelah kontrak source diperiksa; hasil awal disimpan pada `independent-initial-order-expectation.json`. Kedua koreksi hanya menyentuh harness QC, tanpa perubahan source aplikasi. Hasil final 30/30 di atas berasal dari eksekusi ulang setelah koreksi tersebut.

## Batas persetujuan

`store/accountingStore.ts` berubah sejak tes filter developer: hash lama `52e27a2b…`, hash saat review `af13573347207d472a6df93d4ce13218fdba794efeee57a19809c276b69395ec`. Perubahan ID addLedgerEntry masih paket LEDGER-ID-001 Senior8 yang belum final saat klaim QC. Tes batch ini memakai store terbaru sebagai dependency dan fingerprint-nya stabil; **keputusan ini tidak menyetujui patch ID store**. Manifest helper/filter lama tidak dianggap manifest final store.

Native primitives, common UI, actionsheet primitives dan currency formatter memakai adapter; navigasi memakai parameter fixture. Callback tombol komponen produksi dipanggil pada test renderer. Tidak ada uji klik/keyboard browser, geometri native, API/database, autentikasi penuh atau Figma. Formatter adapter hanya membantu observasi nilai summary, bukan bukti format rupiah produksi. Tidak mengakses atau mengubah data pengguna.

**Saldo Akhir tetap saldo metadata akun**, bukan saldo akhir periode hasil perhitungan opening balance. Fallback ID akun invalid ke akun pertama dan ketidakpatuhan UI legacy yang dicatat pada laporan awal tetap di luar delta. Tidak ada timer otomatis yang menyegarkan periode pada pergantian hari; periode diperbarui melalui pemilihan ulang/remount sesuai kontrak handoff. Full TypeScript/gate integrasi snapshot akhir tetap milik PM; typecheck developer direview sebagai bukti historis, tidak diklaim QC ulang.

PM dapat menilai publikasi **dua hash final** setelah gate integrasi. QA/QC delta filter lulus; tidak ada persetujuan seluruh modul keuangan atau rilis aplikasi. QC tidak mengubah source aplikasi/backend/dependency/harness developer, server/HP, branch/index, commit/push maupun PDF snapshot sebelumnya. Sinyal melalui dokumen workspace, tanpa klaim percakapan Senior8/PM telah menerima langsung.
