import Card from "@/components/common/Card";
import Text from "@/components/common/Text";

export default function HistoryNotice() {
	return (
		<Card density="compact" className="gap-2">
			<Text w="semibold">Pratinjau Riwayat Absensi</Text>
			<Text size="small" className="text-muted">
				Menampilkan data contoh dan catatan selama aplikasi terbuka. Data belum
				terhubung ke server atau dipisahkan per karyawan.
			</Text>
		</Card>
	);
}
