# Lingkup QC terkini — 9 Oktober 2026

Instruksi pengguna terbaru: **fokus tampilan; backend akan diganti**. Pemeriksaan/perbaikan backend ditangguhkan. QC-STOCK-001 disimpan sebagai temuan historis untuk kontrak backend pengganti dan **tidak menjadi gate persetujuan UI saat ini**. Report/DECISION awal tetap utuh sebagai bukti pemeriksaan sebelumnya.

Kandidat backend pada `proposal/` hanya salinan, belum diterapkan. Sebelum instruksi baru, kandidat sudah diuji30/30 pada memory fixture; tes tambahan backend tidak dilanjutkan. Ini bukan perubahan source, recheck backend aplikasi atau penutupan temuan.

QC sekarang memeriksa tampilan Batas Stok, keadaan layar/picker/modal, viewport kecil, token UI, dan status warning kuning dalam [paket UI terpisah](../qc-stock-ui-2026-10-09/REPORT.md). Keputusan UI dan perilaku frontend dipisahkan dari backend lama. PM tetap pemilik gate akhir/push Git.
