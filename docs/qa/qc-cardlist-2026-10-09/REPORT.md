# QC CardList — filter bagian laporan

9 Oktober 2026, Asia/Jakarta. **QC-CARDLIST-20261009-PASS-DELTA / PASS_DELTA_FOR_PM_REVIEW.** Tidak ditemukan temuan baru pada delta filter. Keputusan ditujukan untuk PM melalui dokumen workspace, tanpa klaim percakapan langsung telah menerima.

## Snapshot

Source `components/custom/CardList.tsx`, SHA-256 **`a0e976f5626a9a5e26a8b961fc288624d33e6689bbf32dca7ef8f369229c33b2`**, pada working tree base lokal `acba0d92460c1af3149abc3775f09888a2943cab`.

Hash sesuai handoff FINAL READY_FOR_QA Senior7. Manifest source/harness/bukti dan tujuh pemanggil dicocokkan; stabil sebelum/sesudah rerun. Snapshot antara batch sheet `ec560307...` bukan source final yang disetujui. Diff hanya sinkronisasi draft sheet, identitas bagian pada hook dan format props Button; row/title renderer, data/kalkulasi serta route tidak diubah.

## Verifikasi QA/QC

| Pemeriksaan | Assertion final lolos | Bukti |
| --- | ---: | --- |
| Sheet produksi | 18 | Rerun QC harness developer |
| Hook + sheet + CardListSections produksi | 21 | Rerun QC harness developer |
| Tujuh screen laporan + builder + CardList produksi | 86 | Harness tambahan QC |
| Total | **125** | 39 rerun + 86 tambahan |

Runtime/act error 0. Rerun diarahkan ke output QC terpisah dan tidak menimpa bukti developer. Source/harness/caller/bukti developer stabil pada `sheet-snapshot.json` dan `integration-snapshot.json`. Source CardList, tujuh screen serta tujuh builder stabil pada `caller-results.json`.

ESLint CardList **0 error/0 warning**; Biome check dan `git diff --check` bersih. TypeScript CardList/tujuh pemanggil yang dilakukan developer dibaca sebagai bukti developer. QC tidak menggandakan TypeScript global; gate integrasi final tetap milik PM.

## Kontrak dan pemanggil aktual

JSON serialization memisahkan batas ID sehingga dua daftar yang dahulu berbenturan melalui pemisah `::` kini berbeda. Rerun membuktikan perubahan kumpulan bagian tidak menghasilkan commit laporan tersembunyi oleh filter identitas lama. Array baru dengan isi ID yang sama mempertahankan draft; pembukaan ulang atau nilai eksternal yang berubah mereset draft. Default all, subset, kosong, ID fallback title dan setter publik tetap berfungsi.

Kontrak **Reset langsung berlaku** dipertahankan: onReset mengembalikan semua bagian tanpa menunggu Terapkan. Batal hanya membuang draft berikutnya dan tidak membatalkan Reset yang sudah diterapkan. Konfigurasi initialSelected setelah mount tidak menimpa pilihan pengguna; perubahan identitas/urutan kumpulan bagian memulai pilihan all sebagaimana perilaku existing.

Harness tambahan menjalankan screen dan builder produksi pada React StrictMode:

| Screen | Bagian default | Assertion perilaku |
| --- | ---: | ---: |
| Summary | 8 | 12 |
| Sales | 9 | 12 |
| Purchase-supplier | 6 | 12 |
| Product-stock | 7 | 12 |
| Operational-team | 3 | 12 |
| Customers-promos | 5 | 12 |
| Cash | 5 | 12 |

Dua assertion tambahan memeriksa runtime/act error dan kestabilan source. ID default tujuh laporan unik. Masing-masing screen diuji membuka filter melalui callback FilterRow, draft tanpa perubahan laporan, rerender state action, Terapkan, Batal, Reset langsung, Batal sesudah Reset, pilihan kosong, pemulihan Reset serta remount. Sales membuat ulang array bagian pada rerender; draft dan subset laporan tetap terjaga. Ini pengujian screen React terisolasi, bukan klik browser/navigator penuh.

## Batas dan keputusan PM

Native/UI/Actionsheet/Button/Text, FilterRow/action controls, AnimatedWrapper dan formatter adalah adapter. Screen, builder laporan, hook/sheet/CardListSections serta row renderer berasal dari source produksi. Tidak disertifikasi: interaksi browser/HP, fokus/keyboard/screen reader, frame animasi, root router/auth, data backend, nilai nominal/kebenaran laporan atau Figma. Builder masih memakai data contoh existing; pemformatan dalam tes tidak membuktikan angka keuangan.

Tool Figma tidak tersedia pada profil QC saat diperiksa. Raw colors/fractional spacing/style legacy di luar diff tetap backlog. Persetujuan ini berlaku pada delta filter satu hash; tidak menambah redesign dan tidak mengesahkan seluruh fitur laporan/aplikasi. PM dapat menilai publikasi source setelah gate integrasi snapshot akhir. QC tidak mengubah source aplikasi/harness developer/dependency, server/HP, branch/index atau commit/push.

## Reproduksi

```powershell
# Dari root aplikasi
node docs/qa/qc-cardlist-2026-10-09/rerun.cjs sheet
node docs/qa/qc-cardlist-2026-10-09/rerun.cjs integration
node docs/qa/qc-cardlist-2026-10-09/caller-integration.cjs
```

Hasil: `sheet-results.json`, `integration-results.json`, `caller-results.json`, kedua snapshot, `eslint.json` dan `DECISION.json`. `finalize.cjs` memastikan gate/fingerprint tetap sesuai sebelum menulis keputusan.
