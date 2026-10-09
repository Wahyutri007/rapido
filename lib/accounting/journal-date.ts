import { accountingDateISO, validAccountingDate } from "./date";

const SHORT_MONTHS = [
	["jan"],
	["feb"],
	["mar"],
	["apr"],
	["mei", "may"],
	["jun"],
	["jul"],
	["agu", "aug"],
	["sep"],
	["okt", "oct"],
	["nov"],
	["des", "dec"],
];

// Journal fixtures and the native picker use abbreviated months; reports also use ISO/full Indonesian dates.
export function journalPickerDate(value: string): Date | undefined {
	let iso = accountingDateISO(value);
	if (!iso) {
		const match = /^(\d{1,2})\s+([a-z]{3})\s+(\d{4})$/i.exec(value.trim());
		if (!match) return undefined;
		const month =
			SHORT_MONTHS.findIndex((aliases) =>
				aliases.includes(match[2].toLowerCase()),
			) + 1;
		iso = `${match[3]}-${String(month).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
		if (!validAccountingDate(iso)) return undefined;
	}
	const [year, month, day] = iso.split("-").map(Number);
	return new Date(year, month - 1, day);
}
