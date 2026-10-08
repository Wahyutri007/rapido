export type PlaceKind =
	| "dine-in"
	| "counter"
	| "waiting"
	| "retail"
	| "facility";

export type ManagedPlace = {
	id: string;
	name: string;
	kind: PlaceKind;
	capacity: number;
	active: boolean;
	position: number;
};

export type PlaceArea = {
	id: string;
	name: string;
	places: ManagedPlace[];
};

export type PlaceOutlet = {
	id: string;
	name: string;
	address: string;
	active: boolean;
	areas: PlaceArea[];
};
