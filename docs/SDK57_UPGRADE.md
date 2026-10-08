# Migrasi Expo SDK 57

Upgrade dari SDK 53 mengikuti [panduan resmi Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/). Aplikasi tetap memakai konfigurasi backend yang ada.

| Paket | Versi |
| --- | --- |
| Expo | 57.0.27 |
| React Native | 0.86.3 |
| React / React DOM | 19.2.3 |
| Expo Router | 57.0.25 |
| Reanimated / Worklets | 4.5.1 / 0.10.1 |
| NativeWind / CSS interop | 4.2.3 / 0.2.7 |
| React Native Tab View | 4.3.3 |

Gunakan Node 22.13 atau lebih baru dan `npm ci`. `package-lock.json` merupakan lockfile tunggal; lockfile Bun untuk SDK 53 telah dihapus.

## Perubahan kompatibilitas

- Import navigation memakai entry point `expo-router/react-navigation`, `js-stack`, `js-tabs`, dan `js-top-tabs` sesuai migrasi Router. Dependency React Navigation langsung dilepas.
- `react-native-tab-view` dipasang langsung untuk entry point TopTabs; pager-view tetap mengikuti versi SDK 57.
- Konfigurasi Expo lama yang sudah dihapus dari schema SDK 57 dibersihkan. Izin HTTP Android tetap di plugin `expo-build-properties`.
- Shared values pada tombol, bottom tab, dan splash memakai `get()` / `set()` untuk [dukungan React Compiler](https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue/). `AnimatedPressable` didaftarkan pada NativeWind agar geometri tombol tetap diterapkan.
- Nama ikon AntDesign dan tipe warna/simbol mengikuti paket terbaru. Metadata `lastModified` unggahan opsional pada kontrak aplikasi agar aset lama tetap dapat ditampilkan.
- State animasi loading tidak dibaca melalui ref saat render. Timer penyelesaian registrasi dibatalkan ketika sheet ditutup.
- Kondisi password kosong pada registrasi tidak merender teks langsung di dalam `View`; log respons request yang dapat memuat token login dihapus.
- `npm run android`, `ios`, dan `web` dapat dijalankan dari PowerShell. `npm run start:usb` mengutamakan IPv4 agar server localhost dapat dijangkau melalui ADB reverse.
- Metro memakai `forceWriteFileSystem` untuk CSS NativeWind. Safelist Tailwind dicocokkan penuh dengan token warna solid; kelas transparansi yang tertulis di source tetap ditemukan melalui content scanning. CSS snapshot turun dari 1.857.183 menjadi 179.800 byte dan aturan native dari 22.716 menjadi 1.677, sehingga bundling dapat diselesaikan.

## Menjalankan Android lewat USB

Pasang Expo Go untuk SDK 57, sambungkan HP, dan izinkan USB debugging. Jalankan dari root aplikasi:

```sh
adb reverse tcp:8088 tcp:8088
adb reverse tcp:8001 tcp:8001
npm run start:usb
```

Backend lokal dan `.env.local` mengikuti petunjuk di [README](../README.md). Buka `exp://127.0.0.1:8088` pada Expo Go; ulangi ADB reverse setelah kabel disambungkan kembali.

## Verifikasi

Hasil pemeriksaan final dicatat di [catatan koordinasi](SESSION_COORDINATION.md). Perubahan SDK diuji pada snapshot terpisah. Setelah sesi lain menyelesaikan verifikasi, perubahan Inventory dan Penggajian juga dimasukkan ke snapshot. Hasil fitur ada pada [Income](previews/income/README.md), [Inventory](previews/inventory/README.md), dan [Penggajian](previews/payroll/README.md).

- Snapshot gabungan lolos TypeScript, pengecekan versi dependency, dan Expo Doctor **21/21**.
- Bundle development Android/Hermes berhasil HTTP 200: **5.170 module, 22.526.524 byte**. Ini merupakan bundling JavaScript, bukan build APK atau uji runtime perangkat.
- Lint 29 file Inventory/Penggajian bersih; konfigurasi Metro/Tailwind dan perbaikan kondisi registrasi tidak memiliki error lint.
- Expo Go 57.0.9 sudah dipasang. HP tidak terdeteksi saat verifikasi terakhir, sehingga pengujian runtime Android SDK57 belum selesai.

Expo ESLint terbaru menambahkan pemeriksaan React Compiler. Pemeriksaan lint seluruh source awal migrasi melaporkan 68 error dan 451 warning pada pola kode lama; setelah perbaikan, lint pada 25 file perubahan migrasi/navigation melaporkan 0 error dan 13 warning. Pemeriksaan seluruh proyek belum bersih dan tidak diklaim lolos.
