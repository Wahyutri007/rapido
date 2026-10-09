import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import { Button, ButtonText } from "@/components/ui/button";
import { billPaymentTotals } from "@/lib/inventory/bill-payment";
import { route } from "@/lib/utils";
import { useInventoryBillPaymentStore } from "@/store/inventoryBillPaymentStore";
import BillPaymentDeleteDialog from "./BillPaymentDeleteDialog";
import BillPaymentSummary, {
	formatBillPaymentMoney,
} from "./BillPaymentSummary";

export default function BillPaymentDetailScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const record = useInventoryBillPaymentStore((state) =>
		state.payments.find((payment) => payment.id === id),
	);
	const [deleting, setDeleting] = React.useState(false);
	if (!record)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Pembayaran tidak ditemukan" />
			</Wrapper>
		);
	const totals = billPaymentTotals(record.lines);
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-2">
					<Text size="normal" w="semibold" className="text-primary">
						{record.reference}
					</Text>
					<Text size="small" className="text-muted">
						Tanggal Pembayaran {dayjs(record.date).format("DD MMMM YYYY")}
					</Text>
				</Card>
				<View className="gap-2">
					<Text size="normal" w="medium" className="text-muted">
						Informasi Tagihan
					</Text>
					<Card>
						<DetailRow
							icon="truck"
							label="Pemasok"
							value={record.supplierName}
						/>
						<DetailRow
							icon="credit-card"
							label="Metode Pembayaran"
							value={record.paymentMethod}
						/>
						<DetailRow
							icon="file-text"
							label="No Referensi"
							value={record.externalReference || "-"}
						/>
						<DetailRow
							icon="file-text"
							label="Catatan"
							value={record.note || "-"}
							isLast
						/>
					</Card>
				</View>
				<View className="gap-2">
					<Text size="normal" w="medium" className="text-muted">
						Daftar Tagihan
					</Text>
					<Card className="gap-4">
						{record.lines.map((line) => (
							<View key={line.purchaseId} className="gap-2">
								<Text size="normal" w="semibold" className="text-primary">
									{line.purchaseReference}
								</Text>
								{[
									{
										label: "Tanggal Tagihan",
										value: dayjs(line.purchaseDate).format("DD MMM YYYY"),
									},
									{
										label: "Total Tagihan",
										value: formatBillPaymentMoney(line.billAmount),
									},
									{
										label: "Sisa Sebelum Pembayaran",
										value: formatBillPaymentMoney(line.outstandingBefore),
									},
									{
										label: "Diskon",
										value: formatBillPaymentMoney(line.discount),
									},
									{
										label: "Total Pembayaran",
										value: formatBillPaymentMoney(line.amount),
									},
								].map((row) => (
									<View
										key={row.label}
										className="flex-row justify-between gap-3"
									>
										<Text size="small" className="text-muted">
											{row.label}
										</Text>
										<Text size="small" w="medium">
											{row.value}
										</Text>
									</View>
								))}
								<Button
									size="sm"
									variant="link"
									onPress={() =>
										router.push(
											route("/inventory/purchase-order/detail", {
												id: line.purchaseId,
											}),
										)
									}
								>
									<ButtonText>Lihat Pesanan Pembelian</ButtonText>
								</Button>
							</View>
						))}
					</Card>
				</View>
				<BillPaymentSummary
					amount={totals.amount}
					discount={totals.discount}
					remaining={record.lines.reduce(
						(sum, line) => sum + line.remaining,
						0,
					)}
				/>
				<Text size="small" className="text-muted">
					Sisa tagihan di atas adalah snapshot saat pembayaran ini disimpan.
				</Text>
			</Wrapper>
			<DetailBottomActions
				onEdit={() =>
					router.push(
						route("/inventory/bill-payments/modify", { id: record.id }),
					)
				}
				onDelete={() => setDeleting(true)}
			/>
			<BillPaymentDeleteDialog
				id={deleting ? record.id : undefined}
				reference={record.reference}
				onClose={() => setDeleting(false)}
				onDeleted={() => router.dismissTo(route("/inventory/bill-payments"))}
			/>
		</>
	);
}
