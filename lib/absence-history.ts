import { attendanceDateKey, filterAttendance } from "@/lib/manage/absence";
import type { AttendanceRecord } from "@/store/useAbsenceStore";
import type { AttendanceFilters } from "@/types/ui/manage/absence";

export function groupAttendanceHistory(
	records: AttendanceRecord[],
	filters: AttendanceFilters,
) {
	const groups = new Map<
		string,
		{ key: string; title: string; data: AttendanceRecord[] }
	>();
	for (const record of filterAttendance(records, filters)) {
		const date = record.date.trim();
		const key = attendanceDateKey(date) ?? `unknown:${date}`;
		const group = groups.get(key);
		if (group) group.data.push(record);
		else
			groups.set(key, {
				key,
				title: date || "Tanggal tidak dicatat",
				data: [record],
			});
	}
	return [...groups.values()];
}

export function findAttendanceHistory(
	records: AttendanceRecord[],
	id: string | string[] | undefined,
) {
	return typeof id === "string" && id
		? records.find((record) => record.id === id)
		: undefined;
}
