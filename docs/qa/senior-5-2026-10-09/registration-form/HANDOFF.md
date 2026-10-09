# SD5-008 — READY_FOR_QA

Software Developer Senior 5 / Codex-5 (`D:/Codex-5`), 9 Oktober 2026. Scope satu source `hooks/useRegistrationForm.ts`. Hash final `1ec99821cccb41a6d0c86372f083227445e7bbe1f44b30edefd0ab7c1ce4918c`. Kelanjutan instruksi pengguna; label developer, bukan tiket PM baru. Siap QA perilaku → QC kontrak → PM, belum persetujuan independen.

Default checkbox false dan dua effect sebelumnya dapat mengubah store yang sudah menerima ketentuan menjadi false saat mount. Perubahan store ke false tidak diteruskan ke form. Pemulihan data juga tidak mengisi password/confirm, dan pemilihan langkah dapat melewati prasyarat yang belum lengkap.

Kini setiap mount mengambil snapshot awal dari store, dengan URL sebagai fallback untuk seed null. Group data diperiksa memakai schema produksi dan mendapat default lengkap; password/confirm turut dipulihkan. Index awal0 ketika data personal atau persetujuan belum lengkap,1 ketika rekening belum lengkap, dan2 ketika personal/persetujuan/rekening lengkap. Password tetap dapat ditinjau di langkah2; tidak ada tahap sukses otomatis. Bank/password valid dapat dipulihkan meskipun prasyarat lebih awal belum lengkap, tanpa melewati prasyarat tersebut. Payload store invalid tidak diam-diam diganti payload URL valid.

**Store persetujuan adalah acuan.** `tnc:true` di URL atau seed personal tidak otomatis memberi persetujuan. Field personal lain yang valid tetap dipulihkan; persetujuan false menjaga index awal0. Store accepted true dapat memulihkan field personal valid walaupun flag tnc dalam seed lama false. Ini koreksi perilaku yang disengaja: checklist dan kelayakan langkah awal memakai persetujuan aktual yang sama.

Perubahan persetujuan store masuk ke form untuk true dan false. Subscription RHF pada field tnc menyelaraskan perubahan form/reset eksplisit ke store; pemeriksaan nilai terkini mencegah echo berulang. Cleanup menonaktifkan callback dan unsubscribe sehingga form lama tidak mengubah persetujuan bersama. Dua instance dan StrictMode diuji. Render `watch` di hook dan mount-effect prefill dihapus tanpa suppression.

Snapshot seed hanya untuk mount baru. Perubahan URL/store seed selama mounted tidak menimpa draft/index yang sedang dikerjakan. Persetujuan tetap live, tanpa mereset field rekening/password. `resetRegistration` menurunkan persetujuan tetapi tidak mengosongkan input mounted secara otomatis. **Ini pemulihan seed yang sudah tersedia, bukan autosave baru atau penyimpanan draft ke disk.** Public return/form schemas/store API/caller JSX/route/HTTP tidak diubah.

## Verifikasi

- Snapshot baseline `30302ead774fa521c2a4c413d1d47a4958e9c5b87591331cbd9c6828817a8c70`: **24 lulus/36 gagal dari60**, runtime/React/act/unhandled0.
- Hash final: **60/60 lulus**, runtime/React/act/unhandled0. Kasus empty/valid/invalid/malformed seeds, prioritas store/URL, persetujuan saat mount dan hidup, checkbox href, schema validation, password/rekening defaults, prasyarat tahap, seed berubah/rerender/remount, reset eksplisit, dua instance, StrictMode dan unmount tercakup.
- ESLint baseline0error/8warning → final0error/0warning, suppression0. Biome/diff-check satu source exit0. Biome intermediate meminta satu import reorder dan satu line-wrap; safe formatting terbatas pada hook, lalu60 pemeriksaan dan quality diulang pada hash final. Tidak dijumlahkan sebagai120 tes.
- TypeScript root hook dan Wizard consumer beserta imported source/declaration closure: diagnostic0. Source yang dibaca cocok disk selama check. Bukan pemeriksaan TypeScript seluruh proyek.
- `verification.json`/`scope-proof.json` mengikat hash public return API, resolver/mode,15 read-only contract, runtime library, source yang benar-benar dieksekusi, dan artifact.33 artifact paket registration-start/OTP tetap byte-identical.

Runner memakai hook/store/schema/parameter parser/Form/Controller/FormCheckbox/input/RHF/Zod produksi dengan parent fixture. Native controls, Text/icons/SingleSelect presentation dan router diganti adapter. `Setuju` direpresentasikan dengan setter store yang dipakai Terms screen; screen Terms dan tiga halaman Wizard tidak dirender oleh runner. Tidak ada API/storage/network/backend/dummy data aplikasi atau dependency baru. Fixture memakai email `.test`.

## Gate paket sebelumnya dan QA/QC

Hook merupakan dependency Wizard/read-only contract SD5-006. Hash hook lama pada packet SD5-006 adalah histori; **review gabungan saat ini perlu mencakup SD5-008**.96 assertion registration-start menguji caller sheet dengan fixture parent, bukan keseluruhan Wizard menggunakan hook ini. Packet SD5-006 tidak ditimpa dan belum mendapat keputusan QC. OTP SD5-007 tidak memakai hook ini pada source aktif; packet105 dan source OTP tidak diubah/diulang tanpa alasan. Developer tidak menyatakan approval paket lama otomatis berlaku pada kombinasi baru.

Reviewer harus salin `check.cjs`, `typecheck.cjs` dan folder `before` ke folder reviewer baru sebelum replay, karena output disimpan di direktori runner. Jalankan dari root aplikasi; baseline sengaja exit1. Alat React/react-test-renderer19.2.3 default `.expo/senior7-test-tools/node_modules`, alternatif lewat `RAPIDO_TEST_TOOLS`.

```powershell
node docs/qa/<folder-reviewer>/check.cjs --baseline
node docs/qa/<folder-reviewer>/check.cjs
node docs/qa/<folder-reviewer>/typecheck.cjs
node node_modules/eslint/bin/eslint.js hooks/useRegistrationForm.ts
node node_modules/@biomejs/biome/bin/biome check hooks/useRegistrationForm.ts
```

QA perlu memeriksa Wizard aktual saat membuka ketentuan/kembali, menerima dan mencabut centang, kembali ke seed yang valid/invalid, remount, input rekening/password, serta keyboard/scroll pada web/Android. Tidak ada sertifikasi browser/native/full navigation/Figma parity dari fixture ini. Metadata Figma halaman berhasil diakses; tidak menerapkan frame UI. Terms screen saat ini memiliki loader content yang belum diimplementasikan; isi ketentuan tetap scope terpisah. Persetujuan field yang sinkron bukan bukti isi ketentuan sudah tampil.

**Verifikasi OTP server dan pendaftaran akhir belum diimplementasikan**, termasuk placeholder final Wizard; pemulihan langkah bukan bukti OTP/account berhasil. Kontrak backend memerlukan pekerjaan terpisah. Tidak mengubah server/Metro/HP/backend/dependency/Git index/commit/push; PM pemilik gate publikasi.

Execution Profile & Operator Tips: High untuk konsistensi RHF/Zustand dan tahap awal. Hash → replay di folder reviewer → QA Wizard aktual → QC → PM. Bedakan snapshot seed dari persetujuan live/autosave; jangan menggunakan kelengkapan field sebagai bukti verifikasi server. Pertahankan paket historis dan source pemilik lain.
