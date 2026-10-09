import { useMemo } from "react";
import { buildStockMovements } from "@/lib/inventory-stock-movement";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import { useInventoryStore } from "@/store/inventoryStore";

export function useStockMovements() {
	const stockRecords = useInventoryStore((state) => state.stockRecords);
	const purchases = useInventoryStore((state) => state.purchases);
	const materials = useInventoryMaterialStore((state) => state.materials);
	return useMemo(
		() => buildStockMovements({ stockRecords, purchases, materials }),
		[stockRecords, purchases, materials],
	);
}
