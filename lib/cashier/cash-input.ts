// Rp200.000 is the explicit quick-entry key in frame29:25047, not an order total.
const CASH_PRESET = 200_000;

export function getCashQuickAmounts(totalPrice: number | null): number[] {
	if (
		totalPrice === null ||
		!Number.isSafeInteger(totalPrice) ||
		totalPrice < 0
	) {
		return [];
	}
	return [...new Set([totalPrice, CASH_PRESET])].filter(
		(amount) => amount > 0 && amount >= totalPrice,
	);
}

/** Group digits without rounding an unsafe or long amount before validation. */
export function formatCashDigits(value: string): string {
	if (!value || /\D/.test(value)) return "0";
	return value.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
