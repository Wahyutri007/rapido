# Perbaikan menjalankan Rapido di HP - 9 Oktober 2026

**QC-HP-RUN-20261009-PASS-DELTA**. Pengguna mengonfirmasi **"sudah bisa"** setelah perbaikan sambungan dan launcher. Rapido teramati pada layar Karyawan di vivo 1918/Android 11/Expo Go 57.0.9. Panduan lengkap ada di [RUN_DI_HP.md](../../RUN_DI_HP.md).

## Perubahan

Ditambahkan `scripts/start-hp.cjs` dan alias `npm.cmd run start:hp`. Launcher mencari ADB di lokasi Android SDK/RapidoAndroidTools/PATH atau override, memeriksa perangkat, Expo Go/SDK dan health backend, memasang reverse USB Metro/backend, lalu membuka `exp://127.0.0.1:8088` secara eksplisit di Expo Go. Server Metro existing diverifikasi project/SDK sebelum dipakai; port milik layanan/proyek lain ditolak tanpa menghentikannya. Jika server belum ada, Metro dimulai satu worker dalam mode Expo Go/localhost/offline. Opsi `--check` hanya memeriksa kesiapan.

Diagnosis awal: ADB ada di LOCALAPPDATA/RapidoAndroidTools tetapi tidak dikenali PowerShell melalui PATH, dan daftar reverse kosong sesudah reconnect. Metro8088/backend8001 masih berjalan. Dua reverse dipasang kembali, sehingga localhost HP menjangkau komputer. `README.md` menunjuk panduan baru; `package.json` hanya mendapat satu script, dependency/lockfile tidak berubah. PowerShell di komputer ini menjatuhkan argumen `--check` saat lewat npm.ps1; penggunaan npm.cmd meneruskan opsi dengan benar. Launcher tanpa opsi juga bekerja.

## Verifikasi

- **49/49 pemeriksaan launcher lolos**, menggunakan source produksi di VM dengan adapter perangkat/HTTP/process dan filesystem/version proyek asli. Kasus warm/cold server, pemilihan beberapa perangkat, unauthorized/offline, ADB/dependency/SDK/backend salah, maintenance, port asing, reverse/spawn error, help/check, env child dan cleanup listener diuji tanpa menjalankan atau menghentikan proses/HP nyata dalam suite ini.
- Kesiapan nyata: HP vivo, Expo Go57.0.9, backend `/api/health` HTTP200 online, manifest Metro project/SDK cocok. Launcher memasang reverse8088/8001 dan membuka native ExperienceActivity. Hierarchy pembukaan awal berisi layar Karyawan; pemeriksaan PID7768 tidak menemukan ReactNativeJS/AndroidRuntime error. Tidak dipublikasikan screenshot/data pribadi HP.
- Uji cold relaunch tambahan: intent membuka Expo berhasil, proses baru PID22161, reverse dan backend benar, cache tetap, error JS/runtime0. **Observasi foreground/UI terinterupsi karena HP pindah ke aplikasi lain**: 10 assertion lulus, 2 pemeriksaan layar belum memenuhi kondisi. Hasil asli dan klasifikasi tersimpan pada `native-results.json`/`native-interrupted.json`; tidak dihitung sebagai 12 native pass atau dilabeli bug aplikasi. Tidak diulang setelah pengguna mengonfirmasi aplikasi bisa dibuka.
- ESLint launcher0 error/warning, Biome launcher/package dan diff-check scope bersih. Source launcher sama dengan hash49tes. Empat kontrak lockfile/Metro/Tailwind/guard cache tetap; cache Android193003byte/hash056c153e8c69e6815a4afef0d77c5cfc6bc38adc7ea5dd21b76bcca74f11aa6b tidak berubah selama pemeriksaan native.

Pemeriksaan awal lint menemukan deklarasi global Node `__dirname` belum dikenali konfigurasi Expo; deklarasi global ditambahkan dan lint akhir bersih. VM awal belum menyediakan global URL; adapter dilengkapi sebelum49tes final. Dua catatan ini tidak menyatakan error aplikasi HP. Trailing whitespace README akibat campuran line ending dinormalisasi ke LF sebelum diff-check akhir.

## Scope dan batas

Empat file disetujui: launcher, package alias, README dan RUN_DI_HP. Source UI/boot/router/cache/dependency/backend tidak diubah paket ini. `app/index.tsx` dan `docs/README.md` berubah di workspace saat pekerjaan berjalan; perubahan itu berada di luar scope ini dan tidak disahkan oleh keputusan launcher. Metro8088 PID9200, backend8001 PID24116 dan Payroll8096 PID37288 tetap aktif. Tidak menghapus data Expo/HP, menjalankan transaksi/backend write, global TS, mengubah branch/index atau commit/push.

Ini kelulusan launcher/koneksi yang diuji beserta konfirmasi pengguna, bukan sertifikasi seluruh fitur, APK produksi, iOS, autentikasi/persistensi atau navigasi seluruh aplikasi. Warning kuning route/dependency existing tetap paket terpisah. Launcher USB saat ini memerlukan health backend localhost online mengikuti kontrak root aplikasi; penggantian backend berada di luar scope. PM memegang integrasi akhir dan publikasi Git.

Bukti: [launcher-results.json](launcher-results.json), [quality-results.json](quality-results.json), [native-interrupted.json](native-interrupted.json), [DECISION.json](DECISION.json) dan [artifact-manifest.json](artifact-manifest.json). Skrip verify-runtime.cjs mengoperasikan Expo Go; pengulangan memerlukan HP tersedia agar observasi foreground valid. Sinyal melalui dokumen workspace, tanpa klaim penerimaan langsung dari percakapan lain.
