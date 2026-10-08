export type AccountClassification =
	| "Harta"
	| "Kewajiban"
	| "Modal"
	| "Pendapatan"
	| "Beban";

export type AccountSubClassification =
	| "Harta Lancar"
	| "Harta Tetap"
	| "Investasi"
	| "Kewajiban Jangka Pendek"
	| "Kewajiban Jangka Panjang"
	| "Modal Pemilik"
	| "Laba Ditahan"
	| "Pendapatan Operasional"
	| "Pendapatan Non-Operasional"
	| "Beban Operasional"
	| "Beban Non-Operasional";

export type Account = {
	id: string;
	code: string;
	name: string;
	classification: string;
	subClassification: string;
	currency: string;
	debit: number;
	credit: number;
	description?: string;
};
