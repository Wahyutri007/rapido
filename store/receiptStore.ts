import { create } from "zustand";
import type { ReceiptSettings } from "@/types/ui/manage/receipt";

type ReceiptState = {
	settingsByStore: Record<string, ReceiptSettings>;
	previewByStore: Record<string, ReceiptSettings | undefined>;
	saveSettings: (storeId: string, settings: ReceiptSettings) => void;
	setPreview: (storeId: string, settings?: ReceiptSettings) => void;
};

// UI prototype state, retained while the app runs; no backend save or printing.
export const useReceiptStore = create<ReceiptState>((set) => ({
	settingsByStore: {},
	previewByStore: {},
	saveSettings: (storeId, settings) =>
		set((state) => ({
			settingsByStore: { ...state.settingsByStore, [storeId]: settings },
			previewByStore: { ...state.previewByStore, [storeId]: undefined },
		})),
	setPreview: (storeId, settings) =>
		set((state) => ({
			previewByStore: { ...state.previewByStore, [storeId]: settings },
		})),
}));
