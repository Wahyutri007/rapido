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

type LedgerPeriodActionSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedPeriod: string;
	onSelectPeriod: (period: string) => void;
};

const PERIOD_OPTIONS = [
	{ label: "Semua Periode", value: "all" },
	{ label: "Bulan Ini", value: "month" },
	{ label: "Kuartal Ini", value: "quarter" },
	{ label: "Tahun Ini", value: "year" },
];

export default function LedgerPeriodActionSheet({
	isOpen,
	onClose,
	selectedPeriod,
	onSelectPeriod,
}: LedgerPeriodActionSheetProps) {
	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="pb-8 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				<View className="w-full flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
					<Text w="semibold" className="text-base text-foreground">
						Pilih Periode
					</Text>
					<Pressable
						onPress={() => {
							onSelectPeriod("all");
							onClose();
						}}
						hitSlop={8}
					>
						<Text className="text-xs font-medium text-primary-500">Reset</Text>
					</Pressable>
				</View>

				<View className="w-full px-2 pt-2">
					{PERIOD_OPTIONS.map((option) => {
						const isSelected = selectedPeriod === option.value;
						return (
							<Pressable
								key={option.value}
								onPress={() => {
									onSelectPeriod(option.value);
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
