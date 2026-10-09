import { formatRp } from "@/lib/utils";
import type { TransactionItemProps } from "@/types/ui/transaction/transaction";

// A missing breakdown is unknown, rather than an invented zero-item bill.
export function billItemQuantity(orders: TransactionItemProps["orders"]) {
	if (!orders.length) return null;
	let quantity = 0;
	for (const order of orders) {
		if (!Number.isSafeInteger(order.amount) || order.amount < 0) return null;
		quantity += order.amount;
		if (!Number.isSafeInteger(quantity)) return null;
	}
	return quantity;
}

export function billTotalLabel(total: number) {
	if (!Number.isSafeInteger(total) || total < 0) return "Total tidak tersedia";
	return `Total : ${formatRp(total).replace(/\s+/g, "")}`;
}

function validDate(value: TransactionItemProps["date"]) {
	const date = new Date(value);
	return Number.isFinite(date.getTime()) ? date : null;
}

export function billCalendarLabel(value: TransactionItemProps["date"]) {
	const date = validDate(value);
	return date
		? date.toLocaleDateString("id-ID", {
				day: "2-digit",
				month: "long",
				year: "numeric",
				timeZone: "UTC",
			})
		: "Tanggal tidak tersedia";
}

export function billAgeLabel(
	value: TransactionItemProps["date"],
	now = Date.now(),
) {
	const date = validDate(value);
	if (!date || !Number.isFinite(now)) return "Waktu tidak tersedia";
	const elapsed = now - date.getTime();
	if (elapsed < 0) return "Waktu mendatang";
	const minutes = Math.floor(elapsed / 60_000);
	if (minutes < 1) return "Baru saja";
	if (minutes < 60) return `${minutes} menit yang lalu`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} jam yang lalu`;
	return `${Math.floor(hours / 24)} hari yang lalu`;
}
