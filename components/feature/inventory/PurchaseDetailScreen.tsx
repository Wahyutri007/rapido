import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import Card from "@/components/common/Card";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { CardListItem, CardListSeparator } from "@/components/custom/CardList";
import DetailRow from "@/components/custom/DetailRow";
import { formatRp } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventoryStore";
import PurchaseStatusBadge from "./PurchaseStatusBadge";

export default function PurchaseDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const record = useInventoryStore((state) =>
		state.purchases.find((record) => record.id === id),
	);
	if (!record)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Pesanan pembelian tidak ditemukan" />
			</Wrapper>
		);
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			<Card className="gap-3">
				<View className="flex-row items-center justify-between gap-3">
					<Text size="normal" w="semibold" className="text-primary">
						{record.reference}
					</Text>
					<PurchaseStatusBadge status={record.status} />
				</View>
				<Text size="small" className="text-muted">
					Pesanan Stok
				</Text>
			</Card>
			<View className="gap-2">
				<Text size="normal" w="medium" className="text-muted">
					Informasi Pesanan Pembelian
				</Text>
				<Card className="py-1">
					<DetailRow icon="grid" label="Toko" value={record.store} />
					<DetailRow icon="truck" label="Supplier" value={record.supplier} />
					<DetailRow
						icon="calendar"
						label="Tanggal"
						value={dayjs(record.createdAt).format("DD MMMM YYYY HH:mm:ss")}
					/>
					<DetailRow
						icon="user"
						label="Diterima Oleh"
						value={record.receivedBy}
					/>
					<DetailRow
						icon="credit-card"
						label="Metode Pembayaran"
						value={record.paymentMethod}
					/>
					<DetailRow
						icon="file-text"
						label="Catatan"
						value={record.note || "-"}
						isLast
					/>
				</Card>
			</View>
			<View className="gap-2">
				<Text size="normal" w="medium" className="text-muted">
					Daftar Produk
				</Text>
				<Card className="gap-3">
					{record.lines.map((line) => (
						<CardListItem
							key={line.item.id}
							label={line.item.name}
							description={`${line.quantity} ${line.item.unit} × ${formatRp(line.price)}`}
							value={formatRp(line.quantity * line.price)}
						/>
					))}
					<CardListSeparator />
					<View className="flex-row justify-between">
						<Text size="normal" w="semibold">
							Total Transaksi
						</Text>
						<Text size="normal" w="semibold" className="text-primary">
							{formatRp(record.amount)}
						</Text>
					</View>
				</Card>
			</View>
		</Wrapper>
	);
}
