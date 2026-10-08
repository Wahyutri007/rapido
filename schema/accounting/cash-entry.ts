import { z } from "zod";
import { validAccountingDate } from "@/lib/accounting/date";

type CashEntryOptions = {
	accounts: readonly { value: string; code: string }[];
	fundingSources: readonly { value: string }[];
	stores: readonly { value: string }[];
};

export function createCashEntrySchema(options: CashEntryOptions) {
	return z
		.object({
			accountName: z
				.string()
				.refine(
					(value) => options.accounts.some((item) => item.value === value),
					"Pilih nama akun.",
				),
			accountCode: z.string(),
			referenceNumber: z
				.string()
				.trim()
				.min(1, "Nomor referensi wajib diisi.")
				.max(80, "Maksimal 80 karakter."),
			fundingSource: z
				.string()
				.refine(
					(value) =>
						options.fundingSources.some((item) => item.value === value),
					"Pilih sumber dana.",
				),
			store: z
				.string()
				.refine(
					(value) => options.stores.some((item) => item.value === value),
					"Pilih toko.",
				),
			date: z
				.string()
				.trim()
				.refine(
					validAccountingDate,
					"Gunakan tanggal valid dengan format YYYY-MM-DD (1900–2100).",
				),
			amount: z
				.number()
				.finite()
				.int("Nominal harus berupa Rupiah bulat.")
				.min(1, "Nominal harus lebih dari 0.")
				.max(1_000_000_000_000, "Nominal maksimal Rp1 triliun."),
			description: z
				.string()
				.trim()
				.min(1, "Deskripsi wajib diisi.")
				.max(1000, "Maksimal 1.000 karakter."),
		})
		.superRefine((values, context) => {
			const account = options.accounts.find(
				(item) => item.value === values.accountName,
			);
			if (account && account.code !== values.accountCode)
				context.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["accountCode"],
					message: "Kode harus sesuai nama akun.",
				});
		});
}

export type CashEntryValues = z.infer<ReturnType<typeof createCashEntrySchema>>;
