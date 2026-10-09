import { INVENTORY_ITEMS } from "./inventory";

export const COMPOSITION_PRODUCTS = INVENTORY_ITEMS.filter(
	(item) => item.kind === "product",
);
// Only the captured Ayam Geprek sale price is known; other prices remain unknown.
export const COMPOSITION_SALE_PRICES: Record<string, number | undefined> = {
	"ayam-geprek": 28000,
};
