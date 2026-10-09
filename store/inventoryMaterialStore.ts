import { create } from "zustand";
import { DEFAULT_MATERIALS } from "@/constants/data/inventory-materials";
import { allocateMaterialStock } from "@/lib/inventory-material";
import { materialSchema } from "@/schema/inventory/material";
import type {
	InventoryMaterial,
	MaterialFields,
	MaterialResult,
} from "@/types/ui/inventory/material";
import { useInventoryStore } from "./inventoryStore";
import { useInventoryCompositionStore } from "./inventoryCompositionStore";

type MaterialState = {
	materials: InventoryMaterial[];
	sequence: number;
	saveMaterial: (
		id: string | undefined,
		values: MaterialFields,
	) => MaterialResult;
	deleteMaterial: (id: string) => MaterialResult;
};
const normalized = (value: string) => value.trim().toLowerCase();

// UI session data only; keep API DTOs and persistence separate until a contract exists.
export const useInventoryMaterialStore = create<MaterialState>((set, get) => ({
	materials: DEFAULT_MATERIALS,
	sequence: DEFAULT_MATERIALS.length,
	saveMaterial: (id, values) => {
		const result = materialSchema.safeParse(values);
		if (!result.success) return { error: result.error.issues[0].message };
		const current =
			id !== undefined
				? get().materials.find((material) => material.id === id)
				: undefined;
		if (id !== undefined && !current)
			return { error: "Bahan baku tidak ditemukan" };
		const data = result.data;
		if (
			get().materials.some(
				(material) =>
					material.id !== id &&
					normalized(material.name) === normalized(data.name),
			)
		)
			return { error: "Nama bahan baku sudah digunakan", field: "name" };
		if (
			data.sku &&
			get().materials.some(
				(material) =>
					material.id !== id &&
					normalized(material.sku) === normalized(data.sku),
			)
		)
			return { error: "Kode bahan sudah digunakan", field: "sku" };
		const fields = {
			...data,
			expiresAt: data.expiresAt?.toISOString() ?? null,
		};
		if (current) {
			set((state) => ({
				materials: state.materials.map((material) =>
					material.id === id
						? {
								...material,
								...fields,
								locations: allocateMaterialStock(
									data.stock,
									material.locations,
								),
							}
						: material,
				),
			}));
			return { id: current.id };
		}
		const sequence = get().sequence + 1;
		const newId = `material-${Date.now()}-${sequence}`;
		set((state) => ({
			sequence,
			materials: [
				{
					...fields,
					id: newId,
					kind: "material",
					category: "Bahan Baku",
					averageDailyUsage: null,
					locations: allocateMaterialStock(data.stock, []),
					movements: [],
				},
				...state.materials,
			],
		}));
		return { id: newId };
	},
	deleteMaterial: (id) => {
		const material = get().materials.find((item) => item.id === id);
		if (!material) return { error: "Bahan baku tidak ditemukan" };
		if (
			useInventoryCompositionStore
				.getState()
				.compositions.some((composition) =>
					composition.lines.some((line) => line.materialId === id),
				)
		)
			return { error: "Bahan baku masih digunakan pada resep produk" };
		const inventory = useInventoryStore.getState();
		const used =
			material.movements.length > 0 ||
			[...inventory.purchases, ...inventory.stockRecords].some((record) =>
				record.lines.some((line) => line.item.id === id),
			);
		if (used)
			return {
				error: "Bahan baku masih digunakan pada transaksi atau mutasi stok",
			};
		set((state) => ({
			materials: state.materials.filter((item) => item.id !== id),
		}));
		return { id };
	},
}));
