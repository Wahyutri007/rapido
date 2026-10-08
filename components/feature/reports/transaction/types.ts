export type TransactionStatus = "success" | "refund" | "cancelled";

export type TransactionItem = {
	id: string;
	customer: string;
	channel: string;
	time: string;
	cashier: string;
	amount: number;
	status: TransactionStatus;
	statusLabel: string;
	paymentMethod: string;
};

export type TransactionGroup = {
	date: string;
	dateKey: string;
	totalTransactions: number;
	totalAmount: number;
	items: TransactionItem[];
};

export type TransactionFilterState = {
	search: string;
	status: string; // "Semua Status" or status label
	cashier: string; // "Semua Kasir" or cashier name
	payment: string; // "Semua Pembayaran" or payment method
};
