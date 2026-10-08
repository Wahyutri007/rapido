import { z } from "zod";

export const expenseSchema = z.object({
	accountName: z.string().min(1, "Nama akun wajib dipilih"),
	accountCode: z.string().min(1, "Kode akun wajib diisi"),
	referenceNumber: z.string().min(1, "Nomor referensi wajib diisi"),
	fundingSource: z.string().min(1, "Sumber dana wajib dipilih"),
	store: z.string().min(1, "Toko wajib dipilih"),
	date: z.string().min(1, "Tanggal wajib diisi"),
	amount: z.coerce.number().min(1, "Nominal wajib diisi dan lebih dari 0"),
	description: z.string().min(1, "Deskripsi wajib diisi"),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
