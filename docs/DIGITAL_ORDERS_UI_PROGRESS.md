# Pesanan Digital Back Office — SD6-006

Owner: Software Developer Senior 6. **READY_FOR_QA → QC → PM**, 9 Oktober 2026.

Flow baru: Kelola → Pengaturan POS → Pesanan Digital → daftar/search/filter/reset → tambah/detail/edit/hapus kanal pemesanan. Empat route pada `app/(no-layout)/manage/pos-settings/digital-orders/`, lima komponen feature, schema/type/store baru; integrasi hanya slot Pesanan Digital dan satu child headerShown:false. Header/back/fallback/fokus di layout.

Koleksi awal kosong dan diisi pengguna. Kanal selalu Draf, tersedia selama sesi aplikasi, belum aktif/terhubung marketplace/menerima pesanan/backend/persistensi. Batas tersebut tampil pada notice dan pesan simpan. Nama unik, URL HTTPS, panjang field tervalidasi RHF/Zod. ID monoton/revisi melindungi save/delete usang; per-ID editor dan mounted/claim guards menjaga draft, callback lama, unmount, cancel, simpan ganda dan acknowledgement.

[Handoff QA](qa/senior-6-2026-10-09/digital-orders/HANDOFF.md) dan [manifest](qa/senior-6-2026-10-09/digital-orders/verification.json) memuat sinyal `SD6-006-DIGITAL-ORDERS-READY-FOR-QA`. Developer65model/29browser/4quality =98 kelompok PASS pada source final, runtime/console/request eksternal0. Portrait320/390 dan landscape844: row panjang/target44px/footer/field terakhir diperiksa. Lint14/Biome12/scopedTS enam route/POS roots beserta closure/diff bersih. Dependency opt-in terbaru sesi Senior5 dipakai tanpa edit; quality sebelum perubahan tersebut tetap histori, final TypeScript mengikuti source aktual.

AGENTS/UI/context/koordinasi dibaca; callable Figma tidak tersedia pada toolset Senior6, belum parity/native/fullrouter. Build offline satu worker tanpa listener/rootconfig/NativeWind Metro plugin/server/HP; cache baru milik tugas dipindah dari C penuh ke D, bundle/config hash tercatat. Bukti awal di interim dipertahankan dan tidak dihitung ulang. Shared QC-DELETE-001 P2 tetap OPEN untuk modal panjang mendatar; modul tidak menutup defect shared. QA aktual → QC UI/kontrak → publikasi PM, belum approval independen.

Execution Profile & Operator Tips: Medium untuk CRUD/revisi/lifecycle. Kontrak → UI/rute → model/browser/kualitas → QA → QC → PM. Reuse Form/Wrapper/Card/Text/SearchBar/SingleSelect/CatalogItemCard/DetailRow/DetailBottomActions dan modal existing. Verifier default read-only, replay ke salinan/namespace reviewer; paket SD6-001—005 serta source peer dipertahankan.
