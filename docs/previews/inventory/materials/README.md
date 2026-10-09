# Bahan Baku implementation previews

Captured on 9 October 2026 with the actual feature components, shared controls,
fonts and route layouts in an isolated Expo web preview. Authentication and
backend bootstrap were bypassed. No dependency or package-manifest changes were
made for this module.

| Screen/state | Screenshot |
| --- | --- |
| List | [390 px](list.png), [320 px](list-320.png) |
| Flour detail | [390 px](detail.png), [320 px](detail-320.png) |
| Create form | [Empty](empty-form.png), [Filled](filled-form.png) |
| New material detail | [Created](created-detail.png) |
| Purchase integration | [Recent purchase movement](purchase-movement.png) |
| Referenced material | [Blocked deletion](protected-delete.png) |

Developer checks passed: production schema/store/helper scenarios; search, empty
results, store/status filters, required/duplicate/date errors, decimal typing,
expiry clearing, multi-store creation, prefilled edit, stable IDs, delete
cancellation/confirmation and reference guards. New materials are selectable in
Purchase Orders and Transfer Stok. Transfer validation rejects quantities above
the current stock. Purchase creation appears in recent movements. Browser checks
reported zero page errors and no horizontal overflow at 390 x 1004 and 320 x 812.
ESLint, Biome and focused TypeScript results are recorded in the
[developer handoff](../../../qa/codex-2/materials/HANDOFF.md).

Data is session-only. Material create/edit/delete updates list counts and item
selection. Transactions retain item snapshots; their preview creation does not
post stock balances. Location quantities are proportionally redistributed when
the material form edits stock. Summary analytics remain separate design fixtures.
Unknown cost/usage use a dash. No material API or warehouse contract is invented.

Full Figma context/screenshots and the list reference are unavailable under the
current MCP quota. [Source notes](../../../figma/inventory/materials/README.md)
explain the saved form naming and Pcs/Kg discrepancy. These images are
implementation evidence, not Figma comparison results. Native safe areas,
fonts/shadows, keyboards and Android date picker behavior are not verified;
web/iOS expiry uses validated YYYY-MM-DD entry. No 100% parity or QA/PM approval
is claimed.
