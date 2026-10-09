# QC SD5-005 — Provider/Login recheck — 9 Oktober 2026

**PASS-RECHECK. QC-LOGIN-001 P2 dan QC-LOGIN-002 P3 ditutup pada hash Provider koreksi.** Kegagalan validasi user setelah POST login kini tampil pada form, hook menerima error, dan tombol dapat mencoba ulang. Diagnostic kualitas Provider sudah bersih. Sinyal **QC-AUTH-20261009-PASS-RECHECK** tersedia untuk Senior5/QA/PM melalui workspace; integrasi/publikasi tetap ditangani PM.

Provider disetujui: `60337fb439c306e4b30344b39a0e5f8534636a9de9989c973b4bcb606a05e646`. [Salinan source](AuthContext.reviewed.tsx.txt), [keputusan dan closure](DECISION.json). Source aplikasi telah dikoreksi developer; QC tidak mengedit source atau menerapkan patch historis.

## Hasil pada source aktual

| Suite | Lolos | Gagal |
| --- | ---: | ---: |
| loginProviderReplay | 85 | 0 |
| bootReplay | 64 | 0 |
| guardReplay | 105 | 0 |
| guardIntegration | 46 | 0 |
| bootIntegration | 41 | 0 |
| newQcIntegration | 48 | 0 |
| Total eksekusi assertion, cakupan berulang | 389 | 0 |

Semua hasil final runtime/React/act error dan unhandled rejection **0**. Tambahan QC baru memakai fixture library aktual yang diaudit dan menguji **48** assertion. Provider lama f311 dengan Guard saat ini: **38 lulus/10 gagal** pada skenario yang sama; Provider baru603: **48/48 lulus**. Baseline tidak masuk hitungan kelulusan source aktual. Sepuluh assertion gagal bukan sepuluh temuan baru; tiga mereproduksi gejala QC-LOGIN-001 dan tujuh menguji bootstrap/lifetime storage.

ESLint Provider **0 error/0 warning**, Biome/diff exit **0**, tanpa suppression. Pemeriksaan independen statement AST/source membuktikan type/useAuth, state awal, role/permission helpers, JSX provider, signOut/cache clearing dan code lain identik baseline setelah normalisasi EOL serta opsi refetch yang sengaja ditambahkan. Perubahan lain terbatas pada loader/reload/bootstrap effect dan binding refetch stabil.

TypeScript lima root developer **0 diagnostic**: provider, login hook/screen, boot, Guard beserta import/declaration closure. QC memeriksa fingerprint seluruh **83** source pada bukti tipe; tidak menjalankan ulang TypeScript terfokus/global.

## Penutupan temuan

- **QC-LOGIN-001 P2 — CLOSED_BY_RECHECK.** Tiga pemeriksaan yang gagal pada QC Login lama sekarang lulus dalam replay. Kasus QC baru melalui tombol dan FormMessage produksi menampilkan pesan generic setelah GET user500; hook menerima error pada GET user401. Draft dipertahankan dan tombol aktif untuk retry. Retry dua kali dalam satu event menghasilkan satu POST baru, satu storage write, satu GET; sukses mengautentikasi pengguna dan Guard mengarahkan home sekali.
- **QC-LOGIN-002 P3 — CLOSED_BY_RECHECK.** Lint/Biome Provider bersih. Dependency refetch stabil teruji dengan QueryObserver aktual: penyelesaian query/rerender tidak mengulang bootstrap. Loading bootstrap/reload selesai pada hasil aktif. Tidak menggunakan timer penundaan atau suppression.

Kasus baru membalik urutan penyelesaian pembacaan token StrictMode. Hasil effect lama berupa token kosong atau rejection tidak menghapus auth, tidak mengakhiri loading bootstrap aktif dan tidak membatalkan frame home aktif. Setelah provider ditutup/diremount, hasil storage lama tidak memulai GET; provider baru menuntaskan pembacaan miliknya sendiri. Helpers nonowner diuji untuk grant/deny scalar/array, lalu semuanya menolak setelah sign-out. Sign-out menghapus token/query; reload tanpa token tidak menambah GET dan tidak menavigasi home.

Regresi developer85/64/105 dan tambahan QC sebelumnya Guard46/Boot41 dijalankan ke output supplement ini pada Provider603+Guardffe aktual. Guard tambahan menguji callback retired setelah login/signOut/reload/pindahroute/unmount/StrictMode. Boot tambahan memakai SplashScreenView/haptic produksi dengan adapter Reanimated, termasuk finished=false, callback lama, target terbaru dan pemulihan. Kelulusan ini terikat fixture, bukan bukti frame visual/native.

## Integritas dan batas keputusan

**51** fingerprint handoff source/kontrak/library/artefak cocok sebelum tes. **61** berkas disk stabil dari awal hingga final. **153** entri bukti historis (**115** berkas unik) cocok; paket QC Login/Boot/Guard serta developer lama tetap beku. Seluruh runtime module hash cocok dengan disk; semua enam suite memuat Provider603 terkini. Tidak ada pin Provider lama pada suite final. Runner replay developer identik kecuali output folder pada boot/guard; runner QC lama disalin dengan perubahan provider load seam/label dan output path, tanpa mengubah assertion.

17 modul produksi dieksekusi pada gabungan suite; kode query/transport pada integrasi Login memakai library React Query/Axios/RHF/Zod aktual:

- `api/common.ts`
- `api/factory.ts`
- `api/hooks/auth.ts`
- `app/(onboarding)/login.tsx`
- `app/index.tsx`
- `components/common/Form.tsx`
- `components/custom/SplashScreenView.tsx`
- `constants/Colors.ts`
- `constants/Fonts.ts`
- `constants/Keys.ts`
- `context/AuthContext.tsx`
- `hooks/useNavigateAuthenticated.ts`
- `hooks/usePostRequest.ts`
- `hooks/useProtectedRoute.ts`
- `lib/api-utils.ts`
- `lib/haptics.ts`
- `schema/onboarding/login.ts`

Query fixture memakai retry:false dan staleTime/gcTime:Infinity; root produksi retry:2 dan staleTime:5 menit. Transport/storage, router/segmen/RAF, host UI serta runtime Reanimated memakai adapter. Root layout hanya kontrak baca. Tidak sertifikasi browser/Android/iOS, native frames, storage/API nyata, root navigator/mode/toko menyeluruh, SSR atau parity Figma; callable Figma tidak tersedia.

Cleanup mengabaikan hasil read bootstrap yang sudah tidak aktif, tanpa membatalkan IO atau transaksi auth/query yang sudah berjalan. Gagal validasi user dapat meninggalkan token tersimpan sesuai kontrak existing. Tidak menambahkan rollback, atomic auth atau jaminan concurrency lintas instance login-logout.

Keputusan baru ini menutup dua temuan pada versi koreksi; [keputusan Login lama](../qc-login-2026-10-09/DECISION.json) tetap utuh sebagai histori. **Penerimaan QC-INCOME-001/002/003 tetap OPEN**, dan paket sesi lain mempunyai gate sendiri. PM dapat menggunakan keputusan per hash ini untuk melanjutkan integrasi, dengan pemeriksaan perangkat/network/root yang relevan dan publikasi Git sebagai gate PM.

Tidak source aplikasi/dependency/backend/API/DB/persistensi nyata, operasi Metro/server/HP, branch/index/commit/push atau perubahan PDF progres historis oleh QC. Sinyal melalui dokumen, tanpa klaim penerimaan chat lain.

Label metadata pada salinan Guard pertama masih menyebut pin historis walaupun loader dan hash sudah memakai Provider603. Label/recipe diperbaiki dan suite46 diulang; bukti awal dipertahankan, tidak dihitung dua kali. Ini koreksi metadata harness, tanpa kegagalan aplikasi. [Catatan harness](harness-notes.json).

Paket dibekukan; simpan hasil ulang untuk hash baru pada folder baru. Execution Profile & Operator Tips: High. Hash koreksi → reproduksi temuan → urutan storage/lifecycle → regresi provider+Guard+Boot → quality → closure per hash → QA/PM. Pisahkan gate perangkat dan pertahankan histori.
