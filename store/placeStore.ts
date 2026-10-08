import { create } from "zustand";
import { PLACE_OUTLETS } from "@/constants/data/manage/place";
import { placeOrder } from "@/lib/manage/place";
import type { PlaceAreasValues, PlacesValues } from "@/schema/manage/place";
import type { PlaceOutlet } from "@/types/ui/manage/place";

let sequence = 0;
const newId = () => `place-local-${Date.now()}-${++sequence}`;

type PlaceState = {
	outlets: PlaceOutlet[];
	saveAreas: (values: PlaceAreasValues) => void;
	savePlaces: (outletId: string, values: PlacesValues) => void;
	deleteArea: (outletId: string, areaId: string) => void;
	deletePlace: (outletId: string, areaId: string, placeId: string) => void;
	saveLayout: (outletId: string, areaId: string, order: string[]) => void;
};

// Interactive design state; no backend mutation or device persistence.
export const usePlaceStore = create<PlaceState>((set) => ({
	outlets: PLACE_OUTLETS,
	saveAreas: ({ outletId, rows }) =>
		set((state) => ({
			outlets: state.outlets.map((outlet) => {
				if (outlet.id !== outletId) return outlet;
				const areas = outlet.areas.map((area) => {
					const row = rows.find((item) => item.areaId === area.id);
					return row ? { ...area, name: row.name } : area;
				});
				return {
					...outlet,
					areas: [
						...areas,
						...rows
							.filter((row) => !row.areaId)
							.map((row) => ({ id: newId(), name: row.name, places: [] })),
					],
				};
			}),
		})),
	savePlaces: (outletId, { areaId, rows }) =>
		set((state) => ({
			outlets: state.outlets.map((outlet) =>
				outlet.id !== outletId
					? outlet
					: {
							...outlet,
							areas: outlet.areas.map((area) => {
								if (area.id !== areaId) return area;
								const places = area.places.map((place) => {
									const row = rows.find((item) => item.placeId === place.id);
									return row
										? {
												...place,
												name: row.name,
												kind: row.kind,
												capacity: row.capacity,
												active: row.active,
											}
										: place;
								});
								return {
									...area,
									places: [
										...places,
										...rows
											.filter((row) => !row.placeId)
											.map((row, index) => ({
												id: newId(),
												name: row.name,
												kind: row.kind,
												capacity: row.capacity,
												active: row.active,
												position: places.length + index,
											})),
									],
								};
							}),
						},
			),
		})),
	deleteArea: (outletId, areaId) =>
		set((state) => ({
			outlets: state.outlets.map((outlet) =>
				outlet.id !== outletId
					? outlet
					: {
							...outlet,
							areas: outlet.areas.filter((area) => area.id !== areaId),
						},
			),
		})),
	deletePlace: (outletId, areaId, placeId) =>
		set((state) => ({
			outlets: state.outlets.map((outlet) =>
				outlet.id !== outletId
					? outlet
					: {
							...outlet,
							areas: outlet.areas.map((area) => {
								if (area.id !== areaId) return area;
								const remaining = area.places.filter(
									(place) => place.id !== placeId,
								);
								const order = placeOrder(remaining);
								return {
									...area,
									places: remaining.map((place) => ({
										...place,
										position: order.indexOf(place.id),
									})),
								};
							}),
						},
			),
		})),
	saveLayout: (outletId, areaId, order) =>
		set((state) => ({
			outlets: state.outlets.map((outlet) =>
				outlet.id !== outletId
					? outlet
					: {
							...outlet,
							areas: outlet.areas.map((area) => {
								if (
									area.id !== areaId ||
									order.length !== area.places.length ||
									new Set(order).size !== order.length ||
									area.places.some((place) => !order.includes(place.id))
								)
									return area;
								return {
									...area,
									places: area.places.map((place) => ({
										...place,
										position: order.indexOf(place.id),
									})),
								};
							}),
						},
			),
		})),
}));
