# QC SD6-001 — Printer dan POS

**Status terbaru:** [recheck/REPORT.md](recheck/REPORT.md) menutup QC-SD6-001 P1 pada hash Pembulatan `21bd6758...` dan memberi PASS_DELTA_FOR_PM_REVIEW untuk tiga source final. Laporan di bawah adalah histori temuan pada hash lama; bukti asli dipertahankan. Gunakan runner pada direktori `recheck` untuk snapshot final.

Tanggal: 9 Oktober 2026 (Asia/Jakarta). **CHANGES_REQUESTED untuk Pembulatan; delta lifecycle lolos pemeriksaan terfokus. Belum persetujuan publikasi fitur penuh.** Sinyal untuk Senior6 dan Project Manager tersedia pada koordinasi workspace; tidak mengklaim pesan langsung telah diterima.

## Snapshot dan hasil

Base workspace `acba0d92460c1af3149abc3775f09888a2943cab`. Tiga hash source sama dengan handoff Senior6 saat pengujian:

| Source | SHA-256 |
| --- | --- |
| `app/(no-layout)/manage/printer/modify.tsx` | `ac1d96ab9f562f507d23cb6407a2234848ea5c9ebd3d590c8178e9dd6a47957e` |
| `app/(no-layout)/manage/pos-settings/rounding.tsx` | `6d10d71f7ad5056a6621e5d73f538d3478005adbb3651e16f113dae5ad51c817` |
| `app/(no-layout)/manage/pos-settings/stock-limit.tsx` | `3a69d2f54477dfb46dc342a8820c71747899ab75cb096c28820c1693660edac4` |

QC mengulang 24 pemeriksaan developer melalui `rerun.cjs` dengan hasil terpisah: **24/24 lolos**, runtime/console error 0. Source screen, React DOM dan RHF asli; native UI/router/API diganti adaptor. Ini rerun independen atas harness yang direview, bukan 24 test baru atau tes backend/native. ESLint tiga source exit 0, error/warning 0 (eslint.json); Biome tiga source bersih tanpa fix. Tidak mengulang TypeScript global saat gate integrasi dikoordinasikan sesi lain.

Diff lifecycle ditinjau: editor Printer diberi key per ID; request simulasi milik instance lama tidak membuka modal instance baru. Field POS memakai draft per field sehingga refetch tidak mengganti input pengguna, nilai false/0/array kosong dipertahankan, picker batal membuang draft dan selesai menerapkan. Tidak ditemukan regresi baru dalam delta tersebut.

## QC-SD6-001 — P1: unit Pembulatan tidak sesuai backend

Lokasi frontend: `app/(no-layout)/manage/pos-settings/rounding.tsx:41` dan `:69` (`MULTIPLE_OPTIONS`, prefill dan payload). Kontrak backend: `app/Domain/User/Requests/RoundingSettingRequest.php:16`; perhitungan `app/Domain/Order/Services/CartPricingService.php:126` pada repo backend lokal.

Layar menampilkan kelipatan nominal, namun mengirim nilainya langsung sebagai `decimal_places`. Backend mensyaratkan integer 0–10 dan menghitung kelipatan sebagai `10 ** decimal_places`.

| Pilihan UI | Payload aktual | Hasil validator backend asli | Kelipatan yang seharusnya dikirim |
| --- | --- | --- | --- |
| Ratusan Rp100 | `decimal_places: 100` | Ditolak max:10 | `decimal_places: 2` |
| Ribuan Rp1.000 | `decimal_places: 1000` | Ditolak max:10 | `decimal_places: 3` |
| Puluhan Rp10 | `decimal_places: 10` | Diterima; berarti Rp10.000.000.000 | `decimal_places: 1` |

Dengan total 15.001 dan metode `up`, pilihan Puluhan menghasilkan 10.000.000.000 menurut formula produksi, bukan 15.010. QC menangkap payload dari handler screen produksi pada browser adaptor, lalu memvalidasi melalui Request Laravel produksi tanpa API/database mutation. Perhitungan numerik pada artefak mengikuti formula CartPricingService; service keranjang lengkap tidak dieksekusi. Nilai 100/1000 yang ditolak validator tidak dapat masuk perhitungan melalui request tersebut; hasil aritmetiknya dalam artefak hanya diagnostik.

Bukti: contract-payloads.json dan contract-validation.json. Roundtrip backend `decimal_places:2` tanpa edit mengirim 2, tetapi dropdown tidak memiliki pilihan value 2, sehingga label prefill juga perlu dikoreksi. Default sebelum respons API memakai 100 dan akan ditolak backend.

**Ini bug existing sebelum delta lifecycle Senior6**, bukan regresi yang diperkenalkan perbaikan draft. Kelulusan lifecycle tidak mengesahkan kebenaran fitur Simpan Pembulatan. Senior6 diminta memetakan dua arah nilai nominal/pangkat, menguji 1/2/3, default, disabled/0, data terlambat, roundtrip pangkat lain yang didukung backend, serta mempertahankan draft/refetch. Jangan memperluas batas backend untuk menerima 100/1000 karena service memakai pangkat.

## Batas fitur dan utang lama

- Printer masih fixture perangkat dan simulasi simpan, belum transport/discovery/persistensi. UI menyebut keberhasilan tanpa membuktikan printer tersimpan; perubahan lifecycle ini tidak memberikan approval fitur printer lengkap.
- `applyTo` Pembulatan masih state UI dan tidak ada pada kontrak payload backend. Tidak mengklaim pilihan Tunai Saja diterapkan pada kalkulasi penjualan.
- Stock memakai daftar produk/angka fallback existing saat query belum berisi menu nyata. StockSettingRequest memvalidasi ID terhadap Menu/Category pemilik; fixture `prod-*` bukan kontrak ID backend. Backend mendukung `content_type: category`, layar selalu menyimpan `item`; penggunaan konfigurasi kategori existing perlu tiket kontrak terpisah. Tidak disertifikasi pada pemeriksaan lifecycle ini.
- UI lama masih memakai fractional spacing, raw colors dan override primitive (misalnya rounding Card p-2.5 dan Printer Text text-sm/text-gray-900). Tidak diperkenalkan delta lifecycle; backlog UI harus tetap tercatat. Tidak ada redesign/geometri baru yang disetujui.
- Native, Figma, UI primitive sebenarnya, navigator/auth dan request API penuh belum dijalankan QC. Senior6 sedang melengkapi bukti UI/API dalam paketnya; hasil tersebut belum dianggap approval QC.

## Perintah dan serah terima

```powershell
node docs/qa/qc-sd6-2026-10-09/rerun.cjs
php docs/qa/qc-sd6-2026-10-09/rounding-contract.php
node node_modules/eslint/bin/eslint.js 'app/(no-layout)/manage/printer/modify.tsx' 'app/(no-layout)/manage/pos-settings/rounding.tsx' 'app/(no-layout)/manage/pos-settings/stock-limit.tsx' --no-cache --max-warnings 0
node node_modules/@biomejs/biome/bin/biome check 'app/(no-layout)/manage/printer/modify.tsx' 'app/(no-layout)/manage/pos-settings/rounding.tsx' 'app/(no-layout)/manage/pos-settings/stock-limit.tsx'
```

QC hanya menulis bukti/laporan di direktori ini dan koordinasi. Source/harness/bukti developer dipertahankan; tidak commit/push/merge atau mengendalikan server/HP. PM dapat menilai delta lifecycle tersendiri sesuai scope, tetapi belum menerima persetujuan QC fitur Pembulatan lengkap sampai P1 ditutup dan gate integrasi terpenuhi.
