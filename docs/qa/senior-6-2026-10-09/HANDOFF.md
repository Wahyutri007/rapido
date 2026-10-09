# SD6-001 — Printer dan pengaturan POS

Tanggal: 9 Oktober 2026, Asia/Jakarta. Pemilik: Software Developer Senior 6. Status: **READY_FOR_PM_REVIEW — QC PASS_DELTA, P1 CLOSED**, berdasarkan [recheck QC](../qc-sd6-2026-10-09/recheck/REPORT.md). Handoff developer READY_FOR_QA sudah ditindaklanjuti; penerimaan terbatas pada delta tiga hash source, bukan fitur penuh/main. Setelah SingleSelect berubah pada batch Senior7, 17 tes UI dan TypeScript terfokus diulang dan lolos pada hash dependency final `c10d47b8`. Kanal serah terima: dokumen workspace. Snapshot working tree pada base HEAD `acba0d92460c1af3149abc3775f09888a2943cab`; identitas source yang diuji memakai SHA-256 pada [results.json](results.json), [ui-api-results.json](ui-api-results.json) dan [verification.json](verification.json).

## Perubahan dan perilaku

| File | Sebelum | Sesudah |
| --- | --- | --- |
| `app/(no-layout)/manage/printer/modify.tsx` | Effect sekali saat mount mengisi state printer; perubahan ID/edit ke tambah bisa menyisakan identitas lama. | Printer diturunkan langsung dari ID. Editor diberi key per ID, sehingga form/modal berganti bersama entitas. ID tidak ditemukan memberi pesan Indonesia dan kembali tanpa kontrol simpan. Penyelesaian simulasi simpan milik entitas lama tidak membuka sukses pada entitas baru. |
| `app/(no-layout)/manage/pos-settings/rounding.tsx` | Refetch dapat menimpa draft; pilihan nominal 100/1000/10 dikirim sebagai decimal_places padahal backend memakai pangkat. | Draft per field tetap utuh. UI memetakan Rp10/Rp100/Rp1.000 ke pangkat 1/2/3, default 2. Backend 0–10 ditampilkan dan disimpan tanpa perubahan; pangkat tidak valid diblokir sebelum mutation. |
| `app/(no-layout)/manage/pos-settings/stock-limit.tsx` | Refetch dapat menimpa switch dan daftar pengecualian. | Draft per field melindungi pilihan pengguna; daftar kosong tetap keputusan pengguna yang valid. Picker membuat salinan saat dibuka, Batal membuang perubahan, Selesai menerapkannya. Draft picker tetap utuh ketika query berubah. |

Nilai draft POS tetap dipertahankan setelah gagal/sukses simpan selama layar masih terpasang. Saat layar dibuka ulang, data server menjadi dasar baru. Payload mutation mengikuti kontrak existing pada `api/hooks/settings.ts`; tidak menambah field atau endpoint. Tidak mengubah route, primitive, dependency aplikasi, backend atau source pemilik lain. Import Printer yang tidak dipakai dibuang dan format disesuaikan Biome.

## Respons terhadap QC-SD6-001 (P1)

[Laporan QC](../qc-sd6-2026-10-09/REPORT.md) meminta koreksi unit Pembulatan. Request Laravel produksi mensyaratkan integer 0–10; CartPricingService memakai `pow(10, decimal_places)`. Perbaikan terbatas pada Pembulatan; hash Printer dan Stock tetap sama dengan review QC sebelumnya.

| Pilihan UI | Payload decimal_places | Kelipatan | Total 15.001, metode up |
| --- | --- | --- | --- |
| Puluhan (Rp10) | 1 | 10 | 15.010 |
| Ratusan (Rp100), juga default | 2 | 100 | 15.100 |
| Ribuan (Rp1.000) | 3 | 1.000 | 16.000 |

Nilai backend valid di luar tiga opsi umum mendapatkan pilihan berlabel nominal `Kelipatan (Rp…)`, termasuk 0 dan 4–10. Nilai ini tidak dipaksakan ke default. Draft pilihan tetap mengungguli refetch. Backend yang mengembalikan pangkat negatif, pecahan, atau di atas 10 tidak menghasilkan request simpan.

Hash Pembulatan final: `21bd675838cd5f2378271820ebb4c461c7ad2cf8387a24a9dd69f62eeb66e04f`. Hash lama pada laporan QC: `6d10d71f7ad5056a6621e5d73f538d3478005adbb3651e16f113dae5ad51c817`. QC menutup P1 setelah menguji hash final tersebut.

## Hasil recheck QC dan penyelesaian paket

[QC recheck](../qc-sd6-2026-10-09/recheck/REPORT.md) mencatat **54 lifecycle lulus** (42 rerun developer + 12 kasus tambahan QC), runtime/console error 0; **29 payload lulus Request Laravel dan CartPricingService::calculate produksi** dengan fixture relasi dalam memori, 0 query database. QC menyatakan `QC-SD6-001 P1 CLOSED; PASS_DELTA_FOR_PM_REVIEW` pada ketiga hash final. Hasil service tersebut adalah bukti pemeriksa QC, terpisah dari pemeriksaan formula developer di bawah.

QC membaca paket saat referensi manifest belum selesai dan UI masih memakai SingleSelect `e967d1ef`. Kekurangan paket itu sekarang diselesaikan: verification.json tersedia, 17 UI/API dan TypeScript terfokus sudah diulang pada SingleSelect `c10d47b8`, dan 29 fingerprint source/dependency sesuai hasil final. Informasi ini menjadi supplement developer untuk PM/QC; tidak mengubah laporan pemeriksa atau mengklaim QC mengulang UI terbaru. Gate snapshot integrasi tetap PM.

## Verifikasi developer

- **42 pemeriksaan lifecycle lulus**, runtime exception dan console error 0. Enam Printer, 26 Pembulatan, sepuluh Batas Stok. Mencakup default, late response/refetch, disabled/0, roundtrip seluruh pangkat 0–10, tiga pilihan UI dan empat nilai tidak valid. [Hasil dan hash source](results.json), [bukti Printer](printer-results.json), [harness](lifecycle.cjs). Hasil 24 tes sebelum koreksi P1 adalah histori; bukti final menggantikannya.
- **16 payload lolos validator Request Laravel produksi**, tanpa API/database mutation. Angka pada tabel di atas cocok dengan formula CartPricingService; service keranjang lengkap tidak dieksekusi. [Payload dari handler screen](rounding-contract-payloads.json), [hasil validator dan hash backend](rounding-contract-results.json), [runner](rounding-contract.php).
- **17 interaksi UI/API lulus**, runtime exception dan console error 0, pada Edge headless memakai screen, NativeWind/Gluestack, RHF, React Query dan Axios produksi. Request HTTP memakai fixture dalam konteks browser tes. Cakupan: SingleSelect, simpan/refetch/gagal/switch, picker stok cari/batal/selesai/kosong, pergantian ID Printer, serta prefill/simpan pangkat 0/4/10. CTA dan sheet diperiksa pada 320/390px; screenshot ditinjau setelah animasi selesai. [Hasil, request dan 29 hash source/dependency](ui-api-results.json), [runner](ui-api.cjs), [entry lokal](ui-entry.jsx), [sheet 320px](stock-picker-320.png), [label pangkat 10](rounding-exponent-10-320.png).
- ESLint tiga file: **0 error, 0 warning**, tanpa suppression/perubahan aturan. [Hasil ESLint](eslint.json).
- Biome tiga file: check bersih setelah penyesuaian format/import.
- Diff ditinjau; perbaikan terbatas pada tiga file di atas. Tidak commit/push atau mengubah branch.
- TypeScript **terfokus pada tiga root source beserta dependency closure: exit 0, 0 diagnostic**, dengan konfigurasi salinan [scoped-tsconfig.json](scoped-tsconfig.json) yang dijalankan dari `.expo/senior6-tsconfig.json`. TypeScript seluruh integrasi tetap gate PM; tidak menjalankan pemeriksaan global tambahan.

Suite lifecycle memakai source screen aktual, React DOM dan react-hook-form aktual dengan adaptor native UI/router/API. Suite UI/API tambahan memakai primitive dan hook produksi, dengan navigator tes kecil serta HTTP fixture. Keduanya adalah tes developer, belum QA independen. Web mengeluarkan warning existing `pointerEvents` dan fallback `useNativeDriver`; tidak ada runtime/console error. Dua percobaan awal harness browser gagal membuka bundle karena alamat IPv4 berbeda dari Metro localhost IPv6; alamat harness diperbaiki sebelum suite final lulus. Kegagalan setup tersebut tidak dihitung sebagai tes source yang lolos.

Perintah dari root aplikasi:

```powershell
# Hanya bila alat lokal belum tersedia; dependency aplikasi tidak diubah.
npm install --prefix .expo/senior6-tools --no-save --package-lock=false playwright
node docs/qa/senior-6-2026-10-09/lifecycle.cjs
php docs/qa/senior-6-2026-10-09/rounding-contract.php
node node_modules/eslint/bin/eslint.js 'app/(no-layout)/manage/printer/modify.tsx' 'app/(no-layout)/manage/pos-settings/rounding.tsx' 'app/(no-layout)/manage/pos-settings/stock-limit.tsx' --no-cache --max-warnings 0 -f json -o docs/qa/senior-6-2026-10-09/eslint.json
node node_modules/@biomejs/biome/bin/biome check 'app/(no-layout)/manage/printer/modify.tsx' 'app/(no-layout)/manage/pos-settings/rounding.tsx' 'app/(no-layout)/manage/pos-settings/stock-limit.tsx'
Copy-Item docs/qa/senior-6-2026-10-09/scoped-tsconfig.json .expo/senior6-tsconfig.json
node node_modules/typescript/bin/tsc --noEmit --project .expo/senior6-tsconfig.json
# Entry harus berada di .expo agar relative path font dan config tetap sesuai.
Copy-Item docs/qa/senior-6-2026-10-09/ui-entry.jsx .expo/senior6-ui-entry.jsx
# Jalankan Metro di terminal terpisah, lalu runner setelah port siap.
node node_modules/expo/bin/cli start --localhost --port 8098 --max-workers 1
node docs/qa/senior-6-2026-10-09/ui-api.cjs
node docs/qa/senior-6-2026-10-09/summarize-evidence.cjs
```

## Batas dan tindak lanjut QA/QC

Printer existing hanya menampilkan fixture perangkat terdeteksi dan simulasi simpan: belum ada field konfigurasi, schema/prefill konfigurasi, penemuan perangkat, API atau persistensi. Perbaikan ini tidak menyatakan integrasi printer selesai.

Pilihan Pembulatan `applyTo` masih state UI lokal: kontrak payload belum memiliki field itu. Produk Batas Stok tetap memakai fallback/angka stok contoh existing. Kontrak Stock `content_type: category` memerlukan tiket terpisah seperti dicatat QC; layar masih mengirim `item`. Validasi kepemilikan ID menu stok tidak disertifikasi oleh fixture browser. Normalisasi server sesudah simpan, koneksi API backend nyata, navigator/auth penuh, perangkat native dan Figma belum diuji. Pemeriksaan akses Figma saat ini tidak menemukan tool Figma yang tersedia. Styling lama di luar perubahan lifecycle belum direfaktor.

QA lanjutan: uji tiga layar pada router penuh dan mutation/refetch nyata bila backend tersedia. QC/PM: gunakan keputusan recheck untuk ketiga hash final dan supplement dependency/UI terbaru di atas; jangan memakai bukti snapshot lama sebagai gate integrasi. PM menjalankan gate integrasi terkoordinasi sebelum publikasi. Hash dan hasil terikat pada [verification.json](verification.json). Metro 8098 dan browser tes milik Senior6 ditutup setelah verifikasi; server sesi lain dipertahankan.

## Handover scope yang sempat bersamaan

Katalog/Buku Besar diserahkan kepada Senior 8 sebelum ada edit source oleh Senior 6. Edit awal Promo milik Senior 6 sudah dibalik dengan patch terfokus; `git diff --numstat` untuk detail Promo dan modify Voucher kosong pada pemeriksaan akhir. Source Promo/Voucher **sudah tersedia kembali bagi PM**, bukan WAITING_FOR_SOURCE_HANDOVER. Harness tanggal yang belum lolos dihapus dan tidak dijadikan bukti. Temuan read-only untuk pemiliknya: `getMonthName` pada `lib/utils/dates.ts` memakai tanggal hari ini lalu `setMonth`, sehingga nama bulan dapat melompat pada tanggal 29–31; perlu verifikasi terfokus oleh pemilik scope tersebut.
