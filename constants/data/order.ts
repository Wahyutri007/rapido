import type { OrderItemProps } from "@/types/ui/cart/order";
import { CART_ITEMS_1 } from "./cart";

export const ORDER_ITEM: OrderItemProps = {
	id: "1",
	total: 150000,
	orderType: "Dine In",
	paymentMethod: "Tunai",
	createdAt: new Date(2024, 12, 13, 3, 50, 2),
	transactionId: "INV12345",
	status: "Sedang diproses",
	items: [CART_ITEMS_1[0], CART_ITEMS_1[1]],
	subtotal: 173000,
	tax: 17300,
	other: 0,
};
