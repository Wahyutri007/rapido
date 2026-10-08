import Feather from "@expo/vector-icons/Feather";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { formatRp } from "@/lib/utils";
import type { LedgerAccount } from "@/types/ui/accounting/ledger";

type LedgerDetailHeaderCardProps = {
	account: LedgerAccount;
};

export default function LedgerDetailHeaderCard({
	account,
}: LedgerDetailHeaderCardProps) {
	const isNegative = account.balance < 0;
	const formattedBalance = isNegative
		? `(${formatRp(Math.abs(account.balance)).replace(/\s/g, "")})`
		: formatRp(account.balance).replace(/\s/g, "");

	return (
		<Card className="flex-row items-center justify-between rounded-2xl border-0 p-4">
			<View className="flex-row items-center gap-3">
				<View className="relative size-12 items-center justify-center rounded-2xl bg-primary-50">
					<Feather name="file-text" size={20} color={Colors.primary} />
					<View className="absolute bottom-1 right-1 size-4 items-center justify-center rounded-full bg-primary-500">
						<Feather name="plus" size={10} color="#fff" />
					</View>
				</View>
				<View className="gap-0.5">
					<Text size="body" w="bold">
						{account.name}
					</Text>
					<Text size="small" className="text-muted">
						{account.code} | {account.subClassification}
					</Text>
				</View>
			</View>

			<View className="items-end gap-0.5">
				<Text size="small" className="text-muted">
					Saldo Akhir
				</Text>
				<Text size="body" w="bold">
					{formattedBalance}
				</Text>
			</View>
		</Card>
	);
}
