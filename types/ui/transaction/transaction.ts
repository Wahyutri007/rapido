import type { CartDetailItem } from "../../api/cart";
import { MenuItemProps } from "../add/menu";
import type { PaymentMethodItemProps } from "../manage/payment-method";

export type TransactionItemProps = {
	id: string;
	statuses: {
		isPaid: boolean;
		isFinished: boolean;
	};
	date: Date | string;
	table: string;
	customer: string;
	subtotal: number;
	total: number;
	tax: number;
	other: number;
	transactionId: string;
	paymentMethod: PaymentMethodItemProps;
	orderType: string;
	orders: CartDetailItem[];
};
