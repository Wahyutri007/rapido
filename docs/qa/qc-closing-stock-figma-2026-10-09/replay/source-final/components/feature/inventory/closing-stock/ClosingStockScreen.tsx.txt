import { Image } from "expo-image";
import React from "react";
import { useWindowDimensions, View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import { INVENTORY_STORES } from "@/constants/data/inventory";
import { getInventoryItems } from "@/lib/inventory";
import {
	type ClosingStockStatus,
	closingStockGroups,
	formatClosingStock,
} from "@/lib/inventory-closing-stock";
import { figmaStockShadows, figmaStockTheme } from "@/lib/ui/figma-stock";
import { cn } from "@/lib/utils";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";

const STATUS_OPTIONS: { label: string; value: ClosingStockStatus }[] = [
	{ label: "Status Stok", value: "all" },
	{ label: "Tersedia", value: "available" },
	{ label: "Menipis", value: "low" },
	{ label: "Habis", value: "empty" },
	{ label: "Belum Tersedia", value: "unknown" },
];

export default function ClosingStockScreen() {
	const { width } = useWindowDimensions();
	const dividerOffsets = Array.from(
		{ length: Math.ceil(width / 309) },
		(_, tile) => tile * 309,
	);
	const materials = useInventoryMaterialStore((state) => state.materials);
	const [search, setSearch] = React.useState("");
	const [store, setStore] = React.useState("all");
	const [status, setStatus] = React.useState<ClosingStockStatus>("all");
	const groups = closingStockGroups(getInventoryItems(materials), materials, {
		search,
		store,
		status,
	});
	const stores = [
		...new Set([
			...INVENTORY_STORES,
			...materials.flatMap((item) => item.stores),
		]),
	];
	const hasFilters = search !== "" || store !== "all" || status !== "all";
	const resetFilters = () => {
		setSearch("");
		setStore("all");
		setStatus("all");
	};

	return (
		<View className="flex-1" style={figmaStockTheme}>
			<Wrapper hasBottomBar contentContainerStyle={{ padding: 16, gap: 16 }}>
				<SearchBar appearance="figma" search={search} setSearch={setSearch} />
				<View className="flex-row" style={{ gap: 14 }}>
					<View className="min-w-0 flex-1">
						<SingleSelect
							appearance="figma"
							label="Toko"
							value={store}
							onValueChange={setStore}
							searchable
							items={[
								{ label: "Semua Toko", value: "all" },
								...stores.map((name) => ({ label: name, value: name })),
							]}
							leftIcon={
								<Image
									source={require("@/assets/images/inventory/closing-stock/store.svg")}
									style={{ width: 16, height: 16 }}
									contentFit="contain"
								/>
							}
						/>
					</View>
					<View className="min-w-0 flex-1">
						<SingleSelect<ClosingStockStatus>
							appearance="figma"
							label="Status Stok"
							value={status}
							onValueChange={setStatus}
							items={STATUS_OPTIONS}
							leftIcon={
								<Image
									source={require("@/assets/images/inventory/closing-stock/status.svg")}
									style={{ width: 15.3, height: 15 }}
									contentFit="contain"
								/>
							}
						/>
					</View>
				</View>
				{store !== "all" && (
					<Text size="small" className="text-muted">
						Hanya bahan yang terdaftar di toko ini. Jumlah stok per toko belum
						tersedia; tanda — bukan berarti stok habis.
					</Text>
				)}
				{hasFilters && (
					<View className="items-end">
						<Button variant="link" size="sm" onPress={resetFilters}>
							<ButtonText>Reset Filter</ButtonText>
						</Button>
					</View>
				)}
				<View style={{ marginRight: 1 }}>
					<Card appearance="figma" density="flush" className="overflow-hidden">
						<View className="flex-row justify-between gap-3 bg-primary/10 p-4">
							<Text
								size="normal"
								w="semibold"
								className="text-primary"
								style={{ lineHeight: 18 }}
							>
								Produk
							</Text>
							<Text
								size="normal"
								w="semibold"
								className="text-primary"
								style={{ lineHeight: 18 }}
							>
								Stok Akhir
							</Text>
						</View>
						<View className="gap-4 px-3 py-4">
							{groups.length === 0 ? (
								<SearchNotFound text="Tidak ada stok yang sesuai" />
							) : (
								groups.map((group) => (
									<View
										key={group.category}
										className="rounded-lg bg-white p-3"
										style={figmaStockShadows.control}
									>
										<View
											style={{ gap: group.category === "Minuman" ? 8 : 16 }}
										>
											<Text
												size="normal"
												w="semibold"
												style={{ lineHeight: 18 }}
											>
												{group.category}
											</Text>
											<View style={{ height: 0 }}>
												<View className="absolute -top-px h-px w-full flex-row overflow-hidden">
													{dividerOffsets.map((offset) => (
														<Image
															key={offset}
															source={require("@/assets/images/figma/back-office/divider.svg")}
															style={{ width: 309, height: 1, flexShrink: 0 }}
														/>
													))}
												</View>
											</View>
										</View>
										{group.rows.map((row) => (
											<View
												key={row.key}
												className={cn(
													"flex-row items-center justify-between gap-3",
													group.category === "Minuman" ? "py-4" : "py-3",
												)}
												accessibilityLabel={`${row.item.name}, ${row.item.sku}, ${row.quantity === null ? "Jumlah stok belum tersedia" : formatClosingStock(row.quantity, row.item.unit)}`}
											>
												<View className="min-w-0 flex-1 gap-1">
													<Text size="small" w="medium">
														{row.item.name}
													</Text>
													{row.item.sku !== "" && (
														<Text size="small" className="text-muted">
															{row.item.sku}
														</Text>
													)}
												</View>
												<Text
													size="normal"
													w="medium"
													style={{
														flexShrink: 1,
														maxWidth: "48%",
														lineHeight: 18,
													}}
													className={cn(
														"text-right",
														// Keep status colors above the Text primitive's default foreground.
														row.status === "empty" && "!text-destructive",
														(row.status === "low" ||
															row.status === "unknown") &&
															"!text-muted",
													)}
												>
													{formatClosingStock(row.quantity, row.item.unit)}
												</Text>
											</View>
										))}
										<View
											pointerEvents="none"
											className="absolute inset-0 rounded-lg border border-border-muted"
										/>
									</View>
								))
							)}
						</View>
					</Card>
				</View>
			</Wrapper>
		</View>
	);
}
