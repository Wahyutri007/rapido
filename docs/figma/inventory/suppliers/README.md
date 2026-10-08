# Supplier reference

Source: [Rapido Figma](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=0-1).
Cached metadata was captured before the Figma Starter-plan tool-call limit.
An access recheck on 8 October 2026 returned that same limit. This module uses
metadata and shared Rapido components; screenshots and full design context are
still required to verify exact colors, fonts, shadows and sizing.

| Screen | Node | Cached reference |
| --- | --- | --- |
| List | `1:15653` | [Metadata](list.xml) |
| Add supplier | `1:15530` | [Metadata](form.xml) |
| Detail | `1:15570` | [Metadata](detail.xml) |

The list has search/filter controls, three metric cards, supplier cards with
contact/product metadata and purchase totals, and a bottom add action. The form
has name, address, phone, email, province, city, district and optional postal code.
The detail has a supplier hero, eight information rows and edit/delete actions.
Edit reuses the add form; no separate edit frame was captured.

The source is inconsistent: its metric counts are 12/8/8 while its list heading
shows 24. The implementation counts its six actual sample suppliers. Pemasok Baju
has a Dubai address in the list but Riau/Pekanbaru/Rumbai Selatan in the detail;
the implementation uses the detail address consistently. Unknown fields in the
other sample records remain empty instead of inventing contact data.

Only Riau/Pekanbaru/Rumbai Selatan is available as a captured regional hierarchy.
Existing supplier region values are preserved, but this fixture is not a complete
province/city/district directory. A region data contract is needed for that.
Supplier CRUD is session-only Zustand state with no invented backend endpoint.
Purchase selections use this same supplier state and stable supplier IDs.

Shared Card/Input/Select geometry follows the established design system, which
may differ from individual metadata measurements. Native comparison is pending.
