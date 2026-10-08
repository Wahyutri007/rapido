import type { AdjustingJournal } from "@/types/ui/accounting/journal";

export const ADJUSTING_JOURNAL_ACCOUNT_OPTIONS = [
	{
		label: "6101-00-014 - Beban Penyusutan Peralatan",
		value: "6101-00-014",
		code: "6101-00-014",
		name: "Beban Penyusutan Peralatan",
	},
	{
		label: "1209-00-002 - Akumulasi Penyusutan Peralatan",
		value: "1209-00-002",
		code: "1209-00-002",
		name: "Akumulasi Penyusutan Peralatan",
	},
	{
		label: "6101-00-015 - Beban Penyusutan Kendaraan",
		value: "6101-00-015",
		code: "6101-00-015",
		name: "Beban Penyusutan Kendaraan",
	},
	{
		label: "1209-00-003 - Akumulasi Penyusutan Kendaraan",
		value: "1209-00-003",
		code: "1209-00-003",
		name: "Akumulasi Penyusutan Kendaraan",
	},
	{
		label: "5-1100 - Akrual Beban Listrik",
		value: "5-1100",
		code: "5-1100",
		name: "Akrual Beban Listrik",
	},
	{
		label: "2101-00-001 - Utang Beban Listrik",
		value: "2101-00-001",
		code: "2101-00-001",
		name: "Utang Beban Listrik",
	},
	{
		label: "5-1200 - Beban Gaji & Tunjangan",
		value: "5-1200",
		code: "5-1200",
		name: "Beban Gaji & Tunjangan",
	},
	{
		label: "2101-00-002 - Utang Gaji & Tunjangan",
		value: "2101-00-002",
		code: "2101-00-002",
		name: "Utang Gaji & Tunjangan",
	},
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
		label: "1-1400 - Beban Dibayar Dimuka",
		value: "1-1400",
		code: "1-1400",
		name: "Beban Dibayar Dimuka",
	},
];

export type AdjustmentTypePreset = {
	label: string;
	value: string;
	defaultDescription?: string;
	defaultDebit?: { code: string; name: string; id: string };
	defaultCredit?: { code: string; name: string; id: string };
};

export const ADJUSTMENT_TYPE_OPTIONS: AdjustmentTypePreset[] = [
	{
		label: "Penyusutan Aset",
		value: "Penyusutan Aset",
		defaultDescription: "Penyusutan peralatan kantor",
		defaultDebit: {
			id: "6101-00-014",
			code: "6101-00-014",
			name: "Beban Penyusutan Peralatan",
		},
		defaultCredit: {
			id: "1209-00-002",
			code: "1209-00-002",
			name: "Akumulasi Penyusutan Peralatan",
		},
	},
	{
		label: "Akrual Beban",
		value: "Akrual Beban",
		defaultDescription: "Akrual beban listrik dan operasional",
		defaultDebit: {
			id: "5-1100",
			code: "5-1100",
			name: "Akrual Beban Listrik",
		},
		defaultCredit: {
			id: "2101-00-001",
			code: "2101-00-001",
			name: "Utang Beban Listrik",
		},
	},
	{
		label: "Akrual Gaji",
		value: "Akrual Gaji",
		defaultDescription: "Akrual gaji & tunjangan karyawan",
		defaultDebit: {
			id: "5-1200",
			code: "5-1200",
			name: "Beban Gaji & Tunjangan",
		},
		defaultCredit: {
			id: "2101-00-002",
			code: "2101-00-002",
			name: "Utang Gaji & Tunjangan",
		},
	},
	{
		label: "Penyusutan Kendaraan",
		value: "Penyusutan Kendaraan",
		defaultDescription: "Penyusutan kendaraan operasional",
		defaultDebit: {
			id: "6101-00-015",
			code: "6101-00-015",
			name: "Beban Penyusutan Kendaraan",
		},
		defaultCredit: {
			id: "1209-00-003",
			code: "1209-00-003",
			name: "Akumulasi Penyusutan Kendaraan",
		},
	},
	{
		label: "Beban Dibayar Dimuka",
		value: "Beban Dibayar Dimuka",
		defaultDescription: "Amortisasi beban dibayar dimuka",
		defaultDebit: {
			id: "5-1100",
			code: "5-1100",
			name: "Akrual Beban Listrik",
		},
		defaultCredit: {
			id: "1-1400",
			code: "1-1400",
			name: "Beban Dibayar Dimuka",
		},
	},
	{
		label: "Lainnya",
		value: "Lainnya",
		defaultDescription: "Penyesuaian jurnal lainnya",
	},
];

export const DEFAULT_ADJUSTING_JOURNALS: AdjustingJournal[] = [
	{
		id: "ajp-1",
		referenceNumber: "AJP-0626-001",
		date: "08 Oct 2025",
		adjustmentType: "Penyusutan Aset",
		description: "Penyusutan Aset Tetap",
		totalAmount: 8750000,
		isBalanced: true,
		lines: [
			{
				id: "line-ajp-1-1",
				accountId: "6101-00-014",
				accountCode: "6101-00-014",
				accountName: "Beban Penyusutan Peralatan",
				debit: 8750000,
				credit: 0,
			},
			{
				id: "line-ajp-1-2",
				accountId: "1209-00-002",
				accountCode: "1209-00-002",
				accountName: "Akumulasi Penyusutan Peralatan",
				debit: 0,
				credit: 8750000,
			},
		],
	},
	{
		id: "ajp-2",
		referenceNumber: "AJP-0626-002",
		date: "08 Oct 2025",
		adjustmentType: "Akrual Beban",
		description: "Akrual Beban Listrik",
		totalAmount: 2350000,
		isBalanced: true,
		lines: [
			{
				id: "line-ajp-2-1",
				accountId: "5-1100",
				accountCode: "5-1100",
				accountName: "Akrual Beban Listrik",
				debit: 2350000,
				credit: 0,
			},
			{
				id: "line-ajp-2-2",
				accountId: "2101-00-001",
				accountCode: "2101-00-001",
				accountName: "Utang Beban Listrik",
				debit: 0,
				credit: 2350000,
			},
		],
	},
	{
		id: "ajp-3",
		referenceNumber: "AJP-0626-003",
		date: "08 Oct 2025",
		adjustmentType: "Akrual Gaji",
		description: "Akrual Gaji & Tunjangan",
		totalAmount: 9750000,
		isBalanced: true,
		lines: [
			{
				id: "line-ajp-3-1",
				accountId: "5-1200",
				accountCode: "5-1200",
				accountName: "Beban Gaji & Tunjangan",
				debit: 9750000,
				credit: 0,
			},
			{
				id: "line-ajp-3-2",
				accountId: "2101-00-002",
				accountCode: "2101-00-002",
				accountName: "Utang Gaji & Tunjangan",
				debit: 0,
				credit: 9750000,
			},
		],
	},
	{
		id: "ajp-4",
		referenceNumber: "AJP-0626-004",
		date: "08 Oct 2025",
		adjustmentType: "Penyusutan Kendaraan",
		description: "Penyusutan Kendaraan",
		totalAmount: 4200000,
		isBalanced: true,
		lines: [
			{
				id: "line-ajp-4-1",
				accountId: "6101-00-015",
				accountCode: "6101-00-015",
				accountName: "Beban Penyusutan Kendaraan",
				debit: 4200000,
				credit: 0,
			},
			{
				id: "line-ajp-4-2",
				accountId: "1209-00-003",
				accountCode: "1209-00-003",
				accountName: "Akumulasi Penyusutan Kendaraan",
				debit: 0,
				credit: 4200000,
			},
		],
	},
	{
		id: "ajp-5",
		referenceNumber: "AJP-0626-005",
		date: "08 Oct 2025",
		adjustmentType: "Penyusutan Aset",
		description: "Penyesuaian peralatan kantor oktober 2026",
		totalAmount: 2500000,
		isBalanced: true,
		lines: [
			{
				id: "line-ajp-5-1",
				accountId: "6101-00-014",
				accountCode: "6101-00-014",
				accountName: "Beban Penyusutan Peralatan",
				debit: 1250000,
				credit: 0,
			},
			{
				id: "line-ajp-5-2",
				accountId: "1209-00-002",
				accountCode: "1209-00-002",
				accountName: "Akumulasi Penyusutan Peralatan",
				debit: 0,
				credit: 1250000,
			},
		],
	},
];
