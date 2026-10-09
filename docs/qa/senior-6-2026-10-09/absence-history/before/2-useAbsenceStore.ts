import { create } from "zustand";

export type AttendanceRecord = {
	id: string;
	date: string;
	checkIn: string;
	checkOut: string;
	storeName?: string;
	photoUri?: string;
	locationName?: string;
};

type AbsenceStore = {
	activeTab: "in" | "out";
	draftSelfie: string | null;
	records: AttendanceRecord[];
	setActiveTab: (tab: "in" | "out") => void;
	setDraftSelfie: (uri: string | null) => void;
	addRecord: (record: Omit<AttendanceRecord, "id">) => void;
};

export const useAbsenceStore = create<AbsenceStore>((set) => ({
	activeTab: "in",
	draftSelfie: null,
	records: [
		{
			id: "1",
			date: "06 Maret 2026",
			checkIn: "17:00",
			checkOut: "-",
			storeName: "Cabang Utama",
		},
		{
			id: "2",
			date: "06 Maret 2026",
			checkIn: "17:00",
			checkOut: "-",
			storeName: "Cabang Utama",
		},
		{
			id: "3",
			date: "06 Maret 2026",
			checkIn: "17:00",
			checkOut: "17:00",
			storeName: "Cabang Utama",
		},
		{
			id: "4",
			date: "06 Maret 2026",
			checkIn: "17:00",
			checkOut: "-",
			storeName: "Cabang Utama",
		},
	],
	setActiveTab: (activeTab) => set({ activeTab }),
	setDraftSelfie: (draftSelfie) => set({ draftSelfie }),
	addRecord: (record) =>
		set((state) => ({
			draftSelfie: null,
			records: [
				{
					...record,
					id: Date.now().toString(),
				},
				...state.records,
			],
		})),
}));
