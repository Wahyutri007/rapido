# Konteks Proyek Rapido untuk Sesi Berikutnya

Ditinjau pada 8 Oktober 2026 (Asia/Jakarta). Dokumen ini menyimpan hasil pembelajaran struktur proyek, seluruh 16 berkas Markdown yang tersedia saat peninjauan, dua lampiran pengguna, dan contoh kode inti. Dokumen ini merupakan peta orientasi; kontrak backend, kode yang disentuh, dan akses Figma perlu diperiksa kembali saat mengerjakan fitur.

## Lokasi dan acuan

- Workspace: `C:/Users/Wahyu/Downloads/rapido-dev/`.
- Root aplikasi: `C:/Users/Wahyu/Downloads/rapido-dev/rapido-dev/`.
- Nama `/frontend` di panduan adalah nama historis root aplikasi, bukan subfolder yang tersedia di workspace ini.
- Dua lampiran pengguna sesuai dengan isi [AGENTS.md](../AGENTS.md) dan [AGENTS_UI.md](../AGENTS_UI.md), setelah mengabaikan pengantar lampiran dan perbedaan line ending.

| Acuan | Kegunaan |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | Konvensi utama, routing, lokasi komponen, API, dan aturan keluaran rencana |
| [AGENTS_UI.md](../AGENTS_UI.md) | Aturan UI, token, spacing, typography, container, serta archetype layar |
| [README.md](../README.md) | Ringkasan aplikasi dan quick start |
| [docs/README.md](README.md) | Peta navigasi dan lifecycle aplikasi; wajib diperbarui saat route/layout berubah |
| [docs/api-scaffolding.md](api-scaffolding.md) | Penjelasan factory API; contoh signature lama perlu dicocokkan dengan kode |
| [.agents/skills/](../.agents/skills/) | Workflow khusus CRUD, Figma, ikon, kesederhanaan kode, dan commit |

## Stack dan batas tiap lapisan

Versi di `package.json`: Expo `~57.0.27`, React Native `0.86.3`, React `19.2.3`, expo-router `~57.0.25`, NativeWind `^4.2.3`, TanStack Query `^5.85.6`, Zod `^3.24.4`, dan Zustand `^5.0.4`. TypeScript memakai `strict` dan alias `@/*` ke root aplikasi. React Compiler diaktifkan melalui `app.json`.

| Folder | Tanggung jawab |
| --- | --- |
| `app/` | Layar dan layout expo-router; koordinasi interaksi, data, dan navigasi |
| `types/api/` | DTO yang mengikuti respons backend |
| `types/ui/` | Bentuk data untuk UI dan fitur lokal/mock |
| `schema/` | Validasi Zod dan tipe form hasil inferensi |
| `api/axios.ts` | Base client, bearer token dari SecureStore, dan interceptor |
| `api/common.ts` | GET/POST/PUT/DELETE serta pemetaan error form 422 |
| `api/factory.ts` | Pembuatan query dan mutation hooks dengan konfigurasi object |
| `api/hooks/` | Endpoint dan cache key tiap domain; adapter khusus auth |
| `hooks/` | Logika bersama: pencarian, refresh, routing, auth, dan scroll |
| `context/` | Auth/permission dan container sizing |
| `store/` | State klien Zustand; persistensi hanya pada store yang mengonfigurasikannya |
| `components/ui/` | Primitive Gluestack yang dampak perubahannya meluas ke aplikasi |
| `components/common/` | Komponen generik: Text, Card, Form, Wrapper, picker, modal, dan CTA |
| `components/custom/` | Komponen lintas fitur: CatalogItemCard, DetailRow, CardList, JSStack, BottomTab |
| `components/feature/` | Komposisi yang khusus untuk domain/fitur |
| `components/icons/` | Registrasi ikon, wrapper interop, dan factory `createIcon` |
| `constants/`, `lib/` | Permission, token, mock data, formatter, dan utilitas bersama |

Snapshot inventaris: 240 berkas sumber di `app/` (69 layout dan 171 berkas layar), 27 di `api/`, 202 di `components/`, 19 di `hooks/`, 8 di `store/`, 39 di `schema/`, dan 46 di `types/`. Angka ini perlu dihitung ulang setelah struktur berubah.

## Routing, auth, dan mode

| Mode | Route group | Scope toko |
| --- | --- | --- |
| Back Office | `app/(back-office)/` | Tidak perlu toko aktif di awal |
| Cashier / Kasir | `app/(cashier)/` | Perlu toko aktif |
| Operator | `app/(operator)/` | Perlu toko aktif |
| Absence / Absensi | `app/(absence)/` | Toko dipilih pada form absensi |

`app/(onboarding)/` berisi alur publik/auth. `app/(no-layout)/` berisi detail, form, laporan, dan alur tanpa tab. Nama folder `biling` memang ada pada mode cashier; periksa seluruh pemanggil sebelum mempertimbangkan perubahan nama.

Alur inti yang telah ditelusuri:

1. `app/_layout.tsx` memuat font, QueryClientProvider, AuthProvider, container sizing, Gluestack, dan route guard.
2. `app/index.tsx` memeriksa kesehatan API, auth tersimpan, status onboarding, dan tujuan navigasi sebelum menyelesaikan splash.
3. `context/AuthContext.tsx` memvalidasi pengguna melalui `/user`, menyimpan/menghapus token, serta menyediakan pemeriksaan role/permission. Role `owner` diberi akses oleh helper permission.
4. `hooks/useProtectedRoute.ts` menjaga route privat; maintenance dan terms-and-condition merupakan route publik.
5. `hooks/useNavigateAuthenticated.ts` memilih mode; cashier/operator memakai toko aktif untuk owner atau `team_id` untuk pekerja. Absence langsung menuju home.
6. `components/custom/AppModeButton.tsx` mengelola pemilihan mode/toko; `store/appModeStore.ts` menyimpan mode dan menjalankan transisi. `store/useActiveStore.ts` menyimpan toko aktif di SecureStore.

Header diletakkan pada `_layout.tsx` melalui `JSStack.Screen`; layout parent mendaftarkan folder anak dengan `headerShown: false`. Gunakan `route()` dari `lib/utils/index.ts` untuk parameter navigasi dan `delayedBack()` dari `components/custom/JSStack.tsx` ketika perlu menutup sheet/modal sebelum kembali.

## Pola API dan contoh fitur

Untuk entitas katalog berbasis backend, urutan dependensi adalah **DTO → schema → hooks factory → layar → registrasi route/tile/permission**. Hindari menaruh parsing respons atau axios langsung di layar. Data server dikelola TanStack Query; state form memakai react-hook-form; state UI lokal memakai React atau store yang sesuai.

Factory menerima satu object konfigurasi:

```ts
createGetHook<EntityData[]>({
  path: "/contents/entities",
  queryKey: ["entities"],
  name: "entities",
});

createMutationHook<EntityData, EntitySchema>({
  path: (id) => `/contents/entities/${id}`,
  method: "put",
  invalidateKeys: (_data, _payload, id) => [["entities"], ["entities", id]],
});
```

- GET menghasilkan state query TanStack dan mengembalikan `body.data` melalui `api/common.ts`. Path dinamis otomatis dinonaktifkan ketika argumen belum tersedia, kecuali opsi `enabled` diberikan.
- Mutation menghasilkan `{ call, isLoading }`; `call()` mengembalikan tuple `[data, error]`. Periksa error sebelum menjalankan alur sukses.
- ID dinamis dapat diberikan sebagai argumen kedua saat membuat hook atau argumen kedua `call()`.
- Gunakan cache key list dan detail yang konsisten; update biasanya menginvalidasi keduanya.
- `handleFormError(error, form)` memetakan error 422 ke field form. Error umum ditampilkan dengan modal yang sudah tersedia.
- Base URL memakai `EXPO_PUBLIC_BASE_URL`/`EXPO_PUBLIC_API_URL` melalui `constants/Others.ts`; `.env.example` memuat contoh konfigurasi.

Contoh aktif yang telah ditelusuri lengkap:

| Lapisan | Biaya tambahan |
| --- | --- |
| DTO | `types/api/extra-cost.ts`: id, name, type, amount, timestamps |
| Schema | `schema/add/extra-cost.ts`: nama wajib, enum tipe, amount numerik minimal 0 |
| Hooks | `api/hooks/extra-costs.ts`: list/detail/create/update/delete, cache `extra-costs` |
| Endpoint | `/contents/extra-costs` dan `/contents/extra-costs/{id}` |
| Layar | `app/(no-layout)/catalog/extra-cost/{_layout,index,modify,detail}.tsx` |
| Entry point | Tile di `app/(back-office)/catalog/index.tsx`; `MANAGE_EXTRA_COSTS` di `constants/Permissions.ts` |

`api/hooks/categories.ts`, `brands.ts`, `taxes.ts`, dan `auth.ts` juga dibaca. `tax` dan `brand` merupakan acuan skill scaffolding; tetap cocokkan styling layar contoh dengan aturan UI terbaru.

Sebagian laporan/accounting belum memakai API: `store/accountingStore.ts` diinisialisasi dengan mock di `constants/data/accounting/`; cash-flow membaca konstanta langsung. Keberadaan layar atau angka laporan belum berarti fitur tersebut terhubung ke backend.

## Aturan clean code dan UI yang digunakan

- Gunakan komponen yang sudah ada sebelum membuat komponen baru. Simpan komposisi domain di `components/feature/`; komponen generik di `common`, dan komponen lintas fitur di `custom`.
- Pertahankan layar sebagai pengatur alur; tempatkan kontrak data, validasi, request, dan logika yang dipakai ulang di lapisannya masing-masing. Hindari abstraksi atau dependency baru tanpa kebutuhan nyata.
- Gunakan `Text` dari `components/common/Text` dengan `size="small" | "normal" | "body"` dan `w="regular" | "medium" | "semibold" | "bold"`.
- `Card`, input, picker, Button, dan CTA sudah memiliki styling dasar. Pada layar, gunakan props/variant dan kelas layout yang diperlukan.
- Pakai warna semantic seperti `text-foreground`, `text-muted`, `text-warning`, `text-destructive`, `text-success`, dan `border-border`. Untuk warna ikon yang tidak dapat dinyatakan lewat className, gunakan token `Colors` yang sesuai.
- Aturan spacing eksplisit memakai grid 4 px. Pada UI baru, hindari fractional spacing yang dilarang meskipun masih muncul dalam contoh lama.
- Form/detail: `Wrapper` dengan `contentContainerStyle={{ padding: 16, gap: 16 }}` dan `hasActionButton` saat ada CTA bawah.
- List: `Wrapper isNotScrollable`, biarkan `FlatList` mengatur scroll, padding bawah, dan refresh.
- Laporan: import `AnimatedWrapper` dari `components/common/AnimatedWrapper`; atur padding/gap melalui `contentContainerStyle` dan spacer/FAB melalui props.
- Gunakan Form/Field/Control/Input/Select/Message bersama react-hook-form dan Zod; teks serta error pengguna dalam bahasa Indonesia.
- Pertahankan pengelompokan container pada Figma. Card majemuk dengan subbagian tetap merupakan satu kelompok visual.
- SVG khusus memakai `components/icons/createIcon.tsx`, `currentColor`, dan export di `components/icons/index.ts`.
- Perubahan primitive/shared component memerlukan pemeriksaan pemanggil karena dapat memengaruhi banyak layar.

## Figma yang benar untuk konteks ini

Tautan pengguna: [Untitled — Page 1](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=0-1).

- File key: `gbdKqL2EcYNenWiQXG4SRW`; page node: `0:1`.
- Koneksi MCP resmi: `https://mcp.figma.com/mcp`.
- Saat peninjauan, OAuth berhasil, 45 alat server ditemukan, dan metadata page berhasil dibaca.
- Section langsung pada page: **Back Office** (`1:1973`) dan **Section 1** (`1:60428`). Salah satu frame yang sudah terbaca adalah Splash Screen (`1:1974`).
- Konfigurasi Codex pada mesin ini: `D:/Codex-2/config.toml`; launcher VS Code profil 2 memakai `CODEX_HOME=D:/Codex-2`.
- Konfigurasi MCP VS Code profil aktif: `D:/VSCode-2/Data/User/mcp.json`; ekstensi `figma.figma-vscode-extension` versi `0.4.7` telah terpasang pada `D:/VSCode-2/Extensions/`.
- Konfigurasi dan login Codex telah diverifikasi. Login viewer ekstensi Figma dan otorisasi native MCP VS Code merupakan alur terpisah jika fitur tersebut akan dipakai.
- Koneksi bukan jaminan akses permanen; periksa kembali pada sesi baru. `codex mcp list` memeriksa konfigurasi; `codex mcp login figma` dapat digunakan jika OAuth perlu diulang.
- Untuk implementasi, pilih frame spesifik: baca design context dan screenshot, lalu petakan ke komponen/token React Native Rapido. Sebelas referensi Inventory telah dibaca dan disimpan di `docs/figma/inventory/`; belum dilakukan pemeriksaan visual seluruh desain.
- Progres Inventory, batas data contoh, dan node yang masih menunggu akses dicatat di [FIGMA_PROGRESS.md](FIGMA_PROGRESS.md). MCP Figma mencapai kuota paket Starter setelah pembacaan daftar dan form Pembelian Barang; koneksi OAuth tetap terkonfigurasi.
- Modul Pemasok dilanjutkan dari metadata frame yang sudah tersimpan sesuai permintaan pengguna. Daftar, tambah/edit, detail dan hapus memakai komponen bersama, RHF/Zod dan state sesi. Pesanan memakai ID pemasok yang stabil; backend pemasok, direktori wilayah lengkap dan verifikasi visual Figma/native masih menunggu.
- Modul Bahan Baku kini terhubung dari Persediaan: daftar/filter, tambah/edit, detail stok/lokasi/mutasi dan hapus terjaga memakai RHF/Zod serta state sesi. Pilihan pembelian/transfer membaca katalog bahan terbaru dan menyimpan snapshot transaksi. Referensi form/detail tersedia sebagai teks/dimensi; referensi daftar, context/screenshot penuh, backend ledger dan perbandingan native belum tersedia. Lihat [figma/inventory/materials/README.md](figma/inventory/materials/README.md) dan [previews/inventory/materials/README.md](previews/inventory/materials/README.md) sebelum melanjutkan.
- Komposisi Produk sekarang memakai produk Inventory dan katalog bahan sesi yang sama. Daftar/form/detail, estimasi biaya/margin, simulasi porsi dan perlindungan bahan yang dipakai resep tersedia. Takaran/biaya satuan disimpan per porsi; data tidak membukukan konsumsi stok atau mengganti harga katalog. Contoh Figma tidak konsisten pada nama/biaya/porsi/harga jual, sehingga interpretasi dan kesamaan visual masih provisional. Lihat [figma/inventory/compositions/README.md](figma/inventory/compositions/README.md) dan [previews/inventory/compositions/README.md](previews/inventory/compositions/README.md); harga jual yang diketahui hanya Ayam Geprek, produk lain menampilkan dash.

- Pembayaran Tagihan kini memiliki daftar/pencarian/filter pemasok, form multi-PO, detail snapshot, edit/hapus dan pengamanan referensi PO. Model/schema/helper dipisahkan pada `types/ui/inventory/bill-payment.ts`, `schema/inventory/bill-payment.ts` dan `lib/inventory/bill-payment.ts`; alokasi memakai `store/inventoryBillPaymentStore.ts`. Saldo dihitung dari pembayaran/diskon sesi terbaru, edit mengecualikan alokasinya sendiri dan pembayaran berikutnya tetap diperhitungkan. Status penerimaan/flag paid awal tidak ditimpa; status pembayaran diturunkan terpisah. Ini belum posting kas/bank/backend/persistensi. Referensi dan batas ada di [figma/inventory/bill-payments/README.md](figma/inventory/bill-payments/README.md); status **READY_FOR_QA**, 67 model + 70 browser serta 67/49 regresi Bahan Baku/Komposisi lulus. Hasil, hash dan batas ada di [handoff pembuat](qa/codex-2/bill-payments/HANDOFF.md); TypeScript terfokus, lint dan format lulus setelah cleanup.

Skill `figma-slice-screen` masih mencantumkan default file key `t5TOjRmAB5Z4mmGfoAXXx2`. Gunakan file key dari tautan pengguna di atas untuk pekerjaan yang merujuk desain sesi ini; jangan berpindah ke default lama secara otomatis.

## Perbedaan dokumentasi yang perlu diperhatikan

| Temuan | Acuan saat bekerja |
| --- | --- |
| `docs/api-scaffolding.md` memakai argumen positional | Gunakan signature object aktual di `api/factory.ts` dan contoh hooks yang tersedia |
| Biome dikonfigurasi terpisah | Script `lint` di `package.json` menjalankan `expo lint`; pemeriksaan Biome memakai `npx biome check <files>` |
| `.github/copilot-instructions.md` memakai `(home)` dan `api/queries/auth.ts` | Gunakan route empat mode dan hook factory aktual |
| Beberapa tabel menyebut AnimatedWrapper pada path Wrapper | Import dari berkas `components/common/AnimatedWrapper.tsx` yang terpisah |
| `AGENTS_UI.md` melarang fractional spacing tetapi contoh memakainya | Ikuti aturan eksplisit untuk UI baru; jangan menganggap contoh yang bertentangan sebagai izin umum |
| Sejumlah shared component dan layar lama masih override style/raw color | Reuse API komponennya; cocokkan kode yang disentuh dengan aturan terbaru dan dampak pada pemanggil |
| Scaffolding menyebut EditableActions/ButtonGroup pada beberapa contoh | Periksa layar aktual yang sudah memakai CatalogItemCard/ItemActionSheet/BottomActionButton |
| Diagram boot memasukkan absence pada cabang scope toko | Kode `useNavigateAuthenticated.ts` menangani absence langsung tanpa toko awal |

Perbedaan ini dicatat sebagai hasil pembelajaran; belum dilakukan refactor atau penyelarasan seluruh dokumentasi/layar.

## Skill dan pemeriksaan pekerjaan berikutnya

| Skill lokal | Kapan relevan |
| --- | --- |
| [scaffold-entity-feature](../.agents/skills/scaffold-entity-feature/SKILL.md) | Menambah slice CRUD katalog berbasis backend |
| [figma-slice-screen](../.agents/skills/figma-slice-screen/SKILL.md) | Mengimplementasikan frame Figma; cocokkan file/node/target dan scope dengan instruksi pengguna |
| [convert-svg-icon](../.agents/skills/convert-svg-icon/SKILL.md) | Mengubah SVG menjadi ikon standar Rapido |
| [ponytail](../.agents/skills/ponytail/SKILL.md) | Menjaga perubahan kode tetap sederhana dan memakai solusi yang sudah ada |
| [git-commit-chunking](../.agents/skills/git-commit-chunking/SKILL.md) | Meninjau/mengelompokkan perubahan untuk commit yang diminta pengguna |

Perintah aktual: `npm ci`, `npm start`, `npm run lint` (Expo ESLint), `npx tsc --noEmit`, serta `npx biome check <files>`. SDK 57 memakai `package-lock.json` sebagai lockfile tunggal. Biome mengatur indent tab dan double quotes. Gunakan format/write hanya untuk file yang termasuk scope perubahan.

Pada saat peninjauan, Bun tidak ditemukan pada PATH dan `node_modules` belum tersedia di root aplikasi. Belum dijalankan lint, typecheck, atau aplikasi karena pekerjaan sesi ini adalah pembelajaran dan penyimpanan dokumentasi. Pasang dependency ketika pekerjaan implementasi/verifikasi memerlukannya. Script android/ios/web memakai prefix `DARK_MODE=media`; periksa shell Windows sebelum menjalankannya.

Saat melanjutkan: baca instruksi dan konteks, tentukan layar/frame serta sumber datanya, telusuri pemanggil/komponen yang tersedia, lakukan perubahan dalam scope permintaan pengguna, dan jalankan pemeriksaan yang sesuai. Rencana implementasi mengikuti bagian **Execution Profile & Operator Tips** di `AGENTS.md`.

### 9 Oktober 2026 — Senior6 SD6-004 Riwayat Mutasi Stok

Flow baru `/inventory/stock-movement` dan `/detail?id=<opaque-event-id>` terhubung dari hub, parent child headerShown:false dan header/back fallback layout. Tab bahan/produk, pencarian/filter tanggal-jenis-lokasi/reset, detail/source link dan live/missing/empty tersedia. Helper read-only `lib/inventory-stock-movement.ts` memproyeksikan existing inventoryStore/materialStore: completed purchase masuk, transfer keluar/masuk per toko, adjustment penyusutan; snapshot transaksi dipertahankan. Catatan material tanpa tanggal/toko/satuan menampilkan belum tersedia; closingStock historis tidak dihitung dari stok katalog. Sumber tetap preview sesi, belum API/persistensi/posted ledger.

READY_FOR_QA → QC → PM; handoff `docs/qa/senior-6-2026-10-09/stock-movement/HANDOFF.md`, manifest56artefak/7source. Developer helper20/audit9/browser33/quality4 PASS. Empat ukuran320/360/390/768, runtime/console/externalHTTP0,40fingerprint stabil; scopedlint/Biome/TS/diffbersih. Offline one-shot bundle dipakai karena Metro8088existing tidakmerespons, tanpaserverbaru/restart/rootMetroconfigrequire/sharedcachechange. Navigator/params/asset transport fixture, bukan fullrouter/auth/native/Figma approval. Figma callable pada sesiSenior6 tidaktersedia; cachedmetadata1:30149/30441/30733/30871 saja, sessionlain bisa berbeda.

Dua file integrasi bersama juga menerima bill-payments Codex-2 dan closing-stock Senior5, dipertahankan. Jangan memperluas klaim source keflowpemiliklain. PaketSD6-001/002/003 tetapfrozen; sourcebaru dilepas untukreview. Verifierdefaultbaca saja, replaybuktilain kefolderreviewer; belumpublikasi/commit/push/mainmerge.

### 9 Oktober 2026 — Senior6 SD6-005 Riwayat Mode Absensi

Home mode Absensi menu Riwayat kini menuju /(absence)/history dan /detail?id=<opaque-id>. Date groups/search/status-store filters/reset, detail live/missing, anchor index/back/fallback/focus header tersedia. Sumber useAbsenceStore read-only, data contoh/sesi tanpa employee ID/server/persistensi; batas ditampilkan, bukan riwayat pribadi atau rekap karyawan. Helper/status/type Absensi Kelola reused tanpa edit, source tujuh baru +dua delta home/layout. Form/camera/auth/store/shared primitive dan modul peer tetap.

READY_FOR_QA → QC → PM, sinyal SD6-005-ABSENCE-HISTORY-READY-FOR-QA. Handoff docs/qa/senior-6-2026-10-09/absence-history/HANDOFF.md; manifest47artefak/13kontrak/sembilan snapshot source cocok. Developer36model/25browser/4quality=65PASS,320/390/landscape844, runtime/console/externalHTTP0. Scoped ESLint9/Biome7/TS5roots+1297closure/diff bersih. Offline bundle sendiri tanpa server/rootconfig/HP, Metro/Babel/generatedAndroid hashes identik. Navigator/params/browser records fixture, belum fullrouter/auth/native/Figma/backend approval. Source dilepas QA dan paket frozen; verifier default readonly/replay ke namespace reviewer, bukan reseal.

### 9 Oktober 2026 — Senior6 SD6-006 Pesanan Digital Back Office

Instruksi terbaru fokus Back Office. Menu Pesanan Digital POS yang sebelumnya Coming Soon kini membuka `/manage/pos-settings/digital-orders` dengan daftar/search/filter jenis/reset, tambah/detail/edit/hapus aktual. Dua belas source baru (schema/store/type/lima komponen/empat route); shared hanya slot Pesanan Digital/import route dan child headerfalse pada POS. RHF/Zod, nama unik/URL HTTPS, ID monoton/revisi serta guard umur callback menjaga draft/pergantian ID/cancel/unmount/simpan ganda/stale save-delete/acknowledgement. Reuse ManageListActions/FormNotFound tanpa edit, header hanya layout/fokus/fallback/anchor.

Frontend draf kanal selama sesi, koleksi kosong awal/input pengguna, status Draf. UI menyatakan belum aktif/terhubung marketplace/menerima pesanan/backend/persistensi; bukan modul marketplace operasional. READY_FOR_QA → QC → PM, sinyal SD6-006-DIGITAL-ORDERS-READY-FOR-QA dan handoff `docs/qa/senior-6-2026-10-09/digital-orders/HANDOFF.md`. Developer65model/29browser/4quality=98PASS, runtime/console/externalHTTP0,320/390/landscape844 termasuk field terakhir bebas footer. Lint14/Biome12/scopedTS enam roots+closure/diff bersih. Dependency opt-in terbaru Senior5 dan generated router declaration mengikuti recheck, tanpa source peer diedit. Manifest source/runtime/artifact dan14snapshots disegel; verifier read-only, replay ke namespace reviewer.

Cold build ENOSPC pada C; hanya cache baru milik tugas dipindah ke D dengan literal Move-Item. Output `SD6_DIGITAL_OUTPUT=D:\Codex-6\tmp\rapido-sd6-digital-orders`, satu worker/offline/no listener/rootconfig/NativeWind Metro plugin/HP/server restart; config/generated Android hash identik. Figma callable tidak tersedia pada toolset Senior6, memakai AGENTS_UI tanpa parity; native/fullrouter/auth/Figma/backend/QA-QC approval/publikasi tetap gate terkait. QC-DELETE-001 P2 shared long-landscape tetap OPEN, tidak ditutup hasil CRUD portrait modul. Paket SD6-001—005 frozen dan scope peer dipertahankan.


## SD5-011 Inventory color overlay (9 Oktober2026)

Current InventoryUi supports optional InventoryMetrics valueTone default/item and InventoryMetadata tone primary/muted; only StockOperationDetail adjustment opts into item value tone and eight transfer/purchase metadata calls opt into muted. Destructive number/percent classes have semantic important priority to avoid text-foreground cascade. Default consumers keep their prior styles. Four source color-only delta: [handoff](qa/senior-5-2026-10-09/inventory-qc-colors/HANDOFF.md),44browser+7scope PASS and focused quality clean, READY_FOR_QA_QC_RECHECK, not independent approval or fullframe100%. QC003 recheck and QC004 originalSVG shapes/layout/native remain pending; fresh Figma still Starterlimit. Historical packets stay frozen; recheck current source/shared dependency before extending approval.
