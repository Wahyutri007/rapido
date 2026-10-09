import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { INVENTORY_STORES } from "@/constants/data/inventory";
import { materialStockStatus } from "@/lib/inventory-material";
import { route } from "@/lib/utils";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import type { InventoryMaterial } from "@/types/ui/inventory/material";
import {
	InventoryIcon,
	InventoryMetrics,
	InventorySearch,
} from "../InventoryUi";
import MaterialDeleteDialog from "./MaterialDeleteDialog";
import {
	formatMaterialQuantity,
	MaterialImage,
	MaterialStatusBadge,
} from "./MaterialUi";

export default function MaterialListScreen() {
	const materials = useInventoryMaterialStore((state) => state.materials);
	const [search, setSearch] = React.useState("");
	const [status, setStatus] = React.useState("all");
	const [store, setStore] = React.useState("all");
	const [showFilters, setShowFilters] = React.useState(false);
	const [selected, setSelected] = React.useState<InventoryMaterial>();
	const [deleting, setDeleting] = React.useState<InventoryMaterial>();
	const filtered = materials.filter(
		(material) =>
			(status === "all" || materialStockStatus(material) === status) &&
			(store === "all" || material.stores.includes(store)) &&
			`${material.name} ${material.sku} ${material.category}`
				.toLowerCase()
				.includes(search.trim().toLowerCase()),
	);
	const detail = (id: string) =>
		router.push(route("/inventory/materials/detail", { id }));
	const edit = (id: string) =>
		router.push(route("/inventory/materials/modify", { id }));
	return (
		<>
			<Wrapper isNotScrollable>
				<View className="flex-1 gap-4 p-4">
					<InventorySearch
						search={search}
						setSearch={setSearch}
						onFilter={() => setShowFilters(!showFilters)}
						active={showFilters || status !== "all" || store !== "all"}
					/>
					{showFilters && (
						<View className="flex-row gap-3">
							<View className="flex-1">
								<SingleSelect
									label="Status Stok"
									value={status}
									onValueChange={setStatus}
									items={[
										{ label: "Semua Status", value: "all" },
										{ label: "Aman", value: "safe" },
										{ label: "Menipis", value: "low" },
										{ label: "Habis", value: "empty" },
									]}
								/>
							</View>
							<View className="flex-1">
								<SingleSelect
									label="Toko"
									value={store}
									onValueChange={setStore}
									items={[
										{ label: "Semua Toko", value: "all" },
										...INVENTORY_STORES.map((name) => ({
											label: name,
											value: name,
										})),
									]}
								/>
							</View>
						</View>
					)}
					<InventoryMetrics
						items={[
							{
								label: "Total Bahan",
								value: materials.length,
								icon: "package",
							},
							{
								label: "Stok Aman",
								value: materials.filter(
									(material) => materialStockStatus(material) === "safe",
								).length,
								icon: "shield",
								tone: "success",
							},
							{
								label: "Stok Menipis",
								value: materials.filter(
									(material) => materialStockStatus(material) === "low",
								).length,
								icon: "alert-triangle",
								tone: "warning",
							},
							{
								label: "Stok Habis",
								value: materials.filter(
									(material) => materialStockStatus(material) === "empty",
								).length,
								icon: "slash",
								tone: "destructive",
							},
						]}
					/>
					<Text size="normal" w="medium">
						Daftar Bahan Baku ({filtered.length})
					</Text>
					<FlatList
						data={filtered}
						keyExtractor={(material) => material.id}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ gap: 12, paddingBottom: 112 }}
						ListEmptyComponent={
							<SearchNotFound text="Tidak ada bahan baku ditemukan" />
						}
						renderItem={({ item }) => (
							<View>
								<Pressable
									accessibilityRole="button"
									accessibilityLabel={`Detail ${item.name}`}
									onPress={() => detail(item.id)}
								>
									<CatalogItemCard
										density="compact"
										leading={<MaterialImage material={item} />}
										title={
											<Text
												size="normal"
												w="medium"
												numberOfLines={1}
												className="flex-1"
											>
												{item.name}
											</Text>
										}
										subtitle={item.sku || "-"}
										description={item.category}
										badge={<MaterialStatusBadge material={item} />}
										right={<View className="w-6" />}
									>
										<View className="flex-row items-center justify-between gap-2 border-t border-border-muted pt-2">
											<Text size="small" className="text-muted">
												Stok Tersedia
											</Text>
											<Text size="small" w="medium">
												{formatMaterialQuantity(item.stock)} {item.unit}
											</Text>
										</View>
									</CatalogItemCard>
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
						)}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route("/inventory/materials/modify"))}
			>
				Tambah Bahan Baku
			</BottomActionButton>
			<ItemActionSheet
				isOpen={Boolean(selected)}
				title={selected?.name}
				entityName="Bahan Baku"
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
			<MaterialDeleteDialog
				material={deleting}
				onClose={() => setDeleting(undefined)}
			/>
		</>
	);
}
