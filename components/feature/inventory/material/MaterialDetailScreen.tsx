import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import { recentMaterialMovements } from "@/lib/inventory-material";
import { formatRp, route } from "@/lib/utils";
import { useInventoryMaterialStore } from "@/store/inventoryMaterialStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { InventoryIcon, InventoryMetrics } from "../InventoryUi";
import MaterialDeleteDialog from "./MaterialDeleteDialog";
import {
	formatMaterialQuantity,
	MaterialImage,
	MaterialStatusBadge,
} from "./MaterialUi";

export default function MaterialDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const material = useInventoryMaterialStore((state) =>
		state.materials.find((item) => item.id === id),
	);
	const [deleting, setDeleting] = React.useState(false);
	const purchases = useInventoryStore((state) => state.purchases);
	const stockRecords = useInventoryStore((state) => state.stockRecords);
	if (!material)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Bahan baku tidak ditemukan" />
			</Wrapper>
		);
	const days = material.averageDailyUsage
		? Math.floor(material.stock / material.averageDailyUsage)
		: null;
	const movements = recentMaterialMovements(material, purchases, stockRecords);
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card density="compact" className="gap-3">
					<View className="flex-row items-center gap-3">
						<MaterialImage material={material} />
						<View className="flex-1 gap-1">
							<Text w="semibold">{material.name}</Text>
							<Text size="small" className="text-muted">
								{material.sku || "-"}
							</Text>
							<Text size="small" className="text-muted">
								{material.category}
							</Text>
						</View>
					</View>
					<View className="flex-row items-center gap-2">
						<Text size="small" className="text-muted">
							Status Stok:
						</Text>
						<MaterialStatusBadge material={material} />
					</View>
				</Card>
				<InventoryMetrics
					items={[
						{
							label: "Stok Tersedia",
							value: `${formatMaterialQuantity(material.stock)} ${material.unit}`,
							icon: "package",
						},
						{
							label: "Nilai Stok",
							value:
								material.averagePrice === null
									? "-"
									: formatRp(material.stock * material.averagePrice),
							icon: "dollar-sign",
						},
					]}
				/>
				<Card density="compact" className="flex-row gap-3">
					{[
						{
							label: "Stok Minimum",
							value: `${formatMaterialQuantity(material.minimumStock)} ${material.unit}`,
						},
						{
							label: "Rata2 Pemakaian",
							value:
								material.averageDailyUsage === null
									? "-"
									: `${formatMaterialQuantity(material.averageDailyUsage)} ${material.unit}/hari`,
						},
						{
							label: "Perkiraan Habis",
							value: days === null ? "-" : `${days} hari`,
						},
					].map((metric) => (
						<View key={metric.label} className="flex-1 gap-2">
							<Text size="small" className="text-muted">
								{metric.label}
							</Text>
							<Text size="normal" w="medium">
								{metric.value}
							</Text>
						</View>
					))}
				</Card>
				<Card density="compact" className="gap-3">
					<Text size="normal" w="medium">
						Stok per Lokasi
					</Text>
					{material.locations.map((location) => (
						<View
							key={location.name}
							className="flex-row items-center gap-3 border-t border-border-muted pt-3"
						>
							<InventoryIcon name="map-pin" />
							<Text size="normal" className="flex-1">
								{location.name}
							</Text>
							<Text size="normal" w="medium">
								{formatMaterialQuantity(location.quantity)} {material.unit}
							</Text>
						</View>
					))}
				</Card>
				<Card density="compact" className="gap-3">
					<Text size="normal" w="medium">
						Riwayat Mutasi Terakhir
					</Text>
					{movements.length ? (
						movements.map((movement) => (
							<View
								key={movement.id}
								className="flex-row items-center gap-3 border-t border-border-muted pt-3"
							>
								<InventoryIcon
									name={
										movement.quantity >= 0
											? "arrow-down-left"
											: "arrow-up-right"
									}
									tone={movement.quantity >= 0 ? "success" : "warning"}
								/>
								<View className="flex-1 gap-1">
									<Text size="normal">{movement.label}</Text>
									<Text size="small" className="text-muted">
										{movement.reference}
									</Text>
								</View>
								<Text
									size="normal"
									w="medium"
									className={
										movement.quantity >= 0 ? "text-success" : "text-warning"
									}
								>
									{movement.quantity > 0 ? "+" : ""}
									{formatMaterialQuantity(movement.quantity)}{" "}
									{movement.unit ?? material.unit}
								</Text>
							</View>
						))
					) : (
						<Text size="small" className="text-muted">
							Belum ada riwayat mutasi
						</Text>
					)}
				</Card>
			</Wrapper>
			<DetailBottomActions
				onEdit={() => router.push(route("/inventory/materials/modify", { id }))}
				onDelete={() => setDeleting(true)}
			/>
			<MaterialDeleteDialog
				material={deleting ? material : undefined}
				onClose={() => setDeleting(false)}
				onDeleted={() => router.dismissTo(route("/inventory/materials"))}
			/>
		</>
	);
}
