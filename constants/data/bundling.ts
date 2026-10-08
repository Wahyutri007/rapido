import type { BundlingData } from "@/types/api/bundling";

export const MOCK_BUNDLING_DATA: BundlingData[] = [
	{
		id: "1",
		name: "Paket Ramadhan Berdua",
		code: "RMD-24",
		image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
		start_period: "2024-01-01",
		end_period: "2024-06-01",
		store_ids: ["store-1", "store-2", "store-3", "store-4"],
		stores: [
			{ id: "store-1", name: "Warung Jul Panam", address: "Panam, Pekanbaru", is_active: true },
			{ id: "store-2", name: "Depot Sari Rasa", address: "Marpoyan, Pekanbaru", is_active: true },
			{ id: "store-3", name: "Kopi Luwak Express", address: "Simpang Tiga, Pekanbaru", is_active: true },
			{ id: "store-4", name: "Nasi Goreng Pak Didi", address: "Tenayan Raya, Pekanbaru", is_active: true },
		],
		has_price_variation: true,
		sell_price: 40000,
		prices: [
			{ order_type_id: "ot-takeaway", order_type_name: "Take Away", sell_price: 40000 },
			{ order_type_id: "ot-dinein", order_type_name: "Dine In", sell_price: 44000 },
			{ order_type_id: "ot-online", order_type_name: "Online Food", sell_price: 54000 },
		],
		details: [
			{ id: "d-1", menu_id: "m-1", menu_name: "Nasi Goreng", variant_name: "Pedas", quantity: 3 },
			{ id: "d-2", menu_id: "m-1", menu_name: "Nasi Goreng", variant_name: "Kampung", quantity: 2 },
		],
		is_active: true,
		created_at: "11 Mei 2026",
	},
	{
		id: "2",
		name: "Paket Akhir Tahun",
		code: "NY-24",
		image: null,
		start_period: "2024-12-01",
		end_period: "2024-12-31",
		store_ids: ["store-1", "store-2"],
		stores: [
			{ id: "store-1", name: "Warung Jul Panam", address: "Panam, Pekanbaru", is_active: true },
			{ id: "store-2", name: "Depot Sari Rasa", address: "Marpoyan, Pekanbaru", is_active: true },
		],
		has_price_variation: true,
		sell_price: 65000,
		prices: [
			{ order_type_id: "ot-takeaway", order_type_name: "Take Away", sell_price: 65000 },
			{ order_type_id: "ot-dinein", order_type_name: "Dine In", sell_price: 70000 },
			{ order_type_id: "ot-online", order_type_name: "Online Food", sell_price: 80000 },
		],
		details: [
			{ id: "d-3", menu_id: "m-2", menu_name: "Ayam Bakar", variant_name: "Manis", quantity: 2 },
			{ id: "d-4", menu_id: "m-3", menu_name: "Es Teh Manis", variant_name: "Dingin", quantity: 2 },
		],
		is_active: true,
		created_at: "15 Des 2025",
	},
	{
		id: "3",
		name: "Paket Buy 1 Get 1",
		code: "B1G1",
		image: null,
		start_period: "2024-02-01",
		end_period: "2024-02-28",
		store_ids: ["store-1"],
		stores: [
			{ id: "store-1", name: "Warung Jul Panam", address: "Panam, Pekanbaru", is_active: true },
		],
		has_price_variation: false,
		sell_price: 35000,
		prices: [
			{ order_type_id: "ot-takeaway", order_type_name: "Take Away", sell_price: 35000 },
		],
		details: [
			{ id: "d-5", menu_id: "m-4", menu_name: "Kopi Susu", variant_name: "Reguler", quantity: 2 },
		],
		is_active: true,
		created_at: "01 Feb 2026",
	},
];
