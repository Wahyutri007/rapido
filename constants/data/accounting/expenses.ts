import type { Expense } from "@/types/ui/accounting/expense";

export const DEFAULT_EXPENSES: Expense[] = [
	{
		id: "exp-1",
		accountName: "Kas Kecil",
		accountCode: "110001",
		referenceNumber: "KK/A001/2603/001",
		fundingSource: "Kas",
		store: "Sushiro",
		date: "2026-03-19",
		time: "09.11 WIB",
		createdBy: "Ari Ariani",
		amount: 10000,
		type: "expense",
		description: "Pengeluaran tanggal 9",
		categoryDescription: "Pajak yang dihitung berdasarkan persantese.",
	},
	{
		id: "exp-2",
		accountName: "Kas Kecil",
		accountCode: "110001",
		referenceNumber: "KK/A001/2603/002",
		fundingSource: "Kas",
		store: "Sushiro",
		date: "2026-03-19",
		time: "11.28 WIB",
		createdBy: "Ari Ariani",
		amount: 12000,
		type: "expense",
		description: "Pengeluaran konsumsi rapat",
		categoryDescription: "Pajak yang dihitung berdasarkan persantese.",
	},
	{
		id: "exp-3",
		accountName: "Kas Kecil",
		accountCode: "110001",
		referenceNumber: "KK/A001/2603/001",
		fundingSource: "Kas",
		store: "Sushiro",
		date: "2026-03-20",
		time: "11.28 WIB",
		createdBy: "Ari Ariani",
		amount: 15000,
		type: "income",
		description: "Penyesuaian saldo kas kecil",
		categoryDescription: "Pajak yang dihitung berdasarkan persantese.",
	},
	{
		id: "exp-4",
		accountName: "Kas Kecil",
		accountCode: "110001",
		referenceNumber: "KK/A001/2603/003",
		fundingSource: "Kas",
		store: "Sushiro",
		date: "2026-03-20",
		time: "11.28 WIB",
		createdBy: "Ari Ariani",
		amount: 12000,
		type: "expense",
		description: "Biaya perlengkapan dapur",
		categoryDescription: "Pajak yang dihitung berdasarkan persantese.",
	},
];

export const EXPENSE_ACCOUNTS = [
	{ label: "Kas Kecil", value: "Kas Kecil", code: "110001" },
	{ label: "Beban Operasional", value: "Beban Operasional", code: "510001" },
	{ label: "Beban Gaji", value: "Beban Gaji", code: "510002" },
	{ label: "Beban Perlengkapan", value: "Beban Perlengkapan", code: "510003" },
	{ label: "Beban Sewa", value: "Beban Sewa", code: "510004" },
];

export const EXPENSE_FUNDING_SOURCES = [
	{ label: "Kas", value: "Kas" },
	{ label: "Bank BCA", value: "Bank BCA" },
	{ label: "Bank Mandiri", value: "Bank Mandiri" },
	{ label: "Gopay", value: "Gopay" },
];

export const EXPENSE_STORES = [
	{ label: "Sushiro", value: "Sushiro" },
	{ label: "Sushiro Pusat", value: "Sushiro Pusat" },
	{ label: "Cabang Bandung", value: "Cabang Bandung" },
	{ label: "Cabang Jakarta", value: "Cabang Jakarta" },
];
