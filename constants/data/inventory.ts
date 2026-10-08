import type {
	InventoryItem,
	PurchaseRecord,
	StockRecord,
} from "@/types/ui/inventory";

export const INVENTORY_STORES = [
	"Toko Sushiro",
	"Toko Degri",
	"Toko Sushi",
	"Toko Sepatu",
	"Toko Topi",
];
export const INVENTORY_SUPPLIERS = [
	"General Vendor",
	"PT Sumber Jaya",
	"CV Mitra Niaga",
	"PT Cahaya Abadi",
];
export const STOCK_KIND_OPTIONS = [
	{ label: "Produk", value: "product" },
	{ label: "Bahan Baku", value: "material" },
];

export const INVENTORY_ITEMS: InventoryItem[] = [
	{
		id: "nasgor-pedas",
		name: "Nasgor - Pedas",
		sku: "NSG/PDS/01",
		kind: "product",
		category: "Makanan",
		stock: 100,
		unit: "Pcs",
	},
	{
		id: "nasgor-biasa",
		name: "Nasgor - Biasa",
		sku: "NSG/BSA/01",
		kind: "product",
		category: "Makanan",
		stock: 100,
		unit: "Pcs",
	},
	{
		id: "teh-es",
		name: "Teh Es",
		sku: "TEH/01",
		kind: "product",
		category: "Minuman",
		stock: 8,
		unit: "Pcs",
	},
	{
		id: "cabe",
		name: "Cabe",
		sku: "CAB/01",
		kind: "material",
		category: "Bahan Baku",
		stock: 100,
		unit: "Kg",
	},
	{
		id: "tepung",
		name: "Tepung Terigu",
		sku: "BBK-TPG-001",
		kind: "material",
		category: "Bahan Kering",
		stock: 245,
		unit: "Kg",
	},
	{
		id: "gula",
		name: "Gula Pasir",
		sku: "BBK-GLA-001",
		kind: "material",
		category: "Bahan Kering",
		stock: 160,
		unit: "Kg",
	},
	{
		id: "minyak",
		name: "Minyak Goreng",
		sku: "BBK-MNY-001",
		kind: "material",
		category: "Bahan Baku",
		stock: 120,
		unit: "Liter",
	},
	{
		id: "nasi-goreng-spesial",
		name: "Nasi Goreng Spesial",
		sku: "NSG/SPC/01",
		kind: "product",
		category: "Makanan",
		stock: 100,
		unit: "Pcs",
	},
	{
		id: "ayam-bakar",
		name: "Ayam Bakar Taliwang",
		sku: "AYM/BKR/01",
		kind: "product",
		category: "Makanan",
		stock: 100,
		unit: "Pcs",
	},
	{
		id: "mie-goreng",
		name: "Mie Goreng",
		sku: "MIE/GRG/01",
		kind: "product",
		category: "Makanan",
		stock: 100,
		unit: "Pcs",
	},
	{
		id: "chicken-katsu",
		name: "Chicken Katsu",
		sku: "CKN/KTS/01",
		kind: "product",
		category: "Makanan",
		stock: 100,
		unit: "Pcs",
	},
	{
		id: "ayam-geprek",
		name: "Ayam Geprek",
		sku: "AYM/GPK/01",
		kind: "product",
		category: "Makanan",
		stock: 100,
		unit: "Pcs",
	},
	{
		id: "ayam-fillet",
		name: "Ayam Fillet",
		sku: "BBK-AYM-001",
		kind: "material",
		category: "Bahan Baku",
		stock: 98,
		unit: "Kg",
	},
];

export const DEFAULT_TRANSFERS: StockRecord[] = Array.from(
	{ length: 4 },
	(_, index) => ({
		id: `transfer-${index + 1}`,
		reference: `TF/A001/2603/00${index + 1}`,
		operation: "transfer",
		kind: index === 0 || index === 3 ? "product" : "material",
		fromStore: "Toko Sushiro",
		toStore: "Toko Degri",
		createdAt: "2025-10-08T16:27:47",
		createdBy: "Fauzan",
		note: "Gak pake lama",
		lines:
			index === 0 || index === 3
				? [
						{ item: INVENTORY_ITEMS[0], quantity: 12 },
						{ item: INVENTORY_ITEMS[1], quantity: 24 },
					]
				: [
						{ item: INVENTORY_ITEMS[3], quantity: 24 },
						{ item: INVENTORY_ITEMS[4], quantity: 12 },
					],
	}),
);

export const DEFAULT_ADJUSTMENTS: StockRecord[] = Array.from(
	{ length: 4 },
	(_, index) => ({
		id: `adjustment-${index + 1}`,
		reference: `PS/A001/2603/00${index + 1}`,
		operation: "adjustment",
		kind: index === 0 || index === 3 ? "product" : "material",
		fromStore: ["Toko Sushiro", "Toko Sushi", "Toko Sepatu", "Toko Topi"][
			index
		],
		createdAt: "2025-10-08T16:27:47",
		createdBy: "Fauzan",
		note: "Gak pake lama",
		lines:
			index === 0 || index === 3
				? [
						{ item: INVENTORY_ITEMS[0], quantity: 4 },
						{ item: INVENTORY_ITEMS[1], quantity: 10 },
						{ item: { ...INVENTORY_ITEMS[2], stock: 100 }, quantity: 20 },
					]
				: [
						{ item: INVENTORY_ITEMS[3], quantity: 4 },
						{ item: INVENTORY_ITEMS[4], quantity: 10 },
					],
	}),
);

export const DEFAULT_PURCHASES: PurchaseRecord[] = INVENTORY_SUPPLIERS.map(
	(supplier, index) => ({
		id: `purchase-${index + 1}`,
		reference: `PO/A00${index + 1}/2603/002`,
		store: "Toko Sushiro",
		supplier,
		createdAt: "2025-10-08T09:05:50",
		receivedBy: "Fauzan",
		status: index < 2 ? "completed" : index === 2 ? "cancelled" : "waiting",
		amount: [15250000, 10250000, 20232000, 19432000][index],
		paid: index < 2,
		purchaseMethod: "Pembelian langsung",
		paymentMethod: "Tunai",
		note: "Gak pake lama",
		lines: [{ item: INVENTORY_ITEMS[0], quantity: 100, price: 10000 }],
	}),
);
