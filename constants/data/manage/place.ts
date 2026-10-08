import type {
	ManagedPlace,
	PlaceKind,
	PlaceOutlet,
} from "@/types/ui/manage/place";

export const PLACE_KINDS: {
	value: PlaceKind;
	label: string;
	unit: string;
	icon: "grid" | "credit-card" | "users" | "archive" | "map-pin";
}[] = [
	{ value: "dine-in", label: "Dine In", unit: "kursi", icon: "grid" },
	{ value: "counter", label: "Counter", unit: "operator", icon: "credit-card" },
	{ value: "waiting", label: "Waiting Area", unit: "kursi", icon: "users" },
	{ value: "retail", label: "Retail", unit: "rak", icon: "archive" },
	{ value: "facility", label: "Fasilitas", unit: "unit", icon: "map-pin" },
];

const FIRST_AREA: Omit<ManagedPlace, "id" | "position">[] = [
	{ name: "Meja 01", kind: "dine-in", capacity: 4, active: true },
	{ name: "Meja 02", kind: "dine-in", capacity: 4, active: true },
	{ name: "Meja 03", kind: "dine-in", capacity: 2, active: true },
	{ name: "Kasir 01", kind: "counter", capacity: 1, active: true },
	{ name: "Kursi Tunggu", kind: "waiting", capacity: 10, active: false },
	{ name: "Rak Display 01", kind: "retail", capacity: 3, active: true },
	{ name: "Toilet", kind: "facility", capacity: 2, active: true },
];

function outlet(
	id: string,
	name: string,
	counts: number[],
	active = true,
): PlaceOutlet {
	return {
		id,
		name,
		active,
		address: "Jl. Merdeka No. 123, Pekanbaru",
		areas: counts.map((count, areaIndex) => ({
			id: `${id}-area-${areaIndex + 1}`,
			name: ["Lantai 1 - Indoor", "Outdoor", "VIP"][areaIndex],
			places: Array.from({ length: count }, (_, index) => ({
				...(id === "place-demo-1" && areaIndex === 0
					? FIRST_AREA[index]
					: {
							name: `Meja ${String(index + 1).padStart(2, "0")}`,
							kind: "dine-in" as const,
							capacity: 4,
							active: index % 7 !== 6,
						}),
				id: `${id}-area-${areaIndex + 1}-place-${index + 1}`,
				position: index,
			})),
		})),
	};
}

// Design fixtures. Summary values are derived from these complete local records.
export const PLACE_OUTLETS = [
	outlet("place-demo-1", "Toko Sushiro", [7, 5, 6]),
	outlet("place-demo-2", "Outlet Bandung", [4, 4, 4]),
	outlet("place-demo-3", "Outlet Surabaya", [10, 10]),
	outlet("place-demo-4", "Cabang Jakarta", [10, 10]),
	outlet("place-demo-5", "Warehouse Pusat", [2, 2], false),
];
