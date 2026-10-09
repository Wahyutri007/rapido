# Figma implementation progress

Updated: 9 October 2026. Follow `AGENTS.md` and `AGENTS_UI.md`; use the user's
Figma file, not the older file key written in `figma-slice-screen/SKILL.md`.

Source: [Rapido Figma](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=0-1).
Implementation is proceeding by module. No claim of 100% visual parity has been
made; native device comparison is still required.
Current visual measurements and remaining coverage gates are recorded in
[FIGMA_PARITY_AUDIT.md](FIGMA_PARITY_AUDIT.md).

## Inventory

| Module | Figma nodes | Implementation / verification status |
| --- | --- | --- |
| Persediaan hub | `1:4792` | Ten design menu entries now have route links, including closing-stock, bill-payments and stock-movement from their respective owners; exact exported bitmap icons. Verification remains per flow below. |
| Ringkasan Inventory | `1:12487`, `1:12956` | Both tabs, metrics, ranking cards, chart, recommendations and insights implemented from design context and screenshot. |
| Transfer Stok | `1:12059`, `1:11949`, `1:12312` | List, create, detail, search and store / stock-kind filters implemented from context and screenshots. SD5-011 metadata icons now muted at four opt-in callsites; actual filter/navigation regression passes. Official icon assets/full-frame layout and independent QC remain pending. |
| Penyesuaian Stok | `1:13404`, `1:13851`, `1:13605` | List, create and detail implemented from context and screenshots. SD5-011 forwards status tone to detail totals and protects destructive quantity/percent color; 390/320 browser checks pass. Metric label wrapping/card/header/full-frame geometry remain pending; this color-only correction is READY_FOR_QA_QC_RECHECK, not QC closure or100%parity. |
| Pembelian Barang | `1:14945`, `1:14543` | List and create context / screenshots captured; implemented. SD5-011 metadata icons now muted at four opt-in callsites; prior delete behavior preserved by inverse-delta source check. Official icon assets/layout/QC pending. Detail uses existing detail components and cached metadata; full Figma context still pending (`1:14866`). |
| Pemasok | `1:15653`, `1:15530`, `1:15570` | List, create/edit, detail, search, filters and guarded deletion implemented from cached metadata and existing UI tokens. Full design context and screenshots still pending; visual fidelity is provisional. |
| Bahan Baku | `1:29776`, `1:31002` | Create/edit and detail implemented from cached frame texts/dimensions. Searchable list, status/store filters, guarded deletion and purchase/stock item selection implemented using shared components. Full context/screenshots and list reference are pending; visual fidelity is provisional. |
| Komposisi Produk | `1:31287`, `1:31448`, `1:31480` | List/search/status filters, recipe create/edit/detail/delete, cost/margin calculation, portion simulation and material reference guard implemented from saved texts/dimensions and shared primitives. Full context/screenshots remain pending; interpretation and visual fidelity are provisional. |
| Pembayaran Tagihan | `1:15208`, `1:14178`, `1:26045` | READY_FOR_QA: list/search/supplier filter, multi-PO payment/discount form, snapshot detail, edit/delete and purchase-reference guard implemented; model67/browser70/regressions67+49 and scoped quality passed. Session data; cached metadata only, full visual comparison remains pending. |
| Riwayat Mutasi Stok | `1:30149`, `1:30441`, `1:30733`, `1:30871` | SD6-004 READY_FOR_QA: list/detail/routes/search/kind-date-type-store filters/live updates implemented against existing session records; helper20/audit9/browser33 and scoped quality passed. Historical closing stock unavailable, no API/persistence. Cached metadata only; full design context/screenshots and native visual parity remain pending. |
| Stok Akhir | `1:12401` | SD5-010-NARROW READY_FOR_QA: current full context/screenshot/metadata compared; eight initial-frame anchors match all32 position/size values exactly at390×1347. Colors, typography,11 exact SVG assets and scoped Figma control/header/card/tab appearance corrected. Inventory label at320px fits after responsive gap fix; latest browser52/scope17 passed, header4 reused on unchanged hash. Scoped ESLint/TypeScript clean, Biome0errors/2inherited warnings. [Latest comparison](qa/senior-5-2026-10-09/closing-stock-figma-narrow/compare.html); primary SD5-010 and SD5-009 packets remain frozen history. Native/full-auth/all states/QC and global100% still pending; per-store quantities unavailable. |

Figma MCP returned the Starter-plan tool-call limit after the purchase list and
form were read. One access recheck for Suppliers returned the same limit. The
user requested continued module implementation, so Suppliers uses the cached
frame hierarchy/text/geometry and Materials uses saved frame texts/dimensions
with existing Rapido components. Do not repeatedly
request these pending nodes. Inspect their full context and screenshots when
access becomes available; metadata cannot establish exact colors or typography.

Supplier reference notes and cached frame metadata are in
[figma/inventory/suppliers/README.md](figma/inventory/suppliers/README.md).
Material reference notes and copied source texts are in
[figma/inventory/materials/README.md](figma/inventory/materials/README.md).
Composition reference notes and captured texts are in
[figma/inventory/compositions/README.md](figma/inventory/compositions/README.md),
including inconsistent prices/totals in the source and the per-portion interpretation.
Payment reference notes and copied metadata are in
[figma/inventory/bill-payments/README.md](figma/inventory/bill-payments/README.md).
Closing-stock reference notes and the successfully retrieved full frame are in
[figma/inventory/closing-stock/README.md](figma/inventory/closing-stock/README.md).
The earlier Starter-limit observations above are historical; SD5-009 retrieved
its own frame on 9 October 2026 and does not certify access to other pending nodes.

## Data and architecture

- Source screens: `app/(back-office)/inventory` and `app/(no-layout)/inventory`.
- Feature UI: `components/feature/inventory`; shared stock-operation components
  cover the transfer and adjustment flows without duplicating their layouts.
- UI models: `types/ui/inventory.ts`; validation: `schema/inventory.ts`.
- Supplier UI models and validation: `types/ui/inventory/supplier.ts` and
  `schema/inventory/supplier.ts`; screens: `components/feature/inventory/supplier`.
- Material UI models/validation: `types/ui/inventory/material.ts` and
  `schema/inventory/material.ts`; screens: `components/feature/inventory/material`.
  Stock status, location allocation and recent movements live in
  `lib/inventory-material.ts`; calendar parsing lives in `lib/inventory/material-date.ts`.
- Composition models/schema: `types/ui/inventory/composition.ts` and
  `schema/inventory/composition.ts`; screens: `components/feature/inventory/composition`;
  cost/margin/simulation helpers: `lib/inventory/composition.ts`.
- Payment models/schema: `types/ui/inventory/bill-payment.ts` and
  `schema/inventory/bill-payment.ts`; screens: `components/feature/inventory/bill-payment`;
  balance/status helpers: `lib/inventory/bill-payment.ts`; allocations:
  `store/inventoryBillPaymentStore.ts`. Cash plus discount uses current unpaid PO
  balances; edit excludes its own allocation, delete releases it, and referenced
  POs cannot be deleted. Historical detail snapshots are separate from current balances.
- Mock fixtures: `constants/data/inventory*.ts`; session-only preview records:
  `store/inventoryStore.ts`, `store/inventorySupplierStore.ts` and
  `store/inventoryMaterialStore.ts` and `store/inventoryCompositionStore.ts`. They are not
  backend DTOs and are not persisted.
- Existing Query hooks and authentication are unchanged. No inventory backend
  endpoints were invented. Replace preview data through the API factory when the
  backend contract is supplied.
- Forms use React Hook Form, Zod and shared form controls. Store selection,
  positive quantity, available-stock and transfer-destination validation apply.
- Quantity inputs preserve decimal separators while typing. Form subscriptions
  use `useWatch` for compatibility with the current React Compiler configuration.
- Purchase totals equal their line subtotals. Purchase references use a monotonic
  session counter so deleting a record cannot reuse a reference still in the list.
- Adjustment totals use the line unit; records containing different units show
  no combined quantity, preventing a sum of kilograms and litres.
- Existing `FormInput` has an optional `multiline` prop, defaulting to false.
- Existing `NavList` has an optional `inventory` variant and `imageScale` prop;
  existing default / card consumers retain their geometry.
- All ten hub flows now have routes; implementation and verification scope are
  recorded separately for each flow above.
- Supplier names are unique after trimming and case normalization. Contact fields
  validate phone/email, and optional postal codes accept five digits.
- Purchases link to supplier IDs and retain their name snapshots. Editing a
  supplier also associates matching legacy purchase records before renaming.
  Deletion is blocked while any purchase references that supplier.
- Supplier regional selection currently uses only the captured Riau example and
  preserves prefilled region values. It is not a complete regional directory.
- Materials keep stable IDs and unique normalized names/nonempty codes. Purchase
  and stock forms read the current material catalog; removed items cannot be saved,
  and quantity validation reads the current stock. Transaction item snapshots are
  preserved after edits, including their original units.
- Material deletion is blocked by captured movements or purchase/stock references.
  Detail shows the four latest session transactions followed by captured movements;
  cancelled purchases are excluded. This is a preview history, not a posted ledger.
- The cached flour detail labels quantities as Pcs while existing Inventory flows
  use Kg. Materials retain Kg consistently and use the detail's stock 18, minimum
  245, average price 30000 and location quantities 4/2/12. Summary analytics remain
  static design fixtures; purchase/stock creation does not update material balances.
  Location quantities are proportionally redistributed on a preview stock edit.
- Unknown average cost/daily usage appear as a dash. Editing a fixture without
  cost requires entering the required average price. Expiry is optional: Android
  uses the shared date control with the selected date; web/iOS use validated
  YYYY-MM-DD input. Native picker behavior is not verified.
- Recipes use the current eight Inventory products and initially empty recipe
  records. Only Ayam Geprek has a captured sale price (28000); other price/margin
  values remain unknown. Quantities and estimated unit costs are per portion;
  units follow selected materials. Stock simulation scales quantities separately,
  without adding kilograms to litres or posting stock. Estimated recipe costs do
  not mutate material/purchase prices. Recipe references also prevent material
  deletion, and stale drafts with changed units or missing materials are rejected.

## Other modules

Other sessions have changed modules and upgraded dependencies in this workspace
while Inventory was being implemented. Recheck the current routes and
`docs/README.md` before choosing the next module; the original placeholder audit
is no longer a current completion list. Small route files that re-export a
complete component are not placeholders.

## Verification

- Current workspace: Expo SDK 57, React Native 0.86, React 19.2, TypeScript 6.
  These dependency changes were made outside this Inventory implementation.
- Fourteen schema scenarios passed, covering required fields, item existence,
  positive/decimal quantities, stock limits, destination rules and purchase price.
- Store lifecycle checks passed: fixture subtotals match purchase totals, and
  create/delete/create leaves unique references.
- Fourteen Supplier schema scenarios passed, along with name uniqueness,
  create/edit/delete, retained IDs/metadata, missing-ID handling and purchase
  deletion guards. Legacy purchases retain their snapshots after supplier edits.
- Browser preview at 390 × 1004 passed stock-kind filters, search, required-field
  feedback, stock-limit feedback, decimal typing, transfer creation/detail,
  adjustment list/detail/form, purchase list/form and both summary tabs.
- Purchase status filtering, required-field feedback, decimal subtotal, unpaid
  create/detail, cancelled deletion and confirmed deletion passed in the browser.
- Summary rankings, recommendation navigation/material prefill, and mixed-unit
  adjustment creation/detail passed in the browser.
- Supplier browser checks passed: search/empty results, primary filters,
  prefilled edit, required/email/duplicate validation, create/detail, dependent
  region clearing, delete cancellation/confirmation and referenced-supplier
  protection. New suppliers are selectable in Purchase Orders; created purchases
  prevent their suppliers from being deleted.
- Supplier purchase totals update after purchase creation. Edit/detail deletion
  navigation returns to the existing detail/list route without duplicate screens.
- Material schema/store/helper checks and browser create/edit/delete, validation,
  search/filter, multi-store selection, decimal/date typing, purchase integration
  and stock-transfer limits passed. Preview widths 390 and 320 px have no
  horizontal overflow or page errors. Reproduction scripts, results and source
  fingerprints are in [qa/codex-2/materials/HANDOFF.md](qa/codex-2/materials/HANDOFF.md).
- Composition passed 49 model/reference/calculation checks, 67 Material regression
  checks and 52 browser assertions at 390/320 px without page errors. Sticky
  header/actions and scroll/click access to the custom simulation input passed.
  ESLint 18 source files, Biome 18 source + 4 QA scripts and focused TypeScript
  passed. [Developer evidence](qa/codex-2/compositions/HANDOFF.md) records hashes,
  concurrent hub/layout additions and limits; this is not independent approval.
- Payments passed 67 model checks, 67 Material + 49 Composition regressions and
  70 browser assertions at 390/320 px with no page errors. Decimal totals,
  latest-balance validation, edit/delete, PO guard/release, responsive metrics,
  form input access and sticky detail actions passed. ESLint 20 sources, Biome
  20 sources + 5 QA scripts and focused TypeScript passed after cleanup.
  [Developer evidence](qa/codex-2/bill-payments/HANDOFF.md) records stable source/
  dependency hashes and boundaries; full app/native/Figma acceptance is pending.
- Feature ESLint and Biome checks passed. Touched shared files have twelve
  existing warnings in `Form.tsx`, with no lint errors.
- Final `tsc --noEmit` for the previous Inventory/Supplier batch passed with exit
  code 0 on SDK 57 after preview cleanup. Materials passes focused TypeScript on
  its 22 changed files, ambient declarations and imported dependency closure.
  A project-wide integration gate after concurrent batches stabilize is deferred
  to PM per `SESSION_COORDINATION.md`; this is developer evidence, not QA approval.
- Implementation screenshots and comparison limits are saved in
  [previews/inventory/README.md](previews/inventory/README.md).
- Native Android/iOS comparison remains pending. Web preview does not establish
  pixel parity for safe-area insets, font rendering, shadows or device keyboards.

## Validation

This Inventory implementation did not change the package manifests or lockfiles.
An initial install/typecheck on SDK 53 encountered an out-of-sync npm lockfile and
63 existing TypeScript diagnostics. Subsequent dependency/source changes made in
other sessions superseded that baseline. Use the current check results above,
rather than treating the original diagnostics as current errors.

## Riwayat Mode Absensi — SD6-005 (9 Oktober 2026)

Menu Riwayat pada home yang semula Segera Hadir kini membuka /(absence)/history dan detail ID. Daftar per tanggal/search/filter status-toko/reset/live/missing/back tersedia. Sumber existing data contoh/sesi read-only, belum server atau pemisahan karyawan; label batas pratinjau tampil. Shared helper/status Absensi Kelola reused tanpa edit. Figma callable tidak tersedia pada sesi Senior6 dan frame tersimpan untuk mode ini tidak ditemukan; memakai AGENTS_UI, tanpa klaim parity.

[Progres](ABSENCE_HISTORY_UI_PROGRESS.md), [serah terima QA](qa/senior-6-2026-10-09/absence-history/HANDOFF.md): READY_FOR_QA → QC → PM. Developer65kelompok PASS (36model/25browser/4quality), portrait320/390 dan landscape844, runtime/console/externalHTTP0. Lint9/Biome7/scopedTS5roots/diff bersih; offline build sendiri tanpa operasi server/HP/rootconfig. QA/QC independen/native/fullrouter/Figma/backend/persistensi dan publikasi tetap gate terpisah.

## Pesanan Digital Back Office — SD6-006 (9 Oktober 2026)

Modul POS yang sebelumnya Coming Soon kini tersedia sebagai pengelolaan draf kanal pemesanan: daftar/search/filter/reset/tambah/detail/edit/hapus. Koleksi kosong awal/input pengguna/sesi, status Draf dan belum marketplace aktif/penerimaan pesanan/backend/persistensi. Source dua belas baru +dua delta POS, semantic primitive/RHF/Zod/Wrapper/header layout mengikuti AGENTS_UI. Figma callable diperiksa dan tidak tersedia pada toolset Senior6; belum parity visual Figma atau native.

[Progres](DIGITAL_ORDERS_UI_PROGRESS.md), [handoff QA](qa/senior-6-2026-10-09/digital-orders/HANDOFF.md): READY_FOR_QA → QC → PM. Developer65model/29browser/4quality=98PASS, viewport320/390/844, row panjang/target44px/footer/field terakhir bebas tombol. Runtime/console/externalHTTP0; lint14/Biome12/scopedTS enam roots+closure/diff bersih. Dependency opt-in terbaru owner Senior5 dipakai tanpa edit; generated router TypeScript direcheck. Packet frozen/source runtime fingerprint, offline cache sendiri di D karena C penuh, tanpa operasi HP/server/rootconfig. Approval QA/QC/native/fullrouter/Figma/backend/publikasi tetap gate terpisah.
