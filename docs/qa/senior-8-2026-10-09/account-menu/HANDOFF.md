# ACCOUNT-MENU-001 - Isi Saldo Akun

9 Oktober 2026. **READY_FOR_QA -> QC -> PM**, belum persetujuan independen.

Menu **Isi Saldo Akun** sebelumnya hanya menutup panel karena parent tidak memasang callback `onFillBalance`. `accounts/index.tsx` kini menghubungkannya ke handler edit existing sehingga membuka form akun terpilih yang sudah menyediakan debit/kredit. Placeholder pencarian dikoreksi menjadi **Cari akun...**, unused imports dihapus dan import/format dirapikan.

Review source: AccountActionSheet memanggil onClose lalu onFillBalance dengan account yang dipilih; handler parent memakai ID tersebut menuju `/report/accounting/accounts/modify?id=...`. Callback Edit/Detail/Reset/Hapus, pencarian/filter, mutasi saldo dan copy lain tidak berubah. Form/primitive/store tidak diedit.

ESLint, Biome dan diff-check satu source exit 0, focused TypeScript root screen + dependency closure 0 diagnostic, output [quality.json](quality.json). Hash source, kontrak baca dan artefak ada di [verification.json](verification.json). Untuk delta wiring/copy kecil ini verifikasi melalui review source dan pemeriksaan statis; tidak mengklaim tes interaksi native/browser baru. QA diminta membuka menu akun A/B -> Isi Saldo -> pastikan ID/prefill tepat, batal kembali, lalu uji Edit/Detail/Reset/Hapus tidak berubah.

```powershell
node docs/qa/senior-8-2026-10-09/account-menu/quality.cjs
node docs/qa/senior-8-2026-10-09/account-menu/manifest.cjs
```

Jalankan dari root aplikasi; QA/QC menulis output sendiri. Tidak ada dependency/schema/route baru, perubahan geometri, API/backend/data pengguna, server/HP/Metro/fullTS/branch/index/commit/push. Figma callable tidak tersedia, tanpa klaim parity. Existing form tetap menampilkan field akun lain bersama saldo; patch ini tidak menambahkan auto-focus/scroll ke debit. UI legacy existing tetap di luar delta.

Execution Profile & Operator Tips: Low untuk callback existing. Review ID tujuan -> QA perangkat -> QC -> PM. Pakai fixture akun berbeda untuk membedakan navigation benar dari sekadar menutup sheet.
