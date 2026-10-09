# PM review: input uang tunai Kasir

APPROVED_FOR_SCOPED_MODULE_PUBLICATION, oleh Projek Manager. Base main `833b8c3ff631886ed7c5dbdf30d9cdf0f983a651`, branch `fix/cashier-cash-input`. Scope tujuh source pada CANDIDATE_SETUP.json; tidak ada source produksi baru sesudah review ini.

Perubahan: nominal RHF/Zod terkontrol, total route lokal yang wajib valid, integer Rupiah aman, reset parameter relevan, guard fokus/unmount/stale callback/double submit/retry. Keypad cash dan header input-money mengikuti frame resmi 29:25047, termasuk SVG backspace asli; quick amount memakai total eksplisit atau preset Rp200.000, tanpa membuat quote. Default Keypad dan empat header route lain dipertahankan. Shared Keypad adalah satu-satunya primitive produksi yang berubah; opt-in cash/controlled menjaga default PIN/refund.

Dasar keputusan:

- Suite QA aktual yang ditulis reviewer `/root/cashier_pricing_qa` lulus 35/35: 31 kelompok perilaku, 3 fingerprint caller dan 1 integritas tujuh source. Actual screen, Keypad, RHF/Zod/schema/helpers dijalankan dengan adapter native/router/focus/insets/presentation. Final suite dijalankan PM setelah reviewer kehabisan kredit. Dua kegagalan interim merupakan fixture total/parameter yang salah dan disimpan; kasus invalid/insets dikelompokkan tanpa menghapus cakupan. Fingerprint caller bukan uji alur PIN/refund.
- Reviewer `/root/cashier_navbar_qc` menghasilkan `source-verification-v2.json`, 10/10 kelompok source/AST/expression PASS, serta inspeksi gambar referensi resmi dan capture developer. Status sumber aslinya tetap `PASS_SOURCE_SCOPED_QA_PENDING`. Reviewer juga kehabisan kredit sebelum intake QA/final signature. PM menerima hasil QA final dan menyelesaikan gate scoped ini; tidak mengarang final approval reviewer.
- Quality kandidat: enam root (termasuk schema prerequisite), 1.284 file closure, TS 0 diagnostic, ESLint 0 error/0 warning, Biome/diff bersih. Label hasil lama menyebut five roots; array roots yang sebenarnya memuat enam. Runner label telah diperbaiki, production tidak berubah; quality tidak diulang tanpa alasan.
- Exact tujuh source cocok dengan cohort developer/QA/QC. Dua puluh lima dependency utama dan resolved project inputs cocok terhadap main yang diterbitkan. Delta shared safe-area dari sesi aktif tidak dimasukkan.

Arsip berisi 19 file implementation terpilih: 18 artifact cocok dengan original hash manifest dan satu salinan manifest lengkap. Seluruh 39 original artifact sempat diverifikasi di shared packet saat setup, tetapi tidak semuanya disalin ke commit ini. Tujuh reference resmi disalin byte-exact. Captures/browser 28 kelompok/regression169/quality developer adalah bukti developer, bukan independent replay baru atau tambahan 197 skenario unik.

Batas visual yang diterima: existing Header line height21 versus Figma20.8, font Inter_24pt existing, geometry non-4-unit literal dari frame dan adaptasi nominal panjang/scroll. Tidak ada sertifikasi pixel100/native/fontScale/accessibility/fullRouter/HP. Total route belum quote server yang terotorisasi; downstream confirmation masih legacy wait/API Here. Publikasi input bukan approval checkout/payment atau seluruh Kasir. Modul Laporan/Transaksi/Shift terbaru tetap memiliki gate sendiri.

Root tidak mengedit source implementasi cash dan menjadi reviewer penutup. Review source/helper, bukti QA/QC dan batas di atas cukup untuk menerbitkan modul frontend terfokus atas izin Git pengguna yang sudah ada. Kandidat dibuat di worktree terpisah agar HEAD/index dan edit peer pada shared workspace tetap aman.
