import { z } from "zod";
import { journalLineSchema } from "./general-journal";

export const closingJournalSchema = z
	.object({
		period: z.string().min(1, "Periode harus dipilih"),
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

export type ClosingJournalSchema = z.infer<typeof closingJournalSchema>;
