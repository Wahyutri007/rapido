import Feather from "@expo/vector-icons/Feather";
import React from "react";
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
import { ACCOUNT_CLASSIFICATIONS } from "@/constants/data/accounting/accounts";
import { cn } from "@/lib/utils";

type AccountFilterActionSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedClassification: string | null;
	onSelectClassification: (classification: string | null) => void;
};

export default function AccountFilterActionSheet({
	isOpen,
	onClose,
	selectedClassification,
	onSelectClassification,
}: AccountFilterActionSheetProps) {
	const options = [
		{ label: "Semua Klasifikasi", value: null },
		...ACCOUNT_CLASSIFICATIONS,
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
						Filter Klasifikasi
					</Text>
					<Pressable
						onPress={() => {
							onSelectClassification(null);
							onClose();
						}}
						hitSlop={8}
					>
						<Text className="text-xs text-primary-500 font-medium">Reset</Text>
					</Pressable>
				</View>

				<View className="w-full px-2 pt-2">
					{options.map((option) => {
						const isSelected = selectedClassification === option.value;
						return (
							<Pressable
								key={option.label}
								onPress={() => {
									onSelectClassification(option.value);
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
