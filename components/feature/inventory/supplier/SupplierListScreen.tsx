import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { cn, formatRp, route } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventoryStore";
import { useInventorySupplierStore } from "@/store/inventorySupplierStore";
import type { InventorySupplier } from "@/types/ui/inventory/supplier";
import {
	InventoryIcon,
	InventoryMetrics,
	InventorySearch,
} from "../InventoryUi";
import SupplierDeleteDialog from "./SupplierDeleteDialog";

export default function SupplierListScreen() {
	const suppliers = useInventorySupplierStore((state) => state.suppliers);
	const purchases = useInventoryStore((state) => state.purchases);
	const [search, setSearch] = React.useState("");
	const [filter, setFilter] = React.useState("all");
	const [showFilters, setShowFilters] = React.useState(false);
	const [selected, setSelected] = React.useState<InventorySupplier>();
	const [deleting, setDeleting] = React.useState<InventorySupplier>();
	const filtered = suppliers.filter(
		(supplier) =>
			(filter === "all" ||
				(filter === "active" && supplier.active) ||
				(filter === "primary" && supplier.primary)) &&
			`${supplier.name} ${supplier.address} ${supplier.city} ${supplier.province} ${supplier.products.join(" ")}`
				.toLowerCase()
				.includes(search.trim().toLowerCase()),
	);
	const detail = (id: string) =>
		router.push(route("/inventory/suppliers/detail", { id }));
	const edit = (id: string) =>
		router.push(route("/inventory/suppliers/modify", { id }));
	return (
		<>
			<Wrapper isNotScrollable>
				<View className="flex-1 gap-4 p-4">
					<InventorySearch
						search={search}
						setSearch={setSearch}
						onFilter={() => setShowFilters(!showFilters)}
						active={showFilters || filter !== "all"}
					/>
					{showFilters && (
						<SingleSelect
							label="Filter Pemasok"
							value={filter}
							onValueChange={setFilter}
							items={[
								{ label: "Semua Pemasok", value: "all" },
								{ label: "Supplier Aktif", value: "active" },
								{ label: "Supplier Utama", value: "primary" },
							]}
						/>
					)}
					<InventoryMetrics
						variant="supplier"
						items={[
							{
								label: "Total Supplier",
								value: suppliers.length,
								icon: "truck",
							},
							{
								label: "Supplier Aktif",
								value: suppliers.filter((supplier) => supplier.active).length,
								icon: "check-circle",
								tone: "success",
							},
							{
								label: "Supplier Utama",
								value: suppliers.filter((supplier) => supplier.primary).length,
								icon: "star",
								tone: "warning",
							},
						]}
					/>
					<Text size="normal" w="medium">
						Daftar Supplier ({filtered.length})
					</Text>
					<FlatList
						data={filtered}
						keyExtractor={(supplier) => supplier.id}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ gap: 12, paddingBottom: 112 }}
						ListEmptyComponent={
							<SearchNotFound text="Tidak ada pemasok ditemukan" />
						}
						renderItem={({ item }) => {
							const total =
								item.priorPurchaseTotal +
								purchases
									.filter(
										(purchase) =>
											(purchase.supplierId === item.id ||
												(!purchase.supplierId &&
													purchase.supplier === item.name)) &&
											purchase.status !== "cancelled",
									)
									.reduce((sum, purchase) => sum + purchase.amount, 0);
							return (
								<View>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`Detail ${item.name}`}
										onPress={() => detail(item.id)}
									>
										<Card
											density="compact"
											className="flex-row items-start gap-3"
										>
											<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
												<InventoryIcon name="shopping-bag" size={20} />
											</View>
											<View className="flex-1 gap-3">
												<View className="flex-row items-center gap-2 pr-8">
													<Text
														size="normal"
														w="medium"
														numberOfLines={1}
														className="flex-1"
													>
														{item.name}
													</Text>
													<View
														className={cn(
															"flex-row items-center gap-1 rounded-lg px-2 py-1",
															item.active ? "bg-success-bg" : "bg-warning-bg",
														)}
													>
														<InventoryIcon
															name={
																item.active ? "check-circle" : "pause-circle"
															}
															tone={item.active ? "success" : "warning"}
														/>
														<Text
															size="small"
															className={
																item.active ? "text-success" : "text-warning"
															}
														>
															{item.active ? "Aktif" : "Tidak aktif"}
														</Text>
													</View>
												</View>
												<View className="gap-2">
													<View className="flex-row items-center gap-2">
														<InventoryIcon name="map-pin" />
														<Text
															size="small"
															numberOfLines={1}
															className="flex-1 text-muted"
														>
															{[item.city, item.province]
																.filter(Boolean)
																.join(", ") ||
																item.address ||
																"-"}
														</Text>
													</View>
													<View className="flex-row items-center gap-2">
														<InventoryIcon name="package" />
														<Text
															size="small"
															numberOfLines={1}
															className="flex-1 text-muted"
														>
															{item.products.join(", ") || "-"}
														</Text>
													</View>
												</View>
												<View className="flex-row justify-between gap-2 border-t border-border-muted pt-3">
													<View className="flex-row items-center gap-2">
														<InventoryIcon name="bar-chart-2" />
														<Text size="small" className="text-muted">
															Total Pembelian
														</Text>
													</View>
													<Text size="small" w="medium">
														{formatRp(total)}
													</Text>
												</View>
											</View>
										</Card>
									</Pressable>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`Aksi ${item.name}`}
										hitSlop={8}
										className="absolute right-3 top-3"
										onPress={() => setSelected(item)}
									>
										<InventoryIcon name="more-horizontal" />
									</Pressable>
								</View>
							);
						}}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/inventory/suppliers/modify"))}
			>
				Tambah Pemasok
			</BottomActionButton>
			<ItemActionSheet
				isOpen={Boolean(selected)}
				title={selected?.name}
				entityName="Pemasok"
				onClose={() => setSelected(undefined)}
				onViewDetail={() => {
					if (selected) detail(selected.id);
				}}
				onEdit={() => {
					if (selected) edit(selected.id);
				}}
				onDelete={() => {
					setDeleting(selected);
					setSelected(undefined);
				}}
			/>
			<SupplierDeleteDialog
				supplier={deleting}
				onClose={() => setDeleting(undefined)}
			/>
		</>
	);
}
