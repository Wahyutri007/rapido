import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { useInventoryStore } from "@/store/inventoryStore";
import type { StockOperation } from "@/types/ui/inventory";
import { InventoryIcon, InventoryMetrics } from "./InventoryUi";

export default function StockOperationDetail({
	operation,
}: {
	operation: StockOperation;
}) {
	const { id } = useLocalSearchParams<{ id: string }>();
	const record = useInventoryStore((state) =>
		state.stockRecords.find(
			(record) => record.id === id && record.operation === operation,
		),
	);
	const isTransfer = operation === "transfer";
	if (!record)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Data stok tidak ditemukan" />
			</Wrapper>
		);
	const totalStock = record.lines.reduce(
		(sum, line) => sum + line.item.stock,
		0,
	);
	const totalLoss = record.lines.reduce((sum, line) => sum + line.quantity, 0);
	const firstUnit = record.lines[0]?.item.unit;
	const summaryUnit = record.lines.every((line) => line.item.unit === firstUnit)
		? firstUnit
		: undefined;
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			{!isTransfer && (
				<InventoryMetrics
					valueTone="item"
					items={[
						{
							label: "Total Stok Awal",
							value: summaryUnit ? totalStock : "—",
							description: summaryUnit ?? "Satuan berbeda",
							icon: "box",
							tone: "warning",
						},
						{
							label: "Total Penyusutan",
							value: summaryUnit ? totalLoss : "—",
							description: summaryUnit ?? "Satuan berbeda",
							icon: "alert-triangle",
							tone: "destructive",
						},
						{
							label: "Total Stok Akhir",
							value: summaryUnit ? totalStock - totalLoss : "—",
							description: summaryUnit ?? "Satuan berbeda",
							icon: "check-circle",
							tone: "success",
						},
					]}
				/>
			)}
			<View className="gap-2">
				<Text size="normal" w="medium" className="text-muted">
					Informasi {isTransfer ? "Transfer" : "Penyesuaian"} Stok
				</Text>
				<Card>
					{!isTransfer && (
						<DetailRow label="Toko" value={record.fromStore} icon="grid" />
					)}
					<DetailRow
						label="Tanggal"
						value={dayjs(record.createdAt).format("DD MMMM YYYY HH:mm:ss")}
						icon="calendar"
					/>
					{isTransfer && (
						<>
							<DetailRow
								label="Dari Toko"
								value={record.fromStore}
								icon="grid"
							/>
							<DetailRow
								label="Ke Toko"
								value={record.toStore}
								icon="arrow-right"
							/>
						</>
					)}
					<DetailRow
						label="Dibuat Oleh"
						value={record.createdBy}
						icon="clipboard"
					/>
					<DetailRow
						label="Catatan"
						value={record.note || "-"}
						icon="file-text"
						isLast
					/>
				</Card>
			</View>
			<View className="gap-2">
				<Text size="normal" w="medium" className="text-muted">
					{isTransfer
						? `${record.kind === "product" ? "Produk" : "Bahan baku"} yang ditransfer`
						: "Daftar Penyesuaian Stok"}
				</Text>
				{isTransfer ? (
					<Card>
						{record.lines.map((line, index) => (
							<View
								key={line.item.id}
								className={`flex-row items-start gap-3 py-3 ${index < record.lines.length - 1 ? "border-b border-border-muted" : ""}`}
							>
								<View className="size-9 items-center justify-center rounded-lg bg-primary-50">
									<InventoryIcon name="coffee" />
								</View>
								<View className="flex-1 gap-2">
									<Text size="small" w="semibold">
										{line.item.name}
									</Text>
									<View className="flex-row items-center justify-between">
										<View className="rounded-full bg-primary-50 px-2 py-1">
											<Text size="small" className="text-primary">
												{line.item.category}
											</Text>
										</View>
										<Text size="normal" w="semibold" className="text-primary">
											{line.quantity}
										</Text>
									</View>
									<View className="flex-row items-center justify-between">
										<Text size="small" className="text-muted">
											Jumlah Transfer
										</Text>
										<Text size="small">{line.item.unit}</Text>
									</View>
								</View>
							</View>
						))}
					</Card>
				) : (
					record.lines.map((line) => {
						const remaining = line.item.stock - line.quantity;
						const goodPercent = line.item.stock
							? (remaining / line.item.stock) * 100
							: 0;
						return (
							<Card key={line.item.id} className="gap-3">
								<View className="flex-row items-center justify-between gap-3">
									<View className="flex-1 gap-1">
										<Text size="normal">{line.item.name}</Text>
										<Text size="small" className="text-muted">
											SKU: {line.item.sku}
										</Text>
									</View>
									<View className="rounded-lg bg-primary-50 px-3 py-1">
										<Text w="semibold" className="text-primary">
											{line.item.stock}{" "}
											<Text size="small" className="text-primary">
												{line.item.unit}
											</Text>
										</Text>
									</View>
								</View>
								<View className="flex-row gap-3">
									{[
										{
											label: "Diterima",
											value: line.item.stock,
											color: "text-foreground",
										},
										{ label: "Bagus", value: remaining, color: "text-success" },
										{
											label: "Rusak",
											value: line.quantity,
											color: "!text-destructive",
										},
									].map((metric, index) => (
										<View
											key={metric.label}
											className={`flex-1 gap-2 ${index < 2 ? "border-r border-border-muted" : ""}`}
										>
											<Text size="small">{metric.label}</Text>
											<Text w="semibold" className={metric.color}>
												{metric.value}{" "}
												<Text size="small" className="text-muted">
													{line.item.unit}
												</Text>
											</Text>
										</View>
									))}
								</View>
								<View className="gap-1">
									<View className="h-1 flex-row gap-1">
										<View
											className="rounded-full bg-success"
											style={{ flex: goodPercent }}
										/>
										<View
											className="rounded-full bg-destructive"
											style={{ flex: 100 - goodPercent }}
										/>
									</View>
									<View className="flex-row justify-between">
										<Text size="small" className="text-success">
											Bagus {Number(goodPercent.toFixed(1))}%
										</Text>
										<Text size="small" className="!text-destructive">
											Rusak {Number((100 - goodPercent).toFixed(1))}%
										</Text>
									</View>
								</View>
							</Card>
						);
					})
				)}
			</View>
		</Wrapper>
	);
}
