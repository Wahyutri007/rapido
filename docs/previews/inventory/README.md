# Inventory UI previews

Captured on 8 October 2026 using the actual Inventory route layouts and feature
components in an isolated Expo web preview, at 390 × 1004. These images show the
implementation; Figma reference images are in [`../../figma/inventory/`](../../figma/inventory/).
See [`../../FIGMA_PROGRESS.md`](../../FIGMA_PROGRESS.md) for pending modules.

| Flow | Preview |
| --- | --- |
| Persediaan | [Hub](hub.png) |
| Ringkasan Inventory | [Bahan Baku](summary-material.png), [Produk](summary-product.png), [Ranking sheet](summary-ranking-sheet.png), [Recommendations](summary-recommendations.png) |
| Transfer Stok | [List](transfer-list.png), [Empty form](transfer-empty-form.png), [Filled form](transfer-filled-form.png), [Created detail](transfer-created-detail.png) |
| Penyesuaian Stok | [List](adjustment-list.png), [Empty form](adjustment-empty-form.png), [Filled form](adjustment-filled-form.png), [Detail](adjustment-detail.png), [Mixed units](adjustment-mixed-units-detail.png) |
| Pembelian Barang | [List](purchase-list.png), [Empty form](purchase-empty-form.png), [Filled form](purchase-filled-form.png), [Created detail](purchase-created-detail.png), [Recommendation prefill](purchase-recommendation-prefill.png) |

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
