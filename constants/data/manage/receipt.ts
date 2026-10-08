import type { ReceiptSettings, ReceiptStore } from "@/types/ui/manage/receipt";

// Design fixtures; these IDs are separate from backend store IDs.
export const RECEIPT_STORES: ReceiptStore[] = [
	{
		id: "receipt-demo-1",
		name: "Warung Jul Panam",
		address: "Jl. HR. Soebrantas, Pekanbaru",
		phone: "0812 3456 7890",
	},
	{
		id: "receipt-demo-2",
		name: "Depot Sari Rasa",
		address: "Jl. Merdeka, Jakarta Pusat",
		phone: "0812 3456 7891",
	},
	{
		id: "receipt-demo-3",
		name: "Kopi Luwak Express",
		address: "Jl. Sudirman, Pekanbaru",
		phone: "0812 3456 7892",
	},
	{
		id: "receipt-demo-4",
		name: "Nasi Goreng Pak Didi",
		address: "Jl. Ahmad Yani, Pekanbaru",
		phone: "0812 3456 7893",
	},
];

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
	enabled: {
		logo: false,
		address: true,
		phone: true,
		transactionNumber: true,
		cashier: true,
		customer: true,
		date: true,
		items: true,
		subtotal: true,
		taxes: true,
		total: true,
		payment: true,
	},
	footer: "Terima kasih atas kunjungan Anda!",
};

export const RECEIPT_SAMPLE = {
	date: "01/01/2025 14:00",
	transactionNumber: "123456",
	cashier: "Rahmanda Agisti",
	customer: "Dewi Rahmalia",
	groups: [
		{
			title: "Dine In",
			items: [
				{
					id: "ayam",
					name: "Nasi Kapau Nusantara Ayam Bakar",
					quantity: 5,
					price: 25000,
				},
				{ id: "air", name: "Air Mineral (Dingin)", quantity: 5, price: 5000 },
			],
		},
		{
			title: "Take Away",
			items: [
				{
					id: "ikan",
					name: "Nasi Kapau Nusantara Ikan Bakar",
					quantity: 1,
					price: 20000,
				},
				{ id: "teh", name: "Es Teh Manis", quantity: 1, price: 7000 },
			],
		},
	],
	subtotal: 177000,
	service: 3540,
	tax: 18054,
	rounding: 406,
	total: 199000,
	cash: 250000,
};
