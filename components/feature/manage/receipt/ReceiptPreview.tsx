import { View } from "react-native";
import Text from "@/components/common/Text";
import { StoreIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { RECEIPT_SAMPLE } from "@/constants/data/manage/receipt";
import { formatRp } from "@/lib/utils";
import type { ReceiptSettings, ReceiptStore } from "@/types/ui/manage/receipt";

function ReceiptRow({
	label,
	value,
	important = false,
}: {
	label: string;
	value: string;
	important?: boolean;
}) {
	return (
		<View className="flex-row items-start justify-between gap-3">
			<Text size="small" w={important ? "bold" : "regular"} className="flex-1">
				{label}
			</Text>
			<Text
				size="small"
				w={important ? "bold" : "regular"}
				className="shrink text-right"
			>
				{value}
			</Text>
		</View>
	);
}

export default function ReceiptPreview({
	store,
	settings,
}: {
	store: ReceiptStore;
	settings: ReceiptSettings;
}) {
	const { enabled, footer } = settings;
	const sample = RECEIPT_SAMPLE;
	return (
		<View className="gap-4 rounded-lg border border-border-muted bg-white p-4">
			<View className="items-center gap-1">
				{enabled.logo && (
					<View className="mb-2 size-12 items-center justify-center rounded-lg bg-surface-muted">
						<StoreIcon size={28} color={Colors.neutral} />
					</View>
				)}
				<Text size="normal" w="bold" className="text-center">
					{store.name}
				</Text>
				{enabled.address && (
					<Text size="small" className="text-center">
						{store.address}
					</Text>
				)}
				{enabled.phone && (
					<Text size="small" className="text-center">
						{store.phone}
					</Text>
				)}
			</View>
			<View className="gap-1">
				{enabled.date && <ReceiptRow label="Tanggal" value={sample.date} />}
				{enabled.transactionNumber && (
					<ReceiptRow label="Nomor Invoice" value={sample.transactionNumber} />
				)}
				{enabled.customer && (
					<ReceiptRow label="Pelanggan" value={sample.customer} />
				)}
				{enabled.cashier && <ReceiptRow label="Kasir" value={sample.cashier} />}
			</View>
			{enabled.items &&
				sample.groups.map((group) => (
					<View
						key={group.title}
						className="gap-3 border-t border-dashed border-border-muted pt-3"
					>
						<Text size="small" w="bold">
							{group.title}
						</Text>
						{group.items.map((item) => (
							<View key={item.id} className="gap-1">
								<Text size="small">{item.name}</Text>
								<ReceiptRow
									label={`${item.quantity} × ${formatRp(item.price)}`}
									value={formatRp(item.quantity * item.price)}
								/>
							</View>
						))}
					</View>
				))}
			<View className="gap-2 border-t border-dashed border-border-muted pt-3">
				{enabled.subtotal && (
					<ReceiptRow label="Subtotal" value={formatRp(sample.subtotal)} />
				)}
				{enabled.taxes && (
					<>
						<ReceiptRow label="Service" value={formatRp(sample.service)} />
						<ReceiptRow label="Pajak 10%" value={formatRp(sample.tax)} />
						<ReceiptRow label="Pembulatan" value={formatRp(sample.rounding)} />
					</>
				)}
				{enabled.total && (
					<ReceiptRow label="Total" value={formatRp(sample.total)} important />
				)}
				{enabled.payment && (
					<>
						<ReceiptRow label="Tunai" value={formatRp(sample.cash)} />
						<ReceiptRow
							label="Kembalian"
							value={formatRp(sample.cash - sample.total)}
						/>
					</>
				)}
			</View>
			{footer.trim() && (
				<Text
					size="small"
					className="border-t border-dashed border-border-muted pt-3 text-center"
				>
					{footer.trim()}
				</Text>
			)}
		</View>
	);
}
