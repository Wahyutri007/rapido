# Senior 8 — ID entri Buku Besar

Dependency screen berubah sesudah paket ini dalam [LEDGER-IDENTITY-001](../ledger-identity/HANDOFF.md). Store tidak berubah pada batch tersebut. Manifest dan 62 assertion di bawah tetap bukti snapshot saat serah-terima ID; persetujuan screen/ID harus dinilai menurut hash masing-masing.

9 Oktober 2026, Asia/Jakarta. **LEDGER-ID-001 READY_FOR_QA**. Perbaikan lanjutan atas temuan benturan ID yang dicatat pada batch filter Buku Besar. Belum mendapat persetujuan QA/QC atau izin publikasi.

## Scope dan perubahan

Hanya alokasi ID `addLedgerEntry` pada `store/accountingStore.ts`. ID pertama tetap `le-{timestamp}`. Bila sudah dipakai pada koleksi akun mana pun, dipilih suffix kosong berikutnya (`-1`, `-2`, ...). Pola ini mengikuti perlindungan benturan yang sudah tersedia pada Expense/Income. Record yang sudah ada, payload baru, urutan newest-first, ID return, getter dan notifikasi store dipertahankan.

Pemeriksaan AST/source membuktikan seluruh isi store di luar initializer action tersebut identik dengan snapshot sebelum patch. Jurnal Umum/Penyesuaian/Penutup, Saldo, Expense/Income, metadata/total akun serta source layar tidak diubah. Tidak menambah dependency, persistensi atau API.

## Bukti developer

| Pemeriksaan | Sebelum | Sesudah |
| --- | --- | --- |
| Store Zustand produksi dengan jam tetap | 13 lolos / 9 gagal | 22/22 lolos |
| Layar Buku Besar lengkap + store produksi dengan jam tetap | 37 lolos / 3 gagal; 22 diagnostic React duplicate key | 40/40 lolos; runtime/React error 0 |
| ESLint store | — | 0 error/warning, exit 0 |
| Biome store dan diff-check | — | Bersih |
| TypeScript store + detail Buku Besar beserta dependency closure | — | 0 diagnostic |

Total final 62 assertion, mencakup regresi yang berulang antar lapisan. Skenario meliputi benturan pada akun yang sama/berbeda, suffix yang sudah terisi/berlubang, jam mundur, input tidak dimutasi, 50 penambahan beruntun, subscriber yang memicu penambahan berikutnya, serta 10 penambahan pada layar tanpa workaround kenaikan milidetik. Daftar mempertahankan ID return dan seluruh record; pencarian/jenis/periode dan total tetap benar.

Sinyal batch store 22/22 sudah dicatat sebelum melanjutkan integrasi. Paket final ini melengkapi sinyal tersebut. Snapshot sebelum patch tersedia di `accountingStore.before.ts.txt`; seluruh hash source, dependency produksi, harness, bukti baseline/final dan hasil tipe tercatat pada `verification.json`. Bukti filter lama dipertahankan; dependency store-nya berubah melalui batch ini sehingga recheck memakai manifest final baru.

## Menjalankan ulang

Dari root aplikasi:

```text
node docs/qa/senior-8-2026-10-09/ledger-ids/store-check.cjs --baseline
node docs/qa/senior-8-2026-10-09/ledger-ids/store-check.cjs
node docs/qa/senior-8-2026-10-09/ledger-ids/integration.cjs --baseline
node docs/qa/senior-8-2026-10-09/ledger-ids/integration.cjs
node docs/qa/senior-8-2026-10-09/ledger-ids/typecheck.cjs
node docs/qa/senior-8-2026-10-09/ledger-ids/manifest.cjs
```

Baseline sengaja exit 1 untuk menunjukkan regresi. `integration.cjs` menggunakan harness `../ledger-filters/check.cjs`, mengganti jam fixture menjadi tetap dan sumber baseline menjadi store lama, serta menambahkan assertion burst. Ia tidak mentransformasi source produksi atau menimpa hasil historis. Output diarahkan ke direktori paket ini. Harness reuse dan native/test renderer existing di `.expo/senior7-test-tools/` ikut tercatat dalam konteks pengujian; tidak ada instalasi.

## Batas dan serah-terima

Tes memakai proses terisolasi, fixture state lokal, dan komponen native/presentation yang diadaptasi menjadi host. Tidak mengakses database/API/data pengguna atau mengendalikan Metro/HP. Bukan pengujian keyboard/geometri/native/Figma atau full-project gate. Saat audit, tidak ditemukan pemanggil `addLedgerEntry` pada alur UI selain konsumen koleksi; batch ini menjamin action/store, bukan menambahkan alur posting jurnal. Format tanggal/filter tidak diubah.

Keunikan dijamin terhadap ID yang sedang ada dalam store lokal; bukan keunikan global lintas perangkat atau penggabungan database. ID duplikat historis tidak dimigrasikan. Action pembuat entitas akuntansi lain masih memiliki kontrak tersendiri dan tidak ikut diperbaiki.

QA diminta mencocokkan hash dan mengulang kasus benturan/store + layar. QC meninjau isolasi satu action, kompatibilitas format/payload, hasil integrasi dan batas di atas sebelum menyatakan temuan ditutup. PM tetap pemilik gate integrasi/publikasi. Tidak ada commit/push/merge dari batch developer ini; sinyal melalui workspace tidak membuktikan penerima percakapan lain telah membacanya.
