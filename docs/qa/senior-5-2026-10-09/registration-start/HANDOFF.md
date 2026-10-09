# SD5-006 — pengiriman awal pendaftaran

Software Developer Senior 5 / Codex-5 (`D:/Codex-5`), 9 Oktober 2026. **READY_FOR_QA**, belum approval independen/publikasi. Laporan lewat dokumen workspace untuk QA/QC/PM, tanpa klaim penerimaan chat langsung.

Dua ketukan Kirim sebelumnya mengirim dua POST `/register/start` dan membuka OTP dua kali. Error429 kehilangan pesan batas percobaan, sedangkan payload error422 yang malformed melempar dari callback pemetaan. Respons lama setelah Perbaiki/backdrop/close/unmount masih menutup sesi dialog baru, mengubah OTP store dan menavigasi. Data personal info juga diambil ulang dari form setelah respons, sehingga dapat berbeda dari payload yang dikirim.

Perubahan hanya [api/hooks/registration.ts](../../../../api/hooks/registration.ts) dan [PersonalInfoAction.tsx](../../../../components/feature/register/wizard/PersonalInfoAction.tsx). Hook menahan panggilan berulang lewat lock sinkron, menyediakan loading hingga request selesai, menulis error hanya selama mounted dan menangkap rejection. Error429 mempertahankan cooldown angka positif/finite atau pesan fallback. Error422 divalidasi sebagai object array pesan sebelum memakai mapper existing; malformed/empty memakai pesan umum. Pesan valid422 tetap digabung pada field asal.

Caller membuat child baru untuk setiap pembukaan sheet. Tombol Kirim disabled selama loading; Perbaiki/backdrop tetap dapat menutup. Close menandai sesi tidak aktif langsung, unmount menahan kelanjutan lama; hasil kosong dari call yang diblokir tidak menutup sheet atau menuju OTP. Hasil aktif menyimpan snapshot payload yang benar-benar dikirim, menutup sekali dan membuka route OTP existing sekali. Form/draft parent tetap hidup ketika sheet ditutup. Text caller diselaraskan ke size semantic/foreground dan ButtonText mengikuti variant; hierarchy/padding/dimensi/copy sheet tetap.

## Hasil developer

| Pemeriksaan | Baseline | Final |
| --- | --- | --- |
| Integrasi registration/Form/request/sheet/OTP state | 61 lulus / 35 gagal | **96/96 lulus** |
| Rejected Promise dari aksi UI yang dicatat harness | 2 | **0** |
| Runtime/React/act error | 0 | **0** |
| Unhandled rejection setelah harness memasang handler observasi aksi | 0 | **0** |
| ESLint dua source | 0 error / 1 warning | **0 error / 0 warning** |
| Biome dan diff-check scope | — | **exit 0** |
| TypeScript hook/sheet/Wizard consumer + imported closure | — | **0 diagnostic** |

Bukti [baseline](baseline-results.json), [final](final-results.json), [tipe](typecheck-results.json), [quality](quality-results.json) dan [manifest](verification.json). Angka assertion bukan progres proyek atau kelulusan QC baru. Baseline35 kegagalan adalah gejala yang tumpang tindih, bukan35 defect independen.

Pengujian menjalankan caller/hook/factory/usePostRequest/Common/error mapper/shared Form/schema/OTP store produksi, RHF/Controller/useWatch dan resolver Zod, QueryClient/Axios library aktual. Fixture form membungkus sheet produksi; **bukan WizardScreen penuh atau OTP screen**. Primitives/RN/presentation/router menggunakan host adapter; Axios transport memori. Payload dan respons memakai data fixture `.test`, tanpa pengguna/API/storage nyata. QueryClient fixture retryfalse/staleInfinity/gcInfinity.

Cakupan: success dan tuple/OTP payload/route, double press sebelum render/loading,429 valid/hilang/string/negatif,500,422 valid/malformed/empty, FormMessage, draft dan retry berhasil, Perbaiki/backdrop/external close/parent unmount, respons sukses terlambat, stale error setelah reopen, draft berubah saat request, StrictMode subtree, closed/open. Promise aksi diberi handler observasi segera agar baseline malformed error tidak menghentikan seluruh runner; rejection dicatat dan gagal assertion, tidak dihitung sebagai keberhasilan.

Preparasi awal harness memakai JSX classic dan selector yang mengasumsikan field ID/tombol masih terlihat sesudah stale close. Ini kekurangan adapter/observasi, bukan defect JSX produksi; runner final memakai automatic JSX runtime, placeholder selector dan observasi tombol opsional. Reproduksi pertama juga berhenti pada exception mapper produksi422 sebelum handler observasi aksi ditambahkan. Catatan [harness-notes.json](harness-notes.json) membedakan abort preparasi dan baseline/final lengkap.

## Batas dan permintaan QA/QC

Endpoint, method/name factory, DTO/schema/form, payload, mapper shared, OTP state setters serta route tetap existing. [scope-proof.json](scope-proof.json) mengikat konfigurasi endpoint/caller dan read-only contracts ke source aktual. Hook/kunci submission per instance; menutup/reopen dapat memulai request baru sementara POST lama tetap berjalan pada backend. Tidak ada cancellation jaringan/global dedup, verifikasi OTP atau implementasi pendaftaran akhir. Pengiriman yang berhasil dan side effect sebelum cleanup tidak dibatalkan.

Layout sheet masih menggunakan primitives aktual saat aplikasi berjalan; fixture tidak membuktikan animasi exit sheet setelah conditional unmount. QA perlu memeriksa close/backdrop/reopen/loading, error dan retry pada web/Android, form masih bisa diisi/scroll, serta respons pending ketika meninggalkan wizard. QC perlu cocokkan hash, replay ke output sendiri dan memeriksa payload/OTP state/429/422/null result/lifetime serta token UI. Tidak sertifikasi browser/native/SSR/keyboard/viewport/Figma parity/full auth/backend/full app pada batch ini. Akses top-level Figma berhasil, tanpa pembacaan frame/claim parity.

QC Guard151PASS telah diakui pada handoff induk; provider SD5-005 tetap menunggu recheck independen pada saat mulai batch ini. Paket developer/QC auth sebelumnya tidak diubah. Source provider/guard dan pemilik lain tidak diambil. PM tetap pemilik integrasi/publikasi; tidak commit/push/branch/index/dependency/Metro/server/HP/backend/dummy mode baru.

Perintah dari root aplikasi (baseline sengaja exit1):

```powershell
node docs/qa/senior-5-2026-10-09/registration-start/check.cjs --baseline
node docs/qa/senior-5-2026-10-09/registration-start/check.cjs
node docs/qa/senior-5-2026-10-09/registration-start/typecheck.cjs
node node_modules/eslint/bin/eslint.js api/hooks/registration.ts components/feature/register/wizard/PersonalInfoAction.tsx
node node_modules/@biomejs/biome/bin/biome check api/hooks/registration.ts components/feature/register/wizard/PersonalInfoAction.tsx
```

React/react-test-renderer19.2.3 sudah tersedia di `.expo/senior7-test-tools/node_modules`; `RAPIDO_TEST_TOOLS` bisa memilih lokasi terisolasi lain. Tidak menambah dependency aplikasi.

Execution Profile & Operator Tips: High untuk request/error dan sheet close/reopen. Hash -> QA perilaku -> QC kontrak/fixture/source -> PM. Cocokkan dua source dan kontrak, simpan replays reviewer terpisah; verifikasi OTP/pendaftaran akhir serta perangkat tetap scope/gate tersendiri.
