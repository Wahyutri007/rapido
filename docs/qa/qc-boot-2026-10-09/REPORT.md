# QC SD5-002 — Boot — 9 Oktober 2026

**PASS-DELTA** untuk logika boot satu hash `app/index.tsx`. Sinyal **QC-BOOT-20261009-PASS-DELTA** tersedia untuk Senior5/QA/PM melalui workspace; publikasi Git tetap keputusan PM. Tidak ada temuan baru pada delta yang diuji.

## Bukti dan hasil

| Pemeriksaan | Lolos | Gagal |
| --- | ---: | ---: |
| Replay harness developer, output QC sendiri | 64 | 0 |
| Tambahan QC dengan SplashScreenView produksi | 41 | 0 |
| Gabungan eksekusi assertion, termasuk cakupan berulang | 105 | 0 |

Runtime/React/act error pada dua hasil final: **0**. ESLint source: **0 error/0 warning**; Biome dan scoped diff-check exit **0**. Returned JSX sama dengan baseline sesudah menormalkan prop key yang sengaja ditambahkan. Tipe terfokus developer **0 diagnostic**, bukti/fingerprint direview; QC tidak menjalankan ulang TypeScript global atau terfokus.

14 fingerprint handoff source/kontrak/artefak cocok sebelum tes. Snapshot26 berkas dibuat sebelum replay; seluruh26 dan hash modul yang benar-benar dimuat masih cocok saat quality serta finalisasi. Source yang disetujui: `c06de0d4822c97e4eaa18733ef0632fc707ff2fb5bb244ee28160b43adfe7b5c`. Salinan byte source tersedia di [index.reviewed.tsx.txt](index.reviewed.tsx.txt).

## Perilaku yang diverifikasi

Replay menguji minimum850ms, token kosong/valid/expired, kegagalan baca storage/validasi pengguna, tujuan onboarding/start/maintenance, readiness yang dibatalkan, sign-out, dan10 kombinasi role/mode/toko. Boot mengikuti provider tanpa memulai reloadAuth kedua. Jumlah request ini berlaku pada fixture; bukan klaim retry/deduplikasi jaringan aktual.

Tambahan QC memasang komponen SplashScreenView produksi. Callback withTiming produksi dengan finished=false tidak menavigasi. Callback berhasil/berulang memakai keputusan terbaru dan menavigasi sekali per instance. Rerender saat outro tidak memulai animasi kedua. Pending health membuat instance splash baru; dalam adapter instance itu mulai dengan opacity1. Callback lama tetap ditolak selama pending, setelah pulih, dua siklus pemulihan, dan remount/unmount Boot. Sign-out serta perubahan mode/toko/role/team ketika outro berlangsung memakai navigator terbaru. Timer minimum dibersihkan ketika ditinggalkan.

Setup fixture AuthProvider/query/storage/router developer diaudit dan dipakai ulang; 41 pemeriksaan tambahan ditulis QC untuk menghubungkan outro produksi dengan boot. StrictMode dipasang pada Boot/Splash, sementara provider berada di luar subtree StrictMode. Native Reanimated diadaptasi untuk mengendalikan callback; nilai opacity pada adapter tidak membuktikan frame visual perangkat. Delapan modul produksi dimuat dan diikat hash:

- `constants/Keys.ts`
- `context/AuthContext.tsx`
- `hooks/useNavigateAuthenticated.ts`
- `hooks/useProtectedRoute.ts`
- `constants/Fonts.ts`
- `lib/haptics.ts`
- `components/custom/SplashScreenView.tsx`
- `app/index.tsx`

Handoff dan batasnya ada di [HANDOFF developer](../senior-5-2026-10-09/boot/HANDOFF.md). Hasil akhir ada di [replay](final-results.json), [tambahan QC](independent-results.json), dan [quality](quality-results.json).

## Batas keputusan dan pekerjaan berikutnya

Persetujuan hanya delta logika boot pada hash di atas. Tidak meluluskan seluruh auth/provider/guard/routing/aplikasi, login SD5-003, API/storage nyata, browser/Android/iOS, animasi worklet/frame/haptic native, SSR, atau parity Figma. Guard produksi memakai segmen index dalam fixture. Onboarding storage diperiksa ulang saat boot render; subscription kosong bukan pemantauan storage native realtime. Dokumen navigasi boot saat ini konsisten dengan source; tidak ada route yang ditambah atau dipindah oleh QC.

QA/PM dapat melanjutkan gate integrasi dengan pemeriksaan visual browser/Android yang relevan. Penerimaan tetap CHANGES_REQUESTED dengan tiga temuan OPEN. Login SD5-003 yang baru READY_FOR_QA serta koreksi shared SuccessModal SD3-007 memerlukan review terpisah. Tidak menutup temuan paket lain melalui kelulusan boot ini.

Source aplikasi/dependency/backend dan harness/bukti developer tidak diedit. Tidak HTTP/DB/persistensi nyata, operasi Metro/server/HP, Git branch/index/commit/push, atau perubahan PDF progres historis. Sinyal disampaikan melalui dokumen; tidak mengklaim chat lain telah menerima langsung.

Adapter Reanimated QC pertama gagal mount karena export interop belum ditandai __esModule. Bukti awal dipertahankan; adapter diperbaiki dan suite terkait diulang. Ini kesalahan harness, dikeluarkan dari hitungan aplikasi; lihat [harness-notes.json](harness-notes.json).

Paket ini dibekukan sebagai bukti review. Jika source berubah, simpan runner dan hasil ulang pada folder baru; runner menulis hasil di folder yang dikonfigurasikan.

Execution Profile & Operator Tips: High. Hash terbaru -> reproduksi lifecycle -> callback outro produksi -> quality terfokus -> keputusan QC -> PM. Pisahkan logika callback dari frame native dan pertahankan hasil historis.
