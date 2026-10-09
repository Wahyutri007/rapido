# SD3-007 / QC-STOCK-UI-001 - READY_FOR_QC_RECHECK

Pemilik **Codex-3** (`D:/Codex-3`), 9 Oktober 2026, Asia/Jakarta. Pengguna meminta melanjutkan modul. Koreksi satu shared component yang dipakai Role/Karyawan/Member diklaim pada koordinasi setelah diff kosong dan tidak ada klaim implementasi aktif lain. PM memegang gate akhir/publikasi. **QC-STOCK-UI-001 P2 tetap OPEN** sampai keputusan recheck independen; ini bukti developer, bukan approval QC.

Modal sukses kini membatasi ilustrasi ke tinggi 176 px dan lebar 100%, sesuai niat h-44/w-full existing. Lebar container mengikuti `useWindowDimensions().width - 32` dengan batas maksimum 380 px; modal juga menyesuaikan saat area aplikasi berubah tanpa pergantian props. Sebelumnya Image RN-web memakai ukuran intrinsik 560 px sehingga tombol keluar viewport 320x640; lebar memakai `Dimensions.get("screen")` yang dapat berbeda dari area window. Public props, callback, copy, style lain dan hierarchy tetap.

| Source | SHA-256 |
| --- | --- |
| [SuccessModal.tsx](../../../../components/common/SuccessModal.tsx) final | `f90eec3d8d4b95ad5a5b1b6ff7cc354e9097fe5d232eef4c0d020ebb61f4e495` |
| [Baseline sebelum koreksi](SuccessModal.before.tsx.txt), cocok keputusan QC | `72b29fd049201dad355733885cf0f7f310b0983549337adbe0e653dd820f8745` |
| [Interim Image-only](image-only/SuccessModal.tsx.txt), persis proposal QC | `501c13d445c0283aa93deff8f71bdf9f889b24b9e76afef81f4f9ea3822ce95f` |

Final berbeda dari proposal satu prop karena pemeriksaan pemakai tambahan menemukan overflow lebar saat initial window320/screen360. Interim Image-only replay stok 36/36 lolos, tetapi shared preview 47/48: modal pertama width328/x-4. Bukti dan screenshot disimpan di image-only/, tidak dihapus atau dihitung sebagai hasil source final. Driver final mempertahankan initial window320/screen360 untuk memastikan koreksi lebar, menggunakan gambar Kategori dari caller custom aktual, dan menambah resize saat modal masih terbuka.

## Hasil developer pada source final

| Pemeriksaan | Hasil |
| --- | --- |
| Reproduksi browser stok pada source baseline | 35 lolos / 1 gagal, tombol di luar viewport |
| Replay browser stok pada source final | **36 lolos / 0 gagal** |
| Shared modal/varian pemakai/resize browser final | **51 lolos / 0 gagal** |
| Regresi tiga dialog Kelola, source tetap/dependency modal baru | **156 lolos / 0 gagal** |
| Total eksekusi assertion final, termasuk cakupan berulang | **243 lolos / 0 gagal** |
| Browser runtime/console error, lifecycle runtime/React/act error | 0 |
| HTTP API nyata | 0 |
| ESLint satu source, no-cache/max-warnings 0 | 0 error / 0 warning |
| Biome check dan diff-check scoped | Exit 0 |
| TypeScript satu root + imported dependency closure/opsi/deklarasi proyek asli | 0 diagnostic |
| AST seluruh source setelah normalisasi empat perubahan geometri | Public props/callback/copy/remaining JSX tetap |

[callers.json](callers.json) mencatat **88 pemakaian pada 88 file** dan hash/JSX props saat audit: 74 openState, 14 isOpen, lima onButtonPress, satu image override Kategori dan satu message/confirmText Absensi. Tidak mengubah caller. Audit menemukan hanya aset Kategori yang mengganti gambar; sumber menggunakan `resizeMode="contain"` dan tetap demikian. Ini inventaris kontrak seluruh caller, bukan menjalankan 88 layar atau sertifikasi seluruh fiturnya.

Browser tambahan memakai React/RN-web, shared SuccessModal/modal/button/Text/provider/font produksi, tiga DeleteDialog dan hook/factory/QueryClient produksi dengan Axios browser-local fixture. Periksa 320/360/390/768, title/description panjang, React-node description, message/confirmText fallback, isOpen legacy, openState, custom image/action, hideCloseButton dan resize modal yang masih terbuka tanpa props berubah. Tombol terlihat utuh dan close/notifikasi sekali; tiga domain mengirim hanya DELETE fixture. Screenshot ditinjau: [Role 320](role-320.png), [Karyawan 320](worker-320.png), [Member 320](member-320.png), [Kategori custom 320](custom-320.png), [Stok 320](stock-final/success-resize-320.png).

Replay Stock memakai salinan runner QC asli dengan hanya output location dan owned fixture-entry URL diubah; scenario/assertion body sama, source stock-limit read-only. Own fixture menghapus cabang candidate agar selalu memuat aplikasi aktual. Baseline/final/hasil interim dipisahkan. Tidak menjalankan prepare/proposal QC atau menimpa output QC. Entry hanya browser-local transport, tanpa request backend atau token pengguna.

Regresi 156 menggunakan salinan runner SD3-006 di delete-lifecycle/. Satu adaptasi host menambah `useWindowDimensions` 360/800, scenario/assertion tidak diubah. Browser resize menggunakan hook RN-web nyata. Source tiga dialog tetap hash SD3-006 dan callback/API/cache/guard diuji kembali; hasil baru mencatat dependency SuccessModal final. Paket SD3-006 asli tetap frozen READY_FOR_QA sebelum perubahan dependency; manifestnya sengaja menyimpan hash shared lama. Gunakan supplement ini untuk dependency/replay terbaru, tanpa retrofit bukti lama.

## Ulang dan serah terima

Jalankan dari root aplikasi. Node `D:/laragon/bin/node.exe`, Playwright existing `.expo/senior6-tools/node_modules`, renderer existing `.expo/senior7-test-tools/node_modules`, Edge existing. Tanpa instalasi. Browser menggunakan Metro8088 PID9200 existing untuk dua entry fixture milik Codex-3; server/config/HP tidak diubah atau direstart.

```powershell
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/success-modal-size/stock-browser.cjs
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/success-modal-size/modal-browser.cjs
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/success-modal-size/replay-delete.cjs
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/success-modal-size/quality.cjs
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/success-modal-size/verify.cjs
```

QA/QC menyalin runner ke output sendiri dan menyesuaikan output fixture URL; jangan menimpa packet developer final. Dua entry ada di .expo/codex-3-success-stock-entry.jsx dan .expo/codex-3-success-modal-entry.jsx, salinan portable di packet. Jangan menjalankan prepare.cjs lagi: baseline sudah dibekukan. Flag --baseline hanya mengalihkan output stock-browser, tidak mengganti source yang dibundle; reproduksi awal dilakukan sebelum source diedit dan hash awal tercatat. QA/QC perlu menilai final hash, initial viewport vs screen serta open-modal resize, lalu memutuskan temuan. Developer tidak menandai P2 CLOSED. QC-STOCK-UI-002 token layar stok tetap Senior6, temuan Income/Supplier/auth/boot/runtime/HP tetap scope pemilik lain.

## Batas dan Execution Profile & Operator Tips

Ini delta geometri shared dan fixture browser/React, bukan akses Figma/native/root auth/SSR/keyboard/semua modal atau 88 layar. Viewport terkecil yang diuji 320x640; isi arbitrary lebih panjang/zoom/font accessibility belum disertifikasi. Tool Figma callable tidak tersedia pada profil sesi ini. Tidak mengubah callback/public props/token lama atau menyatakan semua styling legacy sudah patuh AGENTS_UI. API/backend/data pengguna/native server/HP/dependency/Git/branch/index/commit/push/merge/PDF snapshot tidak disentuh.

Effort **Medium** untuk ukuran ilustrasi, window-vs-screen dan resize. Urutan hash/baseline -> source aktual -> browser/stok/representatif shared + regresi156 -> scoped quality -> QC recheck -> gate PM. Gunakan manifest baru dan pertahankan histori; screenshot memakai data contoh, belum screenshot HP pengguna. Semua proses browser/test Codex-3 selesai, server sesi lain dipertahankan.
