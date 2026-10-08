import { create } from "zustand";
import { DEFAULT_SUPPLIERS } from "@/constants/data/inventory-suppliers";
import { supplierSchema } from "@/schema/inventory/supplier";
import type {
	InventorySupplier,
	SupplierFields,
	SupplierResult,
} from "@/types/ui/inventory/supplier";
import { useInventoryStore } from "./inventoryStore";

type SupplierState = {
	suppliers: InventorySupplier[];
	sequence: number;
	saveSupplier: (
		id: string | undefined,
		values: SupplierFields,
	) => SupplierResult;
	deleteSupplier: (id: string) => SupplierResult;
};

const normalizedName = (name: string) => name.trim().toLowerCase();

// Session-only UI records. Supplier CRUD needs the API factory once its contract exists.
export const useInventorySupplierStore = create<SupplierState>((set, get) => ({
	suppliers: DEFAULT_SUPPLIERS,
	sequence: DEFAULT_SUPPLIERS.length,
	saveSupplier: (id, values) => {
		const parsed = supplierSchema.safeParse(values);
		if (!parsed.success) return { error: parsed.error.issues[0].message };
		const current = id
			? get().suppliers.find((supplier) => supplier.id === id)
			: undefined;
		if (id && !current) return { error: "Pemasok tidak ditemukan" };
		if (
			get().suppliers.some(
				(supplier) =>
					supplier.id !== id &&
					normalizedName(supplier.name) === normalizedName(parsed.data.name),
			)
		)
			return { error: "Nama pemasok sudah digunakan", field: "name" };
		if (current) {
			useInventoryStore.getState().linkSupplier(current.id, current.name);
			set((state) => ({
				suppliers: state.suppliers.map((supplier) =>
					supplier.id === id ? { ...supplier, ...parsed.data } : supplier,
				),
			}));
			return { id: current.id };
		}
		const sequence = get().sequence + 1;
		const newId = `supplier-${Date.now()}-${sequence}`;
		set((state) => ({
			sequence,
			suppliers: [
				{
					...parsed.data,
					id: newId,
					active: true,
					primary: false,
					products: [],
					priorPurchaseTotal: 0,
				},
				...state.suppliers,
			],
		}));
		return { id: newId };
	},
	deleteSupplier: (id) => {
		const supplier = get().suppliers.find((item) => item.id === id);
		if (!supplier) return { error: "Pemasok tidak ditemukan" };
		const used = useInventoryStore
			.getState()
			.purchases.some(
				(purchase) =>
					purchase.supplierId === id ||
					(!purchase.supplierId &&
						normalizedName(purchase.supplier) ===
							normalizedName(supplier.name)),
			);
		if (used)
			return { error: "Pemasok masih digunakan pada pesanan pembelian" };
		set((state) => ({
			suppliers: state.suppliers.filter((item) => item.id !== id),
		}));
		return { id };
	},
}));
