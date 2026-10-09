import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";

export function LocationPreviewNotice() {
	return (
		<Card density="compact" className="gap-2">
			<Text size="normal" w="semibold">
				Pratinjau Tempat
			</Text>
			<Text size="small" className="text-muted">
				Pilih outlet contoh untuk melihat area dan tempat. Data ini belum
				terhubung ke toko aktif kasir.
			</Text>
		</Card>
	);
}

export function LocationStatus({ active }: { active: boolean }) {
	return (
		<View
			className={
				active
					? "self-start rounded-lg bg-success-bg px-2 py-1"
					: "self-start rounded-lg bg-surface-muted px-2 py-1"
			}
		>
			<Text
				size="small"
				w="medium"
				className={active ? "text-success" : "text-muted"}
			>
				{active ? "Aktif" : "Nonaktif"}
			</Text>
		</View>
	);
}
