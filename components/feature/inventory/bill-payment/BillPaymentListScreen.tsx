import dayjs from "dayjs";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, useWindowDimensions, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	billPaymentTotals,
	purchaseMatchesSupplier,
	purchaseOutstanding,
} from "@/lib/inventory/bill-payment";
import { route } from "@/lib/utils";
import { useInventoryBillPaymentStore } from "@/store/inventoryBillPaymentStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { useInventorySupplierStore } from "@/store/inventorySupplierStore";
import {
	InventoryIcon,
	InventoryMetadata,
	InventorySearch,
} from "../InventoryUi";

import { formatBillPaymentMoney } from "./BillPaymentSummary";

export default function BillPaymentListScreen() {
	const { width } = useWindowDimensions();
	const payments = useInventoryBillPaymentStore((state) => state.payments);
	const purchases = useInventoryStore((state) => state.purchases);
	const suppliers = useInventorySupplierStore((state) => state.suppliers);
	const [search, setSearch] = React.useState("");
	const [supplierId, setSupplierId] = React.useState("all");
	const [showFilters, setShowFilters] = React.useState(false);
	const query = search.trim().toLowerCase();
	const filtered = payments.filter(
		(payment) =>
			(supplierId === "all" || payment.supplierId === supplierId) &&
			`${payment.reference} ${payment.externalReference} ${payment.supplierName} ${payment.lines.map((line) => line.purchaseReference).join(" ")}`
				.toLowerCase()
				.includes(query),
	);
	const selectedSupplier = suppliers.find(
		(supplier) => supplier.id === supplierId,
	);
	const supplierPurchases = purchases.filter(
		(purchase) =>
			supplierId === "all" ||
			(selectedSupplier && purchaseMatchesSupplier(purchase, selectedSupplier)),
	);
	const supplierPayments = payments.filter(
		(payment) => supplierId === "all" || payment.supplierId === supplierId,
	);
	return (
		<>
			<Wrapper isNotScrollable>
				<View className="flex-1 gap-4 p-4">
					<InventorySearch
						search={search}
						setSearch={setSearch}
						onFilter={() => setShowFilters(!showFilters)}
						active={showFilters || supplierId !== "all"}
					/>
					{showFilters && (
						<SingleSelect
							label="Filter Pemasok"
							value={supplierId}
							onValueChange={setSupplierId}
							items={[
								{ label: "Semua Pemasok", value: "all" },
								...suppliers.map((supplier) => ({
									label: supplier.name,
									value: supplier.id,
								})),
							]}
						/>
					)}
					<View className={width < 360 ? "gap-2" : "flex-row gap-2"}>
						{[
							{
								label: "Total Pembayaran",
								value: formatBillPaymentMoney(
									billPaymentTotals(
										supplierPayments.flatMap((payment) => payment.lines),
									).amount,
								),
								icon: "credit-card" as const,
							},
							{
								label: "Total Tagihan",
								value: formatBillPaymentMoney(
									supplierPurchases.reduce(
										(sum, purchase) =>
											sum + purchaseOutstanding(purchase, payments),
										0,
									),
								),
								icon: "file-text" as const,
								description: "Sisa belum dibayar",
							},
						].map((metric, index) => (
							<Card key={metric.label} className="flex-1 gap-2">
								<View className="flex-row items-center gap-2">
									<View className="size-8 items-center justify-center rounded-lg bg-primary-50">
										<InventoryIcon name={metric.icon} />
									</View>
									<Text size="small" className="flex-1 text-muted">
										{metric.label}
									</Text>
								</View>
								<Text
									testID={`bill-payment-metric-${index}`}
									size="normal"
									w="semibold"
								>
									{metric.value}
								</Text>
								{metric.description && (
									<Text size="small" className="text-muted">
										{metric.description}
									</Text>
								)}
							</Card>
						))}
					</View>
					<FlatList
						data={filtered}
						keyExtractor={(payment) => payment.id}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ gap: 16, paddingBottom: 128 }}
						ListEmptyComponent={
							<SearchNotFound text="Belum ada pembayaran tagihan ditemukan" />
						}
						renderItem={({ item }) => (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel={`Detail pembayaran ${item.reference}`}
								onPress={() =>
									router.push(
										route("/inventory/bill-payments/detail", { id: item.id }),
									)
								}
							>
								<Card className="gap-3">
									<View className="flex-row items-center gap-3">
										<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
											<InventoryIcon name="credit-card" />
										</View>
										<View className="flex-1 gap-1">
											<Text size="normal" w="semibold">
												{item.supplierName}
											</Text>
											<Text size="small" className="text-primary">
												{item.reference}
											</Text>
										</View>
									</View>
									<InventoryMetadata
										icon="file-text"
										label="Jumlah PO"
										value={String(item.lines.length)}
									/>
									<InventoryMetadata
										icon="calendar"
										label="Tanggal Transaksi"
										value={dayjs(item.date).format("DD MMM YYYY")}
									/>
									<InventoryMetadata
										icon="credit-card"
										label="Metode Pembayaran"
										value={item.paymentMethod}
									/>
									<View className="flex-row justify-between gap-3 border-t border-border-muted pt-3">
										<Text size="normal" className="text-muted">
											Total Transaksi
										</Text>
										<Text size="normal" w="semibold" className="text-primary">
											{formatBillPaymentMoney(
												billPaymentTotals(item.lines).amount,
											)}
										</Text>
									</View>
								</Card>
							</Pressable>
						)}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/inventory/bill-payments/modify"))}
			>
				Tambah Pembayaran Tagihan
			</BottomActionButton>
		</>
	);
}
