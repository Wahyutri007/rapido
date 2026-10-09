# Audit desain Rapido terhadap Figma — QC, 9 Oktober 2026

**Sinyal: QC-FIGMA-20261009-AUDIT-PARTIAL-CHANGES-REQUESTED.**

Inventaris seluruh source layar selesai. **Pencocokan dan koreksi seluruh aplikasi belum selesai** karena akses langsung serta acuan lengkap belum tersedia. Empat perbedaan desain dikonfirmasi melalui source dan screenshot historis; koreksi diminta kepada pemilik modul. Belum ada PASS visual penuh untuk source aplikasi terkini dalam audit ini.

File pengguna: [Rapido Figma / Page 0:1](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=0-1), key `gbdKqL2EcYNenWiQXG4SRW`. File key lama dalam skill tidak dipakai.

## Cakupan terukur

| Pemeriksaan / ketersediaan | Jumlah | Makna |
| --- | ---: | --- |
| Inventaris source layar | 239 / 239 | Seluruh berkas layar saat snapshot diparse; bukan seluruh state dieksekusi |
| Layout | 89 | Hierarki layout dicatat untuk setiap layar |
| Source UI/config yang di-hash | 649 | Fingerprint inventaris, bukan 649 pengujian aplikasi |
| Berkas layar dengan frame dalam dokumentasi | 60 / 239 = 25,1% | Pemetaan tercatat; belum otomatis tepat untuk semua state |
| Berkas layar dengan gambar acuan tersedia | 15 / 239 = 6,3% | Mencakup 16 frame; sebagian gambar telah downscale |
| Frame tercatat, tetapi gambar/style belum lengkap | 45 | Memerlukan full context/screenshot/aset |
| Kandidat frame berdasarkan metadata | 10 | Pemetaan/state perlu disahkan |
| Panduan UI tanpa frame tercatat | 10 | Absensi history, Integrasi, Pesanan Digital, Neraca Saldo, detail Target |
| Frame belum dipetakan dalam audit | 159 | Belum ditemukan pemetaan; tidak berarti pasti dibuat tanpa Figma |
| Perbandingan visual tersimpan | 14 pasangan historis + 1 interim pemilik | Semua dilihat; bukan capture aplikasi terkini oleh QC |
| Temuan perbedaan source | 4 OPEN | Perlu koreksi pemilik dan QC ulang |

Persentase tersebut adalah **cakupan acuan berkas layar**, bukan progres keseluruhan proyek. Beberapa berkas memakai route yang sama atau komponen re-export. Loading/error/empty, tambah/edit, filter/sheet/modal, keyboard dan ukuran perangkat menambah state di luar hitungan 239 berkas.

## Temuan terkini berdasarkan source

| Temuan | Frame | Perbedaan | Pemilik koreksi |
| --- | --- | --- | --- |
| QC-FIGMA-001 | 1:19624 | Bentuk/tint ikon FAQ; katalog/waiter masih primary biru | Codex-3 / Bantuan |
| QC-FIGMA-002 | 1:19624 | Hubungi Support masih Button rounded-full; acuan berbentuk persegi bersudut kecil | Bantuan + pemilik varian Button |
| QC-FIGMA-003 | 1:13605 | Tone tiga total hanya diterapkan ke ikon/latar, bukan angka | Pemilik Inventory / Senior5 |
| QC-FIGMA-004 | 1:12059, 1:14945 | Ikon metadata memakai primary; acuan muted | Pemilik Inventory / Senior5 |

Detail bukti/source/acceptance tersedia di [daftar koreksi](CORRECTION_HANDOFF.md), [findings JSON](visual-findings.json) dan [source observations](source-observations.json). Tidak ada source aplikasi yang diubah oleh QC dalam audit ini. Temuan OPEN ini adalah gate desain, bukan pembatalan keputusan fungsi terbatas pada paket sebelumnya.

## Hasil screenshot dan batas interpretasi

Hub Persediaan, transfer, penyesuaian, pembelian serta Bantuan memperlihatkan struktur utama yang berasal dari acuan. Perbedaan geometri/ikon/tint dicatat per frame dalam [halaman pasangan screenshot](perbandingan-visual.html). Gambar asli dan preview disalin tanpa perubahan ke `references/visual/` supaya bukti historis tidak berubah ketika pemilik mengambil screenshot baru.

Gambar Ringkasan Bahan/Produk tersimpan hanya 124×1024 / 133×1024; detail pixel tidak cukup. Screenshot aplikasi ringkasan hanya viewport atas, sehingga bagian rekomendasi/insight di luar viewport **tidak dituduh hilang**. Gambar beberapa form/list juga downscale dari frame 390 px; normalisasi viewport dan state wajib untuk geometri. Angka/date/record/keterangan dinamis tidak diwajibkan sama dengan fixture Figma. Placeholder email pada judul permintaan dan typo Figma yang dinormalisasi adalah perbedaan copy yang dicatat, bukan otomatis bug.

Stok Akhir `1:12401` mempunyai context/screenshot penuh. Pasangan interim Senior5 dilihat; bagian atas dekat acuan, tetapi pemilik masih `IN_PROGRESS` tanpa handoff final pada saat snapshot. Tidak diberi PASS, source tidak diambil alih. Kelola `1:4897` mempunyai context dan gambar tersimpan; pasangan capture aplikasi terkini belum tersedia dalam audit ini.

## Provenance dan akses

- Hanya respons Figma untuk file Rapido yang disalin dari arsip sesi dengan cwd workspace Rapido. Tidak menyalin credential, profil akun, percakapan lain atau menjalankan code hasil Figma. Sembilan capture (2 metadata, 5 blok context, 2 gambar) disimpan bersama asal waktu/session dan SHA-256 di [cached-reference-index.json](cached-reference-index.json).
- Metadata Page0:1 historis **terpotong**, marker pada line5728. Pemulihan indeks memakai indentasi terlihat dan menandai frame yang melewati gap. Indeks 126 kandidat termasuk ringkasan lokal tidak mewakili seluruh halaman. Metadata saja tidak menetapkan style/warna/font atau parity.
- Pada pemeriksaan sesi QC: tidak ada tool Figma callable; `codex mcp list --json` kosong; plugin Figma tersedia tetapi belum terpasang; URL desain gagal dibaca lewat web. Saran pemasangan telah diberikan, bukan klaim terhubung.
- Untuk pemeriksaan semua frame berikutnya, **pasang plugin Figma lalu hubungkan akun yang mempunyai akses file Rapido**. Akses/kuota sesi lain tidak disamakan dengan akses sesi QC.

## Gate berikutnya untuk developer → QA → QC → PM

1. Ambil full screenshot/context/styles/aset pada frame yang tepat; sahkan kandidat dan petakan seluruh sisa source. Sepuluh source yang memakai panduan UI tanpa frame memerlukan keputusan desain/acuan yang sah.
2. Koreksi 001–004 oleh pemilik; gunakan aset resmi dan semantic variant opt-in. Jangan mengubah default seluruh shared component tanpa pemeriksaan caller. Stok Akhir menunggu handoff final Senior5.
3. Capture source aktual pada state setara, 320/390/landscape dan web/native; cek header/footer, font, ukuran, spacing, warna, ikon, overflow serta semua state yang berlaku. QA menjaga regresi fungsi/data dinamis.
4. QC mengikat keputusan per frame kepada hash source dan evidence. PM menilai integrasi/push setelah gate terkait terpenuhi. Sinyal workspace ini belum berarti pesan diterima PM atau persetujuan publikasi.

**Execution Profile & Operator Tips:** High karena seluruh layar dan dependency shared. Bagi per modul: acuan → koreksi pemilik → QA perilaku → QC visual/hash → PM. Header tetap pada layout; semantic primitive dan scope aktif pemilik dipertahankan.

## Artefak dan verifikasi paket

- [Laporan interaktif](Laporan-Audit-Figma-QC-2026-10-09.html), [PDF baru](Laporan-Audit-Figma-QC-2026-10-09.pdf), [inventaris CSV](screen-inventory.csv), [inventaris JSON](screen-inventory.json).
- [Indeks frame parsial](frame-index.json), [indeks screenshot](visual-index.json), [source fingerprints](source-fingerprints.json), [proof dokumen](report-proof.json).
- `node docs/qa/qc-figma-audit-2026-10-09/verify.cjs` memeriksa artefak paket secara read-only; `--source` juga mendeteksi drift source inventaris. Perubahan source sesudah snapshot harus diperiksa ulang, bukan reseal histori.
- Verifikasi rendering/filter/link/gambar/PDF adalah **uji dokumen audit**, bukan uji visual/fungsi aplikasi. Tidak menjalankan global TypeScript/lint/test ulang karena tidak ada perubahan aplikasi; tidak melakukan runtime HP/Metro/ADB/backend, dependency, Git commit/push atau perubahan PDF historis.
