import type { GeneralJournal } from "@/types/ui/accounting/journal";

export const JOURNAL_ACCOUNT_OPTIONS = [
	{
		label: "10001 - Kas Kecil",
		value: "10001",
		code: "10001",
		name: "Kas Kecil",
	},
	{
		label: "10004 - Bank BCA",
		value: "10004",
		code: "10004",
		name: "Bank BCA",
	},
	{
		label: "10005 - Persediaan Barang",
		value: "10005",
		code: "10005",
		name: "Persediaan Barang",
	},
	{
		label: "30001 - Modal Disetor",
		value: "30001",
		code: "30001",
		name: "Modal Disetor",
	},
	{
		label: "40001 - Pendapatan usaha",
		value: "40001",
		code: "40001",
		name: "Pendapatan usaha",
	},
	{
		label: "5-1100 - Beban Operasional",
		value: "5-1100",
		code: "5-1100",
		name: "Beban Operasional",
	},
	{
		label: "5-1200 - Beban Amortisasi",
		value: "5-1200",
		code: "5-1200",
		name: "Beban Amortisasi",
	},
	{
		label: "1-1300 - Akumulasi Amortisasi",
		value: "1-1300",
		code: "1-1300",
		name: "Akumulasi Amortisasi",
	},
];

export const DEFAULT_JOURNALS: GeneralJournal[] = [
	{
		id: "ju-1",
		referenceNumber: "JU00001",
		date: "08 Oct 2025",
		description: "Penyesuaian beban operasional",
		totalAmount: 2500000,
		isBalanced: true,
		lines: [
			{
				id: "line-1-1",
				accountId: "5-1100",
				accountCode: "5-1100",
				accountName: "Beban Operasional",
				debit: 2500000,
				credit: 0,
			},
			{
				id: "line-1-2",
				accountId: "10001",
				accountCode: "1-1000",
				accountName: "Kas Kecil",
				debit: 0,
				credit: 2500000,
			},
		],
	},
	{
		id: "ju-2",
		referenceNumber: "JU00002",
		date: "08 Oct 2025",
		description: "Koreksi Kas Kecil",
		totalAmount: 850000,
		isBalanced: true,
		lines: [
			{
				id: "line-2-1",
				accountId: "10001",
				accountCode: "10001",
				accountName: "Kas Kecil",
				debit: 850000,
				credit: 0,
			},
			{
				id: "line-2-2",
				accountId: "10004",
				accountCode: "10004",
				accountName: "Bank BCA",
				debit: 0,
				credit: 850000,
			},
		],
	},
	{
		id: "ju-3",
		referenceNumber: "JU00003",
		date: "08 Oct 2025",
		description: "Jurnal Amortisasi",
		totalAmount: 1200000,
		isBalanced: true,
		lines: [
			{
				id: "line-3-1",
				accountId: "5-1200",
				accountCode: "5-1200",
				accountName: "Beban Amortisasi",
				debit: 1200000,
				credit: 0,
			},
			{
				id: "line-3-2",
				accountId: "1-1300",
				accountCode: "1-1300",
				accountName: "Akumulasi Amortisasi",
				debit: 0,
				credit: 1200000,
			},
		],
	},
	{
		id: "ju-4",
		referenceNumber: "JU00004",
		date: "08 Oct 2025",
		description: "Penyesuaian Persediaan",
		totalAmount: 4100000,
		isBalanced: true,
		lines: [
			{
				id: "line-4-1",
				accountId: "10005",
				accountCode: "10005",
				accountName: "Persediaan Barang",
				debit: 4100000,
				credit: 0,
			},
			{
				id: "line-4-2",
				accountId: "40001",
				accountCode: "40001",
				accountName: "Pendapatan usaha",
				debit: 0,
				credit: 4100000,
			},
		],
	},
];
