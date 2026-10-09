# Senior 7 - filter bagian laporan CardList

9 Oktober 2026, Asia/Jakarta. **READY_FOR_QA**, belum approval QA/QC. Scope source: `components/custom/CardList.tsx`, terbatas pada CardListFilterSheet dan useCardListFilter. Pekerjaan dipilih dari backlog lint PM yang belum diklaim setelah pengguna meminta lanjut; bukan nomor tiket baru yang diterbitkan PM. Klaim dan sinyal per batch tercatat di SESSION_COORDINATION.

## Perubahan

- Sheet sebelumnya menghapus pilihan sementara ketika parent mengirim array selectedIds baru dengan isi sama. Perbandingan isi ID kini menjaga draft tersebut; perubahan nilai eksternal dan pembukaan ulang tetap mereset draft sebelum children dirender. Satu error `react-hooks/set-state-in-effect` dihapus tanpa suppression.
- Hook sebelumnya memperbarui selectedIds melalui effect setelah identitas bagian berubah, sehingga satu commit masih memakai filter lama dan dapat menyembunyikan semua bagian baru. Rekonsiliasi identitas kini terjadi sebelum children dirender.
- Penggabungan ID memakai `::` dapat menyamakan dua daftar berbeda, misalnya `["a::b", "c"]` dan `["a", "b::c"]`. JSON serialization membedakan batas setiap ID. Ini kasus kontrak string ID yang direproduksi; tidak mengklaim data laporan saat ini memakai ID tersebut.

API props, nilai awal all/subset, array bagian datar/bertingkat, fallback ID ke title, setter publik, filterSections, isFiltered serta urutan callback tetap. Reset tetap langsung memanggil onReset dan mengembalikan seluruh bagian, bahkan sebelum Terapkan, sesuai perilaku existing. Batal hanya membuang perubahan draft; tidak membatalkan Reset yang sudah diterapkan. Mengubah konfigurasi initialSelected setelah mount tidak menimpa pilihan pengguna. Perubahan urutan/identitas daftar bagian tetap memulai pilihan all seperti sebelumnya.

Geometri, styling, row/title/container renderer, route, kalkulasi dan data laporan tidak berubah. Biome hanya menyatukan penulisan props Button Terapkan menjadi satu baris. Gaya legacy yang belum sesuai AGENTS_UI tetap di luar scope ini.

## Verifikasi

| Pemeriksaan | Baseline | Final |
| --- | --- | --- |
| Sheet produksi | 16 lolos / 2 gagal | 18 lolos |
| Hook + sheet + CardListSections produksi | 18 lolos / 3 gagal | 21 lolos |
| ESLint CardList | 1 error / 0 warning | 0 error / 0 warning |
| Biome / scoped diff-check | — | Lolos |
| TypeScript CardList + tujuh layar pemanggil dan dependency closure | — | 0 diagnostic |

Total final **39 pemeriksaan lolos**, runtime/act error 0. Kelima assertion baseline gagal berasal dari tiga masalah di atas, bukan lima akar bug terpisah. [verification.json](verification.json) mengikat source, harness dan bukti; [sheet-baseline.json](sheet-baseline.json), [integration-baseline.json](integration-baseline.json), [sheet-results.json](sheet-results.json) serta [integration-results.json](integration-results.json) dapat diperiksa. Batch sheet terlebih dahulu mengirim sinyal QA dengan hasil antara; persetujuan seluruh file harus memakai hash final gabungan.

Seluruh tujuh pemanggil langsung dibaca: summary, sales, purchase-supplier, product-stock, operational-team, customers-promos dan cash di `app/(no-layout)/(back-office)/report/`. Semuanya memakai hook dan sheet bersama; sales membuat ulang array bagian pada render, sedangkan enam lainnya memakai memo. Tidak mengedit layar tersebut. Typecheck mencakup delapan root ini, bukan pemeriksaan global proyek.

## Permintaan QA lalu QC

QA: cocokkan hash lalu uji buka/toggle/Terapkan, kosongkan pilihan, Batal/reopen, Reset langsung, perubahan nilai eksternal, refetch dengan ID sama dan pergantian kumpulan bagian. QC: periksa identitas ID, kontrak initialSelected/callback dan batas perubahan; gate publikasi akhir milik PM.

Tes menjalankan komponen/hook produksi dengan React 19 test renderer; RN, Button, Actionsheet, Text dan ikon memakai host adapter. Tujuh layar diperiksa source dan tipe, belum dijalankan seluruhnya dalam browser/native/router. Tidak menguji data backend, kebenaran nominal laporan, aksesibilitas, fokus atau animasi sheet native. Figma metadata terbaru ditolak akses editor dan whoami sudah diperiksa; tidak mengklaim kecocokan visual.

Source Barcode/Incrementer/SingleSelect/Sort sebelumnya tidak diubah atau diklaim diuji ulang dalam batch ini. Tidak mengubah dependency aplikasi, backend, server/HP, branch/index atau commit/push. Sinyal melalui dokumen workspace, bukan klaim percakapan QA/QC telah menerima atau menyetujui.

## Mengulang

Dari root aplikasi dengan dependency test terisolasi Senior7 yang sudah tersedia:

```powershell
node docs/qa/senior-7-2026-10-09/cardlist-filter/lifecycle.cjs sheet
node docs/qa/senior-7-2026-10-09/cardlist-filter/lifecycle.cjs integration
node node_modules/eslint/bin/eslint.js components/custom/CardList.tsx
node node_modules/@biomejs/biome/bin/biome check components/custom/CardList.tsx
node docs/qa/senior-7-2026-10-09/cardlist-filter/typecheck.cjs
```

Jangan jalankan --baseline dengan source final agar bukti sebelum perbaikan tidak tertimpa.

Execution Profile & Operator Tips: Medium. Sheet -> sinyal QA -> hook/integrasi -> verifikasi final -> QA/QC/PM. Jaga scope shared dan gunakan satu gate TypeScript global terkoordinasi oleh PM.
