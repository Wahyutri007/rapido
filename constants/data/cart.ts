import type { Cart, CartDetail, CartDetailItem } from "@/types/api/cart";
import { MENU_ITEMS } from "./menu";
import { VARIANT_ITEMS } from "./variant";

export const CART_ITEMS_1: CartDetailItem[] = [
	{
		id: "1",
		menu: MENU_ITEMS[0],
		amount: 1,
		variants: [
			VARIANT_ITEMS[0].details[0], // Topping -> "Sosis"
			VARIANT_ITEMS[0].details[1], // Ukuran -> "Sedang"
		],
	},
	{
		id: "2",
		menu: MENU_ITEMS[1],
		amount: 2,
		variants: [],
	},
];

export const CART_DETAILS_1: CartDetail = {
	id: "1",
	orderType: {
		name: "Dine In",
	},
	items: CART_ITEMS_1,
};

export const CART: Cart = {
	id: "1",
	details: [CART_DETAILS_1],
};
