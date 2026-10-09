# SD3-003 Validasi Jurnal — READY_FOR_QA

**Codex-3**, 9 Oktober 2026, Asia/Jakarta. Kelanjutan yang dipilih dari batas SD3-002 setelah pengguna meminta lanjut; bukan tiket PM baru atau approval QC. QA perilaku → QC kontrak/UI/batas → PM. Sinyal melalui dokumen workspace, tanpa klaim penerimaan percakapan langsung.

## Hasil dan kode

Jurnal lama dapat menyimpan tanggal kalender tidak valid, akun tanpa ID, satu baris, nominal negatif yang saling menutup, `NaN` yang dianggap nol oleh total, `Infinity`, atau total overflow. `Infinity === Infinity` juga membuat badge menampilkan **Seimbang**.

- [Jurnal Umum](../../../../app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx) dan [Jurnal Penyesuaian](../../../../app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx) memanggil validator sebelum mutation/lock. Data invalid membuka AlertModal dan menjaga draft serta kesempatan retry. Badge seimbang kini mensyaratkan total finite, sama dan positif.
- [journal-validation](../../../../lib/accounting/journal-validation.ts) memakai schema Zod Jurnal produksi untuk jumlah baris, identitas akun, field wajib dan keseimbangan; helper kalender produksi memeriksa tanggal. Guard tambahan menolak nominal nonfinite/negatif dan overflow total. Pesan dalam bahasa Indonesia.
- Hanya salinan untuk validasi yang di-trim. Payload valid tetap menyimpan teks tanggal/referensi/deskripsi dan ID baris/akun asal. ISO, nama bulan Indonesia penuh, Oct/Okt dan leap day valid tetap kompatibel. Lifetime per ID, draft/refetch, fallback dan saved guard dari SD3-002 dipertahankan.

Scope aplikasi hanya tiga source di atas. Schema/fixture/store/shared helper tanggal, primitive, layout/list/detail/header, backend dan source sesi lain tidak diedit. Editor masih memakai kontrol manual existing; migrasi RHF/Zod UI bukan bagian batch ini. Susunan JSX editor dibandingkan dengan snapshot sebelum batch dan tetap sama. Dokumentasi perilaku [docs/README](../../../README.md) diperbarui.

## Bukti

| Pemeriksaan | Hasil |
| --- | --- |
| Baseline handler sebelum validator | [111 lolos / 72 gagal](baseline.json), 183 assertion; snapshot route disimpan sebagai `*.before.tsx.txt` |
| Tahap validator sebelum guard badge | [183 lolos / 4 gagal](balance-baseline.json), empat assertion badge ditambahkan setelah baseline awal |
| Handler + nominal produksi final | [187/187 lolos](results.json), runtime/act error 0 |
| Regresi SD3-002 pada source final | [55/55 lolos](regression-results.json), runtime/act error 0; output histori SD3-002 tidak ditimpa |
| ESLint tiga source | [0 error / 0 warning](quality-results.json), `--no-cache --max-warnings 0` |
| Biome check, formatter dan diff-check | Exit 0; perbandingan JSX editor dengan snapshot sebelum batch lolos |
| TypeScript tiga root dan dependency closure | [0 diagnostic](typecheck-results.json), opsi/deklarasi proyek; bukan pemeriksaan global |

**242 assertion final lolos**, dengan cakupan yang berulang antara suite validasi dan lifecycle. Kasus mencakup tanggal invalid/alias valid, akun kosong/whitespace, jumlah baris, nominal negatif/NaN/Infinity, overflow total dari angka finite maupun input 400 digit, validasi balance/field wajib, koreksi tanggal lalu retry, payload identitas tetap, draft/refetch, pergantian ID, fallback serta submit ganda.

[verification.json](verification.json) mengikat source/runner/artefak dan memeriksa hash hasil tes terhadap source final. Store accounting shared juga berubah pada action `addLedgerEntry` milik Senior8 selama batch; kedua suite final diulang pada snapshot store terbaru dan hash dicocokkan. Codex-3 tidak mengedit store. Hasil Member QC serta style Kelola terpisah dari bukti Jurnal.

Jalankan dari root aplikasi:

```powershell
node docs/qa/codex-3/journal-validation/check.cjs
node docs/qa/codex-3/journal-validation/regression.cjs
node docs/qa/codex-3/journal-validation/typecheck.cjs
node docs/qa/codex-3/journal-validation/quality.cjs
node docs/qa/codex-3/journal-validation/verify.cjs
```

Suite handler mengeksekusi route/store/schema Zod produksi dan deklarasi `parseNumber`/`formatRp` produksi yang diambil AST tanpa perubahan; `cn`, native/UI, router, modal dan kalender memakai adapter. Runner memakai bootstrap [lifecycle SD3-002](../journals/lifecycle.cjs) dan React/react-test-renderer lokal `.expo/senior7-test-tools/node_modules` read-only. Angka validasi/payload dibuktikan melalui action store; ini bukan rendering NativeWind/Gluestack/browser/native atau API. Baseline bersifat histori; jangan menimpanya dengan menjalankan flag baseline pada source final.

## QA/QC dan batas

QA diminta mencocokkan hash, memastikan input invalid tidak memanggil add/update, tidak membuka sukses/mengunci editor, lalu memastikan koreksi dapat disimpan sekali tanpa kehilangan draft. Ulang case overflow badge dan regresi perpindahan ID. QC memeriksa pemakaian schema, tanggal lokal, payload yang dipertahankan dan batas state contoh; PM menilai publikasi setelah gate integrasi.

State masih fixture Zustand tanpa API/persistensi atau posting buku besar. Belum browser/Expo Router penuh, auth/root, SSR, perangkat Android/iOS, animation/accessibility, Figma atau full-project gate. Tool Figma callable tidak tersedia pada profil saat dicek. Nominal finite mengikuti kontrak schema existing; batas integer aman/precision, keunikan ID antar editor dari `Date.now`, kalender web, tanggal default contoh dan modernisasi kontrol form perlu scope terpisah. Teks tanggal asing yang tidak didukung parser kini perlu diperbaiki lewat picker sebelum simpan.

Tidak menjalankan Metro/bundle/HP, menambah dependency, commit/push/merge atau mengubah branch/index. Paket [SD3-002](../journals/HANDOFF.md) dipertahankan sebagai snapshot histori; **gunakan supplement SD3-003 untuk hash route final dan hasil terbaru**, bukan menganggap hash route SD3-002 masih berlaku.

## Execution Profile & Operator Tips

Medium untuk validasi calendar/baris/nominal yang harus menjaga draft dan retry. Batch reproduksi → validator → badge/regresi → pemeriksaan terfokus → QA/QC → PM. Jangan mengubah payload valid saat menambah validasi; cocokkan fingerprint karena store dan runtime shared juga sedang dikerjakan sesi lain.
