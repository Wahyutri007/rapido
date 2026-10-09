# Senior 7 - error tema berulang saat startup HP

9 Oktober 2026, Asia/Jakarta. Permintaan pengguna: memperbaiki error saat aplikasi dibuka pada HP. Status: **READY_FOR_QA**, dua pembukaan ulang pada HP mencapai Beranda Back Office tanpa error merah tema; belum approval QA/QC independen.

## Penyebab dan perbaikan

UIAutomator pada vivo 1918 menunjukkan Render Error `Unable to manually set color scheme without using darkMode: class`. `tailwind.config.js` sudah memakai class dari perbaikan QC sebelumnya, tetapi `node_modules/react-native-css-interop/.cache/android.js` kembali kosong. Tanpa data gaya tersebut, NativeWind tidak mendapatkan flag darkMode dan setter tema melempar error.

Source CSS Interop 0.2.7 yang terpasang menulis string kosong ke semua file platform native setiap kali konfigurasi Metro dimuat. Pada workspace beberapa sesi, pemuatan konfigurasi untuk preview lain dapat mengosongkan cache yang sedang dipakai server Android. Initializer yang sama direproduksi di direktori sementara terisolasi dalam tes; bukan asumsi dari konfigurasi Tailwind saja.

`metro.config.js` kini membungkus inisialisasi NativeWind dengan `scripts/preserve-nativewind-cache.cjs`. Guard melewatkan hanya penulisan string kosong ke lima file cache native yang sudah berisi data selama inisialisasi sinkron. Berkas yang belum ada tetap dibuat, penulisan CSS baru tetap berjalan, dan writeFileSync asli selalu dipulihkan melalui finally. Ini workaround terbatas untuk initializer dependency terpasang, tanpa mengedit node_modules atau menangkap/mengabaikan exception tema di aplikasi.

Semua konfigurasi preview yang berbagi root ini harus memakai metro.config.js proyek agar guard berlaku. Konfigurasi lain yang memanggil withNativeWind langsung di luar konfigurasi proyek tidak dilindungi. Jika versi CSS Interop berubah, jalankan ulang reproduksi dan pertimbangkan menghapus workaround apabila initializer tidak lagi mengosongkan cache.

## Bukti

- [cache-results.json](cache-results.json): 10 pemeriksaan, termasuk initializer CSS Interop produksi, reproduksi truncation, guard lima platform, konfigurasi dikembalikan, missing file, penulisan baru/web, dan pemulihan fs pada kegagalan.
- `node scripts/verify-metro-cache.cjs`: regresi pembatas file Windows tetap lolos, 3.000 read dan 200 write, maksimal 64 bersamaan, queue pulih sesudah error.
- [multi-process-results.json](multi-process-results.json): proses Node kedua benar-benar memuat konfigurasi proyek saat Metro8088 berjalan; cache Android tetap 193.003 byte, SHA-256 tidak berubah, flag `class dark` tetap ada.
- ESLint empat source/config/test dan scoped diff-check lolos. Tidak menjalankan TypeScript global untuk perubahan konfigurasi CJS ini.
- [native-results.json](native-results.json): dua cold launch Expo Go pada vivo 1918 mencapai Beranda Back Office; screenshot lokal diperiksa secara visual. Bundle pertama 153570 ms/5192 modul, berikutnya 213 ms/1 modul. Log Metro baru tidak mencatat error tema atau entri ERROR. UIAutomator final gagal memperoleh idle state, sehingga kelulusan layar berasal dari pemeriksaan screenshot, bukan assertion UIAutomator yang berhasil. Warning InteractionManager dan route lama masih muncul, tidak menghalangi startup yang diuji.
- [second-config-results.json](second-config-results.json): pemuatan konfigurasi dari proses kedua diulangi sesudah bundle pertama dan tetap mempertahankan cache serta flag tema; pembukaan kedua tetap berhasil.

## Runtime dan batas

Metro8088 lama PID28952 diganti PID9200, satu worker dengan clear/rebuild untuk memulihkan bundle yang terlanjur kosong. Log `.expo/senior7-startup/metro.{out,err}.log`. Backend8001 PID24116 dan Metro8096 tidak dihentikan. ADB reverse8088/8001 dipertahankan; hanya Expo Go di-force-stop dan dibuka ulang, tanpa clear data/token/login. Server8088 ditinggalkan aktif untuk pengguna.

Tidak mengubah provider, boot/index milik Senior5, Tailwind perbaikan QC, dependency aplikasi, backend, branch/index atau commit/push. Ini perbaikan startup/cache, bukan persetujuan seluruh fitur/native. Bukti publik berupa ringkasan observasi label UI aplikasi dan log; screenshot penuh perangkat dengan overlay aplikasi lain tetap lokal di .expo.

## Mengulang

```powershell
node scripts/verify-nativewind-cache.cjs
node scripts/verify-metro-cache.cjs
node node_modules/eslint/bin/eslint.js metro.config.js scripts/preserve-nativewind-cache.cjs scripts/verify-nativewind-cache.cjs scripts/verify-metro-cache.cjs
```

QA memeriksa cold launch/reload pada HP setelah proses kedua memuat konfigurasi; QC mencocokkan batas guard dan hash. Sinyal melalui SESSION_COORDINATION, bukan klaim pesan langsung diterima. Publikasi tetap gate PM.

Execution Profile & Operator Tips: High untuk runtime shared. Reproduksi cache -> guard -> regresi/config proses kedua -> cold launch perangkat -> handoff. Gunakan satu server USB8088 dan jangan menghapus data aplikasi untuk memulihkan cache Metro.
