# Pembayaran Tagihan reference

Source: [Rapido Figma](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=0-1).
Reviewed on 9 October 2026 from saved [Inventory metadata](../frames.json).
[frames.json](frames.json) preserves the three original frame summaries.

| Flow | Node | Dimensions | Content |
| --- | --- | --- | --- |
| List | 1:15208 | 390 × 1091 | Payment/bill totals, supplier, KK reference, PO count, date, method, amount |
| Form | 1:14178 | 390 × 1797 | Supplier, payment method, external reference, date/note, PO lines, discount, payment/remaining |
| Detail | 1:26045 | 390 × 1092 | Payment reference/date, supplier/method/note, PO amounts, price breakdown |

The frame names incorrectly say Purchase Order, Tambah pesanan pembelian and
Detail Biaya Tambahan. Their content identifies the payment flow. Detail also
calls PO lines Item Bundling; implementation uses Daftar Tagihan. List includes
purchase rows and unrelated item/stock table text. No corresponding valid payment
records were captured, so the payment list starts empty rather than inventing
transactions. Actual pending purchases supply selectable bills.

Full Figma tools/context/screenshots are unavailable in this session. Geometry
uses shared Rapido semantic controls; metadata cannot establish exact spacing,
color, typography or 100% parity. Payment methods reuse existing Inventory purchase
choices, without inventing a BCA bank account. No store identifier was supplied
for payments: the preview reference uses KK/YYYYMM/sequence, not a fabricated A001.

## Behavior and data limits

Payment allocations and optional discounts reduce unpaid purchase balances.
Purchases already marked paid are treated as settled, without generating a
historical payment record. Cancelled purchases cannot be paid. The form accepts
multiple outstanding POs from the same supplier; each positive payment plus its
nonnegative discount must fit the latest balance. Values have at most two decimal
places and totals use minor currency units to avoid floating-point drift.
The smallest positive payment is 0.01. Stored values normalize to cents;
fractional totals display up to two decimals, including full settlement at zero.

Dates use real YYYY-MM-DD calendar values and cannot precede the selected bills.
Android uses the shared date display with an explicit picker seeded by the chosen
date; web/iOS use validated text. Native picker/keyboard behavior is unverified.

Edit preserves identity/reference and excludes the edited payment from available
balance calculations. Later payments still count. Historical PO/date/amount and
supplier snapshots remain on detail; displayed remaining is explicitly the
snapshot at save. Deleting a payment releases its allocation in the session.
Referenced POs cannot be deleted until payments are removed. Receipt status and
the original paid flag are retained; payment status is derived separately.

No Inventory payment API, persistence, cash/bank posting, discount authorization,
stock ledger or accounting integration is supplied. This flow is session UI and
does not send money. [Implementation evidence](../../../qa/codex-2/bill-payments/HANDOFF.md)
and [previews](../../../previews/inventory/bill-payments/README.md) record completed
developer checks and remaining comparison/integration limits.
