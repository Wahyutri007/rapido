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
import { INCOME_FUNDING_SOURCES } from "@/constants/data/accounting/incomes";
import { cn } from "@/lib/utils";

type IncomeFilterActionSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedFundingSource: string | null;
	onSelectFundingSource: (source: string | null) => void;
};

export default function IncomeFilterActionSheet({
	isOpen,
	onClose,
	selectedFundingSource,
	onSelectFundingSource,
}: IncomeFilterActionSheetProps) {
	const options = [
		{ label: "Semua Sumber Dana", value: null },
		...INCOME_FUNDING_SOURCES,
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
						Filter Sumber Dana
					</Text>
					<Pressable
						onPress={() => {
							onSelectFundingSource(null);
							onClose();
						}}
						hitSlop={8}
					>
						<Text className="text-xs font-medium text-primary-500">Reset</Text>
					</Pressable>
				</View>

				<View className="w-full px-2 pt-2">
					{options.map((option) => {
						const isSelected = selectedFundingSource === option.value;
						return (
							<Pressable
								key={option.label}
								onPress={() => {
									onSelectFundingSource(option.value);
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
