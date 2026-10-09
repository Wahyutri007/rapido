# QC Penerimaan manual — 9 Oktober 2026

Keputusan **CHANGES_REQUESTED**. Sinyal **QC-INCOME-20261009-CHANGES-REQUESTED** untuk developer/QA/PM melalui workspace. Pemeriksaan QC selesai; tiga temuan masih **OPEN** pada source aplikasi. PM tetap pemilik integrasi dan push Git.

## Hasil

| Bukti | Lolos | Gagal | Makna |
| --- | ---: | ---: | --- |
| Integrasi independen source saat ini | 24 | 12 | 36 pemeriksaan lifecycle form/detail |
| Replay model developer pada source saat ini | 43 | 0 | Validasi dan operasi helper lokal |
| Gabungan source saat ini | 67 | 12 | Eksekusi assertion, termasuk cakupan berulang |
| Kandidat Penerimaan pada salinan | 36 | 0 | Dua koreksi belum diterapkan |
| Regresi kandidat shared form, expense-kind | 6 | 0 | Cakupan terbatas Pengeluaran |

Angka tersebut bukan persentase penyelesaian proyek. Runtime/React/act error pada suite independen dan kandidat: **0**. Kandidat lolos **42 pemeriksaan**; source aplikasi masih gagal 12.

## Temuan yang harus diperbaiki

| ID | Prioritas | Pemicu dan dampak |
| --- | --- | --- |
| QC-INCOME-001 | P2 OPEN | Callback simpan create/edit A atau validasi yang tertunda selesai setelah pindah ke B/unmount: store lokal masih bertambah atau A berubah. Empat assertion gagal. |
| QC-INCOME-002 | P2 OPEN | Konfirmasi hapus A tetap terbuka ketika ID berubah ke B. Callback konfirmasi lama setelah perpindahan, Batal, atau unmount dapat menghapus A dan menjalankan delayedBack. Tujuh assertion gagal. |
| QC-INCOME-003 | P3 OPEN | Dua tekan Simpan sebelum render berikutnya menghasilkan satu record dan modal sukses, disertai error referensi duplikat yang keliru. Satu assertion gagal. |

Langkah reproduksi dan nama assertion persis tersedia di [DECISION.json](DECISION.json) serta nilai aktual/harapan di [lifecycle-results.json](lifecycle-results.json). Temuan 003 tidak menunjukkan dua record duplikat; helper berhasil menahan record kedua.

Perilaku normal yang lolos mencakup prefill, draft pada update store dengan ID sama, transisi edit/create, blokir ID hilang/invoice, validasi, save normal berulang pada ID pertama, isolasi draft baru, dan penghapusan normal satu target.

## Usulan koreksi yang sudah diuji

[income-lifecycle.patch](income-lifecycle.patch) hanya mengubah detail Penerimaan dan shared CashEntryForm. Detail memakai child keyed per ID serta guard mounted/konfirmasi aktif. Form memakai guard sebelum dan setelah validasi, lock pending sinkron dan ref savedId. Simpan normal selanjutnya tetap memperbarui record pertama.

**Patch belum di-apply ke aplikasi.** Dua salinan kandidat ada di [proposal/detail.tsx](proposal/detail.tsx) dan [proposal/CashEntryForm.tsx](proposal/CashEntryForm.tsx). Karena shared form juga dipakai Pengeluaran, pemilik komponen/PM harus memeriksa scope itu sebelum integrasi. Enam pemeriksaan expense-kind tidak meluluskan keseluruhan fitur Pengeluaran.

ESLint source empat file dan kandidat pada konfigurasi path source: **0 error/0 warning**. Biome source/kandidat, scoped diff dan git apply --check: exit **0**. Returned JSX cocok sesudah menormalkan binding event yang sengaja diganti; ini tidak menyertifikasi visual. [quality-results.json](quality-results.json) mengikat hasil ke hash yang diuji.

## Source yang diperiksa

| File | SHA-256 |
| --- | --- |
| `app/(no-layout)/manage/income/modify.tsx` | `dab1cd74a6a464a0baf0b9151a8f6c1b94a5acb0584b3ab5d89504be3abe0f24` |
| `app/(no-layout)/manage/income/detail.tsx` | `ac2cd8fef13b500819c82ef010b2a7156dc1fe33e75dbe817a84a58fc2e273a1` |
| `components/feature/manage/income/IncomeForm.tsx` | `dd59ae110ae656c8edb93df542533f488b22c07afbd6e399028ab445e1411e3e` |
| `components/feature/accounting/CashEntryForm.tsx` | `891fbb76544f5e4b84d6dccc4c4f52d8478b4ed34eb533b3d6ed3ce4fe32ccf7` |

24 modul produksi dibaca saat suite independen berjalan. Snapshot 35 file dibuat sesudah suite awal dengan hash 24 modul yang telah dicocokkan terhadap byte yang benar-benar dimuat; seluruh 35 masih cocok saat finalisasi. Source aplikasi, kontrak/helper/store, dependency, serta bukti developer tidak diedit.

Harness memakai route, IncomeForm, CashEntryForm, Form/Input/Field/Message, DeleteConfirmModal/tombol konfirmasi produksi, RHF/Zod dan helper/Zustand produksi. Host RN/primitive/picker, router, presentasi IncomeDetail dan SuccessModal memakai adapter; sebagian validasi memakai batas promise terkendali untuk menguji hasil terlambat. Data hanya hidup dalam proses tes.

## Batas dan handoff

Tidak ada verifikasi HP/browser/Figma baru, API/backend/DB/persistensi, jurnal/saldo otomatis, atau approval seluruh aplikasi. Suite browser 25 pemeriksaan dan tipe preview lama tidak direrun; bukan bukti QC baru. Temuan UI shared SuccessModal pada paket stok tetap milik paket tersebut. Tidak mengoperasikan Metro/server/HP, mengubah dependency, menjalankan global TypeScript, atau melakukan commit/push. PDF progres sebelumnya tetap snapshot historis.

Persiapan harness pertama gagal karena path entry Zod; mode proposal awal kemudian fallback ke source asli. Bukti itu dipertahankan sebagai proposal-unprepared-results.json, dikeluarkan dari hitungan kandidat. Path diubah ke require.resolve dan mode proposal kini mewajibkan dua salinan. Detail ada di [harness-notes.json](harness-notes.json).

Developer diminta memperbaiki dua source atau memakai patch yang diuji, menjalankan lint/Biome dan TypeScript terfokus, lalu menyerahkan hash/hasil baru. Recheck harus memakai source aplikasi tanpa --proposal. Simpan salinan runner dan hasil pada folder bukti baru karena runner menulis hasil dekat script; pertahankan paket QC ini sebagai histori. Ulangi 36 pemeriksaan Penerimaan dan regresi shared form yang relevan setelah koreksi. QC menutup temuan dan memberi sinyal baru setelah source aktual lolos; PM memutuskan integrasi/publikasi.

Execution Profile & Operator Tips: Medium. Urutan recheck: koordinasi pemilik -> hash baru -> reproduksi temuan -> regresi terfokus -> quality -> keputusan QC -> gate PM. Jangan menghitung kelulusan salinan sebagai perbaikan source aplikasi.
