import { adjustingJournalSchema } from "@/schema/accounting/adjusting-journal";
import { generalJournalSchema } from "@/schema/accounting/general-journal";
import type { GeneralJournal } from "@/types/ui/accounting/journal";
import { journalPickerDate } from "./journal-date";

type JournalDraft = Pick<
	GeneralJournal,
	"date" | "referenceNumber" | "description" | "lines" | "adjustmentType"
>;

const trimText = (value: string): string =>
	typeof value === "string" ? value.trim() : "";

export function journalValidationError(
	draft: JournalDraft,
	kind: "general" | "adjusting",
): string | undefined {
	const date = trimText(draft.date);
	if (!date) return "Tanggal jurnal wajib diisi.";
	if (!journalPickerDate(date)) {
		return "Tanggal jurnal tidak valid. Pilih tanggal kalender yang benar.";
	}
	if (
		draft.lines.some(
			(line) => !Number.isFinite(line.debit) || !Number.isFinite(line.credit),
		)
	) {
		return "Nominal debit dan kredit harus berupa angka yang valid.";
	}
	if (draft.lines.some((line) => line.debit < 0 || line.credit < 0)) {
		return "Nominal debit dan kredit tidak boleh negatif.";
	}
	const totalDebit = draft.lines.reduce((sum, line) => sum + line.debit, 0);
	const totalCredit = draft.lines.reduce((sum, line) => sum + line.credit, 0);
	if (!Number.isFinite(totalDebit) || !Number.isFinite(totalCredit)) {
		return "Total debit dan kredit terlalu besar. Kurangi nominal jurnal.";
	}

	// Trim only the validation copy; saving keeps the original record text and line identities.
	const schema =
		kind === "adjusting" ? adjustingJournalSchema : generalJournalSchema;
	const result = schema.safeParse({
		...draft,
		date,
		referenceNumber: trimText(draft.referenceNumber),
		description: trimText(draft.description),
		adjustmentType: trimText(draft.adjustmentType ?? ""),
		lines: draft.lines.map((line) => ({
			...line,
			accountId: trimText(line.accountId),
			accountCode: trimText(line.accountCode),
			accountName: trimText(line.accountName),
		})),
	});
	return result.success ? undefined : result.error.issues[0].message;
}
