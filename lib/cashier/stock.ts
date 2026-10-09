import type {
	CashierStockFilter,
	CashierStockGroup,
	CashierStockRow,
} from "@/types/ui/cashier/stock";

export function defaultCashierStockFilter(): CashierStockFilter {
	return { status: "all", categories: [] };
}

export function toggleCashierStockCategory(
	categories: string[],
	category: string,
) {
	return categories.includes(category)
		? categories.filter((value) => value !== category)
		: [...categories, category];
}

export function cashierStockGroups(
	rows: readonly CashierStockRow[],
	search: string,
	filter: CashierStockFilter,
): CashierStockGroup[] {
	const query = search.trim().toLocaleLowerCase("id-ID");
	const groups = new Map<string, CashierStockRow[]>();
	for (const row of rows) {
		if (filter.categories.length && !filter.categories.includes(row.category))
			continue;
		// Keep category headers for empty status results, as in the Figma frames.
		if (!groups.has(row.category)) groups.set(row.category, []);
		if (
			!`${row.name} ${row.variant ?? ""} ${row.category}`
				.toLocaleLowerCase("id-ID")
				.includes(query)
		)
			continue;
		if (
			filter.status === "available"
				? row.quantity <= 0
				: filter.status !== "all" && filter.status !== row.status
		)
			continue;
		groups.get(row.category)?.push(row);
	}
	return [...groups]
		.filter(([, items]) => !query || items.length > 0)
		.map(([category, items]) => ({ category, rows: items }));
}

const quantityFormatter = new Intl.NumberFormat("en-US", {
	useGrouping: false,
	maximumFractionDigits: 20,
});

export function formatCashierStock(row: CashierStockRow) {
	return `${quantityFormatter.format(row.quantity)} ${row.unit}`;
}
