import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DetailBottomActionsProps = {
	onEdit: () => void;
	onDelete: () => void;
	editText?: string;
	deleteText?: string;
	isDeleting?: boolean;
	className?: string;
};

export default function DetailBottomActions({
	onEdit,
	onDelete,
	editText = "Edit",
	deleteText = "Hapus",
	isDeleting = false,
	className,
}: DetailBottomActionsProps) {
	const insets = useSafeAreaInsets();

	return (
		<View
			className={cn(
				"absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-gray-100 bg-white px-4 pt-3",
				className,
			)}
			style={{ paddingBottom: Math.max(insets.bottom, 16) }}
		>
			<View className="flex-1">
				<Button variant="outline" size="xl" className="w-full" onPress={onEdit}>
					<ButtonText>{editText}</ButtonText>
				</Button>
			</View>

			<View className="flex-1">
				<Button
					size="xl"
					className="w-full border-0 bg-error-50 active:bg-error-100"
					onPress={onDelete}
					isLoading={isDeleting}
				>
					<ButtonText className="text-destructive">{deleteText}</ButtonText>
				</Button>
			</View>
		</View>
	);
}
