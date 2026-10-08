import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn, formatRp } from "@/lib/utils";
import type { LedgerAccount } from "@/types/ui/accounting/ledger";

type LedgerAccountCardProps = {
	account: LedgerAccount;
	onPress: (account: LedgerAccount) => void;
	isLast?: boolean;
};

export default function LedgerAccountCard({
	account,
	onPress,
	isLast = false,
}: LedgerAccountCardProps) {
	const isNegative = account.balance < 0;
	const formattedBalance = isNegative
		? `(${formatRp(Math.abs(account.balance)).replace(/\s/g, "")})`
		: formatRp(account.balance).replace(/\s/g, "");

	return (
		<Pressable
			onPress={() => onPress(account)}
			className={cn(
				"flex-row items-center justify-between py-3.5 active:opacity-75",
				!isLast && "border-b border-border-muted",
			)}
		>
			{/* Left: Icon & Account Info */}
			<View className="flex-row items-center gap-3">
				<View className="size-10 items-center justify-center rounded-xl bg-primary-50">
					<Feather name="file-text" size={18} color={Colors.primary} />
				</View>
				<View className="gap-0.5">
					<Text size="normal" w="bold">
						{account.name}
					</Text>
					<Text size="small" className="text-muted">
						{account.code}
					</Text>
				</View>
			</View>

			{/* Right: Balance & Chevron */}
			<View className="flex-row items-center gap-2">
				<Text
					size="normal"
					w="bold"
					className={cn(isNegative ? "text-destructive" : "text-success")}
				>
					{formattedBalance}
				</Text>
				<Feather name="chevron-right" size={16} color={Colors.zinc[400]} />
			</View>
		</Pressable>
	);
}
