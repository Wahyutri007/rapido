import { PLACE_KINDS } from "@/constants/data/manage/place";
import type {
	CashierPlace,
	CashierPlaceFilters,
} from "@/types/ui/cashier/location";
import type { ManagedPlace, PlaceOutlet } from "@/types/ui/manage/place";

export function cashierPlaces(outlet: PlaceOutlet): CashierPlace[] {
	return outlet.areas.flatMap((area) =>
		[...area.places]
			.sort((a, b) => a.position - b.position)
			.map((place) => ({
				outlet,
				area,
				place,
				active: outlet.active && place.active,
			})),
	);
}

export function cashierPlaceKind(place: ManagedPlace) {
	return PLACE_KINDS.find((kind) => kind.value === place.kind);
}

export function filterCashierPlaces(
	records: CashierPlace[],
	filters: CashierPlaceFilters,
) {
	const search = filters.search.trim().toLocaleLowerCase("id-ID");
	return records.filter((record) => {
		if (filters.areaId && record.area.id !== filters.areaId) return false;
		if (filters.status && record.active !== (filters.status === "active"))
			return false;
		return (
			!search ||
			[
				record.place.name,
				record.area.name,
				cashierPlaceKind(record.place)?.label,
			].some((value) => value?.toLocaleLowerCase("id-ID").includes(search))
		);
	});
}

export function findCashierPlace(
	outlets: PlaceOutlet[],
	outletId: string | string[] | undefined,
	areaId: string | string[] | undefined,
	placeId: string | string[] | undefined,
): CashierPlace | undefined {
	if (
		typeof outletId !== "string" ||
		typeof areaId !== "string" ||
		typeof placeId !== "string"
	)
		return;
	const outlet = outlets.find((item) => item.id === outletId);
	const area = outlet?.areas.find((item) => item.id === areaId);
	const place = area?.places.find((item) => item.id === placeId);
	if (outlet && area && place)
		return { outlet, area, place, active: outlet.active && place.active };
}
