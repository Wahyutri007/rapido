import type { PurchaseRecord, StockRecord } from "@/types/ui/inventory";
import type {
	InventoryMaterial,
	MaterialLocation,
	MaterialStockStatus,
} from "@/types/ui/inventory/material";

export function recentMaterialMovements(
	material: InventoryMaterial,
	purchases: PurchaseRecord[],
	stockRecords: StockRecord[],
) {
	const transactions = [...purchases, ...stockRecords].flatMap((record) => {
		if ("status" in record && record.status === "cancelled") return [];
		return record.lines
			.filter((line) => line.item.id === material.id)
			.map((line, index) => ({
				id: `${record.id}-${index}`,
				reference: record.reference,
				createdAt: record.createdAt,
				unit: line.item.unit,
				label:
					"status" in record
						? "Pembelian masuk"
						: record.operation === "transfer"
							? "Transfer Stok"
							: "Penyesuaian Stok",
				quantity: "status" in record ? line.quantity : -line.quantity,
			}));
	});
	transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	return [...transactions, ...material.movements].slice(0, 4);
}

export function materialStockStatus(
	material: Pick<InventoryMaterial, "stock" | "minimumStock">,
): MaterialStockStatus {
	if (material.stock <= 0) return "empty";
	return material.stock <= material.minimumStock ? "low" : "safe";
}

// Preview edits preserve location shares; no warehouse allocation is sent to a server.
export function allocateMaterialStock(
	stock: number,
	locations: MaterialLocation[],
): MaterialLocation[] {
	const total = locations.reduce((sum, location) => sum + location.quantity, 0);
	if (!locations.length || total <= 0)
		return [{ name: locations[0]?.name ?? "Gudang Utama", quantity: stock }];
	let remaining = stock;
	return locations.map((location, index) => {
		const share = stock * (location.quantity / total);
		const rounded =
			share > Number.MAX_SAFE_INTEGER ? share : Math.round(share * 1000) / 1000;
		const quantity =
			index === locations.length - 1 ? remaining : Math.min(remaining, rounded);
		remaining -= quantity;
		return { name: location.name, quantity };
	});
}
