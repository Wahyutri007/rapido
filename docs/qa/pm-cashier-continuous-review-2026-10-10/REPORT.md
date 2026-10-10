# Publikasi Kasir — review berkelanjutan,10 Oktober2026

Branch modul diterbitkan sebelum main setelah QA kandidat aktual. SHA branch remote, ancestry main, seluruh blob source pada commit publikasi dan latest source gabungan diperiksa ulang. Shared HEAD/index tetap, tanpa checkout/reset/stash/pull pada workspace developer.

| Perubahan | Commit | Uji RNWeb kandidat |
| --- | --- | --- |
| Input Uang | `a0c059d` | 47 |
| Acuan Tagihan | `09324cb` | 30 |
| Scanner | `4480c4b` | 38 |
| Laci Kasir | `414a9de` | 26 |
| Printer | `1d787a6` | 25 |
| Stok | `9808dc9` | 28 |
| Tempat | `384aa9d` | 41 |
| Pengeluaran | `729803d` | 23 |
| Konfirmasi Tunai | `1c5d52f` | 44 |
| Pencarian Stok | `f15ee80` | 41 |
| Tombol Tagihan | `e4cdde7` | 26 |

Jumlah pengujian adalah per paket, dengan skenario yang dapat berulang antarpaket. Bukan persentase penyelesaian fitur atau bukti seluruh Kasir lulus. Receipt lama/frozen tidak direseal setelah dependensi berubah; blob commit historis dan source terbaru diperiksa terpisah.

Menu Favorit4×2 tetap di branch `fix/cashier-favorites-layout-2026-10-10` pada `ca69db8`; belum ada route `/shift` pada main. Scanner, Stok dan Laci Kasir telah tersedia sebagai pratinjau; Riwayat Shift/list/report dan integrasi seluruh tujuan masih gate. Whole Dashboard, laporan transaksi/shift dan fitur operasional/backend/perangkat belum memperoleh approval global.

Perbaikan baru Pencarian Stok41/32 dan Tombol Tagihan26/22 menutup temuan lebar input/label pada kandidat main. Header Tagihan tetap Figma72; header Kasir lain sesuai opt-in yang diuji. Konfirmasi Tunai44/17 dan Pengeluaran23/16 memberi penjelasan jujur, tanpa transaksi/saldo/simpan palsu. Semua hasil berbatas preview dan fixture, bukan pembayaran/order/stock/backend yang autentik.

Ruang C rendah ditangani dengan memindahkan179 aset checkout QA privat byte-identik ke D dan mempertahankan junction; proyek bersama/common Git tidak dipindahkan. Resolver QA memakai aset original C hanya setelah mencocokkan SHA D, kedua path bound. Lima kegagalan build junction/cross-drive ditahan sebagai bukti CashConfirm. Preflight publish pernah berhenti karena CRLF receipt PowerShell dianggap whitespace oleh Git; receipt frozen dipertahankan, perintah diff memakai cr-at-eol dan kandidat staged diverifikasi byte sama sebelum resume. Tidak ada override source/manifest atau force push.

Figma terhubung pada akun pengguna; live full context masih Starter-limited. Arsip context/gambar asli dipakai dan batas24px header yang berbeda dicatat per paket. Tidak ada klaim100%Figma/latest/native/fullRouter atau persentase progres global.
