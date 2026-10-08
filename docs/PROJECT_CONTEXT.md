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

Versi di `package.json`: Expo `~53.0.27`, React Native `0.79.6`, React `19.0.0`, expo-router `~5.1.11`, NativeWind `^4.1.23`, TanStack Query `^5.85.6`, Zod `^3.24.4`, dan Zustand `^5.0.4`. TypeScript memakai `strict` dan alias `@/*` ke root aplikasi. React Compiler diaktifkan melalui `app.json`.

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
- Untuk implementasi, pilih frame spesifik: baca design context dan screenshot, lalu petakan ke komponen/token React Native Rapido. Verifikasi saat ini hanya metadata, bukan pemeriksaan visual seluruh desain.

Skill `figma-slice-screen` masih mencantumkan default file key `t5TOjRmAB5Z4mmGfoAXXx2`. Gunakan file key dari tautan pengguna di atas untuk pekerjaan yang merujuk desain sesi ini; jangan berpindah ke default lama secara otomatis.

## Perbedaan dokumentasi yang perlu diperhatikan

| Temuan | Acuan saat bekerja |
| --- | --- |
| `docs/api-scaffolding.md` memakai argumen positional | Gunakan signature object aktual di `api/factory.ts` dan contoh hooks yang tersedia |
| `AGENTS.md` menyebut `bun lint` sebagai Biome | Script `lint` di `package.json` menjalankan `expo lint`; Biome dikonfigurasi terpisah |
| `.github/copilot-instructions.md` memakai `(home)`, `api/queries/auth.ts`, dan `bun dev` | Gunakan route empat mode dan hook factory aktual; script `dev` tidak tersedia |
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

Perintah aktual: `bun start`/`npm run start`, `bun lint`/`npm run lint` (Expo ESLint), `bunx tsc --noEmit`/`npx tsc --noEmit`, serta `bunx biome check <files>`/`npx biome check <files>`. Biome mengatur indent tab dan double quotes. Gunakan format/write hanya untuk file yang termasuk scope perubahan.

Pada saat peninjauan, Bun tidak ditemukan pada PATH dan `node_modules` belum tersedia di root aplikasi. Belum dijalankan lint, typecheck, atau aplikasi karena pekerjaan sesi ini adalah pembelajaran dan penyimpanan dokumentasi. Pasang dependency ketika pekerjaan implementasi/verifikasi memerlukannya. Script android/ios/web memakai prefix `DARK_MODE=media`; periksa shell Windows sebelum menjalankannya.

Saat melanjutkan: baca instruksi dan konteks, tentukan layar/frame serta sumber datanya, telusuri pemanggil/komponen yang tersedia, lakukan perubahan dalam scope permintaan pengguna, dan jalankan pemeriksaan yang sesuai. Rencana implementasi mengikuti bagian **Execution Profile & Operator Tips** di `AGENTS.md`.
