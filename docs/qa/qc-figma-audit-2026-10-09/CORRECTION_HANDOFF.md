# Handoff QC — pencocokan semua desain Rapido

Sinyal lokal **QC-FIGMA-20261009-AUDIT-PARTIAL-CHANGES-REQUESTED**. Inventaris 239 layar selesai; approval visual seluruh aplikasi tetap PENDING. Empat temuan perbedaan source OPEN. Tidak ada push/commit atau klaim sesi lain menerima sinyal.

| ID | Source / frame | Perubahan yang diminta | Acceptance / regresi |
| --- | --- | --- | --- |
| 001 | `components/feature/support/FaqCard.tsx` / 1:19624 | Ambil enam ikon/tint resmi; katalog magenta dan waiter ungu sesuai acuan; gunakan asset lokal/semantic token | Screenshot aktual kategori sama, enam ikon sesuai; search/expand/filter tetap bekerja; 320/390 dan native |
| 002 | `app/(no-layout)/manage/faq/index.tsx`, `components/ui/button/index.tsx` / 1:19624 | Bentuk Hubungi Support sesuai acuan melalui semantic variant opt-in; default Button tidak diubah global | Bentuk/ukuran sesuai, area tekan layak, dialog batas kontak tetap; audit caller Button bila varian ditambah |
| 003 | `components/feature/inventory/InventoryUi.tsx`, `StockOperationDetail.tsx` / 1:13605 | Opsi semantic warna angka metrik pada detail penyesuaian; tone yang sudah dikirim harus mencapai nilai | Warning/destructive/success sesuai; label 320/390, stok/satuan campur benar; summary/transfer/supplier tidak ikut berubah tanpa acuan |
| 004 | `components/feature/inventory/InventoryUi.tsx` / 1:12059, 1:14945 | Tone muted untuk ikon metadata kedua daftar, bentuk dari asset resmi | Ikon metadata muted, link/action tetap primary; periksa semua caller InventoryMetadata |

Pemilik Bantuan: Codex-3. Pemilik Inventory: Senior5; antrekan ini **tidak mengambil scope SD5-010 Stok Akhir/shared variants yang masih aktif**. Pemilik semantic Button/ikon dan PM mengoordinasikan kebutuhan shared. QC tidak memilih warna raw/ikon tebakan atau menyamakan fixture Figma dengan data pengguna.

Empat belas pasangan screenshot historis memiliki observasi tambahan di [visual-findings.json](visual-findings.json); perbedaan spacing/header/bayangan/footer/control memerlukan capture source terkini sebelum dijadikan temuan current. Stok Akhir punya satu pasangan interim pemilik yang ditinjau tanpa PASS; perlu final handoff dan recheck independen. QC-INCOME-001/002/003 serta QC-DELETE-001 adalah gate sebelumnya yang tetap mengikuti keputusan paketnya; audit ini tidak menutupnya.

Prioritas setelah akses Figma:

1. Inventory dan Bantuan: lengkapi reference resolution/style, koreksi 001–004 dan recheck 14 frame historis; terima handoff Stok Akhir.
2. Kelola lain: 45 berkas dengan frame tercatat tetapi belum punya gambar/style lengkap; list/detail/form/variant masing-masing.
3. Sahkan 10 kandidat dan petakan 159 source belum dipetakan, termasuk Akses/Katalog/Laporan/Kasir/Operator. Kasir hanya audit read-only sesuai fokus pengguna sebelumnya.
4. Sepuluh source panduan UI tanpa frame memerlukan acuan/keputusan desain: history Absensi, Integrasi, Pesanan Digital, Neraca Saldo dan detail Target.
5. Setiap hasil diikat frame/state/viewport/hash source, bukti web/native serta QA regresi. PM memegang integrasi/push; belum ada approval seluruh desain.

**Execution Profile & Operator Tips:** High. Kerjakan satu modul per acuan/capture/recheck supaya bukti jelas dan source owner tidak bentrok. Tetap gunakan Header dari layout, semantic Text/Card/Form/Wrapper dan varian shared opt-in; jangan mengganti data dinamis dengan contoh Figma untuk memperoleh screenshot serupa.
