import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
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
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import { InventoryIcon, InventorySectionHeading } from "../InventoryUi";
import { formatMaterialQuantity } from "../material/MaterialUi";
import CompositionDeleteDialog from "./CompositionDeleteDialog";
import CompositionSimulation from "./CompositionSimulation";
import {
	CompositionImage,
	CompositionStatus,
	formatCompositionMoney,
	formatCompositionPercent,
} from "./CompositionUi";

export default function CompositionDetailScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const product = COMPOSITION_PRODUCTS.find((item) => item.id === id);
	const composition = useInventoryCompositionStore((state) =>
		state.compositions.find((item) => item.productId === id),
	);
	const materials = useInventoryMaterialStore((state) => state.materials);
	const [deleting, setDeleting] = React.useState(false);
	if (!product)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Produk tidak ditemukan" />
			</Wrapper>
		);
	const cost = composition ? compositionCost(composition.lines) : undefined;
	const price = COMPOSITION_SALE_PRICES[product.id];
	const margin = cost === undefined ? null : compositionMargin(cost, price);
	const names = Object.fromEntries(
		materials.map((item) => [item.id, item.name]),
	);
	const edit = () =>
		router.push(route("/inventory/compositions/modify", { id: product.id }));
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card density="compact" className="gap-3">
					<View className="flex-row items-center gap-3">
						<CompositionImage productId={product.id} />
						<View className="flex-1 gap-1">
							<Text w="semibold">{product.name}</Text>
							<Text size="small" className="text-muted">
								{product.category}
							</Text>
							<Text size="normal">
								Harga Jual: {formatCompositionMoney(price)}
							</Text>
						</View>
					</View>
					<CompositionStatus configured={Boolean(composition)} />
				</Card>
				{composition ? (
					<>
						<Card density="compact" className="gap-3">
							<InventorySectionHeading
								title="Estimasi Margin"
								icon="trending-up"
								right={
									<View className="items-end gap-1">
										<Text size="small" className="text-muted">
											Persentase
										</Text>
										<Text
											size="normal"
											w="semibold"
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
								}
							/>
							{[
								{ label: "Harga Jual", value: price },
								{
									label: "Total Cost Bahan",
									value: cost === undefined ? undefined : -cost,
								},
								{ label: "Laba Kotor", value: margin?.profit },
							].map((row) => (
								<View
									key={row.label}
									className="flex-row justify-between gap-3"
								>
									<Text size="normal" className="text-muted">
										{row.label}
									</Text>
									<Text size="normal" w="medium">
										{formatCompositionMoney(row.value)}
									</Text>
								</View>
							))}
							<View className="flex-row justify-between gap-3">
								<Text size="normal" className="text-muted">
									Margin
								</Text>
								<Text size="normal" w="medium">
									{formatCompositionPercent(margin?.percentage)}
								</Text>
							</View>
							{price === undefined && (
								<Text size="small" className="text-muted">
									Harga jual belum tersedia; margin belum dapat dihitung.
								</Text>
							)}
						</Card>
						<Card density="compact" className="gap-3">
							<InventorySectionHeading title="Komposisi" icon="layers" />
							{composition.lines.map((line) => {
								const material = materials.find(
									(item) => item.id === line.materialId,
								);
								return (
									<View
										key={line.materialId}
										className="gap-2 border-b border-border-muted pb-3"
									>
										<View className="flex-row items-center gap-3">
											<InventoryIcon name="package" />
											<Text size="normal" w="medium" className="flex-1">
												{material?.name ?? line.material.name}
											</Text>
											<Text size="normal" w="medium">
												{formatCompositionMoney(line.quantity * line.unitPrice)}
											</Text>
										</View>
										<Text size="small" className="text-muted">
											{formatMaterialQuantity(line.quantity)} {line.unit} per
											porsi
										</Text>
										{(!material || material.unit !== line.unit) && (
											<Text size="small" className="text-warning">
												Bahan atau satuan berubah. Perbarui resep sebelum
												digunakan.
											</Text>
										)}
									</View>
								);
							})}
							<View className="flex-row justify-between gap-3">
								<Text size="normal" w="medium">
									Total Biaya
								</Text>
								<Text size="normal" w="semibold">
									{formatCompositionMoney(cost)}
								</Text>
							</View>
						</Card>
						<Card density="compact" className="gap-2">
							<Text size="normal" className="text-muted">
								Total Modal per Porsi
							</Text>
							<Text w="semibold">{formatCompositionMoney(cost)}</Text>
							{price !== undefined && cost !== undefined && (
								<Text size="small" className="text-muted">
									{formatCompositionPercent((cost / price) * 100)} dari harga
									jual
								</Text>
							)}
						</Card>
						<CompositionSimulation
							key={product.id}
							lines={composition.lines}
							names={names}
						/>
					</>
				) : (
					<Card className="gap-2">
						<Text size="normal" w="medium">
							Belum ada resep untuk produk ini
						</Text>
						<Text size="small" className="text-muted">
							Atur bahan dan takaran per porsi untuk melihat biaya, margin, dan
							simulasi stok.
						</Text>
					</Card>
				)}
			</Wrapper>
			{composition ? (
				<DetailBottomActions onEdit={edit} onDelete={() => setDeleting(true)} />
			) : (
				<BottomActionButton onPress={edit}>Atur Resep</BottomActionButton>
			)}
			<CompositionDeleteDialog
				productId={deleting ? product.id : undefined}
				productName={product.name}
				onClose={() => setDeleting(false)}
				onDeleted={() => router.dismissTo(route("/inventory/compositions"))}
			/>
		</>
	);
}
