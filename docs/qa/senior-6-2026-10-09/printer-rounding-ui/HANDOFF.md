# SD6-003 — UI Printer dan Pembulatan

9 Oktober 2026, Asia/Jakarta. Software Developer Senior 6. **READY_FOR_QA → QC → PM** melalui workspace. SD6-003 adalah kelanjutan developer dalam scope Printer/POS yang sudah ditugaskan; bukan keputusan QA/QC atau publikasi.

## Scope dan hasil

| Source aplikasi | SHA-256 final | Baseline SD6-001 |
| --- | --- | --- |
| `app/(no-layout)/manage/printer/modify.tsx` | `0174597063bea4d9604925c4d3e43c52160ec4c3a4ab1685c3338866578bf126` | `ac1d96ab9f562f507d23cb6407a2234848ea5c9ebd3d590c8178e9dd6a47957e` |
| `app/(no-layout)/manage/pos-settings/rounding.tsx` | `79893f4bd22b9d85cd42287d12dfadc9f9dac7df3c978312b69071dd8e191ba8` | `21bd675838cd5f2378271820ebb4c461c7ad2cf8387a24a9dd69f62eeb66e04f` |

Printer menggunakan Wrapper dengan content padding16/gap16 dan spacer CTA, Card default, BottomActionButton, serta Text semantic. Container ScrollView/padding manual, surface radius20px dan kelas zinc/gray/text-sm diganti standar bersama. Nama printer memakai flex agar metode koneksi tetap memiliki ruang. Form RHF, deteksi existing, key per ID, guard ID hilang, simulasi simpan dan feedback tetap.

Pembulatan menggunakan spacing grid4, border semantic, padding default Card, radius8 untuk opsi di dalam Card, dan tab tanpa padding inset sesuai AGENTS_UI bagian2.5. Jenis metode, exponent/default/prefill/draft, validasi dan mutation tetap. Delta hanya className; tidak mengubah struktur JSX, handler atau copy. `applyTo` tetap UI lokal tanpa field API.

Source aplikasi hanya dua file di atas. Batas Stok SD6-002 hash `0b61bef95fe023f1aa685560151c716c4c58faed9164509cd70546262878cc9d` dan paket50 artefaknya tetap cocok saat pemeriksaan lanjutan. Hook/DTO/API/backend, shared primitive, modal, layout/route, dependency serta source pemilik lain tidak diedit. Keputusan QC-SD6-001 lama berlaku untuk baseline; tidak otomatis mengesahkan hash UI baru ini.

## Bukti developer

- [Browser](browser-results.json): **47/47 PASS**, runtime/console error0, external HTTP0, fingerprint drift0. Menggunakan screen/RHF/React Query/Axios/NativeWind/primitive/modal/font produksi, dengan transport dan navigation/params fixture browser sendiri. 39 fingerprint source/assets/runner dicatat sebelum/sesudah; bukan seluruh dependency graph Metro.
- Viewport **320×640, 360×780, 390×844, 768×1024**: tidak overflow horizontal, CTA berada di layar dengan tinggi ≥44, nama/metode printer dan label metode pembulatan muat. Field kelipatan dapat dijangkau dengan scroll di atas CTA; dropdown, opsi dan Batal muat.
- Interaksi: metode/exponent yang diedit bertahan sesudah refetch; pilihan Tunai Saja tetap tidak menambah field payload; gagal simpan mempertahankan draft; mode nonaktif menyimpan nilai; exponent10 ditampilkan/dipilih/disimpan sebagai10. Simpan printer tetap melalui RHF/simulasi, create/edit/create menjaga modal, response simpan lama tidak membuka modal untuk ID baru, dan ID tidak valid memanggil alert/back tanpa Simpan.
- [Audit](token-audit.json): **Printer4 + Pembulatan13 = 17 occurrence → 0** pada kategori spacing pecahan, warna nonsemantic, padding override Card, typography Text dan radius arbitrary. Function statements sebelum return JSX dan atribut event identik; seluruh AST non-className Pembulatan identik. Printer sengaja mengubah container/CTA/props Text, sehingga bukan className-only delta.
- [Quality](quality-results.json): ESLint dua source **0 error/0 warning**, Biome exit0, scoped whitespace exit0, TypeScript dua root + imported/declaration closure **exit0/0 diagnostic**. Bukan full-project gate PM.
- [Manifest](verification.json): source, kontrak/asset, runner, hasil, baseline, screenshot dan interim terikat hash. `verify.cjs` default read-only, `--seal` menolak manifest existing.

Screenshot yang diperiksa: [Printer320](printer-main-320.png), [Pembulatan320](rounding-main-320.png), [dropdown320](rounding-picker-320.png), [exponent10](rounding-exponent10-320.png), [sukses Printer](printer-success-320.png), [sukses Pembulatan](rounding-success-320.png), [gagal simpan](rounding-error-320.png). Opsi bawah dapat di-scroll; screenshot bagian atas 320px tidak berarti seluruh Card muat sekaligus.

Shared SuccessModal F90 dan AlertModal76b6 berasal dari Codex-3; Senior6 hanya memakai/menguji caller ini. Hasil dua layar tidak meluluskan seluruh pemakai modal atau menutup QC-STOCK-UI-001. Native/Figma/full router/root auth/accessibility/keyboard dan API/persistensi/perangkat printer tetap gate terpisah. Figma callable tidak tersedia.

## Catatan runner dan reproduksi

Collector AST awal belum membuka ParenthesizedExpression pada return JSX; filter dibetulkan tanpa source aplikasi tambahan. Replay browser awal menyelesaikan40 pemeriksaan sebelum locator exponent10 gagal karena spasi currency Intl (`Rp 10...`); [interim](interim/) menyimpan hasil/screenshot. Locator menerima whitespace currency, dan47 pemeriksaan diulang pada source yang sama. Run40 tidak dijumlahkan menjadi PASS final atau ditandai sebagai regresi aplikasi. Warning RN-web existing tercatat; console error0.

Jalankan dari root aplikasi. Reviewer menyalin runner/baseline ke folder outputnya sendiri supaya evidence frozen tidak tertimpa; sesuaikan entry/fingerprint path bila dipindah.

```powershell
node docs/qa/senior-6-2026-10-09/printer-rounding-ui/audit.cjs
Copy-Item docs/qa/senior-6-2026-10-09/printer-rounding-ui/scoped-tsconfig.json .expo/senior6-printer-pos-tsconfig.json
node docs/qa/senior-6-2026-10-09/printer-rounding-ui/quality.cjs
Copy-Item docs/qa/senior-6-2026-10-09/printer-rounding-ui/ui-entry.jsx .expo/senior6-printer-pos-ui-entry.jsx
# Hanya server Metro127.0.0.1:8088 yang sudah ada dan terkoordinasi; jangan start/restart server sesi lain.
node docs/qa/senior-6-2026-10-09/printer-rounding-ui/browser.cjs
node docs/qa/senior-6-2026-10-09/printer-rounding-ui/verify.cjs
```

QA: ulang interaksi/scroll/dropdown/CTA/modal pada hash final dan perangkat yang relevan. QC: review token, container/spacer dan batas simulasi/kontrak yang tetap; jangan memperluas approval unit Pembulatan lama menjadi sertifikasi API atau transaksi Tunai Saja. PM: gate integrasi/publikasi. Backend tetap ditangguhkan sesuai pengarahan fokus UI. Tidak menjalankan PHP/DB/API nyata pada batch ini.

Browser Senior6 selesai. Metro8088 existingPID9200 dipertahankan tanpa start/restart/stop; tidak HP/ADB, config/cache Android, branch/index/commit/push/merge atau menimpa paket SD6-001/SD6-002/QC lama.

Execution Profile & Operator Tips: Medium untuk layout/scroll layar kecil. Hash → QA interaksi → QC token/kontrak caller → PM. Pertahankan output historis dan server bersama; dua root quality, bukan full-project TS tambahan.
