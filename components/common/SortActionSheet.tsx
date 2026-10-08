import { Feather } from "@expo/vector-icons";
import { ArrowDownAZ, ArrowDownZA, Clock } from "lucide-react-native";
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
import type { SortOption } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

type SortActionSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	value?: SortOption;
	onChange: (value: SortOption) => void;
	title?: string;
};

const SORT_OPTIONS: {
	value: SortOption;
	label: string;
	icon: React.ReactNode;
}[] = [
	{
		value: "a-z",
		label: "A - Z",
		icon: <ArrowDownAZ size={20} color={Colors.primary} />,
	},
	{
		value: "z-a",
		label: "Z - A",
		icon: <ArrowDownZA size={20} color={Colors.primary} />,
	},
	{
		value: "newest",
		label: "Terbaru dibuat",
		icon: <Clock size={20} color={Colors.primary} />,
	},
];

export default function SortActionSheet({
	isOpen,
	onClose,
	value = "newest",
	onChange,
	title = "Opsi Urutan",
}: SortActionSheetProps) {
	const [draftValue, setDraftValue] = React.useState<SortOption>(value);

	React.useEffect(() => {
		if (isOpen) {
			setDraftValue(value);
		}
	}, [isOpen, value]);

	const handleSave = () => {
		onChange(draftValue);
		onClose();
	};

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="px-4 pb-6 pt-2">
				<ActionsheetDragIndicatorWrapper className="mb-2">
					<ActionsheetDragIndicator className="h-1 w-10 rounded-full bg-zinc-300" />
				</ActionsheetDragIndicatorWrapper>

				{/* Header */}
				<View className="w-full flex-row items-center justify-between pb-3">
					<Pressable onPress={onClose} hitSlop={8}>
						<Text size="body" w="medium" className="text-primary">
							Batal
						</Text>
					</Pressable>
					<Text size="body" w="bold">
						{title}
					</Text>
					<Pressable onPress={handleSave} hitSlop={8}>
						<Text size="body" w="semibold" className="text-primary">
							Selesai
						</Text>
					</Pressable>
				</View>

				<View className="mb-4 h-px w-full bg-zinc-100" />

				{/* Section title */}
				<View className="mb-3 w-full">
					<Text size="normal" w="semibold">
						Urutkan berdasarkan
					</Text>
				</View>

				{/* Options List */}
				<View className="w-full gap-2.5">
					{SORT_OPTIONS.map((option) => {
						const isSelected = draftValue === option.value;

						return (
							<Pressable
								key={option.value}
								onPress={() => setDraftValue(option.value)}
								className={cn(
									"w-full flex-row items-center justify-between rounded-2xl border p-4",
									isSelected
										? "border-primary bg-primary/5"
										: "border-zinc-200 bg-white",
								)}
							>
								<View className="flex-row items-center gap-3">
									{option.icon}
									<Text
										size="normal"
										w="medium"
										className={isSelected ? "text-primary" : undefined}
									>
										{option.label}
									</Text>
								</View>

								{isSelected && (
									<View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
										<Feather name="check" size={12} color="#ffffff" />
									</View>
								)}
							</Pressable>
						);
					})}
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}
