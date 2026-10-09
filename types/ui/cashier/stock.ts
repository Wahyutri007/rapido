export type CashierStockStatus = "available" | "low" | "empty";
export type CashierStockFilter = {
	status: "all" | CashierStockStatus;
	categories: string[];
};
export type CashierStockRow = {
	id: string;
	name: string;
	variant?: string;
	category: string;
	quantity: number;
	unit: string;
	status: CashierStockStatus;
};
export type CashierStockGroup = {
	category: string;
	rows: CashierStockRow[];
};
