import { router, useLocalSearchParams } from "expo-router";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { Button, ButtonText } from "@/components/ui/button";
import { attendanceStatus, attendanceTimeLabel } from "@/lib/manage/absence";
import { useAbsenceStore } from "@/store/useAbsenceStore";
import { AbsencePreviewNotice, AbsenceStatus } from "./AbsenceCommon";

export default function AbsenceDetailScreen() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	const record = useAbsenceStore((state) =>
		typeof id === "string" && id
			? state.records.find((item) => item.id === id)
			: undefined,
	);
	if (!record) {
		return (
			<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text w="semibold">Catatan absensi tidak ditemukan.</Text>
					<Text size="small" className="text-muted">
						Catatan mungkin sudah tidak tersedia pada sesi ini.
					</Text>
					<Button
						size="xl"
						onPress={() => router.replace("/(no-layout)/manage/absence")}
					>
						<ButtonText>Kembali ke Daftar Absensi</ButtonText>
					</Button>
				</Card>
			</Wrapper>
		);
	}
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<AbsencePreviewNotice />
			<Card className="gap-4">
				<Text w="semibold">
					{record.storeName?.trim() || "Toko tidak dicatat"}
				</Text>
				<AbsenceStatus status={attendanceStatus(record)} />
				<DetailRow label="Tanggal" value={record.date || "Tidak dicatat"} />
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
					Identitas karyawan, jadwal kerja, keterlambatan, dan durasi shift
					belum tercatat pada data ini.
				</Text>
			</Card>
		</Wrapper>
	);
}
