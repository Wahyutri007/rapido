import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { formatRp } from "@/lib/utils";

type LedgerDetailSummaryCardProps = {
	totalDebit: number;
	totalCredit: number;
	endingBalance: number;
};

export default function LedgerDetailSummaryCard({
	totalDebit,
	totalCredit,
	endingBalance,
}: LedgerDetailSummaryCardProps) {
	const total = totalDebit + totalCredit;
	const debitRatio =
		total > 0 ? Math.min(100, Math.max(10, (totalDebit / total) * 100)) : 50;

	return (
		<View className="gap-2">
			<Text size="body" w="bold">
				Ringkasan
			</Text>

			<Card className="rounded-2xl border-0 p-4">
				{/* Top Row: Total Debit & Total Kredit */}
				<View className="flex-row items-center justify-between pb-3">
					<View className="flex-1 items-center">
						<Text size="small" className="text-muted">
							Total Debit
						</Text>
						<Text size="normal" w="bold" className="mt-0.5 text-success">
							{formatRp(totalDebit).replace(/\s/g, "")}
						</Text>
					</View>

					<View className="h-8 w-px bg-outline-200" />

					<View className="flex-1 items-center">
						<Text size="small" className="text-muted">
							Total Kredit
						</Text>
						<Text size="normal" w="bold" className="mt-0.5 text-error">
							{formatRp(totalCredit).replace(/\s/g, "")}
						</Text>
					</View>
				</View>

				{/* Divider */}
				<View className="h-px bg-outline-100" />

				{/* Bottom Row: Saldo Akhir & Progress Indicator */}
				<View className="items-center pt-3">
					<Text size="small" className="text-muted">
						Saldo Akhir
					</Text>
					<Text size="body" w="bold" className="mt-0.5">
						{formatRp(endingBalance).replace(/\s/g, "")}
					</Text>

					{/* Ratio Indicator Bar */}
					<View className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-100/70">
						<View
							className="h-full rounded-full bg-primary-500"
							style={{ width: `${debitRatio}%` }}
						/>
					</View>
				</View>
			</Card>
		</View>
	);
}
