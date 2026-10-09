import { create } from "zustand";
import { COMPOSITION_PRODUCTS } from "@/constants/data/inventory-compositions";
import { compositionSchema } from "@/schema/inventory/composition";
import type {
	CompositionFields,
	CompositionResult,
	InventoryComposition,
} from "@/types/ui/inventory/composition";
import type { InventoryMaterial } from "@/types/ui/inventory/material";

type CompositionState = {
	compositions: InventoryComposition[];
	saveComposition: (
		productId: string,
		values: CompositionFields,
		materials: InventoryMaterial[],
	) => CompositionResult;
	deleteComposition: (productId: string) => CompositionResult;
};

// Active recipes only, in-memory. Callers supply the current material catalog at save time.
export const useInventoryCompositionStore = create<CompositionState>(
	(set, get) => ({
		compositions: [],
		saveComposition: (productId, values, materials) => {
			if (!COMPOSITION_PRODUCTS.some((item) => item.id === productId))
				return { error: "Produk tidak ditemukan" };
			const parsed = compositionSchema.safeParse(values);
			if (!parsed.success)
				return { error: parsed.error.issues[0].message, field: "lines" };
			for (const [index, line] of parsed.data.lines.entries()) {
				const material = materials.find((item) => item.id === line.materialId);
				if (!material)
					return {
						error:
							"Bahan baku tidak tersedia. Pilih kembali bahan yang digunakan.",
						field: `lines.${index}.materialId`,
					};
				if (material.unit !== line.unit)
					return {
						error: "Satuan bahan berubah. Hapus lalu pilih kembali bahan ini.",
						field: `lines.${index}.unit`,
					};
			}
			const current = get().compositions.find(
				(item) => item.productId === productId,
			);
			const now = new Date().toISOString();
			const composition: InventoryComposition = {
				productId,
				createdAt: current?.createdAt ?? now,
				updatedAt: now,
				lines: parsed.data.lines.map((line) => {
					const { id, name, sku, kind, category, stock, unit } = materials.find(
						(item) => item.id === line.materialId,
					)!;
					return {
						...line,
						material: { id, name, sku, kind, category, stock, unit },
					};
				}),
			};
			set((state) => ({
				compositions: current
					? state.compositions.map((item) =>
							item.productId === productId ? composition : item,
						)
					: [...state.compositions, composition],
			}));
			return { productId };
		},
		deleteComposition: (productId) => {
			if (!get().compositions.some((item) => item.productId === productId))
				return { error: "Resep tidak ditemukan" };
			set((state) => ({
				compositions: state.compositions.filter(
					(item) => item.productId !== productId,
				),
			}));
			return { productId };
		},
	}),
);
