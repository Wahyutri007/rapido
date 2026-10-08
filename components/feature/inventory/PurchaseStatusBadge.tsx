import { View } from "react-native";
import Text from "@/components/common/Text";
import type { PurchaseStatus } from "@/types/ui/inventory";

const STYLES = {
	completed: {
		label: "Selesai",
		background: "bg-success-bg",
		text: "text-success",
	},
	waiting: {
		label: "Menunggu",
		background: "bg-warning-bg",
		text: "text-warning",
	},
	cancelled: {
		label: "Dibatalkan",
		background: "bg-error-bg",
		text: "text-destructive",
	},
};
export default function PurchaseStatusBadge({
	status,
}: {
	status: PurchaseStatus;
}) {
	const style = STYLES[status];
	return (
		<View className={`rounded-full px-3 py-1 ${style.background}`}>
			<Text size="small" className={style.text}>
				{style.label}
			</Text>
		</View>
	);
}
