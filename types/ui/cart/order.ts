import type { CartDetailItem } from "../../api/cart";

export type OrderItemProps = {
	id: string;
	total: number;
	orderType: string;
	paymentMethod: string;
	createdAt: string | Date;
	transactionId: string;
	status: string;

	items: CartDetailItem[];
	subtotal: number;
	tax: number;
	other: number;
};
