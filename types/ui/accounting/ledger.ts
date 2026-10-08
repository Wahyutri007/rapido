export type LedgerCategory =
	| "Semua"
	| "Aset"
	| "Liabilitas"
	| "Ekuitas"
	| "Beban"
	| "Pendapatan";

export type LedgerAccount = {
	id: string;
	code: string;
	name: string;
	classification: string;
	subClassification: string;
	currency: string;
	balance: number;
	totalDebit: number;
	totalCredit: number;
};

export type LedgerEntryType = "debit" | "credit";

export type LedgerEntry = {
	id: string;
	accountId: string;
	referenceNumber: string;
	date: string;
	title: string;
	description: string;
	type: LedgerEntryType;
	amount: number;
};

export type LedgerSummary = {
	date: string;
	netBalance: number;
	totalDebit: number;
	totalCredit: number;
};
