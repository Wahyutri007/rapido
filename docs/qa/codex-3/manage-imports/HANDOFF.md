# QC-MANAGE-FORMS-001 — READY_FOR_QC_RECHECK

**Codex-3**, 9 Oktober 2026. P3 urutan import pada tujuh source Kelola sudah diperbaiki sesuai [patch QC](../../qc-manage-forms-2026-10-09/organize-imports.patch) dan [style-findings](../../qc-manage-forms-2026-10-09/style-findings.json). Source sebelumnya dicocokkan dengan tujuh hash original dan disalin ke `baseline/` sebelum apply. Source/hasil pemeriksa tidak diedit.

Tujuh file: route modify order-type/payment-method/tax serta komposisi ExtraModifyScreen, OrderTypeModifyScreen, PaymentMethodModifyScreen dan TaxModifyScreen. Perubahan hanya urutan deklarasi/binding import dan normalisasi LF sesuai formatter proyek. Tujuh hash final sama persis proposal QC. Tidak mengubah field, JSX, fungsi, schema, payload, routing atau primitive.

[results.json](results.json) mencatat body AST dan binding import ketujuh file tetap sama setelah normalisasi line ending; sepuluh source paket form lolos **ESLint 0 error/0 warning, Biome check exit 0, diff-check exit 0**. [verification.json](verification.json) memuat fingerprint source final, patch dan bukti. `check.cjs` menjalankan pemeriksaan read-only; `apply.cjs` hanya untuk source baseline yang hash-nya cocok, jangan dijalankan ulang pada final.

```powershell
node docs/qa/codex-3/manage-imports/check.cjs
```

Catatan apply: Git Windows pertama menulis CRLF, sehingga hash byte proposal/formatter/diff-check sempat gagal walaupun proposal sama setelah normalisasi LF. `apply-results.json` menyimpan kejadian itu. Biome menormalkan tujuh file ke LF dan hasil final mentah pada results.json kini cocok proposal. Kesetaraan body AST dibandingkan setelah normalisasi line ending agar whitespace JSX CRLF tidak dianggap perubahan fungsi. Tidak mengklaim percobaan pertama lolos.

QC melaporkan 92 pemeriksaan browser pada snapshot sebelum import fix: 54 regresi dan 38 perubahan parameter. Hasil tersebut tetap bukti pemeriksa pada hash lamanya, **bukan browser rerun pada hash final ini**. Browser/Metro tidak diulang untuk perubahan import murni; runtime cache HP sedang ditangani Senior7, konfigurasi tersebut bukan scope paket ini. Pratinjau Kelola tetap tanpa API/persistensi. QA/QC diminta recheck gaya/hash/AST final dan memutuskan penutupan P3; status developer belum CLOSED/APPROVED. PM tetap pemilik gate publikasi/integrasi.

Paket [handoff utama](../HANDOFF.md) dan manifest lama merupakan snapshot sebelum perubahan import; gunakan supplement ini untuk sepuluh hash final. Tidak mengambil server/HP, backend, dependency, source sesi lain atau melakukan commit/push/merge.

## Execution Profile & Operator Tips

Low untuk import-only: hash → patch QC → format LF → AST/lint/Biome → recheck QC. Pertahankan binding import dan isi fungsi; jangan mengklaim hasil browser lama dijalankan ulang setelah hash berubah.
