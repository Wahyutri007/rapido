# Preview Tampilan Struk

Implementasi UI ditinjau pada 8 Oktober 2026 (Asia/Jakarta).

- [Daftar struk toko](list.png)
- [Hasil pencarian kosong](empty.png)
- [Pengaturan default](settings-default.png)
- [Pratinjau dengan draft footer dan alamat disembunyikan](preview-draft.png)
- [Pengaturan pada lebar 320 px](settings-narrow.png)
- [Hasil 15 pemeriksaan interaksi](results.json)

Screenshot diambil dari komponen layar sebenarnya melalui harness web lokal. Harness memasok parameter route dan mensimulasikan stack navigasi; autentikasi serta navigator penuh tidak diuji oleh harness ini. Header produksi tetap diletakkan di `app/(no-layout)/manage/receipt/_layout.tsx`.

Pemeriksaan meliputi pencarian, 12 toggle, warna toggle web, penghitung perubahan, preview draft tanpa menyimpan, kembali dengan draft utuh, simpan/restore per toko, isolasi toko kedua, validasi footer, reset, layout 320 px, menu aksi, dan ID toko tidak valid. Runtime exception: 0. TypeScript seluruh proyek, ESLint, dan Biome untuk 10 file fitur lolos.

Untuk menjalankan ulang dari root aplikasi, mulai `node node_modules/expo/bin/cli start --port 8090 --offline --max-workers 1`, kemudian `node .expo/receipt-preview-check.cjs` di terminal lain. Harness/script berada di `.expo/` sebagai artefak lokal yang diabaikan Git; screenshot dan hasil verifikasi disimpan dalam dokumentasi ini. Script memakai Playwright yang sudah tersedia pada folder sementara verifikasi workspace. Port dapat diatur melalui `RECEIPT_PREVIEW_PORT`.

Referensi: [daftar toko](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-28831), [pengaturan](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-19070), [keadaan diubah](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-19205), dan [struk lengkap](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=1-21182). Implementasi berdasarkan metadata tersimpan dan token proyek karena batas panggilan MCP Starter menolak pembacaan screenshot/style baru. Kesamaan visual penuh dan pengujian perangkat native belum diverifikasi.

Data toko/transaksi adalah fixture desain. Pengaturan tersimpan pada state lokal selama aplikasi terbuka, tanpa API, persistensi perangkat, atau integrasi printer. Logo preview memakai ikon toko sebagai contoh; ilustrasi hero memakai aset receipt yang sudah tersedia. Nilai contoh transaksi konsisten dengan jumlah item dan komponennya.
