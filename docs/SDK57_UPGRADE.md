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
- Nilai awal dropdown Beranda berada pada root Select; ikon membuang flag navigation `focused`, dan label grafik web tanpa rotasi tidak mengirim origin SVG native. Perbaikan sumber warning ini mencegah panel error development menutupi CTA.
- `npm run android`, `ios`, dan `web` dapat dijalankan dari PowerShell. `npm run start:usb` mengutamakan IPv4 agar server localhost dapat dijangkau melalui ADB reverse.
- Metro memakai `forceWriteFileSystem` untuk CSS NativeWind. Safelist Tailwind dicocokkan penuh dengan token warna solid; kelas transparansi yang tertulis di source tetap ditemukan melalui content scanning. CSS snapshot turun dari 1.857.183 menjadi 179.800 byte dan aturan native dari 22.716 menjadi 1.677, sehingga bundling dapat diselesaikan.
- Cache Metro pada Windows membatasi operasi baca/tulis bersamaan menjadi 64. Ini mengatasi `EMFILE` ketika halaman SSR dimuat ulang dan bundle Android dibangun. Regresi antrean, propagasi error, dan delegasi clear dapat diperiksa dengan `node scripts/verify-metro-cache.cjs`.

## Menjalankan Android lewat USB

Pasang Expo Go untuk SDK 57, sambungkan HP, dan izinkan USB debugging. Jalankan dari root aplikasi:

```sh
adb reverse tcp:8088 tcp:8088
adb reverse tcp:8001 tcp:8001
npm run start:usb
```

Backend lokal dan `.env.local` mengikuti petunjuk di [README](../README.md). Buka `exp://127.0.0.1:8088` pada Expo Go; ulangi ADB reverse setelah kabel disambungkan kembali.

## Verifikasi

Hasil pemeriksaan final dicatat di [bukti integrasi](qa/sdk57-integration/README.md) dan [catatan koordinasi](SESSION_COORDINATION.md). Snapshot terpisah mencakup Income, Inventory, Pemasok, Penggajian, navigasi Member, serta perbaikan Reanimated Tempat/scroll. Hasil fitur ada pada [Income](previews/income/README.md), [Inventory](previews/inventory/README.md), [Pemasok](previews/inventory/suppliers/README.md), dan [Penggajian](previews/payroll/README.md).

- Snapshot gabungan lolos TypeScript, pengecekan versi dependency, dan Expo Doctor **21/21**.
- Bundle development Android/Hermes berhasil HTTP 200: **5.181 module, 22.598.806 byte**. Ini merupakan bundling JavaScript, bukan build APK atau uji runtime perangkat.
- Lint 29 file Inventory/Penggajian bersih; konfigurasi Metro/Tailwind dan perbaikan kondisi registrasi tidak memiliki error lint.
- Login menggunakan backend lokal nyata serta form registrasi lolos klik/fokus, mengetik, scroll, dan validasi pada viewport 390 dan 1280 piksel; tidak ada runtime exception.
- Delapan belas pemeriksaan navigator utama mencakup Income, Expense, Member, Penggajian, Pembelian, dan Pemasok: tautan, geometri tombol header, input, validasi, serta reload Member. Tidak ada error runtime atau console pada rangkaian pemeriksaan yang selesai.
- Regresi cache Windows lolos 3.000 pembacaan dan 200 penulisan, maksimum 64 operasi bersamaan, pemulihan antrean setelah penolakan, serta delegasi clear.
- Expo Go 57.0.9 sudah dipasang. HP tidak terdeteksi saat verifikasi terakhir, sehingga pengujian runtime Android SDK57 belum selesai.

Expo ESLint terbaru menambahkan pemeriksaan React Compiler. Pemeriksaan lint seluruh source awal migrasi melaporkan 68 error dan 451 warning pada pola kode lama; setelah perbaikan, lint pada 25 file perubahan migrasi/navigation melaporkan 0 error dan 13 warning. Pemeriksaan seluruh proyek belum bersih dan tidak diklaim lolos.

## Publikasi dan batas integrasi

Hasil gabungan disiapkan pada branch `integration/expo-sdk57` untuk review. Integrasi ke remote `main` mengikuti [keputusan Projek Manager](PROJECT_MANAGER_REVIEW.md): audit terakhir masih mencatat 46 error lint pada 30 file kode lama. Perbaikan backlog yang sedang dikerjakan sesi lain belum dimasukkan sampai hasil dan scope-nya siap.

Konfigurasi backend nyata dipertahankan. State pratinjau yang sudah digunakan fitur Inventory/Pemasok/Penggajian tetap mengikuti batas pada dokumen masing-masing; API dan persistensi fitur tersebut belum diklaim selesai. Pengujian ini tidak merupakan persetujuan QA/QC independen atau kesamaan penuh dengan Figma.
