import { INVENTORY_ITEMS } from "@/constants/data/inventory";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import type { InventoryMaterial } from "@/types/ui/inventory/material";

export function getInventoryItems(
	materials: InventoryMaterial[] = useInventoryMaterialStore.getState()
		.materials,
) {
	return [
		...INVENTORY_ITEMS.filter((item) => item.kind === "product"),
		...materials,
	];
}

export function getInventoryItem(id: string) {
	const item = getInventoryItems().find((item) => item.id === id);
	if (!item) throw new Error(`Inventory item not found: ${id}`);
	return item;
}
