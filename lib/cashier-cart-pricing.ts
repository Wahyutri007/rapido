import type { Cart, CartDetailItem } from "@/types/api/cart";

export type CartItemPricing = {
	unitPrice: number;
	lineTotal: number;
};

function isValidMoney(value: unknown): value is number {
	return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Uses the catalog's existing discounted-price snapshot; amounts are whole rupiah. */
export function getCartItemPricing(
	item: CartDetailItem | null | undefined,
): CartItemPricing | null {
	if (
		!item?.menu ||
		!Array.isArray(item.variants) ||
		!Number.isSafeInteger(item.amount) ||
		item.amount <= 0
	) {
		return null;
	}

	let unitPrice = item.menu.discount?.price ?? item.menu.sell_price;
	if (!isValidMoney(unitPrice)) return null;

	for (const variant of item.variants) {
		if (!isValidMoney(variant?.price)) return null;
		unitPrice += variant.price;
		if (!isValidMoney(unitPrice)) return null;
	}

	const lineTotal = unitPrice * item.amount;
	return isValidMoney(lineTotal) ? { unitPrice, lineTotal } : null;
}

/** Item subtotal only: tax, fees and order-level discounts need a checkout contract. */
export function getCartSubtotal(cart: Cart | null | undefined): number | null {
	if (!cart || !Array.isArray(cart.details)) return null;

	let subtotal = 0;
	for (const detail of cart.details) {
		if (!Array.isArray(detail?.items)) return null;
		for (const item of detail.items) {
			const pricing = getCartItemPricing(item);
			if (!pricing) return null;
			subtotal += pricing.lineTotal;
			if (!isValidMoney(subtotal)) return null;
		}
	}
	return subtotal;
}
