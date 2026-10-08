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

type LedgerTypeActionSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedType: string;
	onSelectType: (type: string) => void;
};

const TYPE_OPTIONS = [
	{ label: "Semua Transaksi", value: "all" },
	{ label: "Debit", value: "debit" },
	{ label: "Kredit", value: "credit" },
];

export default function LedgerTypeActionSheet({
	isOpen,
	onClose,
	selectedType,
	onSelectType,
}: LedgerTypeActionSheetProps) {
	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="pb-8 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				<View className="w-full flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
					<Text w="semibold" className="text-base text-foreground">
						Jenis Transaksi
					</Text>
					<Pressable
						onPress={() => {
							onSelectType("all");
							onClose();
						}}
						hitSlop={8}
					>
						<Text className="text-xs font-medium text-primary-500">Reset</Text>
					</Pressable>
				</View>

				<View className="w-full px-2 pt-2">
					{TYPE_OPTIONS.map((option) => {
						const isSelected = selectedType === option.value;
						return (
							<Pressable
								key={option.value}
								onPress={() => {
									onSelectType(option.value);
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
