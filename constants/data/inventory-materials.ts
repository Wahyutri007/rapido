import { INVENTORY_ITEMS, INVENTORY_STORES } from "@/constants/data/inventory";
import type {
	InventoryMaterial,
	MaterialFields,
} from "@/types/ui/inventory/material";

export const MATERIAL_UNITS = [
	...new Set(INVENTORY_ITEMS.map((item) => item.unit)),
];
export const EMPTY_MATERIAL: MaterialFields = {
	stores: [],
	name: "",
	sku: "",
	unit: "",
	stock: 0,
	minimumStock: 0,
	averagePrice: 0,
	expiresAt: null,
	note: "",
};

// Session fixtures only. The detail source uses Pcs for flour; existing flows use Kg.
// Preserve that existing unit while using the captured detail quantities.
export const DEFAULT_MATERIALS: InventoryMaterial[] = INVENTORY_ITEMS.filter(
	(item) => item.kind === "material",
).map((item) => ({
	...item,
	kind: "material",
	stores: [INVENTORY_STORES[0]],
	minimumStock: item.id === "tepung" ? 245 : 0,
	averagePrice: item.id === "tepung" ? 30000 : null,
	expiresAt: null,
	note: "",
	averageDailyUsage: item.id === "tepung" ? 7 : null,
	stock: item.id === "tepung" ? 18 : item.stock,
	locations:
		item.id === "tepung"
			? [
					{ name: "Gudang Utama", quantity: 4 },
					{ name: "Gudang Cabang", quantity: 2 },
					{ name: "Freezer", quantity: 12 },
				]
			: [{ name: "Gudang Utama", quantity: item.stock }],
	movements:
		item.id === "tepung"
			? [
					{
						id: "material-purchase",
						label: "Pembelian masuk",
						reference: "PO/A001/2603/002",
						quantity: 50,
					},
					{
						id: "material-usage",
						label: "Pemakaian Otomatis",
						reference: "INV/A001/2603/004",
						quantity: -8,
					},
					{
						id: "material-transfer",
						label: "Transfer Stok",
						reference: "TF/A001/2603/001",
						quantity: -10,
					},
					{
						id: "material-adjustment",
						label: "Penyesuaian Stok",
						reference: "PS/A001/2603/001",
						quantity: 2,
					},
				]
			: [],
}));
