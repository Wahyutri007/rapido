import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SingleSelect from "@/components/common/SingleSelect";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import { Button, ButtonText } from "@/components/ui/button";
import {
	COMPOSITION_PRODUCTS,
	COMPOSITION_SALE_PRICES,
} from "@/constants/data/inventory-compositions";
import {
	compositionCost,
	compositionMargin,
} from "@/lib/inventory/composition";
import { route } from "@/lib/utils";
import { useInventoryCompositionStore } from "@/store/inventoryCompositionStore";
import { InventoryMetrics, InventorySearch } from "../InventoryUi";
import {
	CompositionImage,
	CompositionStatus,
	formatCompositionMoney,
	formatCompositionPercent,
} from "./CompositionUi";

export default function CompositionListScreen() {
	const compositions = useInventoryCompositionStore(
		(state) => state.compositions,
	);
	const [search, setSearch] = React.useState("");
	const [status, setStatus] = React.useState("all");
	const [showFilters, setShowFilters] = React.useState(false);
	const filtered = COMPOSITION_PRODUCTS.filter((product) => {
		const configured = compositions.some(
			(item) => item.productId === product.id,
		);
		return (
			`${product.name} ${product.sku} ${product.category}`
				.toLowerCase()
				.includes(search.trim().toLowerCase()) &&
			(status === "all" || configured === (status === "configured"))
		);
	});
	return (
		<Wrapper isNotScrollable>
			<View className="flex-1 gap-4 p-4">
				<InventorySearch
					search={search}
					setSearch={setSearch}
					active={showFilters || status !== "all"}
					onFilter={() => setShowFilters(!showFilters)}
				/>
				{showFilters && (
					<SingleSelect
						label="Status Resep"
						value={status}
						onValueChange={setStatus}
						items={[
							{ label: "Semua Status", value: "all" },
							{ label: "Sudah Teresep", value: "configured" },
							{ label: "Belum Teresep", value: "empty" },
						]}
					/>
				)}
				<InventoryMetrics
					items={[
						{
							label: "Total Menu",
							value: COMPOSITION_PRODUCTS.length,
							icon: "grid",
							description: "item",
						},
						{
							label: "Sudah Teresep",
							value: compositions.length,
							icon: "check-circle",
							tone: "success",
							description: "item",
						},
					]}
				/>
				<FlatList
					data={filtered}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
					ListEmptyComponent={
						<SearchNotFound text="Tidak ada produk ditemukan" />
					}
					renderItem={({ item }) => {
						const composition = compositions.find(
							(entry) => entry.productId === item.id,
						);
						const cost = composition
							? compositionCost(composition.lines)
							: undefined;
						const margin =
							cost === undefined
								? null
								: compositionMargin(cost, COMPOSITION_SALE_PRICES[item.id]);
						return (
							<CatalogItemCard
								density="compact"
								leading={<CompositionImage productId={item.id} />}
								title={
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`Detail komposisi ${item.name}`}
										onPress={() =>
											router.push(
												route("/inventory/compositions/detail", {
													id: item.id,
												}),
											)
										}
									>
										<Text size="normal" w="medium">
											{item.name}
										</Text>
									</Pressable>
								}
								subtitle={`Kategori: ${item.category}`}
								description={`Harga Jual: ${formatCompositionMoney(COMPOSITION_SALE_PRICES[item.id])}`}
							>
								<View className="gap-3">
									<CompositionStatus configured={Boolean(composition)} />
									<View className="flex-row gap-3 border-t border-border-muted pt-3">
										<View className="flex-1 gap-1">
											<Text size="small" className="text-muted">
												Modal/porsi
											</Text>
											<Text size="normal" w="medium">
												{formatCompositionMoney(cost)}
											</Text>
										</View>
										<View className="flex-1 gap-1">
											<Text size="small" className="text-muted">
												Margin
											</Text>
											<Text
												size="normal"
												w="medium"
												className={
													margin
														? margin.profit >= 0
															? "text-success"
															: "text-destructive"
														: "text-muted"
												}
											>
												{formatCompositionPercent(margin?.percentage)}
											</Text>
										</View>
									</View>
									<Button
										size="lg"
										variant="outline"
										accessibilityLabel={`Atur resep ${item.name}`}
										onPress={() =>
											router.push(
												route("/inventory/compositions/modify", {
													id: item.id,
												}),
											)
										}
									>
										<ButtonText>Atur Resep</ButtonText>
									</Button>
								</View>
							</CatalogItemCard>
						);
					}}
				/>
			</View>
		</Wrapper>
	);
}
