import { z } from "zod";

export const accountSchema = z.object({
	classification: z.string().min(1, "Klasifikasi wajib dipilih"),
	subClassification: z.string().min(1, "Subklasifikasi wajib dipilih"),
	code: z.string().min(1, "Kode akun wajib diisi"),
	name: z.string().min(1, "Nama akun wajib diisi"),
	currency: z.string(),
	debit: z.coerce.number().min(0),
	credit: z.coerce.number().min(0),
	description: z.string().optional(),
});

export type AccountSchema = z.infer<typeof accountSchema>;
