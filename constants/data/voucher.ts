import type { VoucherData } from "@/types/api/voucher";
import type { VoucherItemProps } from "@/types/ui/offer/voucher";
import { CATEGORY_ITEMS } from "./category";

// Mock data matching design specifications for Catalog Voucher
export const MOCK_VOUCHER_DATA: VoucherData[] = [
	{
		id: "vouch-1",
		name: "Diskon 15% Hari Kemerdekaan",
		type: "percentage",
		amount: 15,
		minimum_transaction: 50000,
		maximum_discount: 100000,
		start_period: "2026-01-01T00:00:00Z",
		end_period: "2026-01-30T23:59:59Z",
		is_active: true,
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
		codes: [
			{ id: "c-1", code: "SMK25", max_uses: 600, uses_count: 0 },
			{ id: "c-2", code: "OJK26", max_uses: 600, uses_count: 600 },
			{ id: "c-3", code: "FTR100", max_uses: 10, uses_count: 10 },
		],
		created_at: "2026-01-01T08:00:00Z",
		updated_at: "2026-01-01T08:00:00Z",
	},
	{
		id: "vouch-2",
		name: "Diskon Akhir Tahun",
		type: "percentage",
		amount: 25,
		minimum_transaction: 75000,
		maximum_discount: 50000,
		start_period: "2026-12-01T00:00:00Z",
		end_period: "2026-12-31T23:59:59Z",
		is_active: true,
		stores: [
			{ id: "store-1", name: "Warung Jul Panam", address: "Panam, Pekanbaru" },
			{
				id: "store-2",
				name: "Depot Sari Rasa",
				address: "Marpoyan, Pekanbaru",
			},
		],
		codes: [{ id: "c-4", code: "AKHIR25", max_uses: 100, uses_count: 45 }],
		created_at: "2026-12-01T08:00:00Z",
		updated_at: "2026-12-01T08:00:00Z",
	},
	{
		id: "vouch-3",
		name: "Voucher New Member",
		type: "fixed",
		amount: 10000,
		minimum_transaction: 50000,
		maximum_discount: null,
		start_period: "2026-01-01T00:00:00Z",
		end_period: "2026-06-01T23:59:59Z",
		is_active: true,
		stores: [
			{ id: "store-1", name: "Warung Jul Panam", address: "Panam, Pekanbaru" },
			{
				id: "store-3",
				name: "Kopi Luwak Express",
				address: "Simpang Tiga, Pekanbaru",
			},
		],
		codes: [
			{ id: "c-5", code: "M001", max_uses: 8, uses_count: 2 },
			{ id: "c-6", code: "M002", max_uses: 8, uses_count: 5 },
			{ id: "c-7", code: "M003", max_uses: 8, uses_count: 0 },
		],
		created_at: "2026-01-01T08:00:00Z",
		updated_at: "2026-01-01T08:00:00Z",
	},
];

// Legacy mock items for standalone offer/voucher
export const VOUCHER_ITEMS: VoucherItemProps[] = [
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
		target: "new",
	},
];
