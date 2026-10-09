import { z } from "zod";
import { INVENTORY_STORES } from "@/constants/data/inventory";
import { MATERIAL_UNITS } from "@/constants/data/inventory-materials";

const quantity = z
	.number()
	.finite("Masukkan angka yang valid")
	.nonnegative("Nilai tidak boleh negatif");
export const materialSchema = z
	.object({
		stores: z
			.array(
				z
					.string()
					.refine(
						(value) => INVENTORY_STORES.includes(value),
						"Toko tidak ditemukan",
					),
			)
			.min(1, "Pilih setidaknya satu toko")
			.refine(
				(values) => new Set(values).size === values.length,
				"Toko tidak boleh berulang",
			),
		name: z
			.string()
			.trim()
			.min(1, "Nama bahan baku wajib diisi")
			.max(80, "Maksimal 80 karakter"),
		sku: z.string().trim().max(64, "Maksimal 64 karakter"),
		unit: z
			.string()
			.refine((value) => MATERIAL_UNITS.includes(value), "Pilih satuan"),
		stock: quantity,
		minimumStock: quantity,
		averagePrice: z
			.number()
			.finite("Masukkan harga yang valid")
			.positive("Harga beli rata-rata harus lebih dari 0"),
		expiresAt: z
			.date({
				errorMap: () => ({ message: "Tanggal kedaluwarsa tidak valid" }),
			})
			.nullable(),
		note: z.string().trim().max(1000, "Catatan maksimal 1000 karakter"),
	})
	.superRefine((data, context) => {
		if (!Number.isFinite(data.stock * data.averagePrice))
			context.addIssue({
				code: "custom",
				path: ["averagePrice"],
				message: "Nilai stok terlalu besar",
			});
	});
export type MaterialSchema = z.infer<typeof materialSchema>;
