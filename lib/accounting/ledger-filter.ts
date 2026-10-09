import { accountingDateISO, validAccountingDate } from "@/lib/accounting/date";

// Ledger fixtures use DD-MM-YYYY; other accounting flows use ISO or Indonesian
// month names. Normalize calendar dates without parsing them as UTC instants.
function ledgerDateISO(value: string): string {
	const normalized = accountingDateISO(value);
	if (normalized) return normalized;
	const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value.trim());
	if (!match) return "";
	const iso = `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
	return validAccountingDate(iso) ? iso : "";
}

export function ledgerEntryMatchesPeriod(
	date: string,
	period: string,
	referenceDate: Date,
): boolean {
	if (period === "all") return true;
	const iso = ledgerDateISO(date);
	if (!iso) return false;
	const [year, month] = iso.split("-").map(Number);
	if (year !== referenceDate.getFullYear()) return false;
	const referenceMonth = referenceDate.getMonth() + 1;
	switch (period) {
		case "month":
			return month === referenceMonth;
		case "quarter":
			return (
				Math.floor((month - 1) / 3) === Math.floor((referenceMonth - 1) / 3)
			);
		case "year":
			return true;
		default:
			return false;
	}
}
