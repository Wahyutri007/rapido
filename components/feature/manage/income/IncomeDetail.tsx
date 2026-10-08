import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { Colors } from "@/constants/Colors";
import { accountingDateLabel } from "@/lib/accounting/date";
import { formatRp } from "@/lib/utils";
import type { Income } from "@/types/ui/accounting/income";

export default function IncomeDetail({ income }: { income: Income }) {
	const invoice = income.type === "invoice";
	return (
		<Wrapper
			hasActionButton={!invoice}
			contentContainerStyle={{ padding: 16, gap: 16 }}
		>
			<Card density="compact" className="flex-row items-center gap-3">
				<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
					<Feather
						name={invoice ? "shopping-bag" : "credit-card"}
						size={24}
						color={Colors.primary}
					/>
				</View>
				<View className="flex-1 gap-1">
					<Text size="body" w="semibold">
						{income.accountName ??
							(invoice ? "Penerimaan Penjualan" : "Penerimaan Manual")}
					</Text>
					<Text size="small" className="text-muted">
						{income.referenceNumber}
					</Text>
				</View>
			</Card>
			{invoice && (
				<Card density="compact" className="gap-2">
					<Text size="normal" w="medium">
						Penerimaan dari Penjualan
					</Text>
					<Text size="small" className="text-muted">
						Penerimaan ini mengikuti transaksi penjualan. Data ditampilkan
						sebagai informasi.
					</Text>
				</Card>
			)}
			<View className="gap-2">
				<Text size="small" w="medium" className="text-muted">
					Informasi Penerimaan
				</Text>
				<Card density="compact">
					<DetailRow label="Jenis" value={invoice ? "Penjualan" : "Manual"} />
					<DetailRow label="Nama Akun" value={income.accountName} />
					<DetailRow label="Kode Akun" value={income.accountCode} />
					<DetailRow label="No. Referensi" value={income.referenceNumber} />
					<DetailRow label="Sumber Dana" value={income.fundingSource} />
					<DetailRow label="Toko" value={income.store} />
					<DetailRow label="Tanggal" value={accountingDateLabel(income.date)} />
					{invoice && (
						<DetailRow label="Jumlah Item" value={income.itemCount} />
					)}
					<DetailRow label="Nominal">
						<Text
							size="normal"
							w="semibold"
							className="max-w-[50%] text-right !text-success"
						>
							{formatRp(income.amount)}
						</Text>
					</DetailRow>
					<View className="gap-2 py-3">
						<Text size="normal" w="medium">
							Deskripsi
						</Text>
						<Text size="normal" className="text-muted">
							{income.description || "-"}
						</Text>
					</View>
				</Card>
			</View>
			<Card density="compact">
				<DetailRow label="Dibuat oleh" value={income.createdBy} />
				<DetailRow label="Jam" value={income.time} isLast />
			</Card>
		</Wrapper>
	);
}
