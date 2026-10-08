import { INVENTORY_SUPPLIERS } from "@/constants/data/inventory";
import type {
	InventorySupplier,
	SupplierFields,
} from "@/types/ui/inventory/supplier";

export const EMPTY_SUPPLIER: SupplierFields = {
	name: "",
	address: "",
	phone: "",
	email: "",
	province: "",
	city: "",
	district: "",
	postalCode: "",
};

// Only the region example present in the captured supplier-detail frame.
// Replace this preview hierarchy when a regional-data contract is available.
export const SUPPLIER_REGIONS = [
	{ province: "Riau", city: "Pekanbaru", district: "Rumbai Selatan" },
];

export const DEFAULT_SUPPLIERS: InventorySupplier[] = [
	{
		...EMPTY_SUPPLIER,
		id: "supplier-kue",
		name: "Pemasok Kue",
		address: "Bandung, Jawa Barat",
		province: "Jawa Barat",
		city: "Bandung",
		active: true,
		primary: true,
		products: ["Tepung", "telur", "gula"],
		priorPurchaseTotal: 154000000,
	},
	{
		id: "supplier-baju",
		name: "Pemasok Baju",
		address: "Dumai kota, jalan ali akbar",
		phone: "0852 9834 7642",
		email: "smith@gmail.com",
		province: "Riau",
		city: "Pekanbaru",
		district: "Rumbai Selatan",
		postalCode: "25252",
		active: true,
		primary: true,
		products: ["Kain", "penggulung", "mesin jahit"],
		priorPurchaseTotal: 154000000,
	},
	...INVENTORY_SUPPLIERS.map((name, index) => ({
		...EMPTY_SUPPLIER,
		id: `supplier-${index + 1}`,
		name,
		active: true,
		primary: false,
		products: [],
		priorPurchaseTotal: 0,
	})),
];
