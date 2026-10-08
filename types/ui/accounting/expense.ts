export type ExpenseType = "expense" | "income";

export type Expense = {
	id: string;
	accountName: string;
	accountCode: string;
	referenceNumber: string;
	fundingSource: string;
	store: string;
	date: string; // ISO date string or formatted date string "YYYY-MM-DD"
	time: string; // e.g. "09.11 WIB"
	createdBy: string;
	amount: number;
	type: ExpenseType;
	description: string;
	categoryDescription?: string;
};

export type GroupedExpenses = {
	date: string;
	displayDate: string;
	items: Expense[];
};
