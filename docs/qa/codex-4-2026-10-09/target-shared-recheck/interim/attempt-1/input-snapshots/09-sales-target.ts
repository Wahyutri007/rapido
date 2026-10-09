export type SalesTargetKind = "product" | "category";

export type SalesTargetRow = {
	itemId: string;
	quantity: number | null;
	amount: number;
};

export type SalesTarget = {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	storeId: string;
	kind: SalesTargetKind;
	rows: SalesTargetRow[];
};

export type SalesTargetChoice = {
	value: string;
	label: string;
	storeId: string;
};
