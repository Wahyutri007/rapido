import { z } from "zod";
import { documentPickerResultSchema } from "../common";

export const bundlingDetailItemSchema = z.object({
	id: z.string().optional(),
	menu_id: z
		.string({
			required_error: "Menu harus dipilih",
			invalid_type_error: "Menu tidak valid",
		})
		.min(1, "Menu harus dipilih"),
	variant_name: z.string().optional(),
	quantity: z.coerce
		.number({
			required_error: "Jumlah harus diisi",
			invalid_type_error: "Jumlah tidak valid",
		})
		.min(1, "Jumlah minimal 1"),
});

export const bundlingOrderTypePriceSchema = z.object({
	order_type_id: z.string().min(1, "Tipe pesanan harus dipilih"),
	sell_price: z.coerce.number().min(0, "Harga tidak valid"),
});

export const bundlingSchema = z.object({
	name: z
		.string({
			required_error: "Nama paket harus diisi",
			invalid_type_error: "Nama paket tidak valid",
		})
		.min(1, "Nama paket harus diisi"),
	store_ids: z.array(z.string()).min(1, "Minimal pilih 1 toko"),
	image: z
		.union([documentPickerResultSchema, z.string()])
		.optional()
		.nullable(),
	start_period: z.date({
		required_error: "Tanggal mulai harus diisi",
		invalid_type_error: "Tanggal mulai tidak valid",
	}),
	end_period: z.date({
		required_error: "Tanggal akhir harus diisi",
		invalid_type_error: "Tanggal akhir tidak valid",
	}),
	details: z.array(bundlingDetailItemSchema).min(1, "Minimal 1 item bundling"),
	has_price_variation: z.boolean().default(false),
	sell_price: z.coerce.number().min(0).optional(),
	prices: z.array(bundlingOrderTypePriceSchema).optional(),
});

export type BundlingSchema = z.infer<typeof bundlingSchema>;
export type BundlingFormInput = z.input<typeof bundlingSchema>;
