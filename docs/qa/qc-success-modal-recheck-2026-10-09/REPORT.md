# QC SuccessModal — recheck 9 Oktober 2026

**PASS_RECHECK**, sinyal **QC-SUCCESS-20261009-PASS-RECHECK**. Temuan **QC-SUCCESS-001 P2 CLOSED_BY_RECHECK** pada source SuccessModal yang sudah diterapkan developer. Penutupan ini berlaku untuk reproduksi web yang ditemukan QC; belum sertifikasi perangkat HP/native. Source aplikasi tidak diedit oleh QC.

File: components/common/SuccessModal.tsx, SHA256 **7508ea6ee63ec84e991b8075812c49d8a345d2cb256f43d2f45d9a0e325df7f8**. Byte source tepat sama dengan proposal QC sebelumnya. Source F90 sebelum koreksi dan paket keputusan lama tetap histori. Developer menyerahkan koreksi maxHeight mengikuti tinggi window dikurangi 32 px, ScrollView untuk ilustrasi/judul/pesan, dan footer di luar area gulir. Seluruh AST source setelah membalik hanya lima perubahan height/ScrollView cocok dengan F90: props, callback, teks/fallback, gambar, tombol close, controlled/uncontrolled dan ekspor tetap.

| Bukti | Hasil | Atribusi |
| --- | ---: | --- |
| Browser portrait 320/360/390/768, varian publik dan tiga dialog domain | 51 PASS / 0 FAIL | QC menjalankan baru pada source aplikasi |
| Landscape 640×360/844×390, live rotation, scroll akhir pesan dan footer | 27 PASS / 0 FAIL | QC menjalankan baru pada source aplikasi |
| **Total pemeriksaan browser baru** | **78 PASS / 0 FAIL** | Satu run final per suite |
| Lifecycle tiga dialog/Query/Axios memori | 156 PASS / 0 FAIL | Bukti QC Delete digunakan kembali, seluruh 16 hash modul serta package/lock masih cocok; tidak direplay sekarang |

Tidak ada runtime error, console error atau usaha HTTP bisnis pada dua suite browser baru. Cakupan antar-suite berulang; hasil lama tidak dijumlah menjadi jumlah tes baru, fitur atau persentase penyelesaian proyek. Replay 321 developer serta proposal 270 historis adalah histori terpisah, bukan pengujian QC baru.

| Kasus pesan panjang | Sebelum koreksi F90, bukti QC lama | Source sekarang 7508, QC baru |
| --- | --- | --- |
| 640×360 | Modal 496,75 px; tombol terlihat 4,625 dari 48 px | Modal sekitar 328 px; tombol terlihat 48 px |
| 844×390 | Modal sekitar 496,82 px; tombol terlihat 19,625 dari 48 px | Modal 358 px; tombol terlihat 48 px |
| Rotasi terbuka 320×640 → 640×360 | Footer terpotong | Modal dan judul tetap elemen yang sama; tombol terlihat 48 px, tanpa callback tutup otomatis |

Pengukuran memeriksa viewport dan clipping ancestor, bukan sekadar ukuran tombol. Konten overflowing mempunyai area gulir; baris terakhir deskripsi dapat dijangkau, tombol tetap terlihat dan tidak berpindah saat scroll. Menutup setelah pemulihan portrait memberi callback satu kali. [Hasil orientasi](orientation-current/results.json), [sebelum scroll](orientation-current/long-640x360.png), [akhir pesan setelah scroll](orientation-current/long-640x360-scrolled.png), [viewport844](orientation-current/long-844x390-scrolled.png), [hasil shared/caller](modal-browser-results.json). Screenshot 640×360 sebelum/sesudah scroll serta 844×390 setelah scroll diperiksa langsung secara visual.

ESLint satu source: 0 error/0 warning. Biome dan scoped git diff --check: exit 0. TypeScript satu root memakai tsconfig aktual dan imported/declaration closure sebanyak **18 source proyek**: 0 diagnostic; bukan TypeScript seluruh proyek. [Kualitas/kontrak](quality-results.json), [tipe](typecheck-results.json). Header dan isi saja yang dibungkus; penempatan footer dan callback dibuktikan dengan AST, browser aktual dan bukti lifecycle terikat hash. Token/warna/typography lama di luar delta tidak mendapat sertifikasi standar UI seluruhnya.

**37 fingerprint source/contract handoff cocok**, **51 input tetap stabil**, **276 artefak historis cocok** (17 handoff koreksi, 139 QC Success terdahulu, 120 QC Delete). Entry dan stylesheet sendiri cocok snapshot, bundle browser yang benar mempunyai receipt hash sama dengan hasil build. [Snapshot input](source-before.json) dan [bundle/provenance](offline-build.json) mengikat hasil pada source 7508 serta dependency yang benar. Bukti lama tidak ditimpa.

Inventaris saat audit: **93 file/93 pemanggilan SuccessModal**, tanpa named prop yang tidak dikenal atau spread. Ini audit statis; hanya varian publik dan tiga dialog Role/Karyawan/Member diuji dalam browser. [Audit caller](caller-audit.json) tidak memberi approval 93 layar. Alert 76b6/Delete DABC dipakai sebagai dependency, bukan approval keseluruhan modulnya. Source Stock baru tidak dieksekusi dalam packet ini; bukti caller Stock historis pada packet lama tidak diberi atribusi source Stock terkini.

Browser memakai provider, font, RNWeb, modal/button dan dialog produksi. Axios bisnis memakai adapter lokal; semua request network diintersep dan hanya bundle/aset milik fixture dipenuhi dari disk. Bundle Metro API dibuat sekali jalan dengan cache/entry QC sendiri, resolver browser sesuai source Expo CLI terpasang, dan CSS web terkini disalin tetap. Tidak require root Metro config atau memanggil plugin NativeWind Metro, membuat listener, mengoperasikan server HP, ADB atau backend. [Observasi runtime](runtime-observation.json) hanya mencatat port/cache; bukan approval cold startup. Spring Moti ditunggu sampai ukuran render sesuai computed CSS box, secara independen dari target assertion; tidak ada perubahan source untuk menghilangkan animasi.

**QC-DELETE-001 P2 tetap OPEN** pada packet Delete. QC-STOCK-UI-002 serta gate route/dependency warning tetap memiliki review masing-masing. Temuan QC-STOCK-UI-001 portrait yang sebelumnya ditutup tidak dibuka/ditutup ulang di sini. Tidak ada kelulusan seluruh modal, aplikasi, native/keyboard/accessibility, Figma, backend, persistensi atau main merge.

PM dapat meninjau publikasi **delta satu source SuccessModal 7508** beserta dependency tepat dan gate integrasi terpisah. Sinyal PASS_RECHECK tersedia melalui laporan, [keputusan](DECISION.json) dan catatan koordinasi lokal; belum klaim sesi lain menerima/menyetujui. Developer tetap pemilik source, PM pemilik branch/push/integrasi. QC tidak commit/push/merge. PDF progres lama tetap snapshot historis.

Replay dari root aplikasi ke folder reviewer baru agar packet ini tetap frozen: offline-build.cjs → run-browsers.cjs → quality.cjs. Dua browser berjalan berurutan, 51 lalu 27. Entry standalone adalah [fixture](modal-entry.fixture.jsx); source Success diimport langsung tanpa salinan pengganti. Lifecycle 156 rujukan dapat diperiksa hash-nya dari source-before.json; jika satu dependency berubah, bukti lama harus ditinjau ulang untuk delta terkait. Verifikasi packet selesai memakai node docs/qa/qc-success-modal-recheck-2026-10-09/verify-artifacts.cjs; default membaca artefak saja.
