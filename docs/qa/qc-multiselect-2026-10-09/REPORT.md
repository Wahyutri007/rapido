# QC MultiSelect lifecycle

9 Oktober 2026, Asia/Jakarta. **QC-MULTISELECT-20261009-PASS-DELTA**. Komponen final `0afa7aa7faa366fed7bbac063db6aec695a76f1b4aba72193454ec10ad6fbdc1` lulus QA perilaku dan QC kontrak terfokus: **93 pemeriksaan**, tanpa error runtime/React/act yang tidak diharapkan. Persetujuan ini untuk perubahan satu komponen; PM tetap memegang gate integrasi dan publikasi.

## Perubahan yang disahkan

Saat `selectedValues` berubah isinya, draft panel mengikuti nilai baru sebelum child dirender, sehingga Selesai tidak mengembalikan pilihan lama sesudah reset/setValue. Array baru yang berisi nilai dan urutan sama mempertahankan draft. Updater fungsional pada toggle individual/Pilih Semua membaca pilihan terakhir dalam batch, sehingga toggle berulang dapat dibalik dan kombinasi pilihan tidak menggandakan ID.

Props/item type publik dan seluruh returned JSX sama persis dengan baseline `c6d6cb13...`. Diff hanya perubahan logika state/callback, 19 baris tambah/14 hapus. Routing/style lama tidak berubah. Perubahan ini tidak menyatakan seluruh styling existing telah sesuai AGENTS_UI atau Figma.

## Bukti uji

| Pemeriksaan | Hasil |
| --- | --- |
| Rerun lifecycle StrictMode developer pada source final, artefak QC terpisah | 28/28 |
| Rerun Controller/useForm react-hook-form developer | 15/15 |
| Integrasi independen QC: kontrak AST/caller, dua field RHF, SearchBar dan form Target Penjualan produksi | 50/50 |
| ESLint satu source | 0 error/warning |
| Biome check satu source | Lulus, tanpa perubahan source |
| Scoped git diff --check | Lulus; notice konversi LF/CRLF saja |
| Fingerprint source/caller/dependency/harness/handoff | 30 cocok dan stabil sebelum/sesudah QC |

Suite QC menjalankan MultiSelect, SearchBar, SalesTargetForm, lib/manage/sales-target, schema/manage/sales-target dan constants/data/manage/sales-target produksi; React/test-renderer19.2.3 terpasang serta RHF Controller/useForm/useFieldArray/useWatch produksi memakai instance React yang sama. Resolver Zod terpasang dimuat; final submit/validasi domain tidak diuji dalam paket ini. Native/UI/Form control/store-save/formatter diadaptasi, bukan pengujian seluruh layar pada HP/browser.

Integrasi dua field memastikan draft kedua picker terpisah, perubahan field pertama tidak menimpa field kedua, callback terbaru dipakai, reset dengan nilai berubah memenangkan draft, dan Selesai setelah reset tidak membuat form dirty kembali. SearchBar produksi diuji melalui onChangeText InputField: pencarian description mengabaikan kapital, Batal/Selesai membersihkan input, hasil kosong tidak menghapus pilihan tersembunyi. Reorder nilai, refetch opsi kosong, pemuatan opsi kembali, pill langsung, serta ID delimiter/quote/newline tetap sesuai kontrak.

Integrasi Target Penjualan menguji bulk choice pada caller sebenarnya dengan RHF field array. Draft tetap setelah edit nama yang menyebabkan caller membuat array baru. Selesai mempertahankan kuantitas/nominal baris yang masih dipilih dan hanya memberi defaults untuk baris baru; Batal mempertahankan baris committed. Reset mengganti draft terbuka. Perubahan produk→kategori dan toko mengosongkan pilihan lama, memakai daftar pilihan scope baru, mempertahankan amount kategori yang masih dipilih serta quantity=null. Pilihan kosong mempertahankan satu baris kosong sesuai caller. Operasi picker tidak memanggil Simpan Target/store-save.

Artefak [independent-results.json](independent-results.json), [caller-contract.json](caller-contract.json), [lifecycle-results.json](lifecycle-results.json), [integration-results.json](integration-results.json), [quality-results.json](quality-results.json), [snapshot-before.json](snapshot-before.json)/[snapshot-after.json](snapshot-after.json) dan [DECISION.json](DECISION.json). Harness developer serta hasil historis/baseline tidak ditulis ulang; output diarahkan ke folder QC saat runtime saja.

## Kontrak pemanggil

Sembilan caller/sebelas penggunaan ditemukan pada manifest dan pencarian repo, seluruh hash cocok handoff:

| Caller | Jumlah |
| --- | --- |
| Katalog Voucher | 1 |
| Katalog Extra Menu | 1 |
| Katalog Promo: toko/hari | 2 |
| Katalog Pembayaran | 1 |
| Katalog Tipe Pesanan | 1 |
| Katalog Menu: tipe/tambahan | 2 |
| Katalog Diskon | 1 |
| Katalog Bundling | 1 |
| SalesTargetForm | 1 |

Caller memakai Controller/field.onChange, watch/setValue, atau rows/replace. Sembilan caller diaudit statis; SalesTargetForm dieksekusi dalam integrasi QC, delapan layar katalog tidak dinyatakan lulus full-screen dari tes ini. Hasil TypeScript developer untuk MultiSelect+sembilan caller/dependency closure0diagnostic dan stabil dicocokkan hash bukti; tidak dijalankan ulang atau disebut full TypeScript.

ID committed yang belum tersedia dalam items tetap dipertahankan untuk refetch sementara, sesuai handoff. Picker mengelola draft berdasarkan isi/urutan `selectedValues`; reset ke isi/urutan sama tidak membawa sinyal baru sehingga sama dengan rerender ekuivalen dan menjaga draft. Pergantian identitas editor tanpa perubahan value atau unmount merupakan tanggung jawab caller, bukan capability baru API ini. Pencarian/Pilih Semua hanya mengubah opsi yang terlihat dan menjaga pilihan tersembunyi. Batal/backdrop membuang draft; hapus pill mengirim value langsung.

## Batas dan serah terima

Tidak ada temuan penghambat baru pada delta dan kontrak yang diuji. Persetujuan tidak mencakup native/gesture/animasi/focus/aksesibilitas, frame browser, full routes/API/backend/auth/persistensi, final Simpan Target, validitas/ownership semua ID domain, Figma atau seluruh aplikasi. TypeScript/lint integrasi aplikasi final tetap gate PM.

Paket startup cache/alert kuning sebelumnya masih **CHANGES_REQUESTED**, bukan ditutup oleh keputusan MultiSelect. Report ini tidak memberikan persetujuan Metro/dependency/runtime HP. Form Kelola, Member, Jurnal, Ledger, Role/Karyawan, SD5 dan SD6 memiliki paket/sesi terpisah.

Source aplikasi/caller/dependency/backend/harness developer tidak diedit; tidak ada Metro/bundle, operasi server/HP, mutation HTTP, clear data, commit/push/merge/ubah branch atau index. Sinyal untuk PM dicatat melalui SESSION_COORDINATION, tanpa klaim percakapan lain telah menerima pesan langsung.

Execution Profile & Operator Tips: Medium. Delta ini selesai → PM memeriksa integrasi pada hash final sebelum publikasi. Gunakan bukti reset/refetch/batch dan batas adapter; jangan memperluas approval ke startup/native atau caller yang masih berubah di sesi lain.
