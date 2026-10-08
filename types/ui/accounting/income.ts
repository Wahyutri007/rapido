export type IncomeType = "manual" | "invoice";

export type OrderItemModifier = {
	name: string;
	qty: number;
	price: number;
};

export type OrderReceiptItem = {
	name: string;
	qty: number;
	price: number;
	modifiers?: OrderItemModifier[];
};

export type OrderReceiptGroup = {
	category: string; // e.g. "Dine In", "Take Away"
	items: OrderReceiptItem[];
};

export type OrderReceiptDetail = {
	merchantName: string;
	merchantPhone: string;
	orderTime: string;
	transactionNumber: string;
	customer: string;
	cashier: string;
	orderStatus: string;
	paymentStatus: string;
	groups: OrderReceiptGroup[];
	subtotal: number;
	tax: number;
	total: number;
};

export type Income = {
	id: string;
	referenceNumber: string;
	type: IncomeType;
	accountName?: string;
	accountCode?: string;
	fundingSource?: string;
	store?: string;
	date: string;
	time: string;
	createdBy: string;
	amount: number;
	itemCount?: number;
	description?: string;
	categoryDescription?: string;
	receipt?: OrderReceiptDetail;
};

export type GroupedIncomes = {
	date: string;
	displayDate: string;
	items: Income[];
};
