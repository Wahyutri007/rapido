import type { DiscountData } from "@/types/api/discount";
import type { DiscountItemProps } from "@/types/ui/offer/dicount";
import { CATEGORY_ITEMS } from "./category";

// Mock data matching the design specifications for Catalog Discount
export const MOCK_DISCOUNT_DATA: DiscountData[] = [
	{
		id: "disc-1",
		user_id: "user-1",
		name: "Diskon 15% Hari Kemerdekaan",
		type: "fixed",
		value_type: "percentage",
		amount: 15,
		fixed_discount: {
			id: "fd-1",
			discount_id: "disc-1",
			amount: 15,
		},
		stores: [
			{ id: "store-1", name: "Warung Jul Panam", address: "Panam, Pekanbaru" },
			{
				id: "store-2",
				name: "Depot Sari Rasa",
				address: "Marpoyan, Pekanbaru",
			},
			{
				id: "store-3",
				name: "Kopi Luwak Express",
				address: "Simpang Tiga, Pekanbaru",
			},
			{
				id: "store-4",
				name: "Nasi Goreng Pak Didi",
				address: "Tenayan Raya, Pekanbaru",
			},
		],
		created_at: "2025-08-17T08:00:00Z",
		updated_at: "2025-08-17T08:00:00Z",
	},
	{
		id: "disc-2",
		user_id: "user-1",
		name: "Diskon Hari Kemerdekaan",
		type: "fixed",
		value_type: "fixed",
		amount: 50000,
		fixed_discount: {
			id: "fd-2",
			discount_id: "disc-2",
			amount: 50000,
		},
		stores: [
			{ id: "store-1", name: "Warung Jul Panam", address: "Panam, Pekanbaru" },
			{
				id: "store-2",
				name: "Depot Sari Rasa",
				address: "Marpoyan, Pekanbaru",
			},
		],
		created_at: "2025-08-17T09:00:00Z",
		updated_at: "2025-08-17T09:00:00Z",
	},
];

// Legacy mock items for standalone offer/discount
export const DISCOUNT_ITEMS: DiscountItemProps[] = [
	{
		id: "1",
		name: "Diskon Akhir Tahun",
		code: "AKHIR25",
		type: "percentage",
		amount: 10,
		appliedProduct: "product",
		appliedCategory: CATEGORY_ITEMS[0].id,
		minimumTransaction: 50000,
		maxDiscount: 35000,
		discountPeriod: {
			start: new Date("2023-08-17T00:00:00Z"),
			end: new Date("2023-08-31T23:59:59Z"),
		},
		timePeriod: {
			start: new Date("2023-08-17T00:00:00Z"),
			end: new Date("2023-08-31T23:59:59Z"),
		},
	},
];
