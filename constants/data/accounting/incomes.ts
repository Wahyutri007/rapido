import type { Income } from "@/types/ui/accounting/income";

export const DEFAULT_INCOMES: Income[] = [
	{
		id: "inc-1",
		referenceNumber: "KM/A002/2603/001",
		type: "manual",
		accountName: "Pendapatan Operasional",
		accountCode: "41001",
		fundingSource: "Kas",
		store: "Sushiro",
		date: "2026-03-19",
		time: "11.28 WIB",
		createdBy: "Ari Ariani",
		amount: 10000,
		description: "Pengeluaran tanggal 31 Januari",
		categoryDescription: "Pajak yang dihitung berdasarkan persantese.",
	},
	{
		id: "inc-2",
		referenceNumber: "INV/A001/2603/001",
		type: "invoice",
		accountName: "Pendapatan Penjualan",
		accountCode: "41002",
		fundingSource: "Kas",
		store: "Sushiro",
		date: "2026-03-19",
		time: "11.28 WIB",
		createdBy: "Ari Ariani",
		amount: 15000,
		itemCount: 5,
		description: "Transaksi penjualan kasir",
		receipt: {
			merchantName: "Tanah Abang, Jakarta Pusat, DKI Jakarta, Indonesia",
			merchantPhone: "+62 812 3456 7890",
			orderTime: "Jum, 13 Des, 2024 03:50:02",
			transactionNumber: "INV-001",
			customer: "Arianjo Einstein",
			cashier: "Julia Hartua",
			orderStatus: "Selesai",
			paymentStatus: "Dibayar",
			groups: [
				{
					category: "Dine In",
					items: [
						{
							name: "Valala Hotdog",
							qty: 1,
							price: 65000,
							modifiers: [
								{ name: "Sosis", qty: 1, price: 5000 },
								{ name: "Sourdough", qty: 1, price: 3000 },
							],
						},
						{
							name: "Nasi Goreng",
							qty: 3,
							price: 45000,
							modifiers: [{ name: "Telor Dadar", qty: 3, price: 15000 }],
						},
						{
							name: "Aglio e Olio Spaghetti",
							qty: 2,
							price: 48000,
						},
					],
				},
				{
					category: "Take Away",
					items: [
						{
							name: "Bakso Goreng",
							qty: 2,
							price: 10000,
						},
						{
							name: "Nasi Goreng",
							qty: 1,
							price: 15000,
							modifiers: [{ name: "Telor Dadar", qty: 1, price: 5000 }],
						},
						{
							name: "Aglio e Olio Spaghetti",
							qty: 3,
							price: 72000,
						},
					],
				},
			],
			subtotal: 173000,
			tax: 17300,
			total: 190000,
		},
	},
	{
		id: "inc-3",
		referenceNumber: "KM/A001/2603/002",
		type: "manual",
		accountName: "Kas Kecil",
		accountCode: "110001",
		fundingSource: "Kas",
		store: "Sushiro",
		date: "2026-03-20",
		time: "11.28 WIB",
		createdBy: "Ari Ariani",
		amount: 10000,
		description: "Penerimaan kas operasional",
		categoryDescription: "Pajak yang dihitung berdasarkan persantese.",
	},
];

export const INCOME_ACCOUNTS = [
	{ label: "Kas Kecil", value: "Kas Kecil", code: "110001" },
	{
		label: "Pendapatan Operasional",
		value: "Pendapatan Operasional",
		code: "41001",
	},
	{
		label: "Pendapatan Penjualan",
		value: "Pendapatan Penjualan",
		code: "41002",
	},
	{
		label: "Pendapatan Lain-lain",
		value: "Pendapatan Lain-lain",
		code: "41003",
	},
	{ label: "Pendapatan Jasa", value: "Pendapatan Jasa", code: "41004" },
];

export const INCOME_FUNDING_SOURCES = [
	{ label: "Kas", value: "Kas" },
	{ label: "Bank BCA", value: "Bank BCA" },
	{ label: "Bank Mandiri", value: "Bank Mandiri" },
	{ label: "Gopay", value: "Gopay" },
];

export const INCOME_STORES = [
	{ label: "Sushiro", value: "Sushiro" },
	{ label: "Sushiro Pusat", value: "Sushiro Pusat" },
	{ label: "Cabang Bandung", value: "Cabang Bandung" },
	{ label: "Cabang Jakarta", value: "Cabang Jakarta" },
];
