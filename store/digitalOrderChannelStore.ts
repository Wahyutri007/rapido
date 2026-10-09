import { create } from "zustand";
import {
	type DigitalOrderChannelInput,
	digitalOrderChannelSchema,
} from "@/schema/manage/digital-order-channel";
import type { DigitalOrderChannel } from "@/types/ui/manage/digital-order-channel";

type Result =
	| { ok: true; id: string }
	| { ok: false; reason: "invalid" | "duplicate" | "missing" | "stale" };
type ChannelStore = {
	items: DigitalOrderChannel[];
	nextId: number;
	add: (values: DigitalOrderChannelInput) => Result;
	update: (
		id: string,
		revision: number,
		values: DigitalOrderChannelInput,
	) => Result;
	remove: (id: string, revision: number) => Result;
};

const nameKey = (name: string) => name.trim().toLocaleLowerCase("id-ID");

export const useDigitalOrderChannelStore = create<ChannelStore>((set, get) => ({
	items: [],
	nextId: 1,
	add(values) {
		const parsed = digitalOrderChannelSchema.safeParse(values);
		if (!parsed.success) return { ok: false, reason: "invalid" };
		if (
			get().items.some(
				(item) => nameKey(item.name) === nameKey(parsed.data.name),
			)
		)
			return { ok: false, reason: "duplicate" };
		const id = `digital-channel-${get().nextId}`;
		set((state) => ({
			items: [
				...state.items,
				{ ...parsed.data, id, revision: 1, status: "draft" },
			],
			nextId: state.nextId + 1,
		}));
		return { ok: true, id };
	},
	update(id, revision, values) {
		const item = get().items.find((entry) => entry.id === id);
		if (!item) return { ok: false, reason: "missing" };
		if (item.revision !== revision) return { ok: false, reason: "stale" };
		const parsed = digitalOrderChannelSchema.safeParse(values);
		if (!parsed.success) return { ok: false, reason: "invalid" };
		if (
			get().items.some(
				(entry) =>
					entry.id !== id && nameKey(entry.name) === nameKey(parsed.data.name),
			)
		)
			return { ok: false, reason: "duplicate" };
		set((state) => ({
			items: state.items.map((entry) =>
				entry.id === id
					? { ...parsed.data, id, revision: revision + 1, status: "draft" }
					: entry,
			),
		}));
		return { ok: true, id };
	},
	remove(id, revision) {
		const item = get().items.find((entry) => entry.id === id);
		if (!item) return { ok: false, reason: "missing" };
		if (item.revision !== revision) return { ok: false, reason: "stale" };
		set((state) => ({ items: state.items.filter((entry) => entry.id !== id) }));
		return { ok: true, id };
	},
}));
