import type { InventoryItem } from "../inventory";

export type MaterialFields = {
	stores: string[];
	name: string;
	sku: string;
	unit: string;
	stock: number;
	minimumStock: number;
	averagePrice: number;
	expiresAt: Date | null;
	note: string;
};

export type MaterialLocation = { name: string; quantity: number };
export type MaterialMovement = {
	id: string;
	label: string;
	reference: string;
	quantity: number;
	unit?: string;
};
export type InventoryMaterial = InventoryItem & {
	kind: "material";
	stores: string[];
	minimumStock: number;
	averagePrice: number | null;
	expiresAt: string | null;
	note: string;
	averageDailyUsage: number | null;
	locations: MaterialLocation[];
	movements: MaterialMovement[];
};
export type MaterialResult =
	| { id: string }
	| { error: string; field?: keyof MaterialFields };
export type MaterialStockStatus = "safe" | "low" | "empty";
