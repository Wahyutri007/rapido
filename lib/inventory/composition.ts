import type { CompositionLineFields } from "@/types/ui/inventory/composition";

export function compositionCost(lines: CompositionLineFields[]) {
	return lines.reduce(
		(total, line) => total + line.quantity * line.unitPrice,
		0,
	);
}

export function compositionMargin(cost: number, salePrice?: number) {
	if (
		!Number.isFinite(cost) ||
		cost < 0 ||
		salePrice === undefined ||
		!Number.isFinite(salePrice) ||
		salePrice <= 0
	)
		return null;
	const profit = salePrice - cost;
	const percentage = (profit / salePrice) * 100;
	return Number.isFinite(profit) && Number.isFinite(percentage)
		? { profit, percentage }
		: null;
}

export function simulateComposition(
	lines: CompositionLineFields[],
	portions: number,
) {
	if (!Number.isFinite(portions) || portions <= 0) return null;
	const quantities = lines.map((line) => ({
		materialId: line.materialId,
		quantity: line.quantity * portions,
		unit: line.unit,
	}));
	const cost = compositionCost(lines) * portions;
	if (
		!Number.isFinite(cost) ||
		quantities.some((line) => !Number.isFinite(line.quantity))
	)
		return null;
	return { portions, cost, quantities };
}
