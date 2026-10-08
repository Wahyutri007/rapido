export type StockKind = "product" | "material";
export type StockOperation = "transfer" | "adjustment";

export type InventoryItem = {
	id: string;
	name: string;
	sku: string;
	kind: StockKind;
	category: string;
	stock: number;
	unit: string;
};

export type StockLine = {
	item: InventoryItem;
	quantity: number;
};

export type StockRecord = {
	id: string;
	reference: string;
	operation: StockOperation;
	kind: StockKind;
	fromStore: string;
	toStore?: string;
	createdAt: string;
	createdBy: string;
	note: string;
	lines: StockLine[];
};

export type PurchaseStatus = "completed" | "waiting" | "cancelled";
export type PurchaseRecord = {
	id: string;
	reference: string;
	store: string;
	supplier: string;
	createdAt: string;
	receivedBy: string;
	status: PurchaseStatus;
	amount: number;
	paid: boolean;
	purchaseMethod: string;
	paymentMethod: string;
	note: string;
	lines: (StockLine & { price: number })[];
};
