import type { ExtraMenuData } from "@/types/api/extra-menu";

// Mock data matching the design specifications for Catalog Extras (Tambahan)
export const MOCK_EXTRA_MENU_DATA: ExtraMenuData[] = [
	{
		id: "extra-1",
		name: "Toping",
		details: [
			{ id: "opt-1", name: "Dadar", price: 8000 },
			{ id: "opt-2", name: "Cabe", price: 4000 },
			{ id: "opt-3", name: "Sosis", price: 6000 },
		],
		menus: [
			{ id: "m-1", name: "Nasi Goreng" },
			{ id: "m-2", name: "Mie Ayam" },
			{ id: "m-3", name: "Sate Taichan" },
			{ id: "m-4", name: "Jus Jeruk" },
		],
		menu_ids: ["m-1", "m-2", "m-3", "m-4"],
		created_at: "2025-08-17T08:00:00Z",
		updated_at: "2025-08-17T08:00:00Z",
	},
	{
		id: "extra-2",
		name: "Add on",
		details: [
			{ id: "opt-4", name: "Extra Keju", price: 5000 },
			{ id: "opt-5", name: "Extra Saus", price: 3000 },
		],
		menus: [
			{ id: "m-1", name: "Nasi Goreng" },
			{ id: "m-2", name: "Mie Ayam" },
		],
		menu_ids: ["m-1", "m-2"],
		created_at: "2025-08-17T09:00:00Z",
		updated_at: "2025-08-17T09:00:00Z",
	},
	{
		id: "extra-3",
		name: "Kacang-kacangan",
		details: [
			{ id: "opt-6", name: "Kacang Almond", price: 7000 },
			{ id: "opt-7", name: "Kacang Mete", price: 8000 },
		],
		menus: [
			{ id: "m-4", name: "Jus Jeruk" },
		],
		menu_ids: ["m-4"],
		created_at: "2025-08-17T10:00:00Z",
		updated_at: "2025-08-17T10:00:00Z",
	},
];
