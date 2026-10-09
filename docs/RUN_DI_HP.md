# Menjalankan Rapido di HP Android melalui USB

Panduan workspace Windows ini, diperiksa pada 9 Oktober 2026 (Asia/Jakarta). Aplikasi berada di `C:\Users\Wahyu\Downloads\rapido-dev\rapido-dev`. Launcher menggunakan Expo Go, Metro port 8088 dan backend HTTP localhost sesuai `.env.local`.

Uji perangkat nyata: vivo 1918, Android 11, Expo Go 57.0.9. HP sudah membuka layar Karyawan. Node di komputer 22.13.1; dependency Expo proyek 57.0.27. Hasil verifikasi terperinci ada di [laporan QC run HP](qa/qc-hp-run-2026-10-09/REPORT.md).

## Langkah menjalankan

1. Di HP, aktifkan **Opsi pengembang** dan **USB debugging**. Jika Opsi pengembang belum tampil, aktifkan melalui Nomor build di informasi perangkat; letaknya mengikuti merek HP.
2. Sambungkan HP ke komputer memakai **kabel USB yang mendukung data**. Buka kunci HP dan pilih **Izinkan USB debugging** saat dialog komputer muncul.
3. Pastikan Expo Go yang cocok dengan SDK proyek terpasang. Di HP yang diuji sudah tersedia Expo Go 57.0.9. Untuk perangkat lain, gunakan [halaman resmi Expo Go](https://expo.dev/go) dan pilih SDK proyek, bukan development client yang belum dipasang.
4. Pastikan backend Rapido aktif pada port 8001. Backend di workspace ini berada di `C:\Users\Wahyu\Downloads\rapido-backend-dev\rapido-backend-dev`. **Bila backend belum berjalan**, buka terminal tersendiri dan jalankan:

   ```powershell
   cd "C:\Users\Wahyu\Downloads\rapido-backend-dev\rapido-backend-dev"
   php artisan serve --host=127.0.0.1 --port=8001
   ```

   Biarkan terminal backend terbuka. URL berikut harus mengembalikan status `online`:

   ```text
   http://127.0.0.1:8001/api/health
   ```

5. Buka **PowerShell** atau terminal VS Code untuk aplikasi:

   ```powershell
   cd "C:\Users\Wahyu\Downloads\rapido-dev\rapido-dev"
   ```

   Dependency sudah terpasang di komputer yang diuji. Untuk pemasangan pertama pada checkout baru, gunakan Node.js 22.13 atau lebih baru lalu `npm.cmd ci`.
6. Jalankan:

   ```powershell
   npm.cmd run start:hp
   ```

   Launcher mencari ADB, memeriksa HP/Expo Go/backend, memasang sambungan USB untuk Metro dan backend, lalu membuka Rapido di HP. Metro Rapido yang sudah aktif dipakai kembali setelah project dan SDK diverifikasi. Jika belum ada, launcher memulai Metro satu worker pada port 8088 dalam mode Expo Go/offline.
7. Tunggu bundle selesai dimuat. Untuk pengguna yang belum login, ikuti onboarding/login yang tampil. Pengguna dengan sesi tersimpan akan mengikuti navigasi aplikasi. Sambungan USB ini tidak memerlukan pemindaian QR atau akun Expo.
8. Biarkan kabel USB terpasang serta Metro dan backend tetap berjalan. **Setelah kabel dicabut lalu disambung ulang, ulangi `npm.cmd run start:hp`** untuk memasang kembali reverse USB.

`npm.cmd` dipakai supaya command dan penerusan argumen konsisten pada PowerShell Windows. `npm run start:hp` tanpa opsi tambahan juga bekerja pada komputer yang diuji.

## Pemeriksaan dan pemulihan

Periksa kesiapan tanpa membuka HP atau mengubah reverse:

```powershell
npm.cmd run start:hp -- --check
```

Jika beberapa HP/emulator terdeteksi, tentukan perangkat:

```powershell
npm.cmd run start:hp -- --device SERIAL_HP
```

| Pesan/kondisi | Langkah |
| --- | --- |
| HP belum siap | Periksa kabel data, buka kunci HP, aktifkan USB debugging dan izinkan komputer. |
| Unauthorized | Pilih Izinkan USB debugging di HP, lalu ulangi launcher. |
| Offline | Sambungkan kembali kabel dan ulangi launcher. |
| ADB belum ditemukan | Pasang [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools), atau isi `RAPIDO_ADB_PATH` dengan path lengkap executable. Launcher otomatis mencari Android SDK dan lokasi RapidoAndroidTools di LOCALAPPDATA. |
| Expo Go/SDK tidak sesuai | Pasang Expo Go yang cocok dengan SDK proyek dari halaman resmi. Launcher memakai URL `exp://`, bukan `exp+rapido://` development client. |
| Backend belum siap | Jalankan backend dan pastikan `/api/health` online. Periksa konfigurasi `.env.local` di bawah. |
| Port 8088 dipakai proyek/layanan lain | Gunakan server Rapido yang benar. Launcher memberi error tanpa menghentikan proses tersebut. |
| Terminal tidak mengenali `php` | Buka terminal Laragon; di komputer yang diuji PHP juga tersedia di `D:\laragon\bin\php\php-8.4.7-Win32-vs17-x64\php.exe`. |

Konfigurasi backend yang diuji:

```dotenv
EXPO_PUBLIC_BASE_URL=http://127.0.0.1:8001
EXPO_PUBLIC_API_URL=http://127.0.0.1:8001/api
```

Untuk lokasi ADB khusus:

```powershell
$env:RAPIDO_ADB_PATH = "C:\lokasi\platform-tools\adb.exe"
npm.cmd run start:hp
```

Perintah manual yang setara, jika Metro Rapido dan backend sudah aktif:

```powershell
$rapidoAdb = "$env:LOCALAPPDATA\RapidoAndroidTools\platform-tools\adb.exe"
& $rapidoAdb reverse tcp:8088 tcp:8088
& $rapidoAdb reverse tcp:8001 tcp:8001
& $rapidoAdb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8088" -p host.exp.exponent
```

Untuk launcher USB, localhost HP mencapai komputer melalui ADB reverse. Mode Wi-Fi/LAN memakai konfigurasi terpisah: URL Metro dan backend perlu IP komputer yang dapat dijangkau HP; launcher ini memeriksa backend localhost.

Panduan resmi: [Expo CLI](https://docs.expo.dev/more/expo-cli/) untuk Expo Go/localhost/offline dan [Android ADB](https://developer.android.com/tools/adb) untuk USB debugging serta reverse. Keberhasilan run HP tidak menyatakan seluruh fitur/persistensi/API aplikasi telah lulus QC.
