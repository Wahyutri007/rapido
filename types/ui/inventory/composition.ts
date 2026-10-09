import type { InventoryItem } from "../inventory";

export type CompositionLineFields = {
	materialId: string;
	unit: string;
	quantity: number;
	unitPrice: number;
};
export type CompositionFields = { lines: CompositionLineFields[] };
export type CompositionLine = CompositionLineFields & {
	material: InventoryItem;
};
export type InventoryComposition = {
	productId: string;
	createdAt: string;
	updatedAt: string;
	lines: CompositionLine[];
};
export type CompositionResult =
	| { productId: string }
	| {
			error: string;
			field?: "lines" | `lines.${number}.materialId` | `lines.${number}.unit`;
	  };
