# Komposisi Produk reference

Source: [Rapido Figma](https://www.figma.com/design/gbdKqL2EcYNenWiQXG4SRW/Untitled?node-id=0-1).
Reviewed on 9 October 2026 from the previously captured frame summaries in
[`../frames.json`](../frames.json). [`frames.json`](frames.json) copies those
three records, including original names, dimensions and texts.

| Flow | Node | Dimensions | Captured evidence |
| --- | --- | --- | --- |
| Product list | `1:31287` | 390 x 1087 | Counts, recipe status, sale price, cost/portion, margin, Atur Resep |
| Recipe form | `1:31448` | 390 x 844 | Bahan Baku Digunakan, ingredient picker, amount, unit, estimated price |
| Detail/simulation | `1:31480` | 390 x 1286 | Product, margin/cost breakdown, ingredients, cost/portion, 1/5/custom portions |

Full hierarchy/style data and screenshots are unavailable under the previously
reported Starter MCP quota; direct Figma tools were unavailable in this turn.
Do not claim 100% visual parity. Existing Rapido tokens, components and exported
Inventory food images are reused; the list/form/detail geometry remains provisional.

## Source discrepancies and implementation choices

The recipe form frame is named **Tambah Transfer Stok**, and detail is named
**ringkasan inventory(list)**. Content identifies the recipe flow; route headers
use Komposisi Produk, Atur Resep and Detail Komposisi. Product names include
Ayam Gprek/Gerpek; the existing Inventory product is Ayam Geprek.

The list shows 12 menus/8 configured, with Cabe/Tomat/Hotdog as product examples.
The current Inventory catalog has eight products, keeps Cabe as a material, and
has no Tomat/Hotdog products. The flow uses those existing product IDs instead
of creating a second catalog. No complete valid recipe was captured, so recipes
start empty; counters reflect the eight actual menus and recipes saved this session.

For Ayam Geprek, detail says Rp 10.000 in the hero and Rp 28.000 in the breakdown;
the list also says Rp 28.000. The preview uses 28000 for this product. Other
product sale prices are unknown: their price/margin show a dash, and detail
explains that margin cannot be calculated. The catalog backend is not connected.

The source's ingredient amounts, total cost, cost/portion and simulation totals
are inconsistent. The four ingredient prices sum to 195000 but total cost says
235000; no batch yield is captured. At 7850 per portion, five portions cost 39250,
while the source says 39755. A sale price of 28000 with cost 7850 gives gross
profit 20150, while its gross-profit row repeats 28000.

The implemented recipe explicitly stores **amounts per one portion**. Unit comes
from the selected material and is read-only; no Kg/Ekor or other conversion is
invented. Estimated unit cost defaults to that material's known average price;
unknown prices require entry. This is an editable recipe estimate, separate from
material/purchase prices. Total cost = sum(amount x estimated unit cost), gross
profit = sale price - cost, margin = gross profit / sale price x 100, and portion
simulation scales each ingredient separately. This interpretation is provisional
until full design/domain context is available.

Material names resolve from the current catalog; saved unit/price snapshots remain
stable. Changed units require removing/reselecting the ingredient. Materials used
by an active recipe cannot be deleted. Clearing the recipe releases that guard,
while existing purchase/stock/history guards continue to apply.

This is session UI data: no API, persistence, sale-driven ingredient consumption
or stock posting is implemented. Native font/safe-area/keyboard comparison remains
pending. [Implementation previews](../../../previews/inventory/compositions/README.md)
and [developer checks](../../../qa/codex-2/compositions/HANDOFF.md) document behavior.
