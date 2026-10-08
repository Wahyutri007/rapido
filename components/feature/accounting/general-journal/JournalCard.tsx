import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { JournalCodeIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { formatRp } from "@/lib/utils";
import type { GeneralJournal } from "@/types/ui/accounting/journal";

type JournalCardProps<T extends GeneralJournal = GeneralJournal> = {
	journal: T;
	onPress: (journal: T) => void;
	onOpenActionMenu: (journal: T) => void;
	totalLabel?: string;
	displayDate?: string;
};

export default function JournalCard<T extends GeneralJournal = GeneralJournal>({
	journal,
	onPress,
	onOpenActionMenu,
	totalLabel = "Nilai",
	displayDate,
}: JournalCardProps<T>) {
	const dateText =
		displayDate ||
		("period" in journal && typeof journal.period === "string"
			? journal.period
			: journal.date);

	return (
		<Card>
			<Pressable onPress={() => onPress(journal)} className="active:opacity-75">
				<View className="gap-2.5">
					{/* Top Row: Date & Reference */}
					<View className="flex-row items-center gap-3">
						<View className="flex-row items-center gap-1.5">
							<Feather name="calendar" size={14} color={Colors.primary} />
							<Text className="text-xs text-muted font-medium">{dateText}</Text>
						</View>

						<View className="flex-row items-center gap-1.5">
							<JournalCodeIcon size={14} color={Colors.primary} />
							<Text className="text-xs text-muted font-medium">
								{journal.referenceNumber}
							</Text>
						</View>
					</View>

					{/* Middle Row: Title / Description & Menu */}
					<View className="flex-row items-start justify-between gap-2">
						<Text w="bold" className="flex-1 text-sm text-foreground">
							{journal.description}
						</Text>
						<Pressable
							onPress={(e) => {
								e.stopPropagation?.();
								onOpenActionMenu(journal);
							}}
							hitSlop={10}
							className="-mr-1 -mt-1 p-1"
						>
							<Feather
								name="more-horizontal"
								size={20}
								color={Colors.zinc[400]}
							/>
						</Pressable>
					</View>

					{/* Bottom Row: Nilai / Total */}
					<View className="gap-0.5 pt-0.5">
						<Text className="text-xs text-muted">{totalLabel}</Text>
						<Text w="bold" className="text-base text-foreground">
							{formatRp(journal.totalAmount).replace(/\s/g, "")}
						</Text>
					</View>
				</View>
			</Pressable>
		</Card>
	);
}
