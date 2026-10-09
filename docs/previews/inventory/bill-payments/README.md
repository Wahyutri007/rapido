# Pembayaran Tagihan implementation previews

Captured on 9 October 2026 from production Inventory components, layouts, shared
controls and fonts in an isolated Expo web preview. Auth/backend boot is bypassed.
These images show implementation behavior; exact Figma parity is unverified.
The final browser run passed 70 assertions with zero page errors at 390 × 1004
and 320 × 812; temporary preview routes and owned servers have been cleaned up.

| State | Screenshot |
| --- | --- |
| Initial empty list | [390 px](empty-list.png), [320 px](empty-list-320.png) |
| Saved payment list/filter | [390 px](list.png), [320 px](list-320.png) |
| Payment form | [Empty](empty-form.png), [Multiple POs](filled-form.png), [320 px](filled-form-320.png) |
| Saved snapshot | [Detail](detail.png), [Scrolled 320 px](detail-320.png) |
| Referenced PO deletion | [Protected deletion](protected-purchase-delete.png) |

Checks cover required/date/latest-balance errors, supplier/PO selection/removal,
new unpaid purchase integration, multiple POs, decimal totals, partial/edit/full
settlement, reference/ID stability, cancelled/confirmed deletion and PO protection/
release. Missing/empty edit IDs have no save action. Metric values remain within
screen bounds; detail actions/header and the form's last input remain usable at
320 px. Final results and scope are in the [developer handoff](../../../qa/codex-2/bill-payments/HANDOFF.md).

Payments reduce session outstanding balances; receipt status and original paid
flags stay separate. Detail uses snapshots at save. No cash/bank/stock ledger or
backend/persistence is connected. [Source notes](../../../figma/inventory/bill-payments/README.md)
record frame discrepancies and rounding/date choices. Browser history is used
across isolated route groups; full root/auth/header back behavior, native date/
keyboard/safe-area/font comparison and independent acceptance remain pending.
