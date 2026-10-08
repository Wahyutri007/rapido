import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailRow from "@/components/custom/DetailRow";
import { Colors } from "@/constants/Colors";
import { expenseDateLabel } from "@/lib/manage/expense-date";
import { formatRp } from "@/lib/utils";
import type { Expense } from "@/types/ui/accounting/expense";

export default function ExpenseDetail({ expense }: { expense: Expense }) {
	return (
		<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
			<Card density="compact" className="flex-row items-center gap-3">
				<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
					<Feather name="credit-card" size={24} color={Colors.primary} />
				</View>
				<View className="flex-1 gap-1">
					<Text size="body" w="semibold">
						{expense.accountName}
					</Text>
					<Text size="small" className="text-muted">
						{expense.referenceNumber}
					</Text>
				</View>
			</Card>
			<View className="gap-2">
				<Text size="small" w="medium" className="text-muted">
					Informasi Pengeluaran
				</Text>
				<Card density="compact">
					<DetailRow label="Nama Akun" value={expense.accountName} />
					<DetailRow label="Kode Akun" value={expense.accountCode} />
					<DetailRow label="No. Referensi" value={expense.referenceNumber} />
					<DetailRow label="Sumber Dana" value={expense.fundingSource} />
					<DetailRow label="Toko" value={expense.store} />
					<DetailRow label="Tanggal" value={expenseDateLabel(expense.date)} />
					<DetailRow label="Nominal">
						<Text
							size="normal"
							w="semibold"
							className="max-w-[50%] text-right !text-destructive"
						>
							{formatRp(expense.amount)}
						</Text>
					</DetailRow>
					<View className="gap-2 py-3">
						<Text size="normal" w="medium">
							Deskripsi
						</Text>
						<Text size="normal" className="text-muted">
							{expense.description}
						</Text>
					</View>
				</Card>
			</View>
			<Card density="compact">
				<DetailRow label="Dibuat oleh" value={expense.createdBy} />
				<DetailRow label="Jam" value={expense.time} isLast />
			</Card>
		</Wrapper>
	);
}
