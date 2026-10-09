import { create } from "zustand";
import {
	type IntegrationSchema,
	integrationSchema,
} from "@/schema/manage/integration";
import type { IntegrationDraft } from "@/types/ui/manage/integration";

type ManageIntegrationStore = {
	items: IntegrationDraft[];
	nextId: number;
	add: (values: IntegrationSchema) => string | null;
	update: (id: string, values: IntegrationSchema) => boolean;
	remove: (id: string) => boolean;
};

export const useManageIntegrationStore = create<ManageIntegrationStore>(
	(set, get) => ({
		items: [],
		nextId: 1,
		add(values) {
			const result = integrationSchema.safeParse(values);
			if (!result.success) return null;
			const id = `integration-${get().nextId}`;
			set((state) => ({
				items: [...state.items, { ...result.data, id, status: "draft" }],
				nextId: state.nextId + 1,
			}));
			return id;
		},
		update(id, values) {
			const result = integrationSchema.safeParse(values);
			if (!result.success || !get().items.some((item) => item.id === id))
				return false;
			set((state) => ({
				items: state.items.map((item) =>
					item.id === id ? { ...result.data, id, status: "draft" } : item,
				),
			}));
			return true;
		},
		remove(id) {
			if (!get().items.some((item) => item.id === id)) return false;
			set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
			return true;
		},
	}),
);
