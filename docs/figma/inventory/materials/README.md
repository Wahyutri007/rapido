# Bahan Baku reference

Source: [Rapido Figma](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=0-1).
Reviewed on 9 October 2026 using the frame summaries already saved in
[`../frames.json`](../frames.json). [`frames.json`](frames.json) copies the two
relevant records without inventing layout properties.

| Screen | Node | Saved dimensions | Available evidence |
| --- | --- | --- | --- |
| Material form | `1:29776` | 390 x 1252 | Frame name, sections and text contents |
| Material detail | `1:31002` | 390 x 945 | Frame name, sections and text contents |
| Material list | Unknown | Unknown | No captured reference; shared catalog pattern is provisional |

The form's saved frame name is **Tambah pesanan pembelian** despite containing
material fields. Its body says **Informasi Pesanan** and **Lengkapi detail dari
pesanan ini**; those strings and the store-selection hint are preserved. Route
headers identify the implemented flow as Tambah/Edit Bahan Baku. Full design
context is needed to resolve the inconsistent source naming.

The form includes multi-store selection, material name, optional code, unit,
initial/minimum stock, required average purchase price, optional expiry and notes.
The detail includes a material identity/status, available stock/value, minimum
stock, daily usage, depletion estimate, locations and recent movements.

The cached detail says **18 Pcs** and a minimum of **245 Pcs** for Tepung Terigu.
Existing Inventory fixtures and transactions use **Kg** for this ID. The preview
keeps Kg consistently, while adopting stock 18, minimum 245, average purchase
price 30000, usage 7/day, and location quantities 4/2/12. This is a documented
source discrepancy, not a unit conversion. The summary screen remains static
design data and is not recalculated from material CRUD.

Figma MCP reached its Starter tool-call quota during the earlier Inventory work;
the Supplier access recheck returned the same limit. Full context, screenshots,
colors, typography and geometry for these two nodes have not been retrieved.
Existing exported material images and Rapido semantic controls/tokens are reused.
Neither the summaries nor the implementation screenshots establish 100% parity.

Implementation screenshots and behavior checks:
[`../../../previews/inventory/materials/README.md`](../../../previews/inventory/materials/README.md).
