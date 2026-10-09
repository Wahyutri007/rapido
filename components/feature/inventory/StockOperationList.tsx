import dayjs from "dayjs";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { INVENTORY_STORES } from "@/constants/data/inventory";
import { route } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventoryStore";
import type {
	StockKind,
	StockOperation,
	StockRecord,
} from "@/types/ui/inventory";
import {
	InventoryIcon,
	InventoryMetadata,
	InventoryMetrics,
	InventorySearch,
	InventoryTabs,
	StockKindBadge,
} from "./InventoryUi";

export default function StockOperationList({
	operation,
}: {
	operation: StockOperation;
}) {
	const records = useInventoryStore((state) => state.stockRecords);
	const [search, setSearch] = React.useState("");
	const [kind, setKind] = React.useState<StockKind | "all">("all");
	const [store, setStore] = React.useState("all");
	const [showFilters, setShowFilters] = React.useState(false);
	const isTransfer = operation === "transfer";
	const basePath = `/inventory/stock-${operation}`;
	const operationRecords = records.filter(
		(record) => record.operation === operation,
	);
	const filtered = operationRecords.filter(
		(record) =>
			(kind === "all" || record.kind === kind) &&
			(store === "all" ||
				record.fromStore === store ||
				record.toStore === store) &&
			`${record.reference} ${record.fromStore} ${record.toStore ?? ""} ${record.createdBy}`
				.toLowerCase()
				.includes(search.trim().toLowerCase()),
	);
	const count = (stockKind: StockKind) =>
		operationRecords.filter((record) => record.kind === stockKind).length;
	const metrics = isTransfer
		? [
				{
					label: "Stok",
					value: 12,
					description: "Produk",
					icon: "box" as const,
				},
				{
					label: "Jumlah",
					value: 8,
					description: "Produk",
					icon: "truck" as const,
					tone: "warning" as const,
				},
				{
					label: "Stok",
					value: 24,
					description: "Bahan Baku",
					icon: "layers" as const,
					tone: "success" as const,
				},
				{
					label: "Jumlah",
					value: 36,
					description: "Bahan Baku",
					icon: "truck" as const,
				},
			]
		: [
				{
					label: "Produk",
					value: 12,
					icon: "package" as const,
					tone: "warning" as const,
				},
				{
					label: "Bahan Baku",
					value: 8,
					icon: "layers" as const,
					tone: "success" as const,
				},
			];

	function renderRecord(record: StockRecord) {
		return (
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={`Detail ${record.reference}`}
				onPress={() =>
					router.push(route(`${basePath}/detail`, { id: record.id }))
				}
			>
				<Card className="gap-3">
					<View className="flex-row items-center justify-between">
						<Text size="normal" className="text-primary">
							{record.reference}
						</Text>
						<StockKindBadge kind={record.kind} />
					</View>
					{isTransfer ? (
						<>
							<Text size="small" className="text-muted">
								{dayjs(record.createdAt).format("DD MMMM YYYY HH:mm:ss")}
							</Text>
							<View className="flex-row gap-3">
								<View className="flex-1 gap-3 border-r border-border-muted pr-3">
									<InventoryMetadata
										icon="grid"
										tone="muted"
										label="Dari Toko"
										value={record.fromStore}
									/>
									<InventoryMetadata
										icon="arrow-right"
										tone="muted"
										label="Ke Toko"
										value={record.toStore ?? "-"}
									/>
								</View>
								<View className="flex-1 gap-3">
									<InventoryMetadata
										icon="user"
										tone="muted"
										label="Dibuat Oleh"
										value={record.createdBy}
									/>
									<InventoryMetadata
										icon="box"
										tone="muted"
										label="Jumlah Transfer"
										value={String(record.lines.length)}
									/>
								</View>
							</View>
						</>
					) : (
						<View className="flex-row items-center justify-between gap-3">
							<View className="flex-1 gap-2">
								<Text size="small" w="medium">
									{record.fromStore}
								</Text>
								<InventoryMetadata
									icon="clock"
									label={dayjs(record.createdAt).format("DD MMM YYYY HH:mm:ss")}
									value=""
								/>
								<View className="flex-row items-center gap-2">
									<InventoryIcon name="user" />
									<Text size="small" className="text-muted">
										Disesuaikan oleh:{" "}
										<Text size="small">{record.createdBy}</Text>
									</Text>
								</View>
							</View>
							<View className="items-center gap-2">
								<InventoryIcon name="chevron-right" />
								<Text size="small" className="text-muted">
									Total
								</Text>
								<Text size="body" w="semibold">
									{record.lines.reduce((sum, line) => sum + line.item.stock, 0)}
								</Text>
							</View>
						</View>
					)}
				</Card>
			</Pressable>
		);
	}

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
					<InventoryMetrics items={metrics} />
					<InventoryTabs
						items={[
							{ value: "all", label: "Semua" },
							{ value: "product", label: `Produk (${count("product")})` },
							{ value: "material", label: `Bahan Baku (${count("material")})` },
						]}
						value={kind}
						onChange={setKind}
					/>
					<FlatList
						data={filtered}
						keyExtractor={(record) => record.id}
						renderItem={({ item }) => renderRecord(item)}
						contentContainerStyle={{ gap: 12, paddingBottom: 112 }}
						showsVerticalScrollIndicator={false}
						ListEmptyComponent={
							<SearchNotFound text="Tidak ada stok ditemukan" />
						}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push(route(`${basePath}/modify`))}
			>
				Tambah {isTransfer ? "Transfer" : "Penyesuaian"} Stok
			</BottomActionButton>
		</>
	);
}
