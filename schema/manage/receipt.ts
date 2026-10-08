import { z } from "zod";

export const receiptSettingsSchema = z.object({
	enabled: z.object({
		logo: z.boolean(),
		address: z.boolean(),
		phone: z.boolean(),
		transactionNumber: z.boolean(),
		cashier: z.boolean(),
		customer: z.boolean(),
		date: z.boolean(),
		items: z.boolean(),
		subtotal: z.boolean(),
		taxes: z.boolean(),
		total: z.boolean(),
		payment: z.boolean(),
	}),
	footer: z.string().trim().max(500, "Catatan footer maksimal 500 karakter."),
});
