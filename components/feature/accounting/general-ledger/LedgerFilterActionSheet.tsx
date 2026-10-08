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

type LedgerFilterActionSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	selectedSort: string;
	onSelectSort: (sort: string) => void;
};

const SORT_OPTIONS = [
	{ label: "Default (Urutan Akun)", value: "default" },
	{ label: "Saldo Terbesar", value: "balance_desc" },
	{ label: "Saldo Terkecil", value: "balance_asc" },
	{ label: "Nama Akun (A-Z)", value: "name_asc" },
	{ label: "Kode Akun", value: "code_asc" },
];

export default function LedgerFilterActionSheet({
	isOpen,
	onClose,
	selectedSort,
	onSelectSort,
}: LedgerFilterActionSheetProps) {
	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="pb-8 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				<View className="w-full flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
					<Text w="semibold" className="text-base text-foreground">
						Urutkan Buku Besar
					</Text>
					<Pressable
						onPress={() => {
							onSelectSort("default");
							onClose();
						}}
						hitSlop={8}
					>
						<Text className="text-xs font-medium text-primary-500">Reset</Text>
					</Pressable>
				</View>

				<View className="w-full px-2 pt-2">
					{SORT_OPTIONS.map((option) => {
						const isSelected = selectedSort === option.value;
						return (
							<Pressable
								key={option.value}
								onPress={() => {
									onSelectSort(option.value);
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
