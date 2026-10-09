import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { Colors } from "@/constants/Colors";
import { TARGET_STORES } from "@/constants/data/manage/sales-target";
import {
	targetChoices,
	targetPeriod,
	targetTotals,
} from "@/lib/manage/sales-target";
import { formatRp } from "@/lib/utils";
import type { SalesTarget } from "@/types/ui/manage/sales-target";

export default function SalesTargetDetail({ target }: { target: SalesTarget }) {
	const total = targetTotals(target.rows);
	const choices = targetChoices(target.storeId, target.kind);
	const product = target.kind === "product";
	return (
		<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
			<Card density="compact" className="gap-3">
				<View className="flex-row items-center gap-3">
					<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
						<Feather name="target" size={24} color={Colors.primary} />
					</View>
					<View className="flex-1 gap-1">
						<Text size="body" w="semibold">
							{target.name}
						</Text>
						<Text size="small" className="text-muted">
							Target Penjualan
						</Text>
					</View>
				</View>
				<View>
					<DetailRow
						label="Toko"
						value={
							TARGET_STORES.find((store) => store.value === target.storeId)
								?.label
						}
					/>
					<DetailRow label="Periode" value={targetPeriod(target)} />
					<DetailRow
						label="Tipe Target"
						value={product ? "Per Produk" : "Per Kategori"}
						isLast
					/>
				</View>
			</Card>
			<Card density="compact" className="gap-2">
				<Text size="normal" className="text-muted">
					Total Nilai Target
				</Text>
				<Text size="body" w="bold" className="text-primary">
					{formatRp(total.amount)}
				</Text>
				{product && (
					<Text size="small" className="text-muted">
						{total.quantity.toLocaleString("id-ID")} unit dari{" "}
						{target.rows.length} produk
					</Text>
				)}
			</Card>
			<Card density="compact" className="gap-3">
				<Text size="normal" w="semibold">
					Target per {product ? "Produk" : "Kategori"}
				</Text>
				{target.rows.map((row, index) => (
					<View key={row.itemId} className="gap-2">
						{index > 0 && <View className="h-px bg-border-muted" />}
						<Text size="normal" w="medium">
							{choices.find((choice) => choice.value === row.itemId)?.label}
						</Text>
						<View className="flex-row flex-wrap justify-between gap-2">
							{product && (
								<Text size="small" className="text-muted">
									{row.quantity?.toLocaleString("id-ID")} unit
								</Text>
							)}
							<Text size="normal" w="semibold">
								{formatRp(row.amount)}
							</Text>
						</View>
					</View>
				))}
			</Card>
		</Wrapper>
	);
}
