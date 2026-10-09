import type { InventoryItem } from "@/types/ui/inventory";
import type { InventoryMaterial } from "@/types/ui/inventory/material";

export type ClosingStockStatus =
	| "all"
	| "available"
	| "low"
	| "empty"
	| "unknown";
export type ClosingStockRow = {
	key: string;
	item: InventoryItem;
	quantity: number | null;
	status: Exclude<ClosingStockStatus, "all">;
};
export type ClosingStockGroup = { category: string; rows: ClosingStockRow[] };

const normalized = (value: string) => value.trim().toLocaleLowerCase("id-ID");
const validQuantity = (value: number) => Number.isFinite(value) && value >= 0;

export function closingStockStatus(
	quantity: number | null,
	minimumStock?: number,
): ClosingStockRow["status"] {
	if (quantity === null || !validQuantity(quantity)) return "unknown";
	if (quantity === 0) return "empty";
	if (
		minimumStock !== undefined &&
		validQuantity(minimumStock) &&
		quantity <= minimumStock
	)
		return "low";
	return "available";
}

/** Current catalog snapshot, not a ledger reconstructed from session transactions. */
export function closingStockGroups(
	items: readonly InventoryItem[],
	materials: readonly InventoryMaterial[],
	filters: { search: string; store: string; status: ClosingStockStatus },
): ClosingStockGroup[] {
	const materialById = new Map(materials.map((item) => [item.id, item]));
	const groups = new Map<string, ClosingStockRow[]>();
	const search = normalized(filters.search);
	for (const item of items) {
		const material =
			item.kind === "material" ? materialById.get(item.id) : undefined;
		if (
			filters.store !== "all" &&
			!material?.stores.some(
				(store) => normalized(store) === normalized(filters.store),
			)
		)
			continue;
		if (
			!normalized(`${item.name} ${item.sku} ${item.category}`).includes(search)
		)
			continue;
		// Store membership and warehouse locations do not describe per-store balances.
		const quantity =
			filters.store === "all" && validQuantity(item.stock) ? item.stock : null;
		const status = closingStockStatus(quantity, material?.minimumStock);
		if (
			filters.status !== "all" &&
			!(filters.status === "available" && quantity !== null && quantity > 0) &&
			filters.status !== status
		)
			continue;
		const category = item.category.trim() || "Tanpa Kategori";
		const rows = groups.get(category) ?? [];
		rows.push({ key: `${item.kind}:${item.id}`, item, quantity, status });
		groups.set(category, rows);
	}
	return [...groups].map(([category, rows]) => ({ category, rows }));
}

const quantityFormatter = new Intl.NumberFormat("id-ID", {
	maximumFractionDigits: 20,
});

export function formatClosingStock(quantity: number | null, unit: string) {
	if (quantity === null || !validQuantity(quantity)) return "—";
	return `${quantityFormatter.format(quantity)} ${unit}`.trim();
}
