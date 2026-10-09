import type {
	SalesTarget,
	SalesTargetChoice,
} from "@/types/ui/manage/sales-target";

export const TARGET_STORES = [
	{ value: "target-store-sushiro", label: "Toko Sushiro" },
	{ value: "target-store-warung", label: "Warung Jul Panam" },
];

export const TARGET_KINDS = [
	{ value: "product", label: "Per Produk" },
	{ value: "category", label: "Per Kategori" },
];

export const TARGET_PRODUCTS: SalesTargetChoice[] = [
	{
		value: "target-product-salmon",
		label: "Salmon Sushi",
		storeId: TARGET_STORES[0].value,
	},
	{
		value: "target-product-california",
		label: "California Roll",
		storeId: TARGET_STORES[0].value,
	},
	{
		value: "target-product-ocha",
		label: "Ocha",
		storeId: TARGET_STORES[0].value,
	},
	{
		value: "target-product-nasi",
		label: "Nasi Goreng",
		storeId: TARGET_STORES[1].value,
	},
	{
		value: "target-product-ayam",
		label: "Ayam Bakar",
		storeId: TARGET_STORES[1].value,
	},
	{
		value: "target-product-teh",
		label: "Es Teh",
		storeId: TARGET_STORES[1].value,
	},
];

export const TARGET_CATEGORIES: SalesTargetChoice[] = [
	{
		value: "target-category-sushi",
		label: "Sushi",
		storeId: TARGET_STORES[0].value,
	},
	{
		value: "target-category-minuman",
		label: "Minuman",
		storeId: TARGET_STORES[0].value,
	},
	{
		value: "target-category-paket",
		label: "Paket",
		storeId: TARGET_STORES[0].value,
	},
	{
		value: "target-category-makanan",
		label: "Makanan",
		storeId: TARGET_STORES[1].value,
	},
	{
		value: "target-category-warung-minuman",
		label: "Minuman",
		storeId: TARGET_STORES[1].value,
	},
];

export const SALES_TARGETS: SalesTarget[] = [
	{
		id: "target-demo-1",
		name: "Target Sushiro",
		startDate: "2026-10-01",
		endDate: "2026-10-31",
		storeId: TARGET_STORES[0].value,
		kind: "product",
		rows: [
			{ itemId: TARGET_PRODUCTS[0].value, quantity: 120, amount: 6_000_000 },
			{ itemId: TARGET_PRODUCTS[2].value, quantity: 80, amount: 2_000_000 },
		],
	},
	{
		id: "target-demo-2",
		name: "Target Warung Jul Panam",
		startDate: "2026-10-01",
		endDate: "2026-10-31",
		storeId: TARGET_STORES[1].value,
		kind: "category",
		rows: [
			{ itemId: TARGET_CATEGORIES[3].value, quantity: null, amount: 5_000_000 },
		],
	},
];
