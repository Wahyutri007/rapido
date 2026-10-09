# ACCOUNT-FORM-001 - draft dan penyimpanan form akun

9 Oktober 2026. **READY_FOR_QA -> QC -> PM**. Scope satu source `app/(no-layout)/(back-office)/report/accounting/accounts/modify.tsx`. Belum persetujuan independen.

Sebelumnya setiap perubahan koleksi accounts menjalankan prefill/reset sehingga draft pengguna hilang; edit ke tambah membawa nilai edit sebelumnya. Form kini memakai pola parent resolver + child ber-key seperti form jurnal existing: setiap ID/tambah memiliki lifetime sendiri, initial values merupakan snapshot saat mount. Perubahan metadata/saldo akun yang sama maupun akun lain mempertahankan draft. Berpindah ID atau kembali ke tambah membuat form baru beserta state validasi/modal baru. Akun dihapus menghapus form; jika tersedia lagi, defaults diambil dari data terbaru.

Parameter string/array pertama mengikuti pola akuntansi. ID eksplisit kosong/tidak ditemukan menampilkan state **Akun tidak ditemukan** dengan tombol **Kembali ke daftar**, tanpa auto-back maupun form yang bisa disimpan. Parameter tidak diberikan berarti tambah. Nilai ID tidak di-trim. Key create berbeda dari key edit.

Penyimpanan valid hanya sekali per lifetime form. Ref sinkron menahan dua callback async resolver yang selesai berdekatan; Simpan disabled setelah sukses. Callback yang terlambat setelah route berubah/unmount tidak memutasi store. Edit memeriksa keberadaan ID terbaru tepat sebelum menyimpan. Menutup sukses hanya back sekali; callback modal lama tidak menavigasi form baru. Validasi Zod, field/payload/default create/subclassification, update/add store dan rute kembali tetap mengikuti kontrak existing. `useWatch` menggantikan `form.watch` untuk langganan klasifikasi yang sesuai React Compiler. Tidak menambah dependency/schema/route/layout baru.

## Verifikasi

- Baseline **15 lulus/23 gagal** -> final **38/38 lulus**, React/runtime error 0.
- Screen lengkap + React StrictMode, React Hook Form/Zod resolver, Zustand/actions dan useAlertModal produksi. Kasus prefill, draft terhadap update, edit A/B/tambah, array/ID invalid, delete/restore, subclassification, validasi nama/debit, double-submit create/edit, success/back sekali, pending resolver saat route/delete/unmount.
- Field UI/Form wrapper/modal/router/RN adalah host adapter. Interaksi mengubah RHF melalui API form dan memanggil tombol screen; bukan pengujian teks input, picker, fokus, keyboard atau shared modal aktual. Resolver async produksi benar-benar berjalan; tidak mengganti hasil validasi dengan boolean fixture.
- ESLint final 0 error/warning, Biome/diff exit 0; TypeScript root screen + dependency closure 0 diagnostic. Quality awal menemukan warning `form.watch` dan urutan imports; `quality-initial.json` dipertahankan. Sesudah useWatch, compiler menemukan potensi pembacaan ref melalui handleSubmit saat render; `quality-second.json` dipertahankan. HandleSubmit kini dibuat/dipanggil saat tombol ditekan. Semua diperbaiki tanpa suppression.
- [verification.json](verification.json) memuat source/dependency/harness/runtime/artifact SHA. Manifest membandingkan token JSX form sebelum/sesudah (kecuali prop disabled dan penundaan handleSubmit pada tombol Simpan). Geometri dan copy form existing tetap; UI baru hanya state not-found memakai Wrapper/Card/Text/Button semantic. UI legacy existing tidak direfaktor atau diklaim patuh penuh.

```powershell
# Dari root aplikasi; baseline sengaja exit 1.
node docs/qa/senior-8-2026-10-09/account-form/check.cjs --baseline
node docs/qa/senior-8-2026-10-09/account-form/check.cjs
node docs/qa/senior-8-2026-10-09/account-form/quality.cjs
node docs/qa/senior-8-2026-10-09/account-form/manifest.cjs
```

QA/QC gunakan output sendiri; runner menggunakan prefix loader detail akun dengan anchor tervalidasi, tetapi source screen dimuat byte-identik. Tidak mengubah bukti historical. State fixture terisolasi, tanpa API/backend/persistensi/data pengguna. Store final dari [ACCOUNT-ID-001](../account-ids/HANDOFF.md) menjadi dependency, approval tiap delta tetap terpisah. Figma callable tidak tersedia. Tidak mengakses server/Metro/HP/browser/native, mengubah primitive/schema/source pemilik lain, menjalankan fullTS atau commit/push/merge.

Snapshot form sengaja tidak menerima refetch saat ID tetap; reopen/pergantian ID membaca data terbaru. Ini bukan conflict resolution antar pengguna atau jaminan transaksi backend. Save yang sudah selesai sebelum cleanup tidak dibatalkan. Duplicate ID historis dan validasi kebijakan bisnis tambahan tetap di luar delta.

Execution Profile & Operator Tips: Medium untuk RHF/async resolver. Cocokkan hash -> QA draft/route/validation/submit/lifetime -> QC -> PM. Uji perangkat untuk input/picker/modal/not-found; jangan menyamakan host test ini dengan sertifikasi native atau seluruh saldo awal.
