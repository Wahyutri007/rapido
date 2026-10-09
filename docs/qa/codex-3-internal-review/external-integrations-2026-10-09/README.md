# SD3-014 Integrasi Eksternal: checklist QA internal

Reviewer hanya membaca aplikasi dan menulis folder ini. Developer mengerjakan sebelas source baru; root mengerjakan satu href menu dan satu child layout serta dokumentasi. Modul ini adalah CRUD draf tujuan webhook di state sesi yang awalnya kosong. Status selalu Draf. Endpoint/catatan bukan aktivasi, koneksi provider, binding event, pengiriman data, API atau persistensi.

Checklist schema/store: nama/URL trim, HTTPS absolut valid; URL invalid, HTTP, userinfo dan fragment ditolak; catatan opsional tetap; invalid add/update tidak mutasi; ID stabil dan tidak dipakai ulang; update/delete tepat sasaran, missing ID tidak fallback, data berasal input fixture sendiri tanpa seed.

Checklist renderer: actual Form/RHF/Zod/store/routes/screens dan shared modals, with native/presentation/router adapters. Submit valid/invalid, rapid duplicate once, callback submit setelah unmount, draft tetap ketika record lain berubah, ID/edit->create reset, live store detail, empty/missing-ID state, pencarian, action sheet canonical availability, delete exact record dan acknowledgement sekali setelah recordgone. Uji label error terhadap aksi default shared Alert; seluruh copy tetap draf/sementara/tidak dikirim.

Checklist static UI: header hanya layout, shared semantic primitives, daftar menampilkan status Draf, CTA tidak menyatakan Hubungkan/Aktifkan/Kirim, source tidak memanggil transport jaringan atau persist/secret/provider/event. Root menu href/child diperiksa per hash akhir, tanpa mengambil source shared. Callable Figma tidak tersedia menurut parent; halaman baru tidak mengklaim desain webhook dari frame menu Figma.

Hanya jalankan suite setelah developer memberi stable hashes. Fingerprint actual source yang dimuat sebelum/sesudah tes, cocokkan sebelas hash dengan quality developer dan dua shared source root ketika siap. Setup failure disimpan sebagai setup, tidak dianggap bug aplikasi atau QA complete. Packet lama tetap beku, tidak install/server/HP/browser/HTTP/backend/full TS/Git mutation. Status akhir internal QA saja; QC eksternal dan PM publikasi tetap terpisah.

Execution Profile & Operator Tips: Medium untuk RHF/URL validation dan sesi keyed CRUD. Audit source -> stable signal -> schema/store/renderer terfokus -> hash/manifest -> QA/QC -> PM. Reuse hanya host adapters dari runner reviewer sebelumnya, dengan URL tersedia pada isolated VM. Jangan menjumlahkan suite lama atau mengubah shared primitive agar tes baru lewat.
