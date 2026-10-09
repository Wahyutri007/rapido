Pemeriksaan Kasir: Menu Favorit, filter Stok, dan menu profil

Menu Favorit dan filter Stok diterima QC untuk lingkup yang diperiksa. Bug garis pemisah menu profil sudah diperbaiki dan siap untuk review QA berikutnya. Hasil akhir: **28 pemeriksaan browser PASS, 0 FAIL; 6 kontrak source/asset PASS; TypeScript 3 root + 4 ambient/967 file tanpa diagnostik; ESLint 0 error/0 warning; Biome dan whitespace check lulus.** Ini pemeriksaan independen komponen yang dirilis, bukan persetujuan seluruh Kasir.

Menu Favorit tetap dua baris empat kolom sesuai instruksi pengguna. Pada390px, kartu358×168, item71.5×64, jarak16 dan jarak antarbaris80 cocok metadata tersimpan. Delapan label/rute, tujuh gambar40px, serta SVG Member20px di tile40px tetap benar. Lebar320/360/280/844, kartu280px, dan teks2× diuji. Tujuh PNG Home belum mempunyai ekspor asli dalam arsip; SVG Member adalah original komponen Manage, bukan bukti original ilustrasi40px Home.

Filter Stok memakai full context/image29:27391 serta SVG close/check asli yang hash-nya cocok byte-for-byte. Ukuran referensi390px: panel619, kategori358×53, gap8, tombol172×48, gap14, padding bawah32. Layar320×240 dan240×200 dengan inset bawah48 tetap dapat menjangkau kategori terakhir dan Terapkan. Cancel, Reset, Apply, rotasi saat terbuka, dan teks2× juga lulus. Fixture ini menggunakan lifecycle lokal; integrasi Stock body dan Header ditangani cohort terpisah.

Pada menu profil, divider sebelumnya dikunci di y42. Teks2× membuat divider melintas di tulisan Profile (baseline: teks y88..120, divider y114..115). Divider kini mengikuti akhir baris pertama melalui wrapper tanpa tambahan tinggi. Ukuran normal107×84 dan offset label16/52 tetap sama. Anchor, dismiss, rotasi, aria-expanded, serta callback Profile/Logout tidak berubah. Bukti source memastikan hanya subtree divider berubah. Teks yang diperbesar diuji melalui adapter CSS; validasi native fontScale/HP masih diperlukan.

Versi yang diperiksa:

| Komponen | SHA256 akhir | Status |
| --- | --- | --- |
| MainMenu | `02f3c5b5fc095729f12b50d93b8b71e76d10387f3cc14675b2dd0562bec0baad` | QC_ACCEPTED_SCOPED_UI |
| StockFilterSheet | `aec3506b55fdcf1366b89dfa02f2374f23439b9dc2d0c9f620ff270bc66a7139` | QC_ACCEPTED_SCOPED_UI |
| ProfileMenu | `d6735c456bc289760d942d4c3df878d120b735c7c5dbb7557ceb8bade1a4e3f4` | READY_FOR_QA_SCOPED |

Bukti akhir: [hasil browser](browser-confirmed/results.json), [kontrak source/asset](contracts.json), [quality](quality.json), [perbandingan](perbandingan.html), [manifest](manifest.json), dan [verifikasi](verification.json). Build RNWeb dibuat sendiri dengan Metro satu worker, cache privat diD, font/komponen/CSS/SVG produksi. Router, lifecycle draft lokal, dan insets merupakan fixture eksplisit. Seluruh request aset dilayani dari berkas yang diizinkan; error runtime/console/request tak terlayani0. Receipt mengikat source proyek yang dikompilasi, asset yang dimuat build, input quality dan referensi, serta byte bundle/output; ini bukan jaminan seluruh runtime/dependency aplikasi.

Riwayat percobaan dipertahankan. `browser-first` membaca Profile saat animasi pembukaan sehingga tiga ukuran tampak lebih kecil. `browser-settled` mengoreksi waktu pengambilan dan membuktikan satu bug divider. `browser-final` membuktikan divider selesai namun satu ukuran filter masih terbaca selama animasi masuk. `browser-confirmed` menunggu animasi dan menghasilkan28/28 PASS. Kegagalan pengambilan selama animasi tidak diklasifikasikan sebagai bug produksi dan tidak dipakai untuk penerimaan akhir.

Belum100% seluruh Figma. Arsip `PARTIAL_CACHED_REFERENCE` hanya memberi enam frame Kasir lengkap; full Dashboard/Katalog/Laporan/Tempat dan original Home artwork tidak tersedia. Percobaan context Figma terbaru pada turn ini terkena batas Starter. Permintaan lokasi unduhan lain sudah disampaikan kepada pengguna. Sumber baru tidak boleh ditebak dari metadata. Header ringkas yang diminta pada sesi lain juga menggeser referensi Cash390px: tinggi48 alih-alih72 pada inset0, amount y153 alih-alih177. Owner Header/PM mencatat perubahan24px ini sebagai variasi yang disengaja; perlu rekonsiliasi sebelum pernyataan sama persis.

Tidak ada perubahan backend, data, dependency/config, Git/index, HP, Chrome bersama, atau runtime bersama. Scope produksi hanya separator ProfileMenu. Lease dilepas setelah verifikasi untuk QA/QC/PM. Packet lama dan arsip tidak ditulis ulang. Perubahan dependency setelah receipt memerlukan review candidate baru.
