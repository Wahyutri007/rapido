export type JournalLine = {
	id: string;
	accountId: string;
	accountCode: string;
	accountName: string;
	debit: number;
	credit: number;
};

export type GeneralJournal = {
	id: string;
	referenceNumber: string;
	date: string;
	adjustmentType?: string;
	description: string;
	lines: JournalLine[];
	totalAmount: number;
	isBalanced: boolean;
	createdAt?: string;
};

export type AdjustingJournal = GeneralJournal;

export type ClosingJournal = GeneralJournal & {
	period?: string;
};

export type GroupedJournals = {
	date: string;
	displayDate: string;
	items: GeneralJournal[];
};
