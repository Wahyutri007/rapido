import Card from "@/components/common/Card";
import Text from "@/components/common/Text";

export default function ChannelNotice() {
	return (
		<Card density="compact" className="gap-2">
			<Text w="semibold">Draf Kanal Pemesanan</Text>
			<Text size="small" className="text-muted">
				Draf tersedia selama aplikasi terbuka. Kanal belum aktif dan belum
				menerima pesanan atau terhubung ke marketplace.
			</Text>
		</Card>
	);
}
