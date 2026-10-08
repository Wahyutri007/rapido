import { z } from "zod";

export const journalLineSchema = z.object({
	id: z.string(),
	accountId: z.string().min(1, "Akun harus dipilih"),
	accountCode: z.string().min(1, "Kode akun harus diisi"),
	accountName: z.string().min(1, "Nama akun harus diisi"),
	debit: z.number().min(0),
	credit: z.number().min(0),
});

export const generalJournalSchema = z
	.object({
		date: z.string().min(1, "Tanggal harus diisi"),
		referenceNumber: z.string().min(1, "No. Referensi harus diisi"),
		description: z.string().min(1, "Deskripsi harus diisi"),
		lines: z
			.array(journalLineSchema)
			.min(2, "Minimal 2 baris jurnal diperlukan"),
	})
	.refine(
		(data) => {
			const totalDebit = data.lines.reduce(
				(sum, line) => sum + (line.debit || 0),
				0,
			);
			const totalCredit = data.lines.reduce(
				(sum, line) => sum + (line.credit || 0),
				0,
			);
			return totalDebit > 0 && totalDebit === totalCredit;
		},
		{
			message: "Total debit dan total kredit harus seimbang dan lebih dari 0",
			path: ["lines"],
		},
	);

export type JournalLineSchema = z.infer<typeof journalLineSchema>;
export type GeneralJournalSchema = z.infer<typeof generalJournalSchema>;
