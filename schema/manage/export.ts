import { z } from "zod";
import { validAccountingDate } from "@/lib/accounting/date";
export const exportSelectSchema = z.object({
	store: z.string().min(1, "Pilih toko"),
});
export const exportSchema = exportSelectSchema
	.extend({
		type: z.enum(["transaction", "inventory", "financial"]),
		store: z.string(),
		start: z.string().trim(),
		end: z.string().trim(),
	})
	.superRefine((value, context) => {
		if (value.type === "financial" && !value.store)
			context.addIssue({
				code: "custom",
				path: ["store"],
				message: "Pilih toko",
			});
		if (value.type === "inventory") return;
		for (const field of ["start", "end"] as const) {
			if (value[field] && !validAccountingDate(value[field]))
				context.addIssue({
					code: "custom",
					path: [field],
					message: "Gunakan tanggal valid YYYY-MM-DD",
				});
		}
		if (value.start && value.end && value.start > value.end)
			context.addIssue({
				code: "custom",
				path: ["end"],
				message: "Tanggal akhir harus setelah atau sama dengan tanggal mulai",
			});
	});
export type ExportSelectSchema = z.infer<typeof exportSelectSchema>;
export type ExportSchema = z.infer<typeof exportSchema>;
