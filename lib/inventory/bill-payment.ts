import type { PurchaseRecord } from "@/types/ui/inventory";
import type {
	BillPayment,
	BillPaymentFields,
} from "@/types/ui/inventory/bill-payment";

export const billMoney = (value: number) => {
	const minor = Math.round(value * 100);
	return minor === 0 ? 0 : minor / 100;
};

export function purchaseOutstanding(
	purchase: PurchaseRecord,
	payments: BillPayment[],
	excludingId?: string,
) {
	if (
		purchase.paid ||
		purchase.status === "cancelled" ||
		!Number.isFinite(purchase.amount) ||
		purchase.amount <= 0
	)
		return 0;
	const applied = payments
		.filter((payment) => payment.id !== excludingId)
		.flatMap((payment) => payment.lines)
		.filter((line) => line.purchaseId === purchase.id)
		.reduce(
			(sum, line) =>
				sum + Math.round(line.amount * 100) + Math.round(line.discount * 100),
			0,
		);
	return Math.max(0, Math.round(purchase.amount * 100) - applied) / 100;
}

export function purchaseMatchesSupplier(
	purchase: PurchaseRecord,
	supplier: { id: string; name: string },
) {
	return purchase.supplierId
		? purchase.supplierId === supplier.id
		: purchase.supplier.trim().toLowerCase() ===
				supplier.name.trim().toLowerCase();
}

export function billPaymentTotals(lines: BillPaymentFields["lines"]) {
	return {
		amount:
			lines.reduce((sum, line) => sum + Math.round(line.amount * 100), 0) / 100,
		discount:
			lines.reduce((sum, line) => sum + Math.round(line.discount * 100), 0) /
			100,
	};
}

export function purchasePaymentStatus(
	purchase: PurchaseRecord,
	payments: BillPayment[],
) {
	if (purchase.status === "cancelled") return "Dibatalkan";
	const remaining = purchaseOutstanding(purchase, payments);
	if (remaining === 0) return "Lunas";
	return remaining < billMoney(purchase.amount) ? "Sebagian" : "Belum Lunas";
}
