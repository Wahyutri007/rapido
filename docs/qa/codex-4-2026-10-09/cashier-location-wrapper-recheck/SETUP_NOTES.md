# Recheck setup

Upstream Wrapper berubah dari e7917179 ke753ae276 pada finalisasi. Paket awal disegel memakai result integration yang sudah terdahulu; supplement ini mengoreksi klaim sembilan input unchanged dan mengikat tes baru pada Wrapper/BottomActionBar terkini. Sepuluh source Tempat Kasir tidak berubah. Paket awal tetap histori.

Server Metro63329 yang berjalan dalam CI tidak menemukan BottomActionBar baru pada file-map; server sendiri dimulai ulang tanpaCI untuk watcher aktif. Percobaan browser pertama pada setup recheck dimulai sebelum log Waiting on localhost8088, request bundle ERR_CONNECTION_REFUSED,0assertion dan dihentikan. Pengujian diulang setelah Metro siap. Ini kegagalan persiapan/transport, bukan error UI Tempat Kasir.
