const MONTHS = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

export function validExpenseDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split("-").map(Number);
	if (year < 1900 || year > 2100) return false;
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
}

// The existing report form also saves dates such as "19 Maret 2026".
export function expenseDateISO(value: string): string {
	const trimmed = value.trim();
	if (validExpenseDate(trimmed)) return trimmed;
	const match = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(trimmed);
	if (!match) return "";
	const month =
		MONTHS.findIndex((name) => name.toLowerCase() === match[2].toLowerCase()) +
		1;
	const iso = `${match[3]}-${String(month).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
	return validExpenseDate(iso) ? iso : "";
}

export function expenseDateLabel(value: string): string {
	const iso = expenseDateISO(value);
	if (!iso) return value || "Tanggal belum diisi";
	const [year, month, day] = iso.split("-").map(Number);
	return `${day} ${MONTHS[month - 1]} ${year}`;
}
