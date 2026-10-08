import type { Account } from "@/types/ui/accounting/account";

export const DEFAULT_ACCOUNTS: Account[] = [
	{
		id: "1",
		code: "10001",
		name: "Kas Kecil",
		classification: "Harta",
		subClassification: "Harta Lancar",
		currency: "IDR",
		debit: 0,
		credit: 0,
		description: "Pajak yang dihitung berdasarkan persentase.",
	},
	{
		id: "2",
		code: "10002",
		name: "Gopay",
		classification: "Harta",
		subClassification: "Harta Lancar",
		currency: "IDR",
		debit: 0,
		credit: 0,
		description: "Saldo akun dompet digital Gopay.",
	},
	{
		id: "3",
		code: "10003",
		name: "ShopeePay",
		classification: "Harta",
		subClassification: "Harta Lancar",
		currency: "IDR",
		debit: 0,
		credit: 0,
		description: "Saldo akun dompet digital ShopeePay.",
	},
	{
		id: "4",
		code: "10004",
		name: "Bank BCA",
		classification: "Harta",
		subClassification: "Harta Lancar",
		currency: "IDR",
		debit: 1000000,
		credit: 0,
		description: "Rekening operasional bank BCA.",
	},
	{
		id: "5",
		code: "30001",
		name: "Modal Disetor",
		classification: "Modal",
		subClassification: "Modal Pemilik",
		currency: "IDR",
		debit: 0,
		credit: 1000000,
		description: "Modal awal disetor pemilik usaha.",
	},
];

export const ACCOUNT_CLASSIFICATIONS = [
	{ label: "Harta", value: "Harta" },
	{ label: "Kewajiban", value: "Kewajiban" },
	{ label: "Modal", value: "Modal" },
	{ label: "Pendapatan", value: "Pendapatan" },
	{ label: "Beban", value: "Beban" },
];

export const ACCOUNT_SUB_CLASSIFICATIONS: Record<
	string,
	{ label: string; value: string }[]
> = {
	Harta: [
		{ label: "Harta Lancar", value: "Harta Lancar" },
		{ label: "Harta Tetap", value: "Harta Tetap" },
		{ label: "Investasi", value: "Investasi" },
	],
	Kewajiban: [
		{ label: "Kewajiban Jangka Pendek", value: "Kewajiban Jangka Pendek" },
		{ label: "Kewajiban Jangka Panjang", value: "Kewajiban Jangka Panjang" },
	],
	Modal: [
		{ label: "Modal Pemilik", value: "Modal Pemilik" },
		{ label: "Laba Ditahan", value: "Laba Ditahan" },
	],
	Pendapatan: [
		{ label: "Pendapatan Operasional", value: "Pendapatan Operasional" },
		{ label: "Pendapatan Non-Operasional", value: "Pendapatan Non-Operasional" },
	],
	Beban: [
		{ label: "Beban Operasional", value: "Beban Operasional" },
		{ label: "Beban Non-Operasional", value: "Beban Non-Operasional" },
	],
};

export const ACCOUNT_CURRENCIES = [
	{ label: "IDR", value: "IDR" },
	{ label: "USD", value: "USD" },
];
