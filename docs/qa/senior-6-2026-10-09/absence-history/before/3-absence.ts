import type { AttendanceRecord } from "@/store/useAbsenceStore";
import type {
	AttendanceFilters,
	AttendanceStatus,
} from "@/types/ui/manage/absence";

const MONTHS = [
	"januari",
	"februari",
	"maret",
	"april",
	"mei",
	"juni",
	"juli",
	"agustus",
	"september",
	"oktober",
	"november",
	"desember",
];

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
	complete: "Masuk & Keluar",
	open: "Belum Keluar",
	unknown: "Belum Lengkap",
};

export function attendanceDateKey(value: string): string | undefined {
	const text = value.trim();
	const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
	const local = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(text);
	if (!iso && !local) return undefined;
	const year = Number(iso ? iso[1] : local?.[3]);
	const month = iso
		? Number(iso[2])
		: MONTHS.indexOf(local?.[2].toLowerCase() ?? "") + 1;
	const day = Number(iso ? iso[3] : local?.[1]);
	if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1)
		return undefined;
	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	)
		return undefined;
	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isAttendanceTime(value: string): boolean {
	return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export function attendanceStatus(record: AttendanceRecord): AttendanceStatus {
	if (!isAttendanceTime(record.checkIn)) return "unknown";
	if (isAttendanceTime(record.checkOut)) return "complete";
	return !record.checkOut.trim() || record.checkOut.trim() === "-"
		? "open"
		: "unknown";
}

export function attendanceTimeLabel(value: string): string {
	return isAttendanceTime(value) ? value.trim() : "Belum dicatat";
}

export function filterAttendance(
	records: AttendanceRecord[],
	filters: AttendanceFilters,
): AttendanceRecord[] {
	const query = filters.search.trim().toLocaleLowerCase("id-ID");
	return records
		.filter((record) => {
			const status = attendanceStatus(record);
			return (
				(filters.status === "all" || status === filters.status) &&
				(filters.storeName === undefined ||
					record.storeName?.trim() === filters.storeName) &&
				(filters.date === undefined || record.date === filters.date) &&
				(!query ||
					[
						record.date,
						record.storeName,
						record.locationName,
						record.checkIn,
						record.checkOut,
						ATTENDANCE_STATUS_LABELS[status],
					].some((value) => value?.toLocaleLowerCase("id-ID").includes(query)))
			);
		})
		.map((record, index) => ({
			record,
			index,
			date: attendanceDateKey(record.date) ?? "",
		}))
		.sort((a, b) => b.date.localeCompare(a.date) || a.index - b.index)
		.map((item) => item.record);
}

export function attendanceSummary(records: AttendanceRecord[]) {
	return records.reduce(
		(counts, record) => {
			counts[attendanceStatus(record)] += 1;
			return counts;
		},
		{ complete: 0, open: 0, unknown: 0 },
	);
}
