import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

type JournalFilterActionSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedFilter: string | null;
	onSelectFilter: (filter: string | null) => void;
	title?: string;
};

export default function JournalFilterActionSheet({
	isOpen,
	onClose,
	selectedFilter,
	onSelectFilter,
	title = "Filter Jurnal Umum",
}: JournalFilterActionSheetProps) {
	const options = [
		{ label: "Semua Jurnal", value: null },
		{ label: "Bulan Ini", value: "this_month" },
		{ label: "Jurnal Seimbang", value: "balanced" },
	];

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="pb-8 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				<View className="w-full flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
					<Text w="semibold" className="text-base text-foreground">
						{title}
					</Text>
					<Pressable
						onPress={() => {
							onSelectFilter(null);
							onClose();
						}}
						hitSlop={8}
					>
						<Text className="text-xs font-medium text-primary-500">Reset</Text>
					</Pressable>
				</View>

				<View className="w-full px-2 pt-2">
					{options.map((option) => {
						const isSelected = selectedFilter === option.value;
						return (
							<Pressable
								key={option.label}
								onPress={() => {
									onSelectFilter(option.value);
									onClose();
								}}
								className="flex-row items-center justify-between px-4 py-3.5"
							>
								<Text
									w={isSelected ? "semibold" : "regular"}
									className={cn(
										"text-sm",
										isSelected ? "text-primary-500" : "text-foreground",
									)}
								>
									{option.label}
								</Text>

								{isSelected && (
									<Feather name="check" size={18} color={Colors.primary} />
								)}
							</Pressable>
						);
					})}
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}
