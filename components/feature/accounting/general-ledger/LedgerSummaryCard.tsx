import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { formatRp } from "@/lib/utils";
import type { LedgerSummary } from "@/types/ui/accounting/ledger";

type LedgerSummaryCardProps = {
	summary: LedgerSummary;
};

export default function LedgerSummaryCard({ summary }: LedgerSummaryCardProps) {
	return (
		<Card className="overflow-hidden border border-primary-200/50 bg-primary-100 p-0">
			{/* Top Tier: Blue Surface */}
			<View className="p-4">
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-3">
						<View className="size-10 items-center justify-center rounded-lg bg-primary-200">
							<Feather name="file-text" size={20} color={Colors.primary} />
						</View>
						<View className="gap-1">
							<Text size="normal" w="bold">
								Ringkasan Saldo
							</Text>
							<Text size="small" className="text-muted">
								{summary.date}
							</Text>
						</View>
					</View>

					<View className="items-end gap-1">
						<Text size="small" className="text-muted">
							Saldo Bersih:
						</Text>
						<Text size="body" w="bold" className="text-primary">
							{formatRp(summary.netBalance).replace(/\s/g, "")}
						</Text>
					</View>
				</View>
			</View>

			{/* Bottom Tier: White Surface Flushing with Card Edges */}
			<View className="flex-row items-center rounded-t-lg bg-white p-3">
				{/* Debit Column */}
				<View className="flex-1 pr-3">
					<View className="mb-2 size-9 items-center justify-center rounded-lg bg-success-bg">
						<Ionicons
							name="swap-horizontal"
							size={16}
							color={Colors.green[500]}
						/>
					</View>
					<Text size="small" className="mb-1 text-muted">
						Total Saldo Debit
					</Text>
					<Text size="normal" w="bold" className="text-success">
						{formatRp(summary.totalDebit).replace(/\s/g, "")}
					</Text>
				</View>

				{/* Center Divider */}
				<View className="h-14 w-px bg-border-muted self-center" />

				{/* Kredit Column */}
				<View className="flex-1 pl-3">
					<View className="mb-2 size-9 items-center justify-center rounded-lg bg-error-bg">
						<Ionicons
							name="swap-horizontal"
							size={16}
							color={Colors.red[500]}
						/>
					</View>
					<Text size="small" className="mb-1 text-muted">
						Total Saldo Kredit
					</Text>
					<Text size="normal" w="bold" className="text-destructive">
						{formatRp(summary.totalCredit).replace(/\s/g, "")}
					</Text>
				</View>
			</View>
		</Card>
	);
}
