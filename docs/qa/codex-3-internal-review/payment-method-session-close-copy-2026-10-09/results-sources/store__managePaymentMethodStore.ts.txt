import { create } from "zustand";
import {
	type PaymentMethodSchema,
	paymentMethodSchema,
} from "@/schema/manage/payment-method";
import type { PaymentMethodItemProps } from "@/types/ui/manage/payment-method";

type ManagePaymentMethodStore = {
	items: PaymentMethodItemProps[];
	nextId: number;
	add: (values: PaymentMethodSchema) => string | null;
	update: (id: string, values: PaymentMethodSchema) => boolean;
	remove: (id: string) => boolean;
};

export const useManagePaymentMethodStore = create<ManagePaymentMethodStore>(
	(set, get) => ({
		items: [],
		nextId: 1,
		add(values) {
			const result = paymentMethodSchema.safeParse(values);
			if (!result.success) return null;
			const id = `payment-method-${get().nextId}`;
			set((state) => ({
				items: [...state.items, { ...result.data, id }],
				nextId: state.nextId + 1,
			}));
			return id;
		},
		update(id, values) {
			const result = paymentMethodSchema.safeParse(values);
			if (!result.success || !get().items.some((item) => item.id === id))
				return false;
			set((state) => ({
				items: state.items.map((item) =>
					item.id === id ? { ...result.data, id } : item,
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
