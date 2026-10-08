import { View } from "react-native";
import Text from "@/components/common/Text";
import { cn, formatRp } from "@/lib/utils";
import type { LedgerEntry } from "@/types/ui/accounting/ledger";

type LedgerEntryCardProps = {
	entry: LedgerEntry;
	isLast?: boolean;
};

export default function LedgerEntryCard({
	entry,
	isLast = false,
}: LedgerEntryCardProps) {
	const isDebit = entry.type === "debit";

	return (
		<View
			className={cn("gap-1 py-3.5", !isLast && "border-b border-outline-100")}
		>
			{/* Top Row: Title & Type Badge */}
			<View className="flex-row items-center justify-between">
				<Text size="normal" w="bold">
					{entry.title}
				</Text>
				<View
					className={cn(
						"rounded-full px-2.5 py-0.5",
						isDebit ? "bg-success-50" : "bg-warning-50",
					)}
				>
					<Text
						size="small"
						w="medium"
						className={cn(isDebit ? "text-success" : "text-warning")}
					>
						{isDebit ? "Debit" : "Kredit"}
					</Text>
				</View>
			</View>

			{/* Middle Row: Reference/Date & Amount */}
			<View className="flex-row items-center justify-between">
				<Text size="small" className="text-muted">
					{entry.referenceNumber} • {entry.date}
				</Text>
				<Text
					size="normal"
					w="bold"
					className={cn(isDebit ? "text-success" : "text-warning")}
				>
					{formatRp(entry.amount).replace(/\s/g, "")}
				</Text>
			</View>

			{/* Bottom Row: Description */}
			{Boolean(entry.description) && (
				<Text size="small" className="text-muted">
					{entry.description}
				</Text>
			)}
		</View>
	);
}
