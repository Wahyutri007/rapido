import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import {
	filterStockMovements,
	formatMovementDay,
	formatMovementQuantity,
	MOVEMENT_TYPES,
} from "@/lib/inventory-stock-movement";
import { route } from "@/lib/utils";
import type { StockKind } from "@/types/ui/inventory";
import {
	InventoryMetadata,
	InventorySearch,
	InventoryTabs,
} from "../InventoryUi";
import { useStockMovements } from "./useStockMovements";

export default function StockMovementList() {
	const movements = useStockMovements();
	const [kind, setKind] = useState<StockKind>("material");
	const [search, setSearch] = useState("");
	const [store, setStore] = useState("");
	const [type, setType] = useState("");
	const [day, setDay] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const filtered = useMemo(
		() => filterStockMovements(movements, { kind, search, store, type, day }),
		[movements, kind, search, store, type, day],
	);
	const stores = [
		...new Set(movements.flatMap((m) => (m.store ? [m.store] : []))),
	];
	const days = [...new Set(movements.flatMap((m) => (m.day ? [m.day] : [])))];
	// Keep a selected value visible when its last source record disappears.
	if (store && !stores.includes(store)) stores.push(store);
	if (day && !days.includes(day)) days.push(day);
	const hasFilters = Boolean(search.trim() || store || type || day);
	function resetFilters() {
		setSearch("");
		setStore("");
		setType("");
		setDay("");
	}
	return (
		<Wrapper isNotScrollable>
			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View className="gap-4 pb-4">
						<InventoryTabs
							items={[
								{ value: "material", label: "Bahan Baku" },
								{ value: "product", label: "Produk" },
							]}
							value={kind}
							onChange={setKind}
						/>
						<InventorySearch
							search={search}
							setSearch={setSearch}
							onFilter={() => setShowFilters((value) => !value)}
							active={showFilters}
						/>
						{showFilters && (
							<Card className="gap-4">
								<Text w="semibold">Filter Mutasi</Text>
								<View className="gap-2">
									<Text size="normal">Tanggal</Text>
									<SingleSelect
										label="Tanggal Mutasi"
										items={[
											{ label: "Semua tanggal", value: "" },
											...days
												.sort()
												.reverse()
												.map((value) => ({
													label: formatMovementDay(value),
													value,
												})),
										]}
										value={day}
										onValueChange={setDay}
									/>
								</View>
								<View className="gap-2">
									<Text size="normal">Jenis Mutasi</Text>
									<SingleSelect
										label="Jenis Mutasi"
										items={[
											{ label: "Semua jenis", value: "" },
											...MOVEMENT_TYPES,
										]}
										value={type}
										onValueChange={setType}
									/>
								</View>
								<View className="gap-2">
									<Text size="normal">Lokasi</Text>
									<SingleSelect
										label="Lokasi Stok"
										items={[
											{ label: "Semua lokasi", value: "" },
											...stores
												.sort()
												.map((value) => ({ label: value, value })),
										]}
										value={store}
										onValueChange={setStore}
										searchable
									/>
								</View>
							</Card>
						)}
						<View className="gap-2">
							<Text size="small" className="text-muted">
								Riwayat dari data persediaan sesi ini. Stok akhir historis belum
								tersedia.
							</Text>
							<Text size="normal" w="medium">
								{filtered.length} mutasi
							</Text>
							{hasFilters && (
								<Button variant="link" onPress={resetFilters}>
									<ButtonText>Reset filter</ButtonText>
								</Button>
							)}
						</View>
					</View>
				}
				ListEmptyComponent={
					<SearchNotFound
						text={
							hasFilters
								? "Tidak ada mutasi sesuai filter"
								: "Belum ada riwayat mutasi"
						}
					/>
				}
				renderItem={({ item, index }) => (
					<View className="gap-3">
						{(index === 0 || filtered[index - 1].day !== item.day) && (
							<Text size="normal" w="semibold">
								{formatMovementDay(item.day)}
							</Text>
						)}
						<Pressable
							accessibilityRole="button"
							accessibilityLabel={`Detail ${item.name}, ${item.label}, ${item.reference}, ${item.store ?? "lokasi belum tersedia"}`}
							onPress={() =>
								router.push(
									route("/inventory/stock-movement/detail", { id: item.id }),
								)
							}
						>
							<Card className="gap-3">
								<Text size="normal" w="semibold">
									{item.name}
								</Text>
								<Text size="small" className="text-muted">
									{item.reference} · {item.label}
								</Text>
								<InventoryMetadata
									icon="map-pin"
									label="Lokasi Stok"
									value={item.store ?? "Lokasi belum tersedia"}
								/>
								<Text
									w="semibold"
									className={
										item.quantity > 0 ? "text-success" : "text-destructive"
									}
								>
									{formatMovementQuantity(item)}
								</Text>
								<Text size="small" className="text-muted">
									Stok akhir: Belum tersedia
								</Text>
								<Text size="small" className="text-primary">
									Lihat detail
								</Text>
							</Card>
						</Pressable>
					</View>
				)}
			/>
		</Wrapper>
	);
}
