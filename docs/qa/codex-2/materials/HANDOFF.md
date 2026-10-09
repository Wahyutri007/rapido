# Codex-2 developer handoff: Bahan Baku

Date: 9 October 2026 (Asia/Jakarta). Status: **READY_FOR_QA**; this records
developer checks and does not claim independent QA/QC/PM acceptance.

Later extension: Komposisi Produk adds a recipe-reference deletion guard to the
Material store. This packet remains the earlier baseline. The current store
fingerprint and 67 passing Material regression checks are recorded in the
[Composition handoff](../compositions/HANDOFF.md); they do not replace independent
QA/QC approval of either packet.

Persediaan now opens the Materials list, create/edit form and detail. Search and
store/status filters, stock counts, required/duplicate/date validation, optional
expiry/notes, location metrics, recent movements and guarded deletion use shared
Rapido primitives. Headers live in route layouts; route files re-export feature
components. Material model/schema/fixtures/store are separated from backend DTOs.

Purchase and stock forms subscribe to the current material catalog. A new item
can be selected immediately; editing keeps its ID and transaction snapshots;
missing items and quantities exceeding current stock are rejected. Material
deletion is blocked by captured movements or purchase/stock references. Empty or
unknown edit IDs cannot silently create a new material.

## Evidence and checks

| Check | Result | Reproduction/evidence |
| --- | --- | --- |
| Production schema/store/helper scenarios | 67 passed, 0 failures | `node docs/qa/codex-2/materials/check-model.cjs`; [model-results.json](model-results.json) |
| Browser interactions | Passed; 0 page errors | `node docs/qa/codex-2/materials/check-browser.cjs`; [browser-results.json](browser-results.json) |
| Focused TypeScript | 0 diagnostics | `node docs/qa/codex-2/materials/check-types.cjs`; [type-results.json](type-results.json) |
| ESLint | 22 production files; 0 errors/warnings | `node node_modules/eslint/bin/eslint.js --max-warnings=0 <22 paths from type-results.json, excluding ambient files>` |
| Biome | 22 production files + 4 QA scripts; passed | `node node_modules/@biomejs/biome/bin/biome format <same 22 paths> docs/qa/codex-2/materials/{check-model,check-browser,check-types,setup-preview}.cjs` (expand the brace list on PowerShell) |
| Scoped tracked diff | Passed | `git diff --check -- <Inventory source/docs paths>` |

The model checks include finite values/overflow, leap dates, optional expiry,
unique names/codes, preserved IDs/history, stock allocation totals, create/delete
references, missing IDs, snapshot units, cancelled movement filtering and
existing product transfer/adjustment validation. Browser coverage includes
search/empty results, filters, multi-store creation, decimal/date typing,
prefilled edit, expiry clear, delete cancellation/confirmation, purchase selection
and recent movement, reference protection, transfer selection and stock limit.

Browser sizes: **390 x 1004** and **320 x 812**, Microsoft Edge headless,
Asia/Jakarta timezone. No horizontal overflow on the list/detail. Screenshots:
[implementation previews](../../../previews/inventory/materials/README.md).
[verification.json](verification.json) records final source SHA-256 fingerprints
and relevant runtime versions. The final browser run restarted the developer's
Metro after the empty-edit-ID fix to avoid checking a cached earlier bundle.

## Browser reproduction

Run from the app root. The harness depends on the existing local Playwright at
`.expo/payroll-qa-tools/node_modules/playwright` and Microsoft Edge at the path
shown in `check-browser.cjs`; no dependencies were added to the app. Adapt these
two paths to an equivalent local installation when reproducing elsewhere.

1. Check that `preview-inventory/` is absent and ports 8081/8091 are free; preserve
   other sessions' preview directories/processes. In one terminal, run
   `node docs/qa/codex-2/materials/setup-preview.cjs`. It creates 31 temporary TSX
   files and serves the HTML/asset proxy on 8091. The script refuses to overwrite
   an existing preview root.
2. In another PowerShell terminal, set `$env:CI='1'` and
   `$env:EXPO_OFFLINE='1'`, then run
   `node node_modules/expo/bin/cli start --port 8081 --offline --max-workers 1`.
3. Run `node docs/qa/codex-2/materials/check-browser.cjs` in a third terminal.
4. Stop only these owned servers. Inspect the generated files, delete the known
   temporary TSX files explicitly, then remove only their empty directories.
   Re-run focused TypeScript. Do not leave preview routes in production source.

The archived generator's Node syntax was checked; the successful browser run used
the equivalent generator in `.expo/inventory-material-tools/` with the same
entry/layout source. Authentication, route guards and backend initialization are
bypassed; the browser evidence does not verify those integrations.

## Limits and next work

Material data is session-only, with no material API or persistence contract.
Purchase/stock record creation does not post material balances. Locations are
proportionally redistributed when stock is edited in the preview form. Summary
analytics remain static design fixtures. Unknown average cost/daily usage render
a dash; editing a fixture without cost requires the average-price field.

Full Figma context/screenshots are quota-limited and the list reference is not
captured. The form/detail use saved texts/dimensions and existing exported images
and semantic tokens. The cached form name/body copy and flour Pcs/Kg mismatch
are documented in [source notes](../../../figma/inventory/materials/README.md).
Web/iOS expiry uses validated YYYY-MM-DD entry; Android uses the selected date
with the shared date control. Native date picker, keyboard/safe-area behavior
and exact visual parity remain unverified. Do not mark this slice 100% identical.

The focused TypeScript check includes 22 changed production files, ambient
declarations and imported dependencies, not every app root. Full integration
TypeScript belongs to PM after concurrent batches stabilize per
`docs/SESSION_COORDINATION.md`. This module changed no shared primitive, backend,
package manifest, lockfile, auth, branch/index or commit/push. Komposisi Produk and
Pembayaran Tagihan are now READY_FOR_QA; Riwayat Mutasi Stok and Stok Akhir follow
their owners' latest status. The original packet remains historical. The
[payment packet](../bill-payments/HANDOFF.md) includes a fresh 67-assertion Material
regression after both recipe and PO-payment reference guards were added.
