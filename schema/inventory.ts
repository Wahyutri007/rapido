import { z } from "zod";
import { INVENTORY_ITEMS } from "@/constants/data/inventory";

const itemIdSchema = z
	.string()
	.refine(
		(id) => INVENTORY_ITEMS.some((item) => item.id === id),
		"Item tidak ditemukan",
	);

const stockLineSchema = z
	.object({
		itemId: itemIdSchema,
		stock: z.number().nonnegative(),
		quantity: z.number().positive("Jumlah harus lebih dari 0"),
	})
	.refine((line) => line.quantity <= line.stock, {
		path: ["quantity"],
		message: "Jumlah melebihi stok tersedia",
	});

export const stockOperationSchema = z
	.object({
		operation: z.enum(["transfer", "adjustment"]),
		kind: z.enum(["product", "material"]),
		fromStore: z.string().min(1, "Pilih toko"),
		toStore: z.string(),
		note: z.string(),
		lines: z.array(stockLineSchema).min(1, "Pilih setidaknya satu item"),
	})
	.superRefine((data, context) => {
		if (data.operation === "transfer" && !data.toStore) {
			context.addIssue({
				code: "custom",
				path: ["toStore"],
				message: "Pilih toko tujuan",
			});
		}
		if (data.operation === "transfer" && data.toStore === data.fromStore) {
			context.addIssue({
				code: "custom",
				path: ["toStore"],
				message: "Toko tujuan harus berbeda",
			});
		}
	});

export type StockOperationSchema = z.infer<typeof stockOperationSchema>;

export const purchaseSchema = z.object({
	store: z.string().min(1, "Pilih toko"),
	supplier: z.string().min(1, "Pilih pemasok"),
	purchaseMethod: z.string().min(1, "Pilih metode pembelian"),
	paymentMethod: z.string().min(1, "Pilih metode pembayaran"),
	date: z.date(),
	paid: z.boolean(),
	kind: z.enum(["product", "material"]),
	note: z.string(),
	lines: z
		.array(
			z.object({
				itemId: itemIdSchema,
				quantity: z.number().positive("Jumlah harus lebih dari 0"),
				price: z.number().nonnegative("Harga tidak boleh negatif"),
			}),
		)
		.min(1, "Pilih setidaknya satu item"),
});

export type PurchaseSchema = z.infer<typeof purchaseSchema>;
