# Integrasi Eksternal — modul baru Codex-3

Tanggal: 9 Oktober 2026, Asia/Jakarta. Pemilik: Software Developer Senior / Codex-3. Tiket SD3-014.

Audit awal memastikan modul hanya berlabel Coming Soon pada menu Kelola, tanpa href, rute, komponen, schema, store atau kontrak API. Inventaris source dan koordinasi sesi membedakannya dari modul yang telah dikerjakan atau sedang diambil sesi lain.

Implementasi satu flow baru: Kelola → Integrasi Eksternal, daftar kosong awal/pencarian, tambah draf, detail, edit per ID dan hapus terkonfirmasi. Draf berisi nama integrasi, URL tujuan HTTPS serta catatan opsional. Status tetap Draf; konfigurasi belum aktif dan tidak mengirim data. Tidak mengarang pilihan provider/event atau hasil koneksi. Data diisi pengguna dan tersedia selama aplikasi terbuka.

Source baru berada di `app/(no-layout)/manage/integrations/`, `components/feature/manage/integrations/`, `schema/manage/integration.ts`, `store/manageIntegrationStore.ts`, dan `types/ui/manage/integration.ts`. Hub Kelola mengaktifkan satu tautan yang sebelumnya Coming Soon; parent mendaftarkan satu child dengan header nonaktif dan header layar berada pada layout modul.

Validasi, lifetime draft/ID, callback lama, simpan/hapus/acknowledgement ganda serta navigasi diperiksa sebelum handoff. Hasil dan exact hashes akan dicatat pada [paket SD3-014](qa/codex-3/external-integrations/HANDOFF.md). Status akhir mengikuti manifest paket itu, bukan keberadaan layar semata. Koordinasi scope dicatat pada [SESSION_COORDINATION](SESSION_COORDINATION.md).

Batas: belum API, persistensi, aktivasi, autentikasi webhook atau pengiriman data ke layanan eksternal. Rancangan form draf merupakan pilihan implementasi frontend; kontrak backend dan desain layar spesifik belum tersedia. Figma callable tidak tersedia, sehingga tidak mengklaim parity. Browser/native/root auth/router serta publikasi mengikuti verifikasi dan gate tersendiri. Modul sebelumnya dan source pemilik lain tidak dipoles ulang dalam tiket ini.

Execution Profile & Operator Tips: Medium. Source baru → pemeriksaan CRUD/lifetime → kualitas terfokus → QA/QC → PM. Pertahankan semua field dan ID draf; pengembangan integrasi operasional perlu kontrak endpoint/event/auth yang disepakati.
