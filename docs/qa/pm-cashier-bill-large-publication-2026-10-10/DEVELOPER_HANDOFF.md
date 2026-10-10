# SD8-BILL-LARGE-LABEL-005 — READY_FOR_QA_QC_RECHECK

Temuan **QC-BILL-LARGE-LABEL-001** diperbaiki pada satu source `components/feature/cashier/bills/BillReferenceCard.tsx`. Sebelumnya tombol Tambah keluar dari kartu pada240×320, inset kiri/kanan24 dan bawah48 ketika teks menjadi28px/line-height40px. Snapshot sebelumnya7f6b85dc mereproduksi kegagalan dalam build yang sama.

Tombol kini dibatasi selebar area aksi, memiliki tinggi minimum34px dan dapat tumbuh sesuai label. Label dapat menyusut/membungkus. Kedua tombol memakai `animationType="none"` lokal karena wrapper animasi scale berukuran intrinsik mengabaikan batas lebar target. Haptic/handler/aksesibilitas tetap melalui shared Button. Shared Button, data, jumlah, total, callbacks, route dan komponen lain tidak diedit.

**20 kelompok RNWeb PASS,0FAIL**. Runner diadaptasi dari review QC dengan baseline baru dan assertion wajib lulus untuk seluruh enam target/glyph/callback teks besar; ini validasi developer baru, bukan approval independen.

- Geometri seluruh kartu/section/tombol dan text/style pada390/320 sama dengan source sebelum perubahan, toleransi asli0.7px. Tinggi normal34px dan lebar103/87px dipertahankan.
- Seluruh enam aksi diklik pada tujuh viewport200–844px termasuk landscape pendek/insetOS48; ID/objek/jenis aksi tepat. Keyboard Space/Enter, nama panjang, angka/tanggal tidak valid, parent modal dan data tidak berubah lulus.
- Semua enam target dan glyph lulus pada CSS28/40 untuk320×568 serta240×320 inset24/24/48. Screenshot akhir diperiksa. Ini simulasi CSS, bukan fontScale/perangkat Android asli.
- Runtime/console/network/storage effects0. TypeScript1root+4ambient/924closure0diagnostic; ESLint/Biome/diffPASS. Pembalikan tepat dua style, dua animationType dan dua kelas label menghasilkan seluruh source sebelum perubahan tanpa perbedaan lain.

Percobaan pertama hanya memperbaiki tinggi; wrapper scale masih membuat tombol keluar. `first-attempt-*` dipertahankan. Hasil akhir berasal dari build dan pengujian ulang setelah opt-out animasi lokal. [Hasil browser](browser-results.json), [kontrak source](contracts-results.json), [kualitas](quality-results.json), [teks besar](large-label-240.png), [normal390](normal-390.png).

Sumber acuan full context/screenshot resmi29:26627 sudah dibaca dari arsip unduhan QC/Senior5. Gaya normal dipertahankan; tidak mengklaim seluruh Kasir100%. Varian29:48148 masih memerlukan pemetaan alur tersendiri; tidak dibuat route atau perilaku transaksi berdasarkan tebakan.

Sinyal **QA → QC → PM**, lease satu source dilepas. QA/QC perlu memeriksa ulang temuan lama terhadap SHA baru `11cfb859cd97032064128acd1a3d465c479d75fe39a14dd4fe4f965cebdb010b`. Bukti lama tetap immutable/historis. Perangkat native/fullRouter/pembayaran/backend/publikasi belum bagian hasil ini. Tidak ada Git/Metro/HP/shared-browser/backend operation.
