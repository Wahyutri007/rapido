import { z } from "zod";
import { journalLineSchema } from "./general-journal";

export const adjustingJournalSchema = z
	.object({
		date: z.string().min(1, "Tanggal harus diisi"),
		referenceNumber: z.string().min(1, "No. Referensi harus diisi"),
		adjustmentType: z.string().min(1, "Jenis penyesuaian harus dipilih"),
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

export type AdjustingJournalSchema = z.infer<typeof adjustingJournalSchema>;
