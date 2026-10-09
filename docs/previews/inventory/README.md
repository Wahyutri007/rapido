# Inventory UI previews

Captured on 8–9 October 2026 using the actual Inventory route layouts and feature
components in an isolated Expo web preview, at 390 × 1004 (Materials, Compositions and Payments also at
320 × 812). These images show the
implementation; Figma reference images are in [`../../figma/inventory/`](../../figma/inventory/).
See [`../../FIGMA_PROGRESS.md`](../../FIGMA_PROGRESS.md) for pending modules.

| Flow | Preview |
| --- | --- |
| Persediaan | [Hub](hub.png) |
| Ringkasan Inventory | [Bahan Baku](summary-material.png), [Produk](summary-product.png), [Ranking sheet](summary-ranking-sheet.png), [Recommendations](summary-recommendations.png) |
| Transfer Stok | [List](transfer-list.png), [Empty form](transfer-empty-form.png), [Filled form](transfer-filled-form.png), [Created detail](transfer-created-detail.png) |
| Penyesuaian Stok | [List](adjustment-list.png), [Empty form](adjustment-empty-form.png), [Filled form](adjustment-filled-form.png), [Detail](adjustment-detail.png), [Mixed units](adjustment-mixed-units-detail.png) |
| Pembelian Barang | [List](purchase-list.png), [Empty form](purchase-empty-form.png), [Filled form](purchase-filled-form.png), [Created detail](purchase-created-detail.png), [Recommendation prefill](purchase-recommendation-prefill.png) |
| Pemasok | [List](suppliers/list.png), [Empty form](suppliers/empty-form.png), [Filled form](suppliers/filled-form.png), [Detail](suppliers/detail.png), [Created detail](suppliers/created-detail.png), [Blocked deletion](suppliers/protected-delete.png) |
| Bahan Baku | [List](materials/list.png), [Empty form](materials/empty-form.png), [Filled form](materials/filled-form.png), [Detail](materials/detail.png), [Created detail](materials/created-detail.png), [Purchase movement](materials/purchase-movement.png), [Blocked deletion](materials/protected-delete.png), [320 px](materials/detail-320.png) |
| Komposisi Produk | [List](compositions/list.png), [Empty form](compositions/empty-form.png), [Filled form](compositions/filled-form.png), [Detail](compositions/detail.png), [Simulation](compositions/simulation.png), [320 px](compositions/simulation-320.png), [Material deletion guard](compositions/protected-material-delete.png) |
| Pembayaran Tagihan | [Empty list](bill-payments/empty-list.png), [List](bill-payments/list.png), [Empty form](bill-payments/empty-form.png), [Multiple POs](bill-payments/filled-form.png), [Detail](bill-payments/detail.png), [320 px](bill-payments/detail-320.png), [PO deletion guard](bill-payments/protected-purchase-delete.png) |

## Checks

- Fourteen schema scenarios passed: required values, unknown items, positive and
  decimal quantities, available-stock limits, transfer destinations and prices.
- Store checks passed: fixture totals match line subtotals; create/delete/create
  does not leave duplicate purchase references.
- Browser interactions passed: stock-kind tabs, search, validation feedback,
  decimal typing, transfer create/detail, adjustment form/detail, summary tabs,
  rankings, purchase recommendations and material-item prefill.
- Purchase interactions passed: status filter, required fields, decimal subtotal,
  unpaid create/detail, cancelled deletion and confirmed deletion.
- Mixed-unit adjustment creation/detail passed: quantities with different units
  are kept on their respective item rows and are not added in aggregate cards.
- Feature ESLint and Biome passed. Checking touched shared files reported twelve
  existing warnings in `components/common/Form.tsx`, with no lint errors.
- Final project-wide `tsc --noEmit` passed with exit code 0 after preview cleanup.
- Supplier schema, state lifecycle and browser interaction checks are recorded in
  [suppliers/README.md](suppliers/README.md), including purchase integration and
  the current regional-data limitations.
- Material schema/state, browser and focused type/lint results are recorded in
  [materials/README.md](materials/README.md). The earlier full TypeScript gate
  predates Materials; a combined gate after concurrent batches stabilize belongs
  to PM under the session coordination notes.
- Recipe validation/state/calculation, ingredient references and browser
  list/form/detail/simulation checks are in
  [compositions/README.md](compositions/README.md). Scroll/click access to the
  custom-portion control is checked above sticky actions at 390 and 320 px.
- Payment checks passed: 67 model, 67 Material + 49 Composition regressions,
  70 browser assertions, focused TypeScript and scoped ESLint/Biome. See
  [bill-payments/README.md](bill-payments/README.md) for preview states and limits.
  Metrics, form input access and sticky detail actions passed at 390 and 320 px.

The temporary preview entry and routes were removed after these checks. No test
dependencies were added to the app package manifest. The preview bypassed backend
and authentication setup; it does not verify backend persistence or role access.

## Comparison limits

Native device comparison is pending. The browser has different safe-area insets,
font/shadow rendering, keyboards and date-picker behavior. Existing shared tab
icons also emit a web DOM warning for the `focused` prop.

The list tabs count the current sample records; their figures differ from the
larger counts shown in Figma. Form dates and newly created records reflect the
current session. Purchase detail still needs its full Figma design context.
These previews do not certify 100% visual parity.


## SD5-011 current color correction

[Latest isolated visual evidence](../../qa/senior-5-2026-10-09/inventory-qc-colors/compare.html) and [QA/QC handoff](../../qa/senior-5-2026-10-09/inventory-qc-colors/HANDOFF.md):44browser+7scope PASS. Stock adjustment totals and damaged quantity/percent now use semantic status colors; transfer/purchase metadata icons muted only at opt-in callsites. These replace the relevant historical color observations, not whole-frame/native approval. Metric wrapping/geometry and official asset shape exports remain pending; fresh Figma access still Starter-limited. No shared preview server or application dummy data changed.
