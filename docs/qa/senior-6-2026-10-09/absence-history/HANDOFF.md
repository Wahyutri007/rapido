# SD6-005 — Riwayat Mode Absensi

**READY_FOR_QA**, 9 Oktober 2026. Sinyal workspace: `SD6-005-ABSENCE-HISTORY-READY-FOR-QA`. Software Developer Senior 6 → QA perilaku → QC UI/kontrak → PM. Source dilepas untuk review; belum penerimaan/approval independen atau publikasi.

Menu Riwayat pada home sebelumnya hanya alert Segera Hadir. Sekarang membuka `/(absence)/history`, menampilkan daftar per tanggal, pencarian, filter status/toko, reset, dan `/(absence)/history/detail?id=<id>`. Detail memperbarui nilai dari sumber hidup, menangani ID hilang/kosong/array, dan kembali ke daftar dalam mode Absensi. Header nested layout memakai anchor index, fallback home/list dan pointer events sesuai fokus. Data tidak diubah.

Tujuh source baru: `lib/absence-history.ts`, tiga komponen `components/feature/absence/history/`, tiga rute `app/(absence)/history/`. Dua file bersama hanya menambah import/helper pada handler Riwayat dan satu child headerShown:false: `app/(absence)/home.tsx` dan `_layout.tsx`. Audit inverse-delta terhadap snapshot sebelum edit, setelah normalisasi EOL, lulus. Empat kontrak baca store/helper/type/status Absensi Kelola tetap hash awal. Shared primitive, form/camera/auth, Absensi Kelola, Payroll, Tempat Kasir dan source pemilik lain tidak diedit.

**Data contoh dan catatan sesi**, belum server/persistensi atau pemisahan per karyawan. UI menyatakan batas ini. Tanggal kalender valid yang sama dikelompokkan dan diurut terbaru; tanggal kosong/tidak valid tetap ditampilkan tanpa nilai buatan. Tidak menganggapnya riwayat pribadi, rekap semua karyawan, absensi terkirim, shift, keterlambatan atau durasi kerja. Jam tidak valid menampilkan Belum dicatat. Tidak ada seed/API/transport/mutation bisnis baru.

Verifikasi final pada hash di `verification.json`: **36 model + 25 browser + 4 quality = 65 kelompok PASS**, dihitung sekali. Model menjalankan helper produksi, handler home dan callback/header layout dengan fixture record serta adapter router/native. Browser memakai screen/SectionList/store/helper/status/primitive/provider/font produksi melalui RN Web dan navigator/params fixture. Source/harness fingerprint stabil, runtime/console/error transport eksternal0. Tampilan320×640/390×844/844×390: full kartu dan target minimal44px dapat dijangkau, nilai panjang terbungkus dan detail dapat digulir. Filter tetap saat kembali ke list yang masih mounted. Screenshot list/detail320 dan detail844 ditinjau.

ESLint seluruh9 source0warning/error; Biome7 source baru0; TypeScript5 route/home/layout roots +1297 file dependency/declaration closure0diagnostic; scoped diff0. Shared home tidak diformat ulang secara luas. Pemeriksaan awal menemukan tiga pemanggilan rute belum cocok dengan deklarasi router; dikoreksi melalui helper `route` existing, kemudian build/model/browser/quality pada source final diulang. Bukti awal tersimpan di `interim/initial-quality.json` dan `initial-typecheck.json`. Percobaan tambahan browser memilih label filter toko alih-alih row; locator runner dikoreksi tanpa perubahan aplikasi, hasil final25 dihitung sekali. Bukti kegagalan locator dan hasil browser awal tetap di `interim/`.

Build Metro API sekali jalan, satu worker, cache/entry/output sendiri di `.expo/senior6-absence-history-offline`; tidak membuka listener, require root Metro config, memanggil NativeWind Metro plugin atau restart server8088/8001/HP milik sesi lain. CSS dihasilkan ke folder bukti sendiri. `build-result.json` merekam hash config Metro/Babel/generated Android cache sebelum/sesudah yang identik. Tidak mengklaim source final termuat pada runtime HP yang sedang berjalan. Figma callable tidak tersedia pada toolset Senior6 dan frame tersimpan untuk flow ini tidak ditemukan; komposisi AGENTS_UI, belum parity Figma.

QA: cocokkan source manifest, uji dari home Riwayat pada aplikasi aktual, kembali/detail/deep link/ID hilang, live source, search/filter/reset, keyboard/scroll serta mode switching. QC: review batas pratinjau/tanggal/identitas, geometri/status, header/back/fokus dan scope source bersama. Native, full router/auth/SSR, aksesibilitas, keyboard, theme gelap, Figma, server/persistensi belum disertifikasi. Publikasi tetap gate PM.

Perintah baca saja dari root aplikasi:

```powershell
node docs/qa/senior-6-2026-10-09/absence-history/verify.cjs
```

Packet frozen sesudah seal; **jangan** menjalankan model/browser/quality/prepare atau `--seal` ulang di folder ini. Replay: salin packet ke folder reviewer `docs/qa/<reviewer-date>/absence-history/`, tetap depth yang sama untuk import UI entry. Sesuaikan output/cache/bundle pada salinan builder dan browser ke namespace `.expo/<reviewer>-absence-history-offline`. Jalankan model → build-offline → browser → quality pada salinan, gunakan web.css tersimpan; regenerasi stylesheet hanya bila source UI/style berubah. Semua laporan/screenshot ulang harus ke folder reviewer; jangan menimpa snapshot/manifest maupun bundle pembuktian developer.

Execution Profile & Operator Tips: Medium. Hash check → QA aplikasi aktual → QC → PM. Header hanya layout; pertahankan ID/tanggal sumber dan batas catatan sesi. Jangan mengambil perubahan owner lain, menjalankan globalTS, mengoperasikan server HP, instal dependency, atau stage/commit/push/merge untuk paket ini.
