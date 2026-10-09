export type AttendanceStatus = "complete" | "open" | "unknown";

export type AttendanceFilters = {
	search: string;
	status: AttendanceStatus | "all";
	storeName?: string;
	date?: string;
};
