# Komposisi Produk implementation previews

Captured on 9 October 2026 using actual route layouts, feature components, shared
controls and Inter fonts in an isolated Expo web preview. Backend/auth startup
was bypassed. These images show implementation behavior, not a Figma comparison.

| State | Screenshot |
| --- | --- |
| Product list | [390 px](list.png), [320 px](list-320.png) |
| Unconfigured product | [Detail](empty-detail.png) |
| Recipe form | [Empty](empty-form.png), [Filled](filled-form.png) |
| Saved recipe | [Cost/margin detail](detail.png) |
| Portion simulation | [390 px](simulation.png), [320 px](simulation-320.png) |
| Material reference guard | [Blocked deletion](protected-material-delete.png) |

Checks cover search/empty results, status filter/counters, ingredient selection/
removal, required/positive quantity, decimal typing, average-cost prefill, create/
edit, derived gross profit/margin, 1/5/custom portions, invalid custom amounts,
delete cancellation/confirmation and new material integration. Referenced material
deletion is blocked until its recipe is removed. Unknown sale price is not
invented. Scrolling and clicking the custom-portion input above the sticky actions
are checked at both widths; no horizontal overflow or page errors were observed.

[Developer handoff/results](../../../qa/codex-2/compositions/HANDOFF.md) records
focused type/lint/model/browser evidence and its scope. No QA/QC/PM acceptance or
full-project integration gate is claimed.

The source has inconsistent recipe costs, portion counts, sale prices and product
names. [Reference notes](../../../figma/inventory/compositions/README.md) explain
the per-portion/unit-cost interpretation and differences from those sample values.
The current catalog has eight products; recipes initially start empty. Only Ayam
Geprek has a captured sale price. Recipes, estimates and simulations are session
data and do not post stock or change purchase/material prices. Native keyboard,
safe-area/font rendering, full Figma context and 100% parity remain unverified.
