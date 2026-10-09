# QA indépendant — reset pencarian Tagihan Kasir

Tanggal: 2026-10-09 (Asia/Jakarta)
Keputusan: **PASS_SCOPED** untuk lifecycle reset pencarian di `BillsScreen`.

## Sumber yang dibekukan

Paket handoff Senior8 diverifikasi melalui `verify.cjs`: 37 fingerprint, 0 mismatch, sebelum dan sesudah replay. Source caller dan shared SearchBar tetap identik dengan receipt developer.

| File | SHA256 |
|---|---|
| `components/feature/cashier/bills/BillsScreen.tsx` | `2b597fe63843e8187d6c8b5d767aaa264ae01f71ecdb2f75a43969394e5f95fa` |
| `components/common/SearchBar.tsx` | `0e44eed89a277f3604d4686642448fd71a7751e586b4ebbb34a4f3b361a1476f` |
| `lib/cashier/bills.ts` | `54838d4a97338bc65c7886d6a65681d394b6c5447141a5140761dcfff9415457` |
| `constants/data/transaction/transaction.ts` | `db10e63e3066491a34f0122a0d7b531d51c8297c938faa3a49239f5ca4a24d4e` |
| `app/(cashier)/biling/index.tsx` | `40abd7ec4391d2afd86fa6da505fe125309db54048f1e6c5513e5c27799a72fc` |
| `app/(cashier)/biling/detail.tsx` | `743f9f0c75f65c338a346d93212f5e7a3ce212478fc54b21c60cbec03a54289f` |
| `app/(cashier)/biling/_layout.tsx` | `a8894a88b7f9f289076476081d29fd2ea7a89bd251422e15f3632f66b0ee0061` |
| `docs/qa/senior-8-2026-10-09/cashier-bills-resume/HANDOFF.md` | `a47e47980cc66dcdc44c5f42e8a4a04a09e2cd6d52012b5ec807ca1110f27fad` |

## Hasil perilaku

Final replay menghasilkan **20 PASS / 0 FAIL / 0 renderer error**. Runner memakai `BillsScreen` dan `SearchBar` aktual dengan React renderer serta virtual clock. React reconciliation menerapkan `key={searchResetKey}` pada SearchBar di dalam `ListHeaderComponent`; menaikkan key membuat instance input diganti, dan cleanup effect SearchBar membatalkan timer lama.

Cakupan independen: input/query sebelum 150 ms, reset pada t−1 ms, pemeriksaan ulang tepat pada deadline timer lama, query yang settle setelah 150 ms lalu reset, reset berulang, input baru sesudah reset, status `processing` ketika draft masih debounce lalu gabungan status+query, pemulihan default, unmount dengan timer tertunda, serta navigasi row ke detail dengan ID record `4`. Semua ekspektasi final lulus.

Dua percobaan harness antara yang tidak dihitung sebagai hasil final dipertahankan sebagai JSON: selector awal mengasumsikan card invoice unik padahal fixture memakai nomor invoice berulang, dan query `5` tanpa filter status memang cocok pada kedua nomor invoice. Harness diperbaiki untuk memilih record melalui urutan ID fixture dan memakai query tanpa hasil yang unik. Tidak ada perubahan source aplikasi, shared SearchBar, runner/receipt Senior8, layout, atau hasil historis; 42 regresi lama tidak dijumlahkan dengan 20 pemeriksaan baru.

## Batas

Reset me-remount input, sehingga fokus lama dilepas; keyboard dan pemulihan fokus belum diperiksa pada perangkat. Renderer ini memakai adapter presentasi/native/router dan bukan pengujian browser atau HP. Figma visual, pembayaran, backend/API, checkout, TypeScript global, bundle, dan publikasi tidak diuji atau disetujui di receipt ini. Handoff QA ini bukan QC atau persetujuan publikasi.
