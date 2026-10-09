export function expiryDateText(value: Date | null) {
	if (!value || !Number.isFinite(value.getTime())) return "";
	return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function parseExpiryDate(text: string): Date | null {
	if (!text.trim()) return null;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return new Date(Number.NaN);
	const [year, month, day] = text.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	return expiryDateText(date) === text ? date : new Date(Number.NaN);
}
