import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { Button, ButtonText } from "@/components/ui/button";
import {
	formatMovementDay,
	formatMovementQuantity,
} from "@/lib/inventory-stock-movement";
import { route } from "@/lib/utils";
import { InventoryMetadata, StockKindBadge } from "../InventoryUi";
import { useStockMovements } from "./useStockMovements";

export default function StockMovementDetail() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	const movements = useStockMovements();
	const movement =
		typeof id === "string"
			? movements.find((item) => item.id === id)
			: undefined;
	if (!movement) {
		return (
			<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text w="semibold">Mutasi tidak ditemukan</Text>
					<Text size="normal" className="text-muted">
						Transaksi mungkin sudah dihapus atau tautan tidak valid.
					</Text>
					<Button
						onPress={() => router.replace(route("/inventory/stock-movement"))}
					>
						<ButtonText>Kembali ke riwayat</ButtonText>
					</Button>
				</Card>
			</Wrapper>
		);
	}
	const sourcePaths = {
		purchase: "/inventory/purchase-order/detail",
		transfer: "/inventory/stock-transfer/detail",
		adjustment: "/inventory/stock-adjustment/detail",
	};
	const source = movement.source;
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<Card className="gap-4">
				<View className="items-start gap-3">
					<StockKindBadge kind={movement.kind} />
					<Text w="semibold">{movement.name}</Text>
					<Text size="small" className="text-muted">
						{movement.sku} · {movement.category}
					</Text>
				</View>
				<InventoryMetadata
					icon="hash"
					label="Referensi Mutasi"
					value={movement.reference}
				/>
				<InventoryMetadata
					icon="repeat"
					label="Jenis Mutasi"
					value={movement.label}
				/>
				<InventoryMetadata
					icon="calendar"
					label="Tanggal"
					value={formatMovementDay(movement.day)}
				/>
				{movement.createdAt && (
					<InventoryMetadata
						icon="clock"
						label="Waktu"
						value={new Date(movement.createdAt).toLocaleTimeString("id-ID", {
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						})}
					/>
				)}
				<InventoryMetadata
					icon="map-pin"
					label="Lokasi Stok"
					value={movement.store ?? "Lokasi belum tersedia"}
				/>
				<Text size="small" className="text-muted">
					Jumlah Mutasi
				</Text>
				<Text
					w="semibold"
					className={
						movement.quantity > 0 ? "text-success" : "text-destructive"
					}
				>
					{formatMovementQuantity(movement)}
				</Text>
				<InventoryMetadata
					icon="package"
					label="Stok Akhir"
					value="Belum tersedia"
				/>
			</Card>
			<Card className="gap-4">
				<Text w="semibold">Informasi Mutasi</Text>
				{movement.fromStore && (
					<InventoryMetadata
						icon="log-out"
						label="Toko Asal"
						value={movement.fromStore}
					/>
				)}
				{movement.toStore && (
					<InventoryMetadata
						icon="log-in"
						label="Toko Tujuan"
						value={movement.toStore}
					/>
				)}
				{movement.supplier && (
					<InventoryMetadata
						icon="truck"
						label="Pemasok"
						value={movement.supplier}
					/>
				)}
				<InventoryMetadata
					icon="user"
					label="Petugas"
					value={movement.actor ?? "Belum tersedia"}
				/>
				<InventoryMetadata
					icon="file-text"
					label="Catatan"
					value={movement.note ?? "Belum tersedia"}
				/>
				{movement.type === "recorded" && (
					<Text size="small" className="text-muted">
						Catatan bahan baku tidak menyimpan tanggal dan lokasi transaksi.
						Identitas bahan mengikuti katalog saat ini.
					</Text>
				)}
				<Text size="small" className="text-muted">
					Stok akhir historis belum tersedia pada sumber transaksi ini.
				</Text>
				{source && (
					<Button
						variant="outline"
						onPress={() =>
							router.push(
								route(sourcePaths[source.operation], { id: source.id }),
							)
						}
					>
						<ButtonText>Lihat transaksi sumber</ButtonText>
					</Button>
				)}
			</Card>
		</Wrapper>
	);
}
