# QC Jurnal Umum/Penyesuaian — 9 Oktober 2026

**QC-JOURNALS-20261009-CHANGES-REQUESTED**. Satu temuan **QC-JOURNAL-001, P2 OPEN**: indikator **Seimbang** masih tampil ketika baris bernilai negatif atau NaN, meskipun validasi Simpan menolak data tersebut. Koreksi dan hash final developer diperlukan sebelum persetujuan publikasi paket SD3-003.

Penerima: Codex-3 dan PM melalui dokumen workspace. Scope aplikasi: dua route modify Jurnal Umum/Penyesuaian dan `lib/accounting/journal-validation.ts`. Source dan seluruh bukti manifest final developer cocok pada awal review; tidak memakai hash route SD3-002 yang sudah historis.

## Hasil QA/QC

| Pemeriksaan source aplikasi saat ini | Hasil |
| --- | --- |
| Rerun validasi developer, ke output QC | 187/187 lulus |
| Rerun lifecycle developer, ke output QC | 55/55 lulus |
| Tambahan QC, StrictMode/indikator/parser/retry/payload | 37 lulus / 4 gagal |
| Total eksekusi assertion pada source saat ini | 279 lulus / 4 gagal; cakupan berulang |
| Runtime/React error | 0 |
| ESLint tiga source, max-warnings 0 | Exit 0; 0 error/warning |
| Biome check/formatter dan diff-check | Exit 0 |
| JSX editor dibandingkan baseline sebelum SD3-003 | Sama |

Rerun memakai salinan byte-identik runner developer dan bootstrap lifecycle yang telah direview. Hasil developer tidak ditimpa. Tambahan QC memakai loader yang sama dengan kasus terpisah, **StrictMode**, route/Zustand/schema produksi, serta deklarasi `parseNumber`/`formatRp` produksi yang diambil AST tanpa perubahan. Primitive/modal/router/native/calendar tetap adapter; bukan uji klik atau tampilan perangkat.

Validasi sebelum mutation bekerja: tanggal invalid, baris kurang, identitas akun kosong, nominal negatif/nonfinite dan overflow ditolak; draft/retry tetap tersedia. Tes tambahan membuktikan koreksi negatif dapat disimpan sekali dengan ID baris/draft tetap; pembatalan picker mempertahankan tanggal leap day; callback simpan yang ditangkap sebelum record dihapus tidak melakukan update; trim validasi tidak mengubah payload yang dibekukan.

## QC-JOURNAL-001 — P2, indikator balance tidak memeriksa nominal setiap baris

Lokasi: `general-journal/modify.tsx:151` dan `adjusting-journal/modify.tsx:166`, predicate `isBalanced`. Jumlah total memakai `line.debit || 0`/`line.credit || 0`, lalu indikator hanya memeriksa total finite, positif dan sama. Akibatnya NaN berubah menjadi nol pada penjumlahan, sedangkan nominal negatif dapat saling menutup hingga total positif/seimbang.

Reproduksi melalui handler input produksi, untuk kedua editor:

1. Fixture edit memiliki debit 1.500, kredit 1.000 dan baris ketiga dengan akun valid/nominal nol.
2. Masukkan `-500` pada debit baris ketiga (Jurnal Umum) atau nominal baris ketiga (Penyesuaian). Parser produksi mempertahankan tanda negatif.
3. Total debit/kredit menjadi 1.000/1.000 dan indikator menampilkan **Seimbang**. Ekspektasi QC: nominal negatif tidak boleh diberi indikator Seimbang.
4. Simpan membuka pesan negatif, tidak melakukan mutation, tidak membuka sukses dan tidak mengunci editor. Jalur simpan aman pada tes; masalahnya adalah informasi status yang bertentangan.

Reproduksi tambahan memakai fixture store dengan dua baris valid debit/kredit 1.000 dan satu baris debit NaN. Indikator tetap Seimbang karena NaN dianggap nol; Simpan menolak nominal invalid. Ini fixture state invalid, bukan klaim pengguna dapat mengetik literal NaN pada kontrol nominal.

Empat kegagalan pada [independent-results.json](independent-results.json): dua kasus × dua editor. Suite developer sudah memeriksa mutation untuk NaN/negatif, tetapi assertion badge hanya mencakup Infinity dan overflow total; karena itu 242 rerun lulus tanpa menemukan ketidaksesuaian ini. Prioritas P2 diberikan untuk status nominal yang menyesatkan; tidak ada bukti data invalid berhasil disimpan atau hilang pada kasus tersebut.

## Koreksi yang dapat ditinjau developer

[balanced-badge.patch](balanced-badge.patch) hanya menambah guard setiap baris: debit/kredit finite dan nonnegatif, kemudian mempertahankan guard total finite/positif/seimbang existing. Patch dibuat pada **salinan**, belum diterapkan ke source aplikasi.

| Verifikasi proposal, terpisah dari kelulusan aplikasi | Hasil |
| --- | --- |
| 41 kasus QC pada dua candidate source | 41/41 lulus; runtime/React error 0 |
| ESLint candidate text dengan path/config produksi | Dua source; 0 error/warning |
| Biome check dua candidate | Exit 0 |
| Git apply-check terhadap source saat review | Exit 0 |
| Pembandingan AST seluruh source | Sama kecuali initializer `isBalanced` |

Import, JSX, validator, payload, routing dan handler lainnya tetap sama dalam proposal. Lihat [proposal-verification.json](proposal-verification.json), [proposal-results.json](proposal-results.json) dan [proposal-eslint.json](proposal-eslint.json). **41 hasil proposal bukan hasil source aplikasi saat ini** dan tidak menutup temuan.

Codex-3 diminta menerapkan koreksi setelah mencocokkan hash, mengulang regression/validasi serta empat kasus badge, menjalankan scoped ESLint/Biome/diff, lalu menyerahkan manifest final. QC akan memutuskan penutupan pada hash baru. Badge tidak perlu menjalankan validasi seluruh teks/akun untuk menentukan balance; guard yang diminta terbatas pada validitas nominal.

## Batas dan keputusan PM

QA mutation/lifecycle terfokus lulus; QA/QC indikator belum lulus. **Tahan persetujuan QC publikasi paket SD3-003** sampai QC-JOURNAL-001 ditutup. Tiga hash source saat pemeriksaan tercantum pada [DECISION.json](DECISION.json); source/helper/store/dependency/handoff yang direkam stabil. Store ID patch Senior8 hanya dependency, bukan persetujuan LEDGER-ID-001.

State masih contoh Zustand tanpa API/persistensi atau posting Buku Besar. UI manual/legacy, precision/integer aman, ID baris/global, tanggal default contoh dan kalender web tetap scope terpisah. Browser/native/root-auth/SSR/aksesibilitas/geometri/Figma/full-project gate tidak disertifikasi. Akses Figma callable tidak ditemukan pada profil ini. TypeScript terfokus developer direview sebagai bukti, tidak dijalankan ulang QC/global paralel.

Source aplikasi/harness developer/backend/dependency, server/HP, branch/index, commit/push dan PDF snapshot lama tidak diubah. Sinyal melalui workspace, tanpa klaim percakapan langsung developer/PM telah menerima. Paket Role/Karyawan, Bantuan, MultiSelect, startup/boot/stok tetap memiliki gate masing-masing.
