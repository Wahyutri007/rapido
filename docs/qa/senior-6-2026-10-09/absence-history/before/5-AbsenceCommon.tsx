import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { ATTENDANCE_STATUS_LABELS } from "@/lib/manage/absence";
import type { AttendanceStatus } from "@/types/ui/manage/absence";

export function AbsencePreviewNotice() {
	return (
		<Card density="compact" className="gap-2">
			<Text w="semibold">Pratinjau Catatan Absensi</Text>
			<Text size="small" className="text-muted">
				Catatan dari mode Absensi selama aplikasi terbuka. Belum menjadi rekap
				kehadiran seluruh karyawan.
			</Text>
		</Card>
	);
}

export function AbsenceStatus({ status }: { status: AttendanceStatus }) {
	const colors =
		status === "complete"
			? "bg-success-50"
			: status === "open"
				? "bg-warning-50"
				: "bg-surface-muted";
	const textColor =
		status === "complete"
			? "text-success"
			: status === "open"
				? "text-warning"
				: "text-muted";
	return (
		<View className={`self-start rounded-full px-2 py-1 ${colors}`}>
			<Text size="small" w="medium" className={textColor}>
				{ATTENDANCE_STATUS_LABELS[status]}
			</Text>
		</View>
	);
}
