import { router, useLocalSearchParams } from "expo-router";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { AbsenceStatus } from "@/components/feature/manage/absence/AbsenceCommon";
import { Button, ButtonText } from "@/components/ui/button";
import { findAttendanceHistory } from "@/lib/absence-history";
import { attendanceStatus, attendanceTimeLabel } from "@/lib/manage/absence";
import { route } from "@/lib/utils";
import { useAbsenceStore } from "@/store/useAbsenceStore";
import HistoryNotice from "./HistoryNotice";

export default function HistoryDetailScreen() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	const record = useAbsenceStore((state) =>
		findAttendanceHistory(state.records, id),
	);
	if (!record) {
		return (
			<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text w="semibold">Catatan absensi tidak ditemukan.</Text>
					<Text size="small" className="text-muted">
						Catatan sudah tidak tersedia atau tautan tidak lengkap.
					</Text>
					<Button
						size="xl"
						onPress={() => router.replace(route("/(absence)/history"))}
					>
						<ButtonText>Kembali ke Riwayat Absensi</ButtonText>
					</Button>
				</Card>
			</Wrapper>
		);
	}
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<HistoryNotice />
			<Card className="gap-3">
				<Text w="semibold">
					{record.storeName?.trim() || "Toko tidak dicatat"}
				</Text>
				<AbsenceStatus status={attendanceStatus(record)} />
				<DetailRow
					label="Tanggal"
					value={record.date.trim() || "Tidak dicatat"}
				/>
				<DetailRow
					label="Jam Masuk"
					value={attendanceTimeLabel(record.checkIn)}
				/>
				<DetailRow
					label="Jam Keluar"
					value={attendanceTimeLabel(record.checkOut)}
				/>
				<DetailRow
					label="Lokasi"
					value={record.locationName?.trim() || "Tidak dicatat"}
					isLast
				/>
			</Card>
			<Card density="compact" className="gap-2">
				<Text w="semibold">Informasi Catatan</Text>
				<Text size="small" className="text-muted">
					Jam menunjukkan data yang dicatat. Identitas karyawan, jadwal,
					keterlambatan, dan durasi kerja belum tersedia.
				</Text>
			</Card>
		</Wrapper>
	);
}
