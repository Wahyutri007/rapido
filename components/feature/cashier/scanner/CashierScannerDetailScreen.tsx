import { router, useLocalSearchParams } from "expo-router";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { Button, ButtonText } from "@/components/ui/button";
import { CASHIER_SCANNER_PREVIEW } from "@/constants/data/cashier-scanner-preview";
import { findScannerPreview, scannerStatusLabel } from "@/lib/cashier/scanner";
import { route } from "@/lib/utils";

export default function CashierScannerDetailScreen() {
	const { id } = useLocalSearchParams();
	const device = findScannerPreview(CASHIER_SCANNER_PREVIEW, id);
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<Card className="gap-4">
				<Text w="semibold">
					{device ? "Informasi Scanner" : "Scanner tidak ditemukan"}
				</Text>
				{device ? (
					<>
						<DetailRow label="Nama perangkat" value={device.name} />
						<DetailRow
							label="Status contoh"
							value={scannerStatusLabel(device.status)}
							isLast
						/>
						<Text size="normal" className="text-muted">
							Perangkat ini merupakan contoh dari desain, bukan perangkat yang
							terdeteksi. Pembacaan perangkat dan pemasangan scanner belum
							tersedia.
						</Text>
					</>
				) : (
					<Text size="normal" className="text-muted">
						Pilih contoh perangkat dari Pengaturan Scanner.
					</Text>
				)}
			</Card>
			<Button
				variant="outline"
				onPress={() => router.replace(route("/(no-layout)/(cashier)/scanner"))}
			>
				<ButtonText>Kembali ke daftar scanner</ButtonText>
			</Button>
		</Wrapper>
	);
}
