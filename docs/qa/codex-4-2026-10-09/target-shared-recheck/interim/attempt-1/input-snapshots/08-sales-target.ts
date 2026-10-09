import {
	TARGET_CATEGORIES,
	TARGET_PRODUCTS,
} from "@/constants/data/manage/sales-target";
import type {
	SalesTarget,
	SalesTargetKind,
	SalesTargetRow,
} from "@/types/ui/manage/sales-target";

export function targetChoices(storeId: string, kind: SalesTargetKind) {
	return (kind === "product" ? TARGET_PRODUCTS : TARGET_CATEGORIES).filter(
		(item) => item.storeId === storeId,
	);
}

export function blankTargetRow(kind: SalesTargetKind): SalesTargetRow {
	return { itemId: "", quantity: kind === "product" ? 1 : null, amount: 0 };
}

export function selectTargetRows(
	rows: SalesTargetRow[],
	ids: string[],
	kind: SalesTargetKind,
) {
	return [...new Set(ids)].map(
		(itemId) =>
			rows.find((row) => row.itemId === itemId) ?? {
				...blankTargetRow(kind),
				itemId,
			},
	);
}

export function targetTotals(rows: SalesTargetRow[]) {
	return rows.reduce(
		(totals, row) => ({
			amount: totals.amount + row.amount,
			quantity: totals.quantity + (row.quantity ?? 0),
		}),
		{ amount: 0, quantity: 0 },
	);
}

export function validTargetDate(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		year >= 1900 &&
		year <= 2100 &&
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
}

export function targetPeriod(
	target: Pick<SalesTarget, "startDate" | "endDate">,
) {
	const date = (value: string) =>
		new Date(`${value}T00:00:00Z`).toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
			timeZone: "UTC",
		});
	return `${date(target.startDate)} – ${date(target.endDate)}`;
}

export function duplicateTarget(
	targets: SalesTarget[],
	storeId: string,
	name: string,
	id?: string,
) {
	return targets.some(
		(target) =>
			target.id !== id &&
			target.storeId === storeId &&
			target.name.toLocaleLowerCase("id-ID") ===
				name.trim().toLocaleLowerCase("id-ID"),
	);
}
