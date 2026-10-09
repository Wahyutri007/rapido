# QC recheck SD6-001 — Printer dan pengaturan POS

9 Oktober 2026, Asia/Jakarta. **QC-SD6-001 P1 CLOSED; PASS_DELTA_FOR_PM_REVIEW.** Keputusan berlaku untuk tiga hash source di bawah. Paket awal yang meminta perubahan tetap menjadi histori; keputusan ini menggantikannya untuk delta yang diperiksa. Sinyal disampaikan melalui workspace, tanpa klaim percakapan PM sudah menerima langsung.

## Source dan keputusan

Base HEAD lokal `acba0d92460c1af3149abc3775f09888a2943cab`. Snapshot working tree, bukan commit baru.

| Source | SHA-256 final |
| --- | --- |
| `app/(no-layout)/manage/printer/modify.tsx` | `ac1d96ab9f562f507d23cb6407a2234848ea5c9ebd3d590c8178e9dd6a47957e` |
| `app/(no-layout)/manage/pos-settings/rounding.tsx` | `21bd675838cd5f2378271820ebb4c461c7ad2cf8387a24a9dd69f62eeb66e04f` |
| `app/(no-layout)/manage/pos-settings/stock-limit.tsx` | `3a69d2f54477dfb46dc342a8820c71747899ab75cb096c28820c1693660edac4` |

Hash sama dengan handoff final Senior6 dan hasil lifecycle/UI-API developer. Source tiga file serta harness developer stabil sebelum/sesudah rerun (`snapshot.json`). Printer dan Stock tidak berubah sejak review pertama; Pembulatan berubah dari hash `6d10d71f...` yang mereproduksi P1 menjadi `21bd6758...`.

## Verifikasi QA/QC

- **54 skenario lifecycle lulus:** 42 skenario harness developer diulang oleh QC dengan output terpisah, ditambah 12 skenario QC. Source screen/React DOM/RHF produksi; primitive native/router/API memakai adaptor. Runtime/console error 0. Bukan 54 skenario independen baru dan bukan uji navigator/native/API penuh.
- Tambahan QC mencakup sembilan kombinasi tiga nominal dengan metode atas/bawah/terdekat, pemulihan pangkat tidak valid melalui pilihan valid, draft valid saat refetch membawa pangkat tidak valid, serta matikan/aktifkan tanpa kehilangan draft. Nilai diassert dari handler simpan produksi.
- **29 payload produksi lulus validator Laravel asli dan `CartPricingService::calculate` asli.** Cart produksi memakai relasi fixture yang dimuat dalam memori; diskon/promo/pajak/voucher tidak diaktifkan. Hasil service cocok dengan ekspektasi nominal dan formula. **0 query database** selama verifikasi; tidak ada HTTP atau perubahan database. Hash Request, service dan Cart stabil. Ini memverifikasi unit/perhitungan pada fixture, bukan checkout/persistensi penuh.
- ESLint tiga file exit 0, **0 error/0 warning** (`eslint.json`). Biome check tiga file dan `git diff --check` bersih. TypeScript global tidak digandakan; hasil terfokus developer dibaca sebagai bukti developer, gate integrasi akhir milik PM.

## Penutupan P1

| Pilihan | decimal_places | Kelipatan backend | Total 15.001, metode atas |
| --- | --- | --- | --- |
| Puluhan Rp10 | 1 | 10 | 15.010 |
| Ratusan Rp100 | 2 | 100 | 15.100 |
| Ribuan Rp1.000 | 3 | 1.000 | 16.000 |

Default kini 2. Prefill/roundtrip seluruh pangkat 0–10 menjaga nilai dan label kelipatan; pilihan 0 berarti Rp1. Pangkat negatif, pecahan, 11 dan 100 diblokir sebelum mutation. Refetch tidak menimpa field yang sudah diedit. Pilihan Rp10 tidak lagi mengirim pangkat 10; pilihan ratusan/ribuan tidak lagi ditolak validator. **QC-SD6-001 ditutup pada snapshot final ini.**

## Bukti UI developer dan batas penerimaan

Paket developer final melaporkan 17 interaksi browser dengan primitive/hook produksi, HTTP fixture dan viewport 320/390px. QC membaca hasil/request/hash dan meninjau screenshot `rounding-exponent-10-320.png` serta `stock-picker-320.png`: label pangkat 10 dan CTA/sheet terlihat pada viewport tersebut. Ini review artefak developer, bukan rerun UI independen atau pembandingan Figma.

Ketika review dimulai, hasil UI/API masih memakai SingleSelect `e967d1ef...` dan manifest belum tersedia. Sebelum keputusan final, Senior6 menyelesaikan handoff serta mengulang 17 interaksi UI dan tipe terfokus pada SingleSelect final `c10d47b8...` dan tema `d10d2595...`. QC membaca sinyal FINAL READY_FOR_QA lalu mencocokkan seluruh source, artefak manifest dan 29 dependency UI dengan hasil final (`handoff-review.json`); paket lengkap dan cocok. Hasil ini tetap bukti developer yang direview, bukan uji integrasi seluruh aplikasi. PM perlu gate final pada snapshot publikasi.

Persetujuan terbatas pada perbaikan lifecycle Printer/POS dan kontrak unit Pembulatan. Batas existing tetap:

- Printer masih fixture perangkat dan simulasi simpan; transport, discovery serta persistensi belum disertifikasi.
- `applyTo` Pembulatan masih UI lokal tanpa field API; opsi Tunai Saja belum disertifikasi pada transaksi.
- Stock memakai fallback contoh dan selalu `content_type: item`; kepemilikan ID menu serta pengaturan backend berbasis kategori memerlukan tiket tersendiri.
- Native/HP, API nyata, navigator/auth penuh, Figma dan styling legacy di luar delta belum disertifikasi QC. Tidak ada tool Figma tersedia pada pemeriksaan ini.

PM dapat menilai publikasi delta ketiga hash setelah gate integrasi final. Ini bukan persetujuan fitur printer/POS seluruhnya atau push main. QC tidak mengedit source/dependency/harness developer, commit/push, atau mengendalikan server/HP.

## Reproduksi

Jalankan dari root aplikasi:

```powershell
node docs/qa/qc-sd6-2026-10-09/recheck/rerun.cjs
php docs/qa/qc-sd6-2026-10-09/recheck/rounding-contract.php
```

Hasil: `results.json`, `rounding-contract-payloads.json`, `contract-validation.json`, `snapshot.json`, `eslint.json`, `handoff-review.json` dan `DECISION.json` dalam direktori recheck ini. Harness lama di direktori induk memakai pilihan UI historis; jangan menjadikannya runner snapshot final.
