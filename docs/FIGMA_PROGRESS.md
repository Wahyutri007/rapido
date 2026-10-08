# Figma implementation progress

Updated: 8 October 2026. Follow `AGENTS.md` and `AGENTS_UI.md`; use the user's
Figma file, not the older file key written in `figma-slice-screen/SKILL.md`.

Source: [Rapido Figma](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=0-1).
Implementation is proceeding by module. No claim of 100% visual parity has been
made; native device comparison is still required.

## Inventory

| Module | Figma nodes | Implementation / verification status |
| --- | --- | --- |
| Persediaan hub | `1:4792` | Ten design menu entries, four connected flows; exact exported bitmap icons. Other entries disabled until their flows are built. |
| Ringkasan Inventory | `1:12487`, `1:12956` | Both tabs, metrics, ranking cards, chart, recommendations and insights implemented from design context and screenshot. |
| Transfer Stok | `1:12059`, `1:11949`, `1:12312` | List, create, detail, search and store / stock-kind filters implemented from context and screenshots. |
| Penyesuaian Stok | `1:13404`, `1:13851`, `1:13605` | List, create and detail implemented from context and screenshots. |
| Pembelian Barang | `1:14945`, `1:14543` | List and create context / screenshots captured; implemented. Detail uses existing detail components and cached metadata; full Figma context still pending (`1:14866`). |
| Pemasok | `1:15653`, `1:15530`, `1:15570` | Pending design context and screenshots; not implemented in this published snapshot. |
| Bahan Baku | `1:29776`, `1:31002` | Pending design context and screenshots; not implemented. |
| Komposisi Produk | `1:31287`, `1:31448`, `1:31480` | Pending design context and screenshots; not implemented. |
| Pembayaran Tagihan | `1:15208`, `1:14178`, `1:26045` | Pending design context and screenshots; not implemented. |
| Riwayat Mutasi Stok | `1:30149`, `1:30441`, `1:30733`, `1:30871` | Pending design context and screenshots; not implemented. |
| Stok Akhir | `1:12401` | Pending design context and screenshot; not implemented. |

Figma MCP returned the Starter-plan tool-call limit after the purchase list and
form were read. Recheck pending contexts and screenshots when access is available.

## Data and architecture

- Source screens: `app/(back-office)/inventory` and `app/(no-layout)/inventory`.
- Feature UI: `components/feature/inventory`; shared stock-operation components
  cover the transfer and adjustment flows without duplicating their layouts.
- UI models: `types/ui/inventory.ts`; validation: `schema/inventory.ts`.
- Mock fixtures: `constants/data/inventory*.ts`; session-only preview records:
  `store/inventoryStore.ts`. They are not
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
- Missing hub flows have no `href`, avoiding navigation to nonexistent routes.
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
- Feature ESLint and Biome checks passed. Touched shared files have twelve
  existing warnings in `Form.tsx`, with no lint errors.
- Final `tsc --noEmit` passed with exit code 0 on the current SDK 57 workspace,
  after removal of the temporary preview entry and routes.
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
