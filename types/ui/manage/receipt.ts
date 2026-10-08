export type ReceiptElementId =
	| "logo"
	| "address"
	| "phone"
	| "transactionNumber"
	| "cashier"
	| "customer"
	| "date"
	| "items"
	| "subtotal"
	| "taxes"
	| "total"
	| "payment";

export type ReceiptSettings = {
	enabled: Record<ReceiptElementId, boolean>;
	footer: string;
};

export type ReceiptStore = {
	id: string;
	name: string;
	address: string;
	phone: string;
};
