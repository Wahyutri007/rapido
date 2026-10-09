# Codex-2 developer handoff: Pembayaran Tagihan

Date: 9 October 2026 (Asia/Jakarta). Status: **READY_FOR_QA** after final browser
verification and preview cleanup. This is developer evidence, not QA/QC/PM approval.

Persediaan opens the payment list, multi-PO form and snapshot detail. Search by
payment/PO/external reference, supplier filtering, payment totals and outstanding
balances use existing Inventory purchases and suppliers. The initial payment
collection is empty. Already-paid POs are settled without invented payment history;
cancelled POs cannot be paid. New unpaid purchases become selectable immediately.

Each cash allocation plus optional discount must fit its current PO balance.
Save reads fresh catalogs; missing/cancelled/settled POs, wrong suppliers, duplicate
lines, invalid dates and excessive totals are rejected. Dates use the local purchase
day, including UTC-midnight boundaries. Amounts normalize to two decimal places,
the smallest positive payment is 0.01, and fractional totals display accurately.
Arithmetic uses minor units and normalizes negative zero after full settlement.

Edit preserves ID/reference/createdAt and excludes its old allocation while
counting other payments. Detail preserves supplier/PO/date/amount snapshots and
labels the remaining balance as the snapshot at save. Delete releases allocations;
referenced POs cannot be deleted. Purchase detail shows derived payment status,
current remaining balance and a prefilled payment link. Original receipt status
and paid flags are retained. No cash/bank/stock posting is performed.

## Checks

| Check | Result | Reproduction/evidence |
| --- | --- | --- |
| Billing production schema/store/helpers | 67 passed | `node docs/qa/codex-2/bill-payments/check-model.cjs`; [model-results.json](model-results.json) |
| Existing Material and Composition regression | 67 + 49 passed | `node docs/qa/codex-2/bill-payments/check-regressions.cjs`; [Material result](material-regression-results.json), [Composition result](composition-regression-results.json) |
| Actual component/layout browser | 70 passed; 0 page errors, after final cent validation | `node docs/qa/codex-2/bill-payments/check-browser.cjs`; [browser-results.json](browser-results.json) |
| Focused TypeScript | 0 diagnostics, repeated after cleanup | `node docs/qa/codex-2/bill-payments/check-types.cjs`; [type-results.json](type-results.json) |
| ESLint | 20 production files; 0 errors/warnings | `node node_modules/eslint/bin/eslint.js --max-warnings=0 <20 production paths from type-results.json>` |
| Biome | 20 production files + 5 QA scripts passed | `node node_modules/@biomejs/biome/bin/biome format <same 20 paths plus five .cjs scripts in this directory>` |

Model checks cover supplier/bill validity, cancelled/paid bills, cents/finite/caps,
cash/discount bounds, date/leap/calendar cases, duplicate POs, local-date boundaries,
minor-unit addition, full/fractional settlement, edited allocations, later payments,
snapshots, missing IDs, deletion guards and reference numbering after deletion.
The regression runner changes only output filenames in the older checkers and runs
them with this packet's directory, preserving their historical result files.

Browser coverage includes empty/search/filter, required/date/balance errors,
PO selection/removal, a new unpaid purchase, multiple-PO
payment, decimal totals, partial/edit/full settlement, stable edit ID, confirmation
cancel/delete, PO deletion protection/release and missing/empty route IDs.
Microsoft Edge headless uses **390 × 1004** and **320 × 812**, Asia/Jakarta.
Metric text bounds, custom form input access above the footer, horizontal overflow,
and sticky detail header/actions are checked. [Previews](../../../previews/inventory/bill-payments/README.md)
show implementation behavior, not a Figma comparison.

## Reproduction and boundaries

From the app root, using Node, existing Playwright at
`.expo/payroll-qa-tools/node_modules/playwright` and the Edge path in the checker:

1. Ensure `preview-inventory/` is absent and ports 8081/8091 are free. Run
   `node docs/qa/codex-2/bill-payments/setup-preview.cjs`. It refuses to overwrite
   the preview root and creates 43 temporary TSX files with production Inventory
   routes, shared controls/fonts and four placeholder Back Office tabs.
2. In another PowerShell terminal set `$env:CI='1'`, `$env:EXPO_OFFLINE='1'` and run
   `node node_modules/expo/bin/cli start --port 8081 --offline --max-workers 1`.
3. Run the browser checker. It drains the bundle before opening Edge to reduce
   startup memory contention. Stop only these owned servers afterward, delete the
   known generated TSX files explicitly, remove their empty directories and repeat
   focused TypeScript. No app dependencies were added.

The preview bypasses boot/auth/backend and omits the application root's route
groups. Browser history returns across module boundaries; native/shared header
back behavior in the full application is not certified by this harness. A failed
header experiment is retained in [interim](interim/). Earlier attempts also record
fixture/menu selector corrections and timing failures. Their assertions are not
summed into the final passing run. The observed clipped 320 px metrics and date/
negative-zero issues were corrected before final source capture.

All 43 generated TSX files and their empty preview directories were removed.
Owned Metro 8081 and HTML 8091 servers were stopped; other sessions' processes
were preserved. Focused TypeScript, ESLint and Biome passed after this cleanup.

[source-sha256.json](source-sha256.json) and [dependency-sha256.json](dependency-sha256.json)
record source/context used for the final browser run. [verification.json](verification.json)
records results, source/dependency drift, scripts, runtime versions and cleanup.
The Material/Composition packets remain historical baselines; their regression
against the new PO guard is recorded here. Stok Akhir/Mutasi are other owners'
modules; their routes are included for layout compatibility, not certified here.

## Limits

Payments are session-only. No payment API, persistence, bank account, discount
authorization, accounting ledger or native/device comparison is supplied.
Methods reuse existing Inventory purchase choices. Full Figma context/screenshots
are unavailable; [reference notes](../../../figma/inventory/bill-payments/README.md)
record inconsistent frame names/copy and provisional choices. Exact visual parity
remains unverified. Full application TypeScript, boot/role/header navigation and
independent QA/QC/PM acceptance remain separate gates.

No shared primitive, backend, dependency, auth, HP server/device, Git branch/index,
commit or push was changed by this flow. Purchase list/detail/store changes are
limited to the payment link, derived balance and guarded deletion feedback.
