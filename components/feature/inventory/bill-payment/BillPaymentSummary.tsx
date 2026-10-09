import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { formatRp } from "@/lib/utils";

export function formatBillPaymentMoney(value: number) {
	if (!Number.isFinite(value)) return "-";
	if (Number.isInteger(value)) return formatRp(value);
	return value.toLocaleString("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});
}

export default function BillPaymentSummary({
	amount,
	discount,
	remaining,
}: {
	amount: number;
	discount: number;
	remaining: number;
}) {
	return (
		<Card className="gap-3">
			<Text size="normal" w="semibold">
				Rincian Harga
			</Text>
			{[
				{ label: "Total Pembayaran", value: amount },
				{ label: "Total Diskon", value: discount },
				{ label: "Sisa Tagihan", value: remaining },
			].map((row) => (
				<View key={row.label} className="flex-row justify-between gap-3">
					<Text size="normal" className="text-muted">
						{row.label}
					</Text>
					<Text
						size="normal"
						w="semibold"
						className={row.value < 0 ? "text-destructive" : "text-primary"}
					>
						{formatBillPaymentMoney(row.value)}
					</Text>
				</View>
			))}
			{remaining < 0 && (
				<Text size="small" className="text-destructive">
					Pembayaran dan diskon melebihi sisa tagihan
				</Text>
			)}
		</Card>
	);
}
