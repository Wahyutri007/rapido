import { z } from "zod";

export const paymentMethodSchema = z
	.object({
		name: z.string().trim().min(1, "Nama metode pembayaran tidak boleh kosong"),
		type: z
			.string()
			.refine(
				(value): boolean => value === "bank_transfer",
				"Pilih jenis pembayaran",
			),
		adminType: z
			.string()
			.refine(
				(value): boolean => value === "percentage" || value === "nominal",
				"Pilih tipe biaya admin",
			),
		value: z
			.number({ invalid_type_error: "Biaya admin harus berupa angka" })
			.finite("Biaya admin harus berupa angka yang valid")
			.min(0, "Biaya admin tidak boleh kurang dari 0"),
		bank: z
			.string()
			.trim()
			.toLowerCase()
			.refine(
				(value) => ["bca", "bni", "bri", "mandiri"].includes(value),
				"Pilih bank yang tersedia",
			),
		accountNumber: z
			.string()
			.trim()
			.min(1, "Nomor rekening tidak boleh kosong"),
		accountName: z
			.string()
			.trim()
			.min(1, "Nama pemilik rekening tidak boleh kosong"),
	})
	.superRefine((data, context) => {
		if (data.adminType === "percentage" && data.value > 100) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["value"],
				message: "Persentase biaya admin tidak boleh melebihi 100",
			});
		}
	});

export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;
