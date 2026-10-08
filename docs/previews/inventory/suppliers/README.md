# Supplier UI preview

Captured on 8 October 2026 from the actual Supplier feature components and route
layouts in an isolated Expo web preview, at 390 × 1004. These are implementation
screenshots. Cached Figma metadata and source discrepancies are documented in
[the supplier reference](../../../figma/inventory/suppliers/README.md).

| Screen | Preview |
| --- | --- |
| Supplier list | [List](list.png) |
| Source supplier detail | [Detail](detail.png) |
| Add supplier | [Empty form](empty-form.png), [Filled form](filled-form.png) |
| Created supplier detail | [Created detail](created-detail.png) |
| Referenced supplier deletion | [Blocked deletion](protected-delete.png) |

Fourteen supplier schema scenarios passed: required contacts/regions, phone and
email formats, optional five-digit postal code, trimming and leading zeroes.
Store checks passed for duplicate names, missing IDs, create/edit/delete, unique
IDs, retained metadata, purchase references and legacy purchase association
before supplier renaming. The existing fourteen Inventory validation scenarios
and purchase fixture/lifecycle checks also passed after this integration.

Browser checks passed for search/empty results, primary-supplier filtering,
prefilled edit, required/email/duplicate feedback, create/detail, cancellation
and confirmation of deletion, guarded deletion and dependent-region clearing.
New suppliers appeared in Purchase Order selections and could be used to create
a purchase. That purchase subsequently prevented deletion of its supplier.
Its Rp 20.000 purchase total appeared on the supplier card. Confirmed deletion
from detail returned to the list, and back navigation then returned to the hub.
Feature ESLint and Biome checks passed without warnings or errors.

Supplier data is session-only, and the regional fixture only includes the
captured Riau/Pekanbaru/Rumbai Selatan hierarchy. Existing region values are
preserved. The preview bypasses backend/auth initialization and does not verify
backend persistence, role access or native Android/iOS behavior.

The three Supplier Figma frames still need full design context/screenshots
because MCP returned the Starter-plan tool-call limit. Semantic shared component
geometry, native safe areas, font/shadow rendering and sample counts can differ
from the source. These images do not establish 100% visual parity.
