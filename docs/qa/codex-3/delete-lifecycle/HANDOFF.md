# SD3-006 Dialog hapus Role/Karyawan/Member - READY_FOR_QA

Pemilik **Codex-3** (`D:/Codex-3`), 9 Oktober 2026, Asia/Jakarta. Instruksi pengguna: lanjutkan modul, sinkron dengan sesi lain dan laporkan QA/QC. SD3-006 adalah label kelanjutan developer, bukan tiket PM baru. Status developer **READY_FOR_QA**, belum approval QA/QC atau publikasi; PM memegang gate akhir. Sinyal melalui workspace bersama.

Konfirmasi hapus sebelumnya hanya memakai `request.isLoading` dari render sehingga dua callback pada tick yang sama mengirim dua DELETE. Permintaan/callback lama juga dapat menutup dialog target baru, membuka modal lama atau memanggil navigasi berulang. Tiga dialog kini mempunyai lifetime per ID, lock ref sebelum await, guard mounted/visibilitas/ID valid dan penanda sukses. Hasil instance lama tidak mengubah modal/parent baru; penutupan sukses hanya memanggil `onDeleted` sekali. Rerender ID yang sama menjaga request aktif; kegagalan melepas lock untuk retry. Modal, copy, geometri dan endpoint existing dipertahankan.

| Source delta | Snapshot awal |
| --- | --- |
| [RoleDeleteDialog.tsx](../../../../components/feature/manage/roles/RoleDeleteDialog.tsx) | [role.before.tsx.txt](role.before.tsx.txt) |
| [WorkerDeleteDialog.tsx](../../../../components/feature/manage/workers/WorkerDeleteDialog.tsx) | [worker.before.tsx.txt](worker.before.tsx.txt) |
| [MemberDeleteDialog.tsx](../../../../components/feature/manage/member/MemberDeleteDialog.tsx) | [member.before.tsx.txt](member.before.tsx.txt) |

Hash mentah final/snapshot/hasil serta kontrak baca ada di [verification.json](verification.json). Editor Role/Karyawan/Member yang telah QC PASS, route/layout/API/hooks/schema/backend/shared primitive/dependency tidak diubah pada delta ini. Hash tiga dialog dalam inventaris utama lama menjadi histori; supplement ini adalah acuan baru.

| Pemeriksaan developer | Hasil |
| --- | --- |
| Baseline pada tiga snapshot awal, harness yang sama | 66 lolos / 90 gagal |
| Final tiga dialog produksi, React StrictMode | **156 lolos / 0 gagal** |
| Runtime/React/act error | 0 |
| ESLint tiga source, no-cache/max-warnings 0 | 0 error / 0 warning |
| Biome check dan diff-check scoped | Exit 0 |
| Returned JSX terhadap snapshot | Sama kecuali guard isi callback sukses; wrapper baru memberi key per ID |
| TypeScript tiga root + imported dependency closure, opsi/deklarasi proyek asli | 0 diagnostic |

[check.cjs](check.cjs) memuat 16 modul produksi: tiga dialog, tiga modal bersama, `useAlertModal`, tiga hook domain, factory, Common API, `usePostRequest`, error mapper, `roleName` dan Colors. React/TanStack Query/QueryClient/Axios asli digunakan. Modal/button/RN/Text/icon/gambar memakai host presentation adapter; transport Axios memakai promise fixture dan client fixture tanpa auth interceptor. Parent hanya state dialog/target dan provider, bukan list/detail/router produksi. Tidak ada HTTP, DELETE backend atau data pengguna yang disentuh.

Kasus mencakup dua callback sebelum render, endpoint DELETE/encoding ID, invalidasi cache list/detail serta workers setelah hapus Role, success/error/loading, ID null/kosong, konfirmasi tersembunyi dan callback cached setelah dismissal/sukses, kegagalan jaringan/403/body tidak sukses serta retry melalui tombol AlertModal produksi. Pergantian A -> B, null, unmount dan A -> B -> A dengan completion terbalik menjaga dialog/navigasi target terbaru; modal sukses/error yang telah terbuka direset saat ID berubah. Same-ID refetch menjaga pending. Callback `onDeleted` sebelum sukses/setelah unmount dan close sukses berulang ditahan. Konfirmasi request melewati tombol DeleteConfirmModal produksi; close sukses ganda melewati tombol Tutup dan ikon X SuccessModal produksi. Kasus callback tersembunyi/cached juga memanggil props handler untuk mensimulasikan event antrean. Interaksi touch/keyboard native belum diuji.

Persiapan awal harness menggunakan gcTime 0 sehingga cache fixture tanpa observer hilang sebelum assertion; diganti Infinity dan selalu dibersihkan pada unmount. Ini koreksi fixture, bukan error aplikasi. Baseline/final yang dilaporkan berasal dari harness final dan tersimpan lengkap. Tidak menjalankan ulang bukti browser/Laravel/Figma lama pada hash baru.

Saat dispatch melalui tombol diperketat, baseline menutup konfirmasi target baru akibat hasil lama sehingga sembilan dispatch lanjutan tidak menemukan tombol. Driver memakai props callback hanya untuk meneruskan regresi pada state baseline yang sudah gagal; sembilan fallback dicatat. Pada source final **fallback 0**, seluruh dispatch request aktif melalui tombol modal produksi. Jumlah assertion tetap 156; mode baseline/final memakai driver yang sama.

## Cara QA/QC mengulang

Jalankan dari root aplikasi. Node tersedia di `D:/laragon/bin/node.exe`; renderer/React test tools existing berada di `.expo/senior7-test-tools/node_modules`, digunakan read-only tanpa instalasi.

```powershell
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/delete-lifecycle/check.cjs
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/delete-lifecycle/quality.cjs
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/delete-lifecycle/typecheck.cjs
& 'D:/laragon/bin/node.exe' docs/qa/codex-3/delete-lifecycle/verify.cjs
```

Reviewer menyalin runner ke output sendiri atau mengalihkan `__dirname` output sebelum replay agar hasil developer final tetap utuh. Flag `--baseline` hanya menjalankan snapshot awal, bukan source final. Jangan menganggap hasil fixture sebagai izin hapus data nyata. QA memeriksa perilaku per target/retry/navigasi sekali; QC mengaudit hash/kontrak/UI/dokumentasi dan memberi keputusan sendiri. Artefak final dibekukan setelah sinyal READY_FOR_QA pada koordinasi.

## Batas dan Execution Profile & Operator Tips

Perubahan melindungi lifetime UI/current instance; permintaan DELETE yang sudah dikirim tidak dibatalkan. Invalidation hook existing tetap berjalan untuk request sukses yang selesai setelah dialog ditinggalkan. Lock lokal tidak menjamin exactly-once lintas remount/perangkat; backend idempotensi/auth/cache refetch/navigator lengkap/native/SSR/aksesibilitas/Figma/full app belum disertifikasi. Tool Figma callable tidak tersedia pada profil sesi saat pengecekan ini. Hasil sukses yang selesai setelah dialog ditutup tetap dapat memberi notice jika target/instance masih sama; menutup dialog tidak membatalkan operasi yang sudah dikonfirmasi.

Koordinasi terbaru memuat [QC-STOCK-UI-001 P2](../../qc-stock-ui-2026-10-09/REPORT.md) OPEN pada shared SuccessModal: gambar intrinsik menyebabkan tombol keluar viewport 320x640. Dependency ini juga dipakai tiga dialog; persetujuan lifecycle tidak menyatakan modal responsif. Source/proposal shared tersebut tetap pemilik SuccessModal/PM, tanpa mengambil perubahan sesi lain; perlu keputusan/recheck visual terpisah. QC-STOCK-UI-002 di layar stok berada di scope lain.

Effort **Medium** untuk state modal terkontrol dan lifetime async. Urutan baseline -> tiga dialog -> scoped checks -> QA perilaku -> QC kontrak/UI -> gate PM. Gunakan supplement/hash baru, pertahankan screenshot/API historis serta paket editor/Bantuan/Jurnal yang telah QC PASS; jangan restart Metro/server/HP, memasang dependency atau melakukan full-project typecheck paralel. Launcher HP, runtime, stok dan modul sesi lain tetap pemilik masing-masing. Tidak ada commit/push/merge/branch/index atau proses/server baru pada pengerjaan ini.
