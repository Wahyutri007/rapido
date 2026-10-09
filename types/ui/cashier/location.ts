import type {
	ManagedPlace,
	PlaceArea,
	PlaceOutlet,
} from "@/types/ui/manage/place";

export type CashierPlace = {
	outlet: PlaceOutlet;
	area: PlaceArea;
	place: ManagedPlace;
	active: boolean;
};

export type CashierPlaceFilters = {
	search: string;
	areaId?: string;
	status?: "active" | "inactive";
};
