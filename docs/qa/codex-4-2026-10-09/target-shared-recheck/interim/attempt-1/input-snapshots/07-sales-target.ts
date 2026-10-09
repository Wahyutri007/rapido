import { z } from "zod";
import { TARGET_STORES } from "@/constants/data/manage/sales-target";
import { targetChoices, validTargetDate } from "@/lib/manage/sales-target";

const date = z
	.string()
	.refine(validTargetDate, "Gunakan tanggal valid dengan format YYYY-MM-DD.");

export const salesTargetSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Nama target wajib diisi.")
			.max(100, "Nama target maksimal 100 karakter."),
		startDate: date,
		endDate: date,
		storeId: z.string().min(1, "Pilih toko."),
		kind: z.enum(["product", "category"]),
		rows: z
			.array(
				z.object({
					itemId: z.string().min(1, "Pilih produk atau kategori."),
					quantity: z
						.number()
						.int("Kuantitas harus bilangan bulat.")
						.min(1, "Kuantitas minimal 1.")
						.max(1_000_000, "Kuantitas maksimal 1.000.000.")
						.nullable(),
					amount: z
						.number()
						.int("Nilai harus berupa Rupiah bulat.")
						.min(1, "Nilai target minimal Rp1.")
						.max(1_000_000_000_000, "Nilai target maksimal Rp1 triliun."),
				}),
			)
			.min(1, "Tambahkan minimal satu target.")
			.max(50, "Maksimal 50 target per form."),
	})
	.superRefine((values, context) => {
		const issue = (path: (string | number)[], message: string) =>
			context.addIssue({ code: z.ZodIssueCode.custom, path, message });
		if (
			values.storeId &&
			!TARGET_STORES.some((store) => store.value === values.storeId)
		)
			issue(["storeId"], "Toko tidak ditemukan.");
		if (
			validTargetDate(values.startDate) &&
			validTargetDate(values.endDate) &&
			values.endDate < values.startDate
		)
			issue(["endDate"], "Tanggal akhir tidak boleh sebelum tanggal mulai.");
		const choices = targetChoices(values.storeId, values.kind);
		const seen = new Set<string>();
		values.rows.forEach((row, index) => {
			if (row.itemId && !choices.some((choice) => choice.value === row.itemId))
				issue(
					["rows", index, "itemId"],
					"Pilihan tidak tersedia untuk toko dan tipe target ini.",
				);
			if (row.itemId && seen.has(row.itemId))
				issue(["rows", index, "itemId"], "Produk atau kategori sudah dipilih.");
			seen.add(row.itemId);
			if (values.kind === "product" && row.quantity === null)
				issue(["rows", index, "quantity"], "Kuantitas wajib diisi.");
			if (values.kind === "category" && row.quantity !== null)
				issue(
					["rows", index, "quantity"],
					"Target kategori hanya menggunakan nilai.",
				);
		});
	});

export type SalesTargetValues = z.infer<typeof salesTargetSchema>;
