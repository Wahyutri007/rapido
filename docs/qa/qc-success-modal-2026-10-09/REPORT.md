# QC modal sukses — 9 Oktober 2026

Keputusan **CHANGES_REQUESTED**, kode **QC-SUCCESS-20261009-CHANGES-REQUESTED**. Perbaikan lama pada layar tegak menutup **QC-STOCK-UI-001 P2**. Pemeriksaan tambahan menemukan **QC-SUCCESS-001 P2**: pesan panjang membuat tombol penutup terpotong pada layar mendatar. Salinan patch sudah siap ditinjau, belum diterapkan ke aplikasi.

## Temuan baru dan reproduksi

Target: `components/common/SuccessModal.tsx`, tinggi `ModalContent` dan penempatan area pesan/footer. Source yang diperiksa: `f90eec3d8d4b95ad5a5b1b6ff7cc354e9097fe5d232eef4c0d020ebb61f4e495`.

1. Buka modal dengan judul `Data berhasil diperbarui untuk seluruh pengaturan yang dipilih pada halaman ini`.
2. Gunakan deskripsi `Perubahan pengaturan yang Anda pilih sudah disimpan. Silakan periksa kembali daftar dan detail pada halaman sebelumnya. Jika ingin menyesuaikan data lainnya, tutup pemberitahuan ini lalu lanjutkan dari daftar.` Ini sama dengan varian pesan panjang yang sebelumnya diuji pada layar tegak.
3. Atur viewport menjadi 640×360 atau 844×390. Bisa juga membuka pada 320×640 lalu mengubah ukuran ke 640×360 tanpa mengganti modal.

| Viewport | Tinggi modal saat ini | Tombol terlihat saat ini | Tombol terlihat pada salinan patch |
| --- | ---: | ---: | ---: |
| 640×360 | 496,75 px | 4,625 dari 48 px | 48 px |
| 844×390 | sekitar 496,82 px | 19,625 dari 48 px | 48 px |
| Rotasi 320×640 → 640×360 | 496,75 px | 4,625 dari 48 px | 48 px |

Modal hanya membatasi lebar. Tinggi konten melampaui viewport dan footer berada di luar area gulir. Pengguna sulit menekan tombol dan membaca pesan. Sembilan assertion gagal merupakan tiga pemeriksaan geometri pada tiga konteks, **satu temuan**, bukan sembilan bug. Pesan singkat pada kedua ukuran mendatar tetap lulus.

Bukti visual: [kode saat ini](orientation-current/long-640x360.png), [salinan patch](orientation-proposal/long-640x360.png). Ukuran, wilayah yang terlihat, dan langkah rotasi tercatat dalam [hasil orientasi source](orientation-current/results.json).

## Hasil pengujian

| Suite | Source saat ini, lulus/gagal | Salinan patch, lulus/gagal |
| --- | ---: | ---: |
| Browser Stok, kontrak caller historis yang sama | 36 / 0 | 36 / 0 |
| Browser modal dan tiga dialog produksi | 51 / 0 | 51 / 0 |
| Lifecycle tiga dialog dan request produksi dengan transport memori | 156 / 0 | 156 / 0 |
| Orientasi dan rotasi | 12 / 9 | 27 / 0 |
| **Total assertion** | **255 / 9** | **270 / 0** |

Suite mempunyai cakupan yang beririsan. Total bukan jumlah fitur atau persentase penyelesaian proyek. Enam assertion tambahan pada salinan patch memastikan area gulir tersedia, baris terakhir deskripsi dapat dijangkau, dan footer tetap terlihat ketika konten digulir. Pengujian awal salinan dengan 21 assertion disimpan sebagai histori dan tidak dijumlahkan lagi.

Browser menjalankan React Native Web, primitive modal/button, ilustrasi dan font asli. Dialog Role/Worker/Member menjalankan source produksi; suite lifecycle memuat 16 modul produksi dengan Axios/Query di memori. Tidak ada error runtime/console, request bisnis nyata, atau fallback kontrol dalam suite yang dilaporkan. Fixture router dan penyajian native tetap adapter; ini belum merupakan pengujian HP fisik.

ESLint source dan salinan: **0 error/0 warning**. Biome dan pemeriksaan whitespace source lulus. TypeScript terfokus pada dua root SuccessModal beserta closure import/declaration: **0 diagnostic**, dijalankan QC. Kontrak props, callback, fallback pesan/tombol, dan isi JSX tetap sama di luar perubahan geometri/area gulir. Detail ada di [quality-results.json](quality-results.json) dan [typecheck-results.json](typecheck-results.json).

## Penutupan temuan lama

**QC-STOCK-UI-001 P2 CLOSED_BY_RECHECK** pada hash source yang disebut di atas, untuk reproduksi layar tegak 320×640. Ilustrasi kini diberi tinggi eksplisit 176 px; tombol setelah save dan resize berada dalam viewport. Temuan baru mengenai tinggi modal mendatar mempunyai ID berbeda. Keputusan lama di paket QC Stok tetap histori, tidak ditimpa.

**QC-STOCK-UI-002 P3** masih menunggu recheck atas handoff baru Senior 6. Revisi Stok baru dan konfigurasi startup/cache Senior 7 tidak mendapat approval dari pemeriksaan modal ini. Perubahan AlertModal/DeleteConfirmModal terbaru dipakai sebagai dependency sesuai handoff masing-masing, bukan approval seluruh perubahan kedua modul tersebut.

## Patch dan penyerahan

[success-modal-height.patch](proposal/success-modal-height.patch) membatasi tinggi modal menjadi tinggi viewport dikurangi 32 px dan membungkus header/pesan dalam area gulir. Footer tetap di luar area gulir. Props publik, callback, ilustrasi 176 px dan isi pesan tetap. Tidak menambah token gaya baru; token lama di luar delta tidak disertifikasi oleh laporan ini.

Salinan yang diuji: [SuccessModal.tsx](proposal/SuccessModal.tsx), hash `7508ea6ee63ec84e991b8075812c49d8a345d2cb256f43d2f45d9a0e325df7f8`. Hash patch `d1a6b3a8a383905489c1138421e02f1e1370e658f0a747ce9483547bd7b9e1f2`. `git apply --check` lulus; patch belum diterapkan. [patch-check.json](proposal/patch-check.json) mencatat hash source yang harus cocok sebelum integrasi.

Pemilik SD3-007/Codex-3 perlu menerapkan koreksi pada scope miliknya dan menyerahkan hash final untuk recheck. QA berikutnya perlu memeriksa orientasi dan pengguliran native, termasuk interaksi close/footer. Setelah QC pada source final lulus, PM menangani integrasi/publikasi. Kode **CHANGES_REQUESTED** ini belum memberi izin QC untuk mempublikasikan delta modal sekarang.

## Integritas bukti dan batas scope

Saat QC berlangsung, Senior 6 mengubah source Stok dan Senior 7 mengubah dua file konfigurasi. Snapshot awal tetap disimpan. Uji Stok diulang menggunakan salinan byte-identik kontrak caller historis `1e0d3195…`, dengan **SuccessModal produksi saat ini**. Salinan patch memakai kontrak Stok yang sama dan mengganti hanya import SuccessModal. Ini menjaga atribusi perubahan modal; tidak menilai source Stok live yang baru. Lihat [stock-isolation.json](stock-isolation.json).

Final: 39 fingerprint source/input saat ini stabil, satu kontrak Stok historis cocok pada salinan, dan 211 fingerprint artefak handoff historis tetap cocok. Dua file konfigurasi yang berubah dikecualikan secara eksplisit dari approval modal; tidak dikembalikan ke versi lama. Android cache tetap hash awal. Metro 8088 PID 9200 dan backend 8001 PID 24116 tetap berjalan; QC tidak mengatur ulang server atau HP.

Pemeriksaan kualitas awal gagal karena drift milik sesi lain dan protokol Biome stdin. Biome mengembalikan byte yang identik tetapi exit 1 ketika stdin diperiksa tanpa `--write`; koreksi memakai `--write` ke stdout dan memverifikasi byte hasilnya identik dengan salinan yang sudah diuji. Tidak mengubah source aplikasi atau hash salinan. Hasil awal dipertahankan dan dijelaskan dalam [harness-notes.json](harness-notes.json).

Inventaris 88 caller merupakan bukti statis historis; tidak semua caller dijalankan. HP fisik, keyboard, pembesaran font, konten arbitrer/virtual list, aksesibilitas penuh, full router, backend/persistensi, serta parity Figma belum disertifikasi. Akses tool Figma tidak tersedia di sesi QC saat ini. Tidak menjalankan full-project TypeScript atau mengubah dependency, index, commit, branch, push, dan merge.

Keputusan terstruktur: [DECISION.json](DECISION.json). Fingerprint paket: [artifact-manifest.json](artifact-manifest.json). Verifikasi baca saja dari root aplikasi: `node docs/qa/qc-success-modal-2026-10-09/verify-artifacts.cjs`.
