import { create } from "zustand";
import {
	DEFAULT_ADJUSTMENTS,
	DEFAULT_PURCHASES,
	DEFAULT_TRANSFERS,
} from "@/constants/data/inventory";
import type { PurchaseRecord, StockRecord } from "@/types/ui/inventory";

type InventoryState = {
	stockRecords: StockRecord[];
	purchases: PurchaseRecord[];
	purchaseSequence: number;
	addStockRecord: (record: Omit<StockRecord, "id" | "reference">) => string;
	addPurchase: (record: Omit<PurchaseRecord, "id" | "reference">) => string;
	deletePurchase: (id: string) => void;
	linkSupplier: (id: string, name: string) => void;
};

// UI preview data only. Server inventory belongs in api/hooks when endpoints exist.
export const useInventoryStore = create<InventoryState>((set, get) => ({
	stockRecords: [...DEFAULT_TRANSFERS, ...DEFAULT_ADJUSTMENTS],
	purchases: DEFAULT_PURCHASES,
	purchaseSequence: DEFAULT_PURCHASES.length,
	addStockRecord: (record) => {
		const sequence =
			get().stockRecords.filter((item) => item.operation === record.operation)
				.length + 1;
		const prefix = record.operation === "transfer" ? "TF" : "PS";
		const id = `${record.operation}-${Date.now()}-${sequence}`;
		const reference = `${prefix}/A001/2603/${String(sequence).padStart(3, "0")}`;
		set((state) => ({
			stockRecords: [{ ...record, id, reference }, ...state.stockRecords],
		}));
		return id;
	},
	addPurchase: (record) => {
		const sequence = get().purchaseSequence + 1;
		const id = `purchase-${Date.now()}-${sequence}`;
		const reference = `PO/A001/2603/${String(sequence).padStart(3, "0")}`;
		set((state) => ({
			purchases: [{ ...record, id, reference }, ...state.purchases],
			purchaseSequence: sequence,
		}));
		return id;
	},
	deletePurchase: (id) =>
		set((state) => ({
			purchases: state.purchases.filter((record) => record.id !== id),
		})),
	linkSupplier: (id, name) =>
		set((state) => ({
			purchases: state.purchases.map((record) =>
				!record.supplierId &&
				record.supplier.trim().toLowerCase() === name.trim().toLowerCase()
					? { ...record, supplierId: id }
					: record,
			),
		})),
}));
