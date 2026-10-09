# Codex-2 developer handoff: Komposisi Produk

Date: 9 October 2026 (Asia/Jakarta). **READY_FOR_QA** records developer evidence;
independent QA/QC/PM acceptance is pending.

Persediaan opens a product recipe list, ingredient form and cost/margin detail.
Search, status filters and counters use the existing eight Inventory products.
Recipes start empty. Quantities are per portion, units follow selected materials,
and estimated unit costs default to known material average prices. Saved recipes
have stable product IDs. The simulation scales each ingredient for 1, 5 or custom
portions without posting stock or changing material/purchase prices.

Only Ayam Geprek has a captured sale price. Other prices and margins show a dash.
Validation checks positive finite quantities/prices, duplicate ingredients,
overflow, missing material IDs and changed units against the current catalog.
Active recipes block material deletion; clearing a recipe releases that reference
while purchase/stock/history guards remain. Layouts own headers, route files stay
thin, and feature UI reuses Rapido semantic controls with RHF/Zod/useWatch.

## Evidence

| Check | Result | Reproduction/evidence |
| --- | --- | --- |
| Production model/schema/store/helper | 49 passed | `node docs/qa/codex-2/compositions/check-model.cjs`; [model-results.json](model-results.json) |
| Materials regression | 67 passed | Existing Materials checker against the added recipe guard; [material-regression-results.json](material-regression-results.json) |
| Actual feature/router browser | 52 passed; 0 page errors | `node docs/qa/codex-2/compositions/check-browser.cjs`; [browser-results.json](browser-results.json) |
| Focused TypeScript | 0 diagnostics | `node docs/qa/codex-2/compositions/check-types.cjs`; [type-results.json](type-results.json) |
| ESLint | 18 production files; 0 errors/warnings | `node node_modules/eslint/bin/eslint.js --max-warnings=0 <production paths from type-results.json>` |
| Biome | 18 production files + 4 QA scripts passed | `node node_modules/@biomejs/biome/bin/biome format <same source paths and four .cjs files in this directory>` |

Model coverage includes cost/profit/negative margin, simulation fractions and
overflow, per-unit quantities, upsert/edit/delete, snapshot stability, missing
IDs and current-catalog/unit checks. Browser coverage includes search/empty/filter,
required fields, decimal typing, ingredient add/remove, cost prefill, create/edit,
derived margin, invalid simulation, delete cancellation/confirmation, new material
selection and the material deletion guard/release.

Microsoft Edge headless used 390 × 1004 and 320 × 812, Asia/Jakarta. Actual wheel
scroll and click verified the custom-portion input above sticky actions. Header
and Edit/Hapus bounds were checked before/after scrolling at both widths. No
horizontal overflow was observed. [Screenshots](../../../previews/inventory/compositions/README.md)
and [verification.json](verification.json) provide the final evidence and limits.

## Reproduction

Run from the app root using Node, existing Playwright at
`.expo/payroll-qa-tools/node_modules/playwright`, and the Edge path in the checker.
No app dependencies were added. Adapt those local tool paths if needed.

1. Ensure `preview-inventory/` is absent and ports 8081/8091 are free. Run
   `node docs/qa/codex-2/compositions/setup-preview.cjs`. The archived generator
   was the actual successful harness and creates 35 temporary TSX files.
2. In another PowerShell terminal set `$env:CI='1'` and `$env:EXPO_OFFLINE='1'`,
   then run `node node_modules/expo/bin/cli start --port 8081 --offline --max-workers 1`.
3. Run the browser checker. Stop only these owned servers, explicitly delete
   the known generated files and remove their empty directories. Repeat focused
   TypeScript after cleanup; preserve other sessions' processes and files.

The harness uses production feature components, shared controls, fonts and
Inventory layouts. Auth/backend initialization is bypassed. It does not test
role guards, backend persistence, SSR or the full application navigator.

## Source boundaries

[source-sha256.json](source-sha256.json) captures the 18 source files used by the
browser. Subsequent hub/parent additions for Stok Akhir and Riwayat Mutasi belong
to Senior 5/6. Verification records their drift separately; 16 feature/model/store
fingerprints remain the implementation baseline. These additions are not claimed
as browser coverage by this packet. Full integration TypeScript remains PM's gate
after concurrent batches stabilize. No shared primitive, backend, dependencies,
auth, branch/index, commit or push was changed by this module.

The Material store has a new recipe deletion guard. Its earlier Materials packet
remains historical; the current store checksum and Materials regression result
belong to this Composition packet. Earlier QA evidence is not overwritten as a
new approval.

Subsequent Pembayaran Tagihan integration adds a PO payment guard to InventoryStore
and its own hub/parent route entries. The Composition implementation baseline above
remains historical. Its 49 model assertions were replayed against current source
in the [payment packet](../bill-payments/HANDOFF.md), together with 67 Material
regressions; that packet records the later source hashes and browser scope.

## Limits

Data is session-only. No recipe API, persistence, batch yield, unit conversion or
sale-driven consumption contract is available. [Reference notes](../../../figma/inventory/compositions/README.md)
record conflicting sample names, sale prices, totals and portion arithmetic.
Current counters show real preview records rather than the design's 12/8 sample.
Full Figma hierarchy/screenshots and native keyboard/safe-area/font comparison
are unavailable here; visual geometry remains provisional and 100% parity is
unverified. Pembayaran Tagihan is now READY_FOR_QA in the linked payment packet;
Mutasi and Stok Akhir are owned by other sessions.
