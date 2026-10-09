# QC shared picker — SingleSelect dan SortActionSheet

9 Oktober 2026, Asia/Jakarta. **QC-PICKERS-20261009-PASS-DELTA / PASS_DELTA_FOR_PM_REVIEW.** Tidak ditemukan temuan baru pada delta yang diperiksa. Sinyal melalui dokumen workspace, tanpa klaim pesan langsung sudah diterima sesi PM.

## Snapshot

Base lokal `acba0d92460c1af3149abc3775f09888a2943cab`, dengan source working tree berikut:

| Source | SHA-256 yang disetujui untuk review PM |
| --- | --- |
| `components/common/SingleSelect.tsx` | `c10d47b804517e209e3d39d8ff0363520cff89f5263bb836a7d22cf47219559f` |
| `components/common/SortActionSheet.tsx` | `f41a34416b06f136b8b952824c09988d758fae917cafa8a45996f8c9c56182e4` |

SingleSelect memakai handoff final `select-availability/HANDOFF.md` dan manifest supplement; hash SingleSelect pada manifest shared awal adalah histori. Sort sesuai manifest shared dan tidak berubah pada batch availability. Hash source, Form/RHF dan harness dicocokkan sebelum rerun dan stabil sesudahnya pada empat `*-snapshot.json`. BouncyPressable dibaca untuk memastikan disabled diteruskan ke AnimatedPressable.

## Hasil QA/QC

| Pemeriksaan | Assertion lolos | Jenis bukti |
| --- | ---: | --- |
| SingleSelect availability | 26 | Rerun QC atas harness developer |
| SingleSelect lifecycle | 30 | Rerun QC atas harness developer |
| Form/FormSelect/RHF produksi | 26 | Rerun QC atas harness developer |
| SortActionSheet lifecycle | 15 | Rerun QC atas harness developer |
| SearchBar + SortActionSheet + useSearch produksi | 14 | Harness integrasi tambahan QC |
| Total | **111** | 97 rerun + 14 tambahan |

Semua suite final lolos; runtime/act error 0. Rerun diarahkan ke direktori QC ini tanpa menimpa artefak developer. React 19 test renderer memakai primitive UI/native/animasi/haptic host; bukan interaksi browser/HP. Form/RHF dan tiga komponen/hook pada integrasi tambahan menjalankan source produksi.

ESLint dua source **0 error/0 warning**, Biome check dua source dan `git diff --check` bersih. Hasil TypeScript terfokus developer dibaca; QC tidak menjalankan TypeScript global tambahan. Gate snapshot akhir tetap milik PM.

Percobaan awal harness tambahan berhenti pada perbandingan array dari VM dengan array proses utama meskipun elemennya identik. Adapter QC diperbaiki dengan `Array.from`; source aplikasi tidak diubah. Hasil 14 assertion di atas berasal dari rerun final setelah koreksi harness, bukan klaim percobaan awal lulus.

## Kontrak dan pemanggil

SingleSelect mempertahankan callback/value terkontrol, mode aksi tanpa value, nilai numerik 0, draft saat rerender, reset eksternal dan timer dismiss 150ms. Saat disabled berubah ketika sheet terbuka, opsi/Selesai dinonaktifkan dan handler menolak callback; Batal tetap bisa menutup. Pilihan yang dihapus atau dinonaktifkan tidak dapat dikonfirmasi. Draft boleh ditahan sampai pilihan tersedia kembali atau diganti pengguna. Undefined tetap menutup tanpa callback.

FormSelect produksi meneruskan nilai RHF, shouldDirty/shouldValidate dan disabled. Rerun membuktikan draft/batal tidak mengubah field, callback yang ditolak tidak meminta validasi, konfirmasi menjalankan validasi serta reset saat terbuka mengganti draft. Normalisasi label legacy ke value tetap berfungsi.

Inventaris pemanggil terbaru tersedia pada `callers.json`. QC membaca penggunaan representatif pada Form, filter laporan/Income, POS dan Inventory. Dua picker tambah item Inventory memang tidak memberi value dan mengirim aksi append; kontrak placeholder setelah aksi tetap. Pembulatan memakai nilai pangkat sebagai string. Tidak mengklaim semua layar pemanggil sudah diuji runtime.

SortActionSheet diselaraskan saat pembukaan atau perubahan value eksternal; judul/rerender biasa menjaga draft. Integrasi tambahan menjalankan pemanggil SearchBar dan useSearch asli: urutan data berubah setelah Selesai, Batal/backdrop mempertahankan urutan, callback echo/reset parent diterapkan saat reopen atau saat sheet terbuka, pencarian tetap saat sort berubah, dan onSortPress khusus melewati pembukaan internal.

## Batas keputusan dan serah terima

Persetujuan mencakup delta lifecycle/availability dua source, dengan kontrak yang diuji. Animasi, fokus/keyboard, screen reader, perangkat native, navigator/API lengkap serta Figma tidak disertifikasi. Tool Figma tidak tersedia bagi QC pada pemeriksaan ini. Gaya legacy raw colors/fractional spacing tetap backlog; diff tidak menambah redesign/geometri, hanya state opacity/disabled pada pilihan dan konfirmasi.

PM dapat menilai publikasi dua hash setelah gate integrasi final. Keputusan Barcode dan SD6/POS tetap terpisah; keputusan ini tidak mengesahkan seluruh aplikasi atau push main. QC tidak mengubah source/dependency/harness developer, melakukan commit/push, atau mengendalikan server/HP. Delta CardList Senior7 berikut masih IN_PROGRESS dan tidak termasuk persetujuan ini.

## Mengulang

Dari root aplikasi:

```powershell
node docs/qa/qc-pickers-2026-10-09/rerun.cjs availability
node docs/qa/qc-pickers-2026-10-09/rerun.cjs form
node docs/qa/qc-pickers-2026-10-09/rerun.cjs single-select
node docs/qa/qc-pickers-2026-10-09/rerun.cjs sort
node docs/qa/qc-pickers-2026-10-09/search-sort-integration.cjs
```

Hasil dan fingerprint final dirangkum pada `DECISION.json`; pemeriksaan mandiri source/bukti melalui `finalize.cjs`.
