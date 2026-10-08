import { INVENTORY_ITEMS } from "@/constants/data/inventory";

export function getInventoryItem(id: string) {
	const item = INVENTORY_ITEMS.find((item) => item.id === id);
	if (!item) throw new Error(`Inventory item not found: ${id}`);
	return item;
}
