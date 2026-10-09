# Codex-4 — pemeriksaan awal Figma Kasir

Tanggal: 9 Oktober 2026, Asia/Jakarta. Status: **WAITING_FOR_REFERENCE**. Ini catatan pembacaan source, belum handoff implementasi atau approval QA/QC.

Pengguna meminta membaca unggahan Figma Kasir terbaru dan menyelesaikannya. Prioritas sesi Codex-4 beralih dari Back Office ke Kasir. Node/frame unggahan terbaru belum tersedia dalam pesan atau referensi workspace yang ditemukan; belum ada scope source aplikasi yang diambil.

## Pemeriksaan akses

- Acuan lama: file `gbdKqL2EcYNenWiQXG4SRW`, page `0:1`. Pembukaan ulang melalui web gagal mengakses isi desain.
- Pencarian integrasi terbaru menunjukkan Figma tersedia tetapi belum terpasang/terhubung. Saran koneksi sebelumnya sudah tercatat; tidak mengulang saran yang masih belum disambungkan.
- Profil Chrome `Profile 1` cocok dengan akun yang ditentukan pengguna. Chrome berjalan tanpa port debugging yang ditemukan. Belum membaca Figma dari profil tersebut atau melakukan login.
- Referensi lokal `qc-figma-audit-2026-10-09/frame-index.json` memuat 126 frame dari capture parsial Back Office; bukan bukti unggahan Kasir terbaru. Kesamaan nama frame tidak cukup untuk menetapkan mapping Kasir.
- Tidak ditemukan file `.fig` di root Downloads atau ekspor Kasir baru pada referensi workspace yang diperiksa.
- Pertanyaan link frame (“Copy link to selection”) atau path file acuan sudah dikirim kepada pengguna. Frame dan gambar/style terbaru diperlukan sebelum slicing desain.

## Temuan source saat ini

| Bagian | Bukti source | Status yang dapat dibuktikan |
| --- | --- | --- |
| Transaksi | `app/(no-layout)/(cashier)/transaction.tsx` | Hanya merender teks `Transaction`; masih placeholder. |
| Keranjang | `app/(no-layout)/(cashier)/cart/index.tsx` | Subtotal/pajak/total memakai `formatRp(-1)`, tombol Bayar Sekarang memiliki callback kosong, Bayar Nanti memakai penundaan mock. |
| Penyelesaian pembayaran | `app/(no-layout)/(cashier)/cart/input-money-confirm.tsx`, `cart/confirm.tsx` | Konfirmasi selesai memakai penundaan tanpa API; ringkasan memilih `TRANSACTION_ITEMS[0]`, belum terikat transaksi yang baru dibuat. |
| Pengeluaran Kasir | `app/(no-layout)/(cashier)/report/expense-input.tsx` | Form belum memakai resolver schema, beberapa field belum mengikat field controller, CTA Simpan belum mempunyai handler. |
| Beranda/laporan shift | `app/(cashier)/home/index.tsx`, `app/(no-layout)/(cashier)/shift-report.tsx` | Banyak data hardcoded dan kelas typography/warna lama. Belum dibandingkan dengan desain Kasir terbaru. |
| Tempat Kasir | SD4-003 dan supplement `cashier-location-wrapper-recheck` | Handoff fungsi sebelumnya tersedia; bukan approval visual unggahan baru. |
| Riwayat transaksi | CASHIER-HISTORY-001, pemilik Senior 8 | Handoff fungsi sebelumnya tersedia; tidak mengambil source pemilik lain. |
| Tagihan | CASHIER-BILLS-001, pemilik Senior 8 | Catatan terakhir ON_HOLD_BY_USER. Source sudah ada, belum ditemukan HANDOFF final. Permintaan pengguna pada sesi ini tidak otomatis mengubah scope sesi Senior 8. |

Temuan ini merupakan observasi kode, bukan hasil replay runtime atau keputusan QC. Fingerprint source dibaca pada `source-observations.json`; perubahan sesi lain sesudah capture memerlukan pembacaan ulang.

## Kelanjutan setelah acuan diterima

Identifikasi section/frame Kasir terbaru beserta state, gambar dan style; cocokkan route serta pemiliknya; ambil satu alur yang belum selesai. Implementasi memakai Header pada layout, semantic Text/Card/Form/Wrapper dan RHF/Zod. Data dan kontrak transaksi mengikuti source/API yang terbukti tersedia. Verifikasi fungsi dan capture visual diikat ke frame, viewport serta source aktual, lalu laporkan melalui workspace ke QA/QC.

**Execution Profile & Operator Tips:** Medium untuk satu alur Kasir setelah frame diketahui; scope keseluruhan menunggu inventaris desain terbaru. Kerjakan frame → pemetaan komponen/data → implementasi → pemeriksaan terfokus → QA/QC. Jangan menimpa paket historis atau source owner aktif; header tetap pada layout dan perubahan primitive memakai opsi yang menjaga pemakai existing.
