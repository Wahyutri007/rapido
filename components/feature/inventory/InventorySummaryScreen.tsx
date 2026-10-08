import { router } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import {
	INGREDIENT_USAGE,
	INVENTORY_SUMMARIES,
	type InventoryRanking,
} from "@/constants/data/inventory-summary";
import { formatRp, route } from "@/lib/utils";
import type { StockKind } from "@/types/ui/inventory";
import InventoryRankingCard, {
	InventoryRankingRows,
} from "./InventoryRankingCard";
import { InventoryIcon, InventoryMetrics } from "./InventoryUi";

export default function InventorySummaryScreen() {
	const [kind, setKind] = React.useState<StockKind>("material");
	const [selection, setSelection] = React.useState<{
		title: string;
		rows: InventoryRanking[];
		variant: "bar" | "money" | "loss" | "restock" | "image";
	}>();
	const summary = INVENTORY_SUMMARIES[kind];
	const rankings = [
		{
			title: summary.popularTitle,
			rows: summary.popular,
			variant: "bar" as const,
		},
		{
			title: summary.runningLowTitle,
			rows: summary.runningLow,
			variant: "bar" as const,
		},
	];
	const secondaryRankings = [
		{
			title: summary.costTitle,
			rows: summary.costs,
			variant: "money" as const,
		},
		...(kind === "material"
			? [
					{
						title: "Menu paling banyak memakai bahan tertentu",
						rows: INGREDIENT_USAGE,
						variant: "image" as const,
					},
				]
			: []),
		{
			title: summary.lossTitle,
			rows: summary.losses,
			variant: "loss" as const,
		},
		{
			title: summary.restockTitle,
			rows: summary.restock,
			variant: "restock" as const,
		},
	];
	return (
		<>
			<Wrapper hasBottomBar contentContainerStyle={{ padding: 16, gap: 16 }}>
				<View className="flex-row border-b border-border-muted">
					{[
						{ value: "material" as const, label: "Bahan Baku" },
						{ value: "product" as const, label: "Produk" },
					].map((tab) => (
						<Pressable
							key={tab.value}
							accessibilityRole="tab"
							accessibilityState={{ selected: tab.value === kind }}
							onPress={() => setKind(tab.value)}
							className={`flex-1 items-center py-3 ${kind === tab.value ? "border-b-2 border-primary" : ""}`}
						>
							<Text
								size="normal"
								className={kind === tab.value ? "text-primary" : "text-muted"}
							>
								{tab.label}
							</Text>
						</Pressable>
					))}
				</View>
				<InventoryMetrics
					items={[
						{ label: "Total Bahan", value: summary.totals[0], icon: "package" },
						{
							label: "Stok Aman",
							value: summary.totals[1],
							icon: "shield",
							tone: "success",
						},
						{
							label: "Stok Menipis",
							value: summary.totals[2],
							icon: "alert-triangle",
							tone: "warning",
						},
						{
							label: "Stok Habis",
							value: summary.totals[3],
							icon: "slash",
							tone: "destructive",
						},
					]}
				/>
				{rankings.map((ranking) => (
					<InventoryRankingCard
						key={ranking.title}
						{...ranking}
						onViewAll={() => setSelection(ranking)}
					/>
				))}
				<Card className="gap-4">
					<View className="gap-1">
						<Text size="normal" w="semibold">
							Estimasi sisa hari
						</Text>
						<Text size="small" className="text-muted">
							Berdasarkan rata-rata{" "}
							{kind === "material" ? "pemakaian" : "penjualan harian"}
						</Text>
					</View>
					<View className="flex-row gap-3">
						<View className="h-44 justify-between pb-8">
							{summary.dayTicks.map((tick) => (
								<Text key={tick} size="small" className="text-muted">
									{tick}
								</Text>
							))}
						</View>
						<View className="flex-1">
							<View className="h-36 flex-row items-end justify-around border-b border-border-muted">
								<View
									pointerEvents="none"
									className="absolute inset-0 justify-between"
								>
									{summary.dayTicks.map((tick) => (
										<View key={tick} className="border-t border-border-muted" />
									))}
								</View>
								{summary.estimatedDays.map((row, index) => (
									<View
										key={row.name}
										className="w-8 bg-primary"
										style={{
											height: `${(row.value / summary.dayTicks[0]) * 100}%`,
											opacity: 1 - index * 0.15,
										}}
									/>
								))}
							</View>
							<View className="mt-2 flex-row gap-2">
								{summary.estimatedDays.map((row) => (
									<Text
										key={row.name}
										size="small"
										numberOfLines={2}
										className="flex-1 text-center text-muted"
									>
										{row.name}
									</Text>
								))}
							</View>
						</View>
					</View>
					<View className="flex-row items-center justify-center gap-2">
						<View className="size-2 bg-primary" />
						<Text size="small" className="text-muted">
							Hari
						</Text>
					</View>
				</Card>
				{secondaryRankings.map((ranking) => (
					<InventoryRankingCard
						key={ranking.title}
						{...ranking}
						onViewAll={() => setSelection(ranking)}
					/>
				))}
				<Card className="gap-3">
					<Text size="normal" w="semibold">
						Rekomendasi Pembelian
					</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View className="gap-3">
							<View className="flex-row border-b border-border-muted pb-3">
								{[
									{ title: "Bahan Baku", width: 160 },
									{ title: "Jumlah Disarankan", width: 120 },
									{ title: "Supplier Default", width: 120 },
									{ title: "Estimasi Biaya", width: 112 },
									{ title: "Aksi", width: 48 },
								].map((column) => (
									<Text
										key={column.title}
										size="small"
										w="medium"
										className="text-muted"
										style={{ width: column.width }}
									>
										{column.title}
									</Text>
								))}
							</View>
							{summary.recommendations.map((row) => (
								<View
									key={row.name}
									className="flex-row items-center border-b border-border-muted pb-3"
								>
									<View className="w-40 flex-row items-center gap-2">
										{row.image && (
											<Image
												source={row.image}
												className="size-8 rounded-full"
												style={{ width: 32, height: 32 }}
											/>
										)}
										<Text size="small" className="flex-1">
											{row.name}
										</Text>
									</View>
									<Text size="small" className="w-[120px]">
										{row.amount}
									</Text>
									<Text size="small" className="w-[120px]">
										{row.supplier}
									</Text>
									<Text size="small" className="w-28">
										{formatRp(row.cost)}
									</Text>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`Beli ${row.name}`}
										onPress={() =>
											router.push(
												route("/inventory/purchase-order/modify", {
													itemName: row.name,
													kind,
												}),
											)
										}
										className="size-8 items-center justify-center rounded-lg bg-primary-50"
									>
										<InventoryIcon name="plus" />
									</Pressable>
								</View>
							))}
						</View>
					</ScrollView>
				</Card>
				<View className="gap-3">
					<Text size="normal" w="semibold">
						Insight Bisnis
					</Text>
					<View className="flex-row flex-wrap gap-3">
						{summary.insights.map((insight) => (
							<View key={insight.title} style={{ width: "47.5%", flexGrow: 1 }}>
								<Card className="gap-2">
									<Text size="small" className="text-muted">
										{insight.title}
									</Text>
									<Image
										source={insight.image}
										className="h-28 w-full rounded-lg"
										style={{ width: "100%", height: 112 }}
										resizeMode="cover"
									/>
									<Text size="normal" w="medium">
										{insight.name}
									</Text>
									<Text size="small" className="text-muted">
										{insight.label}
									</Text>
									<Text
										size="normal"
										w="semibold"
										className={
											insight.tone === "success"
												? "text-success"
												: insight.tone === "destructive"
													? "text-destructive"
													: "text-primary"
										}
									>
										{insight.value}
									</Text>
								</Card>
							</View>
						))}
					</View>
				</View>
			</Wrapper>
			<Actionsheet
				isOpen={Boolean(selection)}
				onClose={() => setSelection(undefined)}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent>
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator />
					</ActionsheetDragIndicatorWrapper>
					<ActionsheetScrollView
						contentContainerStyle={{ padding: 16, gap: 16 }}
					>
						<Text w="semibold">{selection?.title}</Text>
						{selection && (
							<InventoryRankingRows
								rows={selection.rows}
								variant={selection.variant}
							/>
						)}
					</ActionsheetScrollView>
				</ActionsheetContent>
			</Actionsheet>
		</>
	);
}
