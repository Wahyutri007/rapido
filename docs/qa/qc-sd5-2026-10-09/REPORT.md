# QC SD5-001 — onboarding dan transisi mode

9 Oktober 2026, Asia/Jakarta. **QC-SD5-20261009-PASS-DELTA / PASS_DELTA_FOR_PM_REVIEW.** Tidak ditemukan temuan baru pada delta dua source yang diperiksa. Sinyal keputusan untuk PM melalui workspace; penerimaan percakapan langsung tidak diklaim.

## Snapshot dan hasil

Base lokal `acba0d92460c1af3149abc3775f09888a2943cab`. Ini snapshot working tree SD5-001, berbeda dari branch SDK57 yang sudah dipublikasikan.

| Source | SHA-256 final |
| --- | --- |
| `app/(onboarding)/onboarding.tsx` | `9994c474d290e1c6ad5e6e380030c1e77183dd7106f352a826f3c23c300df779` |
| `components/custom/LayoutTransitionSplash.tsx` | `ab6a8a6dc4c4a87afe34b39e3dbf55feee481956f7bddaac7ea5629e3d80e759` |

Manifest Senior5, source/harness/bukti developer dicocokkan sebelum rerun. Fingerprint stabil sebelum/sesudah (`snapshot.json`). Diff onboarding hanya mengganti inisialisasi Animated.Value menjadi lazy state; overlay menambahkan identitas sesi/callback stabil dan menjaga penyelesaian sesi lama. Store mode, route dan JSX onboarding tidak diubah.

- **61 assertion developer diulang QC** ke output terpisah: semuanya lolos, runtime/act error 0. Mencakup loading/CTA/scroll/container, persist flag fixture/tujuan login-register, remount, empat tujuan mode, timer, restart outro dan callback terlambat. Ini rerun harness yang direview, bukan 61 skenario baru atau uji native.
- **20 assertion integrasi tambahan QC** lolos: LayoutTransitionSplash, SplashScreenView, appModeStore, Zustand React binding serta persist middleware produksi dijalankan bersama dalam React StrictMode. Adapter hanya pada native/Reanimated/worklet/bridge/timer/router/storage. Callback worklet lama ditahan dalam antrean JavaScript sampai outro transisi berikutnya selesai; callback lama tidak menutup overlay baru, dan callback saat ini menutupnya. Rerender tidak memulai ulang outro; middleware menyimpan hanya mode dan guard mode sama tetap bekerja. Runtime/act error 0; source/dependency integrasi stabil.
- Total final **81 assertion lolos**, dengan batas dua jenis bukti di atas. ESLint dua file **0 error/0 warning**, Biome check dan `git diff --check` bersih. TypeScript terfokus developer dibaca sebagai bukti developer; QC tidak menggandakan typecheck global PM.

Percobaan awal integrasi tambahan berhenti pada setup hydration: source store dimuat dalam VM sehingga Promise storage berbeda realm dari pemeriksaan `instanceof Promise` milik middleware. Loader QC diperbaiki agar source memakai realm yang sama; source aplikasi tidak diubah. Hasil 20 assertion adalah rerun final setelah koreksi setup, bukan klaim percobaan awal lulus.

## Kontrak dan batas

Source pemanggil root `app/_layout.tsx`, AppModeButton, store, Paginator, transformer onboarding dan SplashScreenView dibaca. Overlay tetap berada pada root layout; callback identitas baru melewati SplashScreenView produksi dan runOnJS adapter. Tujuan empat mode serta waktu store masuk 300ms + hold 800ms tetap. Durasi outro 320ms berasal dari SplashScreenView; adapter menguji penjadwalan dan antrean callback, bukan frame animasi native.

Onboarding mempertahankan objek Animated.Value pada rerender dan memberi objek baru setelah remount. Tujuan login/register dan flag completion tidak berubah. Rerun onboarding masih memakai query/transformer/Paginator/FlatList/native/storage adapter; review source dependency tidak dianggap pengujian visual atau API sebenarnya.

Persetujuan dibatasi pada delta lifecycle dua hash. Belum disertifikasi: animasi Reanimated/native sebenarnya, browser/HP, rotasi/scroll gesture, data onboarding jaringan, SecureStore nyata, izin/guard auth seluruh aplikasi dan Figma. Tool Figma tidak tersedia saat pemeriksaan QC. Gaya lama SplashScreenView/raw colors/font dan screen di luar diff tidak direfaktor atau disetujui sebagai desain baru. Penulisan flag onboarding existing tidak ditunggu sebelum navigasi; pemulihan kegagalan storage tidak diuji atau diubah pada delta ini.

Boot `app/index.tsx` SD5-002 masih scope developer tersendiri dan tidak termasuk keputusan ini. SDK57 historis/branch publikasi serta hasil startup milik QC lain tidak diklaim rerun atau digabung menjadi approval seluruh proyek. PM dapat menilai publikasi dua hash setelah gate snapshot integrasi akhir. QC tidak mengedit source/dependency/harness developer, menjalankan server/HP, commit atau push.

## Bukti dan reproduksi

```powershell
# Dari root aplikasi
node docs/qa/qc-sd5-2026-10-09/rerun.cjs
node docs/qa/qc-sd5-2026-10-09/transition-integration.cjs
```

Hasil: `lifecycle-results.json`, `transition-results.json`, `snapshot.json`, `eslint.json` dan `DECISION.json`. `finalize.cjs` mencocokkan gate/fingerprint sebelum menulis keputusan. Bukti developer asli tetap utuh.
