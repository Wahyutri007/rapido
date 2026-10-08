import { z } from "zod";

const requirementSchema = z.object({
	applicable_id: z.string().min(1, "Harus dipilih"),
	variant_id: z.string().optional(),
	minimum_quantity: z.coerce.number().min(1, "Minimal 1"),
});

export const promoSchema = z
	.object({
		name: z.string().min(1, "Nama promo wajib diisi"),
		type: z.enum(["discount", "free_item"]),
		promo_requirement: z.enum(["category", "item", "combination"]),
		order_type_id: z.string().min(1, "Tipe pesanan wajib dipilih"),
		store_ids: z.array(z.string()).optional(),
		start_period: z.date({ required_error: "Tanggal mulai wajib diisi" }),
		end_period: z.date({ required_error: "Tanggal selesai wajib diisi" }),
		days: z.array(z.string()).optional(),

		// Dynamic Requirements
		requirements: z.array(requirementSchema).optional(), // For Category/Item
		combination_requirements: z
			.array(
				z.object({
					items: z.array(requirementSchema).min(1, "Minimal 1 item"),
				}),
			)
			.optional(), // For Combination (Array of Groups)

		// Rewards
		discount: z
			.object({
				type: z.enum(["percentage", "fixed"]),
				amount: z.coerce.number().min(0.01, "Nilai minimal 0.01"),
			})
			.optional(),

		free_item: z
			.object({
				menu_id: z.string().optional(),
				menu_entry_id: z.string().min(1, "Menu gratis wajib dipilih"),
				quantity: z.coerce.number().min(1, "Minimal 1"),
			})
			.optional(),
	})
	.refine(
		(data) => {
			if (data.type === "discount" && !data.discount) return false;
			if (data.type === "free_item" && !data.free_item) return false;
			return true;
		},
		{
			message: "Reward harus diisi sesuai tipe promo",
			path: ["type"],
		},
	)
	.refine(
		(data) => {
			if (data.end_period < data.start_period) return false;
			return true;
		},
		{
			message: "Tanggal selesai harus setelah tanggal mulai",
			path: ["end_period"],
		},
	);

export type PromoSchema = z.infer<typeof promoSchema>;
