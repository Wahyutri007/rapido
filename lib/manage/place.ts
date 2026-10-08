import type { ManagedPlace, PlaceOutlet } from "@/types/ui/manage/place";

export function placeSummary(outlets: PlaceOutlet[]) {
	const places = outlets.flatMap((outlet) =>
		outlet.areas.flatMap((area) => area.places),
	);
	const active = outlets
		.filter((outlet) => outlet.active)
		.reduce(
			(sum, outlet) =>
				sum +
				outlet.areas.reduce(
					(count, area) =>
						count + area.places.filter((place) => place.active).length,
					0,
				),
			0,
		);
	return {
		outlets: outlets.length,
		areas: outlets.reduce((sum, outlet) => sum + outlet.areas.length, 0),
		total: places.length,
		active,
		inactive: places.length - active,
	};
}

export function placeOrder(places: ManagedPlace[]) {
	return [...places]
		.sort((a, b) => a.position - b.position)
		.map((place) => place.id);
}

export function movePlace(
	order: string[],
	from: number,
	dx: number,
	dy: number,
) {
	const column = (from % 3) + dx;
	const row = Math.floor(from / 3) + dy;
	const target = row * 3 + column;
	if (
		column < 0 ||
		column > 2 ||
		row < 0 ||
		target >= order.length ||
		target === from
	)
		return order;
	const next = [...order];
	[next[from], next[target]] = [next[target], next[from]];
	return next;
}

export function duplicateName(
	rows: { name: string; id: string }[],
	name: string,
	id: string,
) {
	return rows.some(
		(row) =>
			row.id !== id &&
			row.name.trim().toLocaleLowerCase("id-ID") ===
				name.trim().toLocaleLowerCase("id-ID"),
	);
}
