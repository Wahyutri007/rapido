import dayjs from "dayjs";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { INVENTORY_STORES } from "@/constants/data/inventory";
import { formatRp, route } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventoryStore";
import type { PurchaseRecord, PurchaseStatus } from "@/types/ui/inventory";
import {
	InventoryIcon,
	InventoryMetadata,
	InventorySearch,
	InventoryTabs,
} from "./InventoryUi";
import PurchaseStatusBadge from "./PurchaseStatusBadge";

export default function PurchaseListScreen() {
	const records = useInventoryStore((state) => state.purchases);
	const deleteRecord = useInventoryStore((state) => state.deletePurchase);
	const [search, setSearch] = React.useState("");
	const [status, setStatus] = React.useState<PurchaseStatus | "all">("all");
	const [store, setStore] = React.useState("all");
	const [showFilters, setShowFilters] = React.useState(false);
	const [selected, setSelected] = React.useState<PurchaseRecord>();
	const [deleting, setDeleting] = React.useState<PurchaseRecord>();
	const filtered = records.filter(
		(record) =>
			(status === "all" || record.status === status) &&
			(store === "all" || record.store === store) &&
			`${record.reference} ${record.store} ${record.supplier}`
				.toLowerCase()
				.includes(search.trim().toLowerCase()),
	);
	const count = (status: PurchaseStatus) =>
		records.filter((record) => record.status === status).length;
	return (
		<>
			<Wrapper isNotScrollable>
				<View className="flex-1 gap-4 p-4">
					<InventorySearch
						search={search}
						setSearch={setSearch}
						onFilter={() => setShowFilters(!showFilters)}
						active={showFilters || store !== "all"}
					/>
					{showFilters && (
						<SingleSelect
							items={[
								{ label: "Semua Toko", value: "all" },
								...INVENTORY_STORES.map((name) => ({
									label: name,
									value: name,
								})),
							]}
							value={store}
							onValueChange={setStore}
							label="Filter Toko"
						/>
					)}
					<InventoryTabs
						items={[
							{ value: "all", label: "Semua" },
							{ value: "completed", label: `Selesai (${count("completed")})` },
							{ value: "waiting", label: `Menunggu (${count("waiting")})` },
							{
								value: "cancelled",
								label: `Dibatalkan (${count("cancelled")})`,
							},
						]}
						value={status}
						onChange={setStatus}
					/>
					<FlatList
						data={filtered}
						keyExtractor={(record) => record.id}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ gap: 16, paddingBottom: 112 }}
						ListEmptyComponent={
							<SearchNotFound text="Tidak ada pembelian ditemukan" />
						}
						renderItem={({ item }) => (
							<Pressable
								accessibilityRole="button"
								accessibilityLabel={`Detail ${item.reference}`}
								onPress={() =>
									router.push(
										route("/inventory/purchase-order/detail", { id: item.id }),
									)
								}
							>
								<Card className="gap-3">
									<View className="flex-row items-start gap-3">
										<View className="size-9 items-center justify-center rounded-lg bg-primary-50">
											<InventoryIcon name="grid" />
										</View>
										<View className="flex-1 gap-1">
											<Text size="normal" w="medium">
												{item.store}
											</Text>
											<Text size="small" className="text-primary">
												{item.reference}
											</Text>
										</View>
										<PurchaseStatusBadge status={item.status} />
										<Pressable
											accessibilityRole="button"
											accessibilityLabel={`Aksi ${item.reference}`}
											hitSlop={8}
											onPress={(event) => {
												event.stopPropagation();
												setSelected(item);
											}}
										>
											<InventoryIcon name="more-horizontal" />
										</Pressable>
									</View>
									<View className="flex-row gap-3">
										<View className="flex-1 gap-3 border-r border-border-muted pr-3">
											<InventoryMetadata
												icon="grid"
												label="Nama Supplier"
												value={item.supplier}
											/>
											<InventoryMetadata
												icon="calendar"
												label="Tanggal Transaksi"
												value={dayjs(item.createdAt).format("DD MMM YYYY")}
											/>
										</View>
										<View className="flex-1 gap-3">
											<InventoryMetadata
												icon="user"
												label="Diterima Oleh"
												value={item.receivedBy}
											/>
											<InventoryMetadata
												icon="dollar-sign"
												label="Total Transaksi"
												value={formatRp(item.amount)}
											/>
										</View>
									</View>
								</Card>
							</Pressable>
						)}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/inventory/purchase-order/modify"))}
			>
				Tambah Pesanan Pembelian
			</BottomActionButton>
			<ItemActionSheet
				isOpen={Boolean(selected)}
				onClose={() => setSelected(undefined)}
				title={selected?.reference}
				entityName="Pesanan Pembelian"
				onViewDetail={() => {
					if (selected)
						router.push(
							route("/inventory/purchase-order/detail", { id: selected.id }),
						);
				}}
				onDelete={() => {
					setDeleting(selected);
					setSelected(undefined);
				}}
			/>
			<DeleteConfirmModal
				isOpen={Boolean(deleting)}
				itemName={deleting?.reference}
				onClose={() => setDeleting(undefined)}
				onConfirm={() => {
					if (deleting) deleteRecord(deleting.id);
					setDeleting(undefined);
				}}
			/>
		</>
	);
}
