# SD3-002 Jurnal — READY_FOR_QA

Pemilik **Codex-3** (`D:/Codex-3`), 9 Oktober 2026, Asia/Jakarta. Antrean mengikuti [PM_TASK_BOARD](../../../PM_TASK_BOARD.md). Sinyal diserahkan melalui workspace: QA perilaku → QC kontrak/UI/batas → PM. Belum merupakan persetujuan QA/QC atau bukti penerimaan percakapan langsung.

## Perubahan dan source

Saat koleksi Zustand berubah, kedua form lama mengisi ulang seluruh field melalui effect. Draft dan baris tambahan dapat hilang; edit ke tambah membawa nilai lama, picker tanggal selalu mulai 8 Oktober 2025, dan Simpan dapat menambah jurnal kedua.

- [Jurnal Umum](../../../../app/(no-layout)/(back-office)/report/accounting/general-journal/modify.tsx) dan [Jurnal Penyesuaian](../../../../app/(no-layout)/(back-office)/report/accounting/adjusting-journal/modify.tsx): wrapper menormalisasi parameter ID, menolak ID hilang/kosong, dan memberi key `create`/`edit:<id>` pada editor. Snapshot awal termasuk salinan tiap baris. Draft bertahan pada perubahan koleksi dengan ID sama; identitas baru mereset state/picker/modal/lock. Guard ref sebelum mutation memblokir dua submit dalam event yang sama; CTA disabled setelah sukses. Guard store saat submit menolak edit record yang sudah dihapus.
- [JournalFormNotFound](../../../../components/feature/accounting/general-journal/JournalFormNotFound.tsx): Wrapper/Card/Text/BottomActionButton bersama, dengan kembali ke daftar modul yang sesuai.
- [journal-date](../../../../lib/accounting/journal-date.ts): seed kalender lokal dari ISO, bulan Indonesia lengkap, atau singkatan Indonesia/Inggris pada fixture/picker lama; tanggal kalender invalid ditolak parser. Tidak mengubah teks tanggal record saat membuka editor.

Hanya empat source tersebut berubah pada batch ini. Store/schema/fixture/journal detail/list/layout, Buku Besar, saldo akun, primitive, backend dan modul sesi lain dibaca saja. Susunan JSX editor sama dengan HEAD kecuali prop disabled Simpan; perbandingan otomatis ada pada quality-results.json. Peta perilaku diperbarui pada [docs/README](../../../README.md).

## Bukti developer

| Pemeriksaan | Hasil dan bukti |
| --- | --- |
| Baseline dua route dengan store produksi | [23 lolos / 32 gagal](baseline.json); hash source sebelum perbaikan tersimpan |
| Lifecycle final, runner sama | [55/55 lolos](results.json), runtime/act error 0 |
| Parser tanggal produksi | [33/33 lolos](date-results.json): 12 bulan, alias Oct/Okt/May/Aug/Dec, ISO/nama penuh, leap year, tanggal/bulan/tahun invalid |
| ESLint empat source | [0 error / 0 warning](quality-results.json), `--no-cache --max-warnings 0`; baseline dua error `set-state-in-effect` |
| Biome format, diff-check dan susunan JSX | Exit 0; dua render editor tetap sama kecuali disabled CTA, pada quality-results.json |
| TypeScript empat root dan dependency closure | [0 diagnostic](typecheck-results.json), memakai opsi/deklarasi proyek; bukan typecheck global |

**88 pemeriksaan perilaku/tanggal lolos.** [verification.json](verification.json) memuat fingerprint source, dependency yang dibaca, runner dan artefak. Hasil paket Kelola/Member sebelumnya tetap terpisah pada [handoff utama](../HANDOFF.md); tidak diklaim diuji ulang batch ini.

Jalankan dari root aplikasi `rapido-dev/`:

```powershell
node docs/qa/codex-3/journals/lifecycle.cjs
node docs/qa/codex-3/journals/date.cjs
node docs/qa/codex-3/journals/quality.cjs
node docs/qa/codex-3/journals/typecheck.cjs
```

Runner lifecycle memakai React/react-test-renderer dari `.expo/senior7-test-tools/node_modules` secara read-only, TypeScript/Zustand aplikasi, kedua route dan subscription store produksi. Parameter router, primitive RN/UI, modal, picker Android, formatter dan parser nominal diadaptasi; pengujian bukan bukti format Rupiah/parser nominal produksi atau navigasi root. React cache override hanya di proses tes. Store berubah di memori proses tes, tidak menyimpan data aplikasi/backend. Baseline adalah reproduksi sebelum patch; jangan menjalankan `--baseline` pada source final bila ingin mempertahankan bukti awal.

## Review QA/QC dan batas

QA diminta mencocokkan hash, mengulang draft saat koleksi berubah, A → B → tambah → B, validasi jurnal tidak seimbang, simpan ganda, tanggal record dan fallback ID. QC meninjau kontrak store/route dan pemisahan state lokal dari API. PM tetap pemilik publikasi/integrasi; belum commit/push/merge dari Codex-3.

Data masih fixture Zustand tanpa API/persistensi/posting buku besar. Pembuktian belum mencakup browser/Expo Router penuh, perangkat Android/iOS, animasi/modal/accessibility, Figma atau full-project gate. Akses tool Figma pada profil ini tidak tersedia saat dicek. Tidak menjalankan Metro, mengambil HP/server sesi lain, atau membuat dependency baru.

Batas inherited: editor masih memakai kontrol/validasi manual lama; tanggal default tambah tetap fixture 8 Oktober 2025. Picker web belum disediakan oleh source lama. Parser helper tidak mengubah validasi tanggal saat Simpan; format tanggal asing/invalid yang sudah tersimpan tetap tampil dan memakai tanggal fixture sebagai fallback picker. Store membentuk ID dari `Date.now()` tanpa suffix global; guard mencegah duplikasi submit dalam satu editor, bukan menjamin ID unik antar editor serentak. Modernisasi RHF/Zod, validasi finansial lengkap, kalender web dan integrasi API perlu scope terpisah.

## Execution Profile & Operator Tips

Medium untuk identitas form dan draft/baris. Batch: reproduksi → lifecycle/date/fallback → regresi dan pemeriksaan terfokus → QA/QC → PM. Pertahankan snapshot per ID dan layout header; cocokkan fingerprint sebelum review karena workspace dipakai beberapa sesi.
