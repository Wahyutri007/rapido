import { router } from "expo-router";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";

export default function CashDrawerScreen() {
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-1">
					<Text size="normal" w="semibold">
						Koneksi laci kasir belum tersedia
					</Text>
					<Text size="small" className="text-muted">
						Pembukaan laci kasir belum tersedia di aplikasi ini. Anda dapat
						membuka halaman Printer untuk melihat pengaturannya.
					</Text>
				</Card>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push("/(no-layout)/manage/printer")}
			>
				Pengaturan Printer
			</BottomActionButton>
		</>
	);
}
