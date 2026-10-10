import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Button } from "@/components/ui/button";
import {
	billCalendarLabel,
	billTotalLabel,
} from "@/lib/cashier/bill-presentation";
import type { BillReferencePreview } from "@/lib/cashier/bill-reference-preview";
import { catalogBillActionTheme } from "@/lib/cashier/catalog-bill-theme";

export default function CatalogBillCard({
	bill,
	onAdd,
}: {
	bill: BillReferencePreview;
	onAdd: (bill: BillReferencePreview) => void;
}) {
	return (
		<Card
			density="flush"
			appearance="figma"
			className="overflow-hidden"
			style={{ marginRight: 1, boxShadow: "none" }}
			testID={`catalog-bill-${bill.referenceNode}`}
		>
			<View className="flex-row flex-wrap items-center justify-between gap-2 bg-surface-muted p-4">
				<Text
					size="normal"
					w="semibold"
					className="shrink"
					style={{ lineHeight: 18.2 }}
				>
					{bill.customer} - Meja {bill.table}
				</Text>
				<Text
					size="small"
					className="shrink text-muted"
					style={{ lineHeight: 15.6 }}
				>
					{bill.ageLabel}
				</Text>
			</View>
			<View className="gap-2 p-4" testID="catalog-bill-details">
				<Text size="small" className="text-muted" style={{ lineHeight: 14.4 }}>
					Jumlah pesanan:{" "}
					<Text size="small" className="text-subtle">
						{bill.quantity} Item
					</Text>
				</Text>
				{bill.paidQuantity !== undefined && (
					<Text
						size="small"
						className="text-muted"
						style={{ lineHeight: 14.4 }}
					>
						Sudah dibayar:{" "}
						<Text size="small" className="text-subtle">
							{bill.paidQuantity} Item
						</Text>
					</Text>
				)}
				<Text size="small" w="medium" style={{ lineHeight: 15.6 }}>
					{billCalendarLabel(bill.date)}
				</Text>
				<Text
					size="normal"
					w="semibold"
					className="!text-destructive"
					style={{ lineHeight: 16.8 }}
				>
					{billTotalLabel(bill.total)}
				</Text>
			</View>
			<View
				className="items-end border-t border-border p-4"
				style={catalogBillActionTheme}
				testID="catalog-bill-actions"
			>
				<Button
					size="bill"
					action="default"
					variant="outline"
					animationType="none"
					style={{
						minWidth: 100,
						maxWidth: "100%",
						minHeight: 33,
						height: "auto",
						borderRadius: 8,
						paddingHorizontal: 20,
					}}
					accessibilityLabel={`Tambah pesanan ${bill.customer} (pratinjau)`}
					accessibilityHint="Membuka informasi pratinjau penambahan pesanan."
					onPress={() => onAdd(bill)}
				>
					<Text
						size="small"
						className="shrink text-center text-muted"
						style={{ lineHeight: 14.4 }}
					>
						Tambah
					</Text>
				</Button>
			</View>
		</Card>
	);
}
