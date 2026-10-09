import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Button, ButtonText } from "@/components/ui/button";
import {
	billCalendarLabel,
	billTotalLabel,
} from "@/lib/cashier/bill-presentation";
import type { BillReferencePreview } from "@/lib/cashier/bill-reference-preview";

export default function BillReferenceCard({
	bill,
	onAction,
}: {
	bill: BillReferencePreview;
	onAction: (action: "add" | "pay", bill: BillReferencePreview) => void;
}) {
	return (
		<Card
			density="flush"
			appearance="figma"
			className="overflow-hidden"
			// The reference card is 357px inside the 358px list column.
			style={{ marginRight: 1 }}
			testID={`bill-preview-${bill.referenceNode}`}
		>
			<View
				className="flex-row flex-wrap items-center justify-between gap-2 bg-primary/5 p-4"
				testID="bill-preview-heading"
			>
				<Text
					size="normal"
					w="semibold"
					className="shrink !text-primary"
					style={{ lineHeight: 18 }}
				>
					{bill.customer} - Meja {bill.table}
				</Text>
				<Text
					size="small"
					className="shrink !text-primary"
					style={{ lineHeight: 16 }}
				>
					{bill.ageLabel}
				</Text>
			</View>
			<View
				className="flex-row flex-wrap justify-between gap-2 p-3"
				style={{
					alignItems: bill.paidQuantity === undefined ? "flex-start" : "center",
				}}
				testID="bill-preview-details"
			>
				<View className="shrink gap-2">
					<Text size="small" className="!text-muted" style={{ lineHeight: 16 }}>
						Jumlah pesanan:{" "}
						<Text size="small" className="!text-subtle">
							{bill.quantity} Item
						</Text>
					</Text>
					{bill.paidQuantity !== undefined && (
						<Text
							size="small"
							className="!text-muted"
							style={{ lineHeight: 16 }}
						>
							Sudah dibayar:{" "}
							<Text size="small" className="!text-subtle">
								{bill.paidQuantity} Item
							</Text>
						</Text>
					)}
				</View>
				<View className="shrink items-end gap-2">
					<Text
						size="small"
						w="medium"
						className="text-right !text-foreground"
						style={{ lineHeight: 16 }}
					>
						{billCalendarLabel(bill.date)}
					</Text>
					<Text
						size="normal"
						w="semibold"
						className="text-right !text-destructive"
						style={{ lineHeight: 18 }}
					>
						{billTotalLabel(bill.total)}
					</Text>
				</View>
			</View>
			<View
				className="flex-row justify-end gap-3 p-3"
				testID="bill-preview-actions"
			>
				<View
					pointerEvents="none"
					className="absolute inset-x-0 top-0 h-px bg-border"
				/>
				<Button
					size="bill"
					variant="outline"
					style={{ minWidth: 103 }}
					accessibilityLabel={`Tambah pesanan ${bill.customer} (pratinjau)`}
					accessibilityHint="Menampilkan informasi batas pratinjau, tanpa mengubah transaksi."
					onPress={() => onAction("add", bill)}
				>
					<ButtonText>Tambah</ButtonText>
				</Button>
				<Button
					size="bill"
					style={{ minWidth: 87 }}
					accessibilityLabel={`Bayar tagihan ${bill.customer} (pratinjau)`}
					accessibilityHint="Menampilkan informasi batas pratinjau, tanpa melakukan pembayaran."
					onPress={() => onAction("pay", bill)}
				>
					<ButtonText>Bayar</ButtonText>
				</Button>
			</View>
		</Card>
	);
}
