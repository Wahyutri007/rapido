import { z } from "zod";
import { getInventoryItems } from "@/lib/inventory";

const itemIdSchema = z
	.string()
	.refine(
		(id) => getInventoryItems().some((item) => item.id === id),
		"Item tidak ditemukan",
	);

const stockLineSchema = z
	.object({
		itemId: itemIdSchema,
		stock: z.number().finite().nonnegative(),
		quantity: z
			.number()
			.finite("Jumlah tidak valid")
			.positive("Jumlah harus lebih dari 0"),
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
		const items = getInventoryItems();
		data.lines.forEach((line, index) => {
			const item = items.find((item) => item.id === line.itemId);
			if (item && item.kind !== data.kind)
				context.addIssue({
					code: "custom",
					path: ["lines", index, "itemId"],
					message: "Jenis item tidak sesuai",
				});
			if (item && line.quantity > item.stock)
				context.addIssue({
					code: "custom",
					path: ["lines", index, "quantity"],
					message: "Jumlah melebihi stok tersedia",
				});
		});
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

export const purchaseSchema = z
	.object({
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
					quantity: z
						.number()
						.finite("Jumlah tidak valid")
						.positive("Jumlah harus lebih dari 0"),
					price: z
						.number()
						.finite("Harga tidak valid")
						.nonnegative("Harga tidak boleh negatif"),
				}),
			)
			.min(1, "Pilih setidaknya satu item"),
	})
	.superRefine((data, context) => {
		const items = getInventoryItems();
		if (
			!Number.isFinite(
				data.lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
			)
		)
			context.addIssue({
				code: "custom",
				path: ["lines"],
				message: "Total pembelian terlalu besar",
			});
		data.lines.forEach((line, index) => {
			const item = items.find((item) => item.id === line.itemId);
			if (item && item.kind !== data.kind)
				context.addIssue({
					code: "custom",
					path: ["lines", index, "itemId"],
					message: "Jenis item tidak sesuai",
				});
		});
	});

export type PurchaseSchema = z.infer<typeof purchaseSchema>;
