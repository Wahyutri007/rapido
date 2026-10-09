import { create } from "zustand";
import { SALES_TARGETS } from "@/constants/data/manage/sales-target";
import { duplicateTarget } from "@/lib/manage/sales-target";
import {
	type SalesTargetValues,
	salesTargetSchema,
} from "@/schema/manage/sales-target";
import type { SalesTarget } from "@/types/ui/manage/sales-target";

type SaveResult =
	| { id: string }
	| { error: "missing" | "duplicate" | "invalid" };
type SalesTargetState = {
	targets: SalesTarget[];
	save: (values: SalesTargetValues, id?: string) => SaveResult;
	remove: (id: string) => void;
};
let sequence = 0;

// Design prototype only; no API calls or device persistence.
export const useSalesTargetStore = create<SalesTargetState>((set, get) => ({
	targets: SALES_TARGETS,
	save: (values, id) => {
		const parsed = salesTargetSchema.safeParse(values);
		if (!parsed.success) return { error: "invalid" };
		const targets = get().targets;
		if (id && !targets.some((target) => target.id === id))
			return { error: "missing" };
		if (duplicateTarget(targets, parsed.data.storeId, parsed.data.name, id))
			return { error: "duplicate" };
		const savedId = id ?? `target-local-${Date.now()}-${++sequence}`;
		const target = { ...parsed.data, id: savedId };
		set({
			targets: id
				? targets.map((current) => (current.id === id ? target : current))
				: [...targets, target],
		});
		return { id: savedId };
	},
	remove: (id) =>
		set((state) => ({
			targets: state.targets.filter((target) => target.id !== id),
		})),
}));
