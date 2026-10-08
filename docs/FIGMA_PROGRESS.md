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
| Pemasok | `1:15653`, `1:15530`, `1:15570` | Pending design context and screenshots; not implemented. |
| Bahan Baku | `1:29776`, `1:31002` | Pending design context and screenshots; not implemented. |
| Komposisi Produk | `1:31287`, `1:31448`, `1:31480` | Pending design context and screenshots; not implemented. |
| Pembayaran Tagihan | `1:15208`, `1:14178`, `1:26045` | Pending design context and screenshots; not implemented. |
| Riwayat Mutasi Stok | `1:30149`, `1:30441`, `1:30733`, `1:30871` | Pending design context and screenshots; not implemented. |
| Stok Akhir | `1:12401` | Pending design context and screenshot; not implemented. |

Figma MCP returned the Starter-plan tool-call limit after the purchase list and
form were read. Do not repeatedly request these pending nodes or substitute an
invented design. Resume design inspection when that access is available.

## Data and architecture

- Source screens: `app/(back-office)/inventory` and `app/(no-layout)/inventory`.
- Feature UI: `components/feature/inventory`; shared stock-operation components
  cover the transfer and adjustment flows without duplicating their layouts.
- UI models: `types/ui/inventory.ts`; validation: `schema/inventory.ts`.
- Mock fixtures: `constants/data/inventory*.ts`; session-only preview records:
  `store/inventoryStore.ts`. They are not backend DTOs and are not persisted.
- Existing Query hooks and authentication are unchanged. No inventory backend
  endpoints were invented. Replace preview data through the API factory when the
  backend contract is supplied.
- Forms use React Hook Form, Zod and shared form controls. Store selection,
  positive quantity, available-stock and transfer-destination validation apply.
- Existing `FormInput` has an optional `multiline` prop, defaulting to false.
- Existing `NavList` has an optional `inventory` variant and `imageScale` prop;
  existing default / card consumers retain their geometry.
- Missing hub flows have no `href`, avoiding navigation to nonexistent routes.

## Remaining modules outside Inventory

The initial audit also found placeholder screens in Cashier (billing, location,
transaction and history) and Manage (absence, expenses, income, payroll and sales
target), plus hub links without routes. Their Figma frames still need inspection.
Small route files that re-export a complete component are not placeholders.

## Validation

Dependencies installed without rewriting either lockfile. `npm ci` cannot run
against the current `package-lock.json` because it is out of sync with
`package.json`; this predates UI implementation.

The initial `tsc --noEmit` run reported 63 existing error locations. Compare new
diagnostics against the baseline; do not call the whole project type-clean until
those existing errors have been resolved. Final UI, lint and schema verification
results will be recorded here after checks finish.
