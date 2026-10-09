# SD3-012 SuccessModal — audit bukti proposal historis

**HISTORICAL_PROPOSAL_EVIDENCE_VALID_WITH_LIMITS**, review internal terdelegasi Codex-3, 9 Oktober 2026 (Asia/Jakarta). Source aplikasi sekarang byte-identik dengan proposal QC yang telah diuji. Bukti geometri proposal boleh dipakai sebagai dukungan historis yang jelas asalnya; bukti itu belum merupakan browser run baru atau approval QC atas aplikasi saat ini. **QC-SUCCESS-001 tetap OPEN menunggu actual-source final recheck**, dan publikasi tetap gate PM.

| Berkas / bukti | SHA-256 atau hasil |
| --- | --- |
| `components/common/SuccessModal.tsx` aktual | `7508ea6ee63ec84e991b8075812c49d8a345d2cb256f43d2f45d9a0e325df7f8` |
| QC `proposal/SuccessModal.tsx` | Hash yang sama; perbandingan byte penuh cocok |
| QC `DECISION.json` | `7a3551fdf6726c64f2076b6562c505cf35594da96c727fc8d8b718dbd12ca0f9` |
| QC `artifact-manifest.json` | `2bdbd0836b174333d5bc17095a7efc0ba71606c6cc302263a0578d7fba9231df` |
| Artefak dalam manifest QC | **139/139 fingerprint cocok** |
| Proposal orientasi / rotasi / scroll | **27 lolos / 0 gagal** |
| Proposal shared browser | **51 lolos / 0 gagal** |
| Proposal Stock, caller historis | **36 lolos / 0 gagal** |
| Proposal lifecycle tiga dialog | **156 lolos / 0 gagal** |
| Total historis QC proposal | **270 eksekusi lolos / 0 gagal**, cakupan beririsan |

Orientation/shared/lifecycle mencatat source hash proposal `7508ea6e...`. Orientation dan shared browser mencatat fixture yang sama `238021aeb4895d0bbcdcc2cbb84d1e43a58c2f8a71474a064e2f5660ad13edbe`, cocok arsip entry proposal. Entry mengimpor candidate yang diuji; dialog fixture hanya mengarahkan import SuccessModal ke candidate. Stock memakai kontrak caller historis dan tidak menjadi approval source Stock live. Arrays error/runtime/console/blocked yang tersedia, exceptions, receipt errors dan control fallbacks pada empat hasil final proposal seluruhnya bersih. Hasil awal 21 assertion orientasi tidak dijumlahkan lagi ke hasil final 27.

Semua **15 kontrak produksi selain SuccessModal** masih cocok dengan keputusan QC. Pada **40 tracked input QC**, 37 cocok dan tiga berbeda: SuccessModal berubah sengaja dari source reviewed `f90eec3d...` ke proposal `7508ea6e...`; generated Android cache berubah dari `056c153e...` ke `fd438ce4...`; generated web CSS berubah dari `e7992f81...` ke `eb53f069...`. Bukti arsip dengan CSS/fixtures QC tetap utuh, tetapi source equality belum memverifikasi geometri pada CSS atau runtime live yang berubah. Tidak mengedit atau mengembalikan cache milik sesi lain.

Attempt developer yang tersimpan pada `success-modal-height/baseline/results.json` adalah **baseline f90**, berlabel `CURRENT_PRODUCTION_SOURCE`: **0 checks, 0 bundle receipts**, timeout 180000 ms ketika menunggu `preview-ready`. Attempt ini inconclusive, bukan kegagalan assertion geometri dan bukan bukti browser final7508. Jangan mengubahnya menjadi PASS, menjumlahkannya ke 270, atau menyebutnya final-source visual run.

Keputusan QC historis masih **QC-SUCCESS-20261009-CHANGES-REQUESTED**, `approvedSourceHashes` kosong dan proposal `applied:false` pada waktu review. Metadata historis itu tetap benar untuk waktu capture dan tidak perlu ditimpa setelah developer menerapkan proposal. Source aktual baru tetap memerlukan recheck yang diminta QC, termasuk scroll/orientasi native bila hendak memberi klaim tersebut. QC-STOCK-UI-001 portrait sebelumnya CLOSED_BY_RECHECK pada sourcef90 merupakan keputusan terpisah; audit ini tidak mengubah penutupan lama maupun menutup QC-SUCCESS-001.

Detail: [audit.json](audit.json) dan [manifest internal](verification.json). Ini audit ringan hash/source/provenance, **0 assertion runtime baru**; tidak menjalankan browser/server/build/typechecking berat, Metro, HP, HTTP/backend atau mutasi source/Git. Figma callable tidak tersedia; tidak ada klaim parity/native/keyboard/font accessibility/full app/current Stock.

## Execution Profile & Operator Tips

Effort **Low** untuk bukti historis dan hash yang sudah lengkap. Urutan source byte/hash → manifest QC immutable → hitungan final suites → drift dependency/input → label bukti dan gate. Gunakan frasa “QC proposal historis27+51+36+156 pada hash identik”; pertahankan timeout baseline dan gate final recheck. Bila ingin mengulang audit, gunakan output review baru agar capture ini tetap histori.
