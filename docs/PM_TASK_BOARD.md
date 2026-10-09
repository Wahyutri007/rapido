# Penugasan Projek Manager

Tanggal: 9 Oktober 2026 (Asia/Jakarta). Prioritas pertama: menutup temuan QA/lint yang menahan integrasi, lalu melanjutkan fitur. Status sesi lain berasal dari catatan workspace, bukan akses langsung ke percakapan atau pengaturan model mereka.

## Pembagian aktif dan berikutnya

| Pemilik | Tugas | Model / effort | Status |
| --- | --- | --- | --- |
| Codex-3 | Prefill/draft form extra, order-type, payment-method dan tax | GPT-6.1 Sol / medium, rekomendasi | Sudah diklaim sesi tersebut; jangan ambil scope |
| Senior 4 / Codex-4 | Router utama Payroll: deep link, ID, reload, kembali | GPT-6.1 Sol / medium, rekomendasi | Sudah diklaim sesi tersebut |
| Senior 8 | Memoization katalog bundling, extra-menu, menu lalu Buku Besar | GPT-6.1 Sol / medium, rekomendasi | Sudah diklaim sesi tersebut |
| Senior 6 | SD6-001: lifecycle printer/POS | GPT-6.1 Sol / medium, rekomendasi | ACKNOWLEDGED / IN_PROGRESS pada catatan koordinasi terbaru; Promo/Voucher telah dilepas |
| Senior 7 | Lifecycle modal cetak Barcode dan picker produk | GPT-6.1 Sol / medium, rekomendasi | Sudah diklaim sesi tersebut |
| Developer bawaan PM: promo_voucher | Persiapan tiket printer/POS secara read-only | GPT-6 Luna / medium, diatur pada subagent | Selesai: [assignment](qa/pm-printer-pos-2026-10-09/ASSIGNMENT.md); tidak mengedit source |
| Pemeriksa bawaan PM: handoff_triage | Inventaris bukti handoff Codex-3 | GPT-6 Luna / low, diatur pada subagent | Selesai; laporan tersedia, bukan persetujuan QA/QC |
| QA/QC lintas sesi | Tinjau handoff Codex-3; uji perilaku, lalu review kontrak/UI/batas | GPT-6.1 Sol / medium untuk perilaku; Luna / low untuk inventaris bukti | QUEUED; belum dianggap disetujui |

Model subagent hanya dipilih dari pilihan yang tersedia pada sesi ini. Pilihan model sesi VS Code lain merupakan rekomendasi; PM belum mengubah setting mereka. Mulai dari effort yang tercantum, naikkan hanya bila ada masalah konkret yang tidak terpecahkan. Panduan: [OpenAI model selection](https://developers.openai.com/api/docs/guides/model-selection).

## Tiket SD6-001 — printer dan pengaturan POS

Scope eksklusif yang ditawarkan kepada Senior 6:

- `app/(no-layout)/manage/printer/modify.tsx`
- `app/(no-layout)/manage/pos-settings/rounding.tsx`
- `app/(no-layout)/manage/pos-settings/stock-limit.tsx`

Baca ulang SESSION_COORDINATION.md dan git diff sebelum menerima. Jika scope sudah diklaim sesi lain, laporkan benturan dan jangan mengedit. Catat acknowledgment dan IN_PROGRESS sebelum mulai. Periksa temuan `react-hooks/set-state-in-effect` pada source terbaru, bukan hanya JSON historis. Pertahankan prefill per ID, draft saat render/refetch, perpindahan edit/tambah, validasi, ID hilang, simpan dan kembali. Jangan merombak primitive, dependency atau backend. Lint terfokus wajib; uji perilaku relevan wajib ketika lifecycle berubah. Jika source sudah benar, laporkan hasil tanpa membuat perubahan buatan.

Hasil developer: ringkasan perubahan, daftar file, hash source atau commit yang diuji, perintah dan hasil pemeriksaan, regresi draft/prefill, serta batas runtime. Simpan di `docs/qa/senior-6-2026-10-09/HANDOFF.md`; status READY_FOR_QA, bukan APPROVED.

## Antrean setelah pekerjaan aktif diserahkan

Tiket berikut belum IN_PROGRESS. Pemilik harus mencatat acknowledgment dan memeriksa konflik sebelum mulai; utamakan perbaikan yang dikembalikan QA/QC dari modul sebelumnya.

| Pemilik yang dituju | Scope berikut | Model / effort yang direkomendasikan | Kriteria selesai |
| --- | --- | --- | --- |
| Codex-3 | `report/accounting/adjusting-journal/modify.tsx` dan `general-journal/modify.tsx` | GPT-6.1 Sol / medium | Perbaikan lifecycle edit tanpa kehilangan draft/baris jurnal; uji jumlah seimbang, ID hilang, perpindahan entitas |
| Senior 7 | `components/common/SingleSelect.tsx`, lalu `SortActionSheet.tsx` | GPT-6.1 Sol / high | Review semua pemanggil; uji controlled/uncontrolled, reset, pilih/batal, props berubah dan reopen; kerjakan satu primitive per batch |
| Senior 8 | `components/feature/accounting/accounts/AccountBalanceCard.tsx` setelah Buku Besar | GPT-6.1 Sol / medium | Sinkronisasi saldo eksternal tetap benar, input draft tidak hilang; uji reset dan debit/kredit |
| Codex-5 / pemilik auth | Boot/onboarding dari backlog, hanya setelah selesai integrasi SDK dan acknowledgment | GPT-6.1 Sol / high | Tiket terpisah dengan scope spesifik, uji guard/auth/tujuan mode dan regresi onboarding; jangan mulai berdasarkan baris antrean saja |

Senior 4 tetap fokus menyelesaikan paket Payroll dan temuan balik QA sebelum modul baru. Kehadiran nama sesi dalam catatan bukan bukti sesi sedang idle; antrean ini tidak memindahkan scope aktif.

## Tiket PM-DEV-001 — tanggal Promo/Voucher (dibatalkan sebagai duplikat)

Catatan baru Senior 7 menyatakan dua file Promo/Voucher milik Senior 6. Penugasan developer bawaan PM dihentikan untuk menghindari duplikasi; perubahan source orang lain tidak di-revert. Developer bawaan hanya menyiapkan tiket SD6-001 secara read-only di `docs/qa/pm-printer-pos-2026-10-09/ASSIGNMENT.md`. Pemilik Promo/Voucher tetap bertanggung jawab atas handoff QA.

Pembaruan sesudah acknowledgment SD6-001: Senior 6 menerima printer/POS dan melepaskan Promo/Voucher kepada PM; ia sedang menyelesaikan pemeriksaan/revert edit awal miliknya. **Promo/Voucher menjadi antrean PM dengan status WAITING_FOR_SOURCE_HANDOVER**, belum dikerjakan subagent. Jangan mengedit dua file tersebut sampai handover source stabil tercatat. Persiapan read-only printer/POS tetap berguna sebagai masukan Senior 6 dan tidak mengambil implementasinya.

## Aturan serah-terima dan penghematan

Developer → READY_FOR_QA → QA perilaku/regresi → QC kontrak/UI/dokumentasi → Projek Manager review → branch modul → main setelah gate lolos. Handoff developer bukan persetujuan QA/QC. Handoff Codex-3 telah tersedia di `docs/qa/codex-3/HANDOFF.md`; menunggu hasil QA/QC independen sebelum PM menyetujui publikasi baru.

Triase bukti sudah selesai: [laporan](qa/pm-handoff-triage-2026-10-09/REPORT.md). Fingerprint tes historis masih parsial dan empat form baru belum diserahkan. QA/QC perlu mengikat tes pada commit/hash source sebelum memberi persetujuan; utamakan Member dan Karyawan yang memiliki artefak lebih lengkap.

Persiapan printer/POS selesai tanpa edit source. Percobaan lint subagent tidak selesai dan dihentikan setelah 30 detik tanpa output, sehingga diagnosis terbaru belum diklaim lolos; Senior 6 menjalankan verifikasi miliknya sesuai tiket. PM tidak melakukan commit/push/merge baru pada penugasan ini.

Kirim konteks yang dibutuhkan modul saja. Batasi setiap tiket pada 2–4 file atau satu alur. Jalankan lint terfokus setiap tiket; koordinasikan satu TypeScript penuh setelah batch stabil, bukan sekaligus di setiap sesi. Jangan mengulang browser/bundle/API yang masih valid jika source terkait tidak berubah. Laporkan batas dan temuan; tidak perlu menyalin log sukses panjang. Jangan commit/push/main atau mengubah branch workspace dari developer. Pemilik mencatat hasil di handoff masing-masing; PM memperbarui board.

Execution Profile & Operator Tips: Medium untuk tiket developer karena lifecycle tanggal dan draft perlu dijaga. Batch source → verifikasi terfokus → handoff QA → QC. Auth/onboarding dan primitive bersama menunggu penugasan terpisah dengan Sol/high jika analisis menuntutnya; jangan ambil seluruh backlog sekaligus.

## Pembaruan PM - publikasi launcher dan antrean review (9 Oktober 2026)

Bagian ini memperbarui status historis di atas. Branch fix/android-usb-launcher telah dipush pada 319f112d9914f9331e9c722f478ad40ab273ae01, berbasis origin/integration/expo-sdk57 fa860c9. Commit ef3fe20 memperbaiki tema startup; 319f112 menambahkan launcher/panduan/bukti QA. Semua approvedSourceHashes dan manifest QC launcher cocok isi commit; replay PM49/49, scoped lint0, syntax/diff bersih. Remote main tetap a2e3777. Tidak ada approval integrasi seluruh aplikasi.

| Prioritas | Pemilik/antrean | Tugas berikut | Status/gate |
| --- | --- | --- | --- |
| 1 | Senior7 | Selesaikan startup/style-recheck untuk cache; serahkan manifest final dan bukti scoped quality/initializer/queue | IN_PROGRESS telah dicatat pemilik; jangan duplikasi |
| 1 | QA/QC eksternal shared modal | Recheck SD3-007 SuccessModal, SD3-008 DeleteConfirmModal, SD3-009 AlertModal beserta kontrak caller yang berubah; tutup QC-STOCK-UI-001 hanya jika source final lolos | QUEUED, belum diklaim reviewer; hasil internal bukan approval eksternal |
| 2 | QA/QC auth | Review SD5-006 registration-start (hook dan PersonalInfoAction), 429/422/retry/double press/close-reopen/unmount | QUEUED, terpisah dari provider yang sudah PASS_RECHECK |
| 2 | Pemilik Penerimaan + QA | Koreksi QC-INCOME-001/002/003, prioritaskan callback simpan/hapus stale; pastikan klaim terbaru sebelum edit | CHANGES_REQUESTED; bukan izin mengambil file milik sesi aktif |
| 3 | PM | Publikasi paket berikut berdasarkan keputusan final, hash source serta kontrak/dependency terbaru; shared modal berubah sehingga keputusan lama caller tidak otomatis cukup | Main tetap ditahan |

Gunakan effort Medium untuk recheck gaya/cache dan inventaris hash; High untuk lifecycle async lintas hook/provider/modal. Jalankan per paket, satu proses pemeriksaan berat pada satu waktu. Rekomendasi model yang sudah ada tetap berlaku; PM tidak mengubah model sesi lain. Antrean dokumen bukan klaim pesan langsung sudah diterima. Developer tidak mengambil pekerjaan review independennya sendiri.

## Pembaruan PM - branch auth terbit (9 Oktober 2026)

- fix/auth-bootstrap-lifecycle ->42a3f2f telah dipush dari basis integration/expo-sdk57. Hook login/provider/boot/guard exact hash QC, PM135pemeriksaanPASS dan lintbersih; tidak menggabungkan main.
- Senior7 startup style: READY_FOR_QC_RECHECK menurut catatan terbaru. QA/QC prioritaskan quality/hash/AST dan initializer terfokus; jangan ulang bundle atau memulai Metro tambahan untuk perbaikan gaya.
- Sharedmodal SD3-007/008/009 dan registration-start SD5-006 tetap antrean keputusan eksternal. OTP SD5-007 kini sedang dimiliki Senior5; jangan ambil scope atau menganggap approvalregistration mencakup OTP.
- Temuan Penerimaan dan gate Stock tetap sesuai keputusan terakhir. Jangan memperluas approval auth ke scope ini.
- Model sesi lain tidak diubah. EffortMedium untuk review gaya dan manifest; High untuk lifecycleauth/OTP. Gunakan bukti yang masih cocok dan uji ulang hanya cakupan yang terpengaruh.

## Pembaruan PM - onboarding/transisi terbit (9 Oktober 2026)

fix/onboarding-transition-lifecycle ->0e95b24 dipush, berbasis integration/expo-sdk57. Dua sourceSD5-001 exact hashQC; PM81PASS, lint/diffbersih, source dan bukti terverifikasi pada commit. Tiga paket publikasi lanjutan kini tersedia: launcherHP319f112, auth42a3f2f, onboarding/transisi0e95b24. Semuanya branchmodul, belum main.

Senior7 memegang koreksi warningroute QC-HP-WARNING-001 dan runtimeHP; PM tidak menduplikasi operasiHP. Senior6 memegang token/layoutBatasStok. Senior5 OTP-resend SD5-007 sudah READY_FOR_QA bersama registration-startSD5-006; bukan approvalQC. Review sharedmodal dan cache tetap menunggu keputusan final. PrioritasPM berikut: terima keputusanfinal/hash baru, cek dependencydanbukti, publikasi paket terpilih, baru integrasi ketika gatecakupan terkait lolos.

## Pembaruan PM - Barcode terbit (9 Oktober 2026)

fix/barcode-lifecycle -> 56d3e7f telah dipush, tiga source exact hash QC. PM 105 pemeriksaan lulus, lint/diff bersih; bukti historis dan keterbatasan printer/native dilampirkan. Empat paket publikasi lanjutan kini tersedia: launcher HP, auth/boot/guard, onboarding/transisi, Barcode lifecycle. Semua berbasis integration/expo-sdk57, belum digabung ke main.

Prioritas antrean tidak berubah: selesaikan recheck cache/shared modal/Stock dan review registration-start, OTP-resend, registration-form serta route warning dengan keputusan independen. Jangan menandai READY_FOR_QA sebagai lulus QC, atau approval lifecycle Barcode sebagai persetujuan cetak fisik/UI legacy.


## Publikasi berdasarkan instruksi pengguna — 9 Oktober 2026

Pengguna meminta QC mengambil alih PM, push branch sendiri lalu main. Keputusan historis di atas tidak menjadi kelulusan source baru. Lihat [laporan integrasi terkini](qa/pm-main-integration-2026-10-09/REPORT.md) untuk source yang diterbitkan, cakupan pemeriksaan dan sembilan diagnostic lint baseline yang masih terbuka. Kasir yang belum diserahkan tetap tidak ikut. Publikasi source bukan sertifikasi desain/native/produksi.
