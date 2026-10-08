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
import { cn } from "@/lib/utils";
import type { Expense } from "@/types/ui/accounting/expense";

type ExpenseActionSheetProps = {
	expense: Expense | null;
	isOpen: boolean;
	onClose: () => void;
	onViewDetail?: (expense: Expense) => void;
	onEditExpense?: (expense: Expense) => void;
	onDeleteExpense?: (expense: Expense) => void;
};

export default function ExpenseActionSheet({
	expense,
	isOpen,
	onClose,
	onViewDetail,
	onEditExpense,
	onDeleteExpense,
}: ExpenseActionSheetProps) {
	if (!expense) return null;

	const actions = [
		{
			id: "detail",
			title: "Detail Laporan",
			subtitle: "Info lebih lanjut tentang Laporan",
			icon: "eye" as const,
			iconBg: "bg-blue-50",
			iconColor: Colors.primary,
			textColor: "text-foreground",
			onPress: () => {
				onClose();
				onViewDetail?.(expense);
			},
		},
		{
			id: "edit",
			title: "Edit Laporan",
			subtitle: "Ubah Laporan Lebih Lanjut",
			icon: "edit-3" as const,
			iconBg: "bg-blue-50",
			iconColor: Colors.primary,
			textColor: "text-foreground",
			onPress: () => {
				onClose();
				onEditExpense?.(expense);
			},
		},
		{
			id: "delete",
			title: "Hapus  Laporan",
			subtitle: "Akun akan dihapus permanen",
			icon: "trash-2" as const,
			iconBg: "bg-red-50",
			iconColor: Colors.red[500],
			textColor: "text-red-500",
			onPress: () => {
				onClose();
				onDeleteExpense?.(expense);
			},
		},
	];

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="pb-8 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				{/* Header with Batal on left and centered reference number */}
				<View className="w-full flex-row items-center justify-between border-b border-gray-100 py-3">
					<Pressable onPress={onClose} hitSlop={8}>
						<Text className="text-sm font-medium text-primary-500">Batal</Text>
					</Pressable>

					<Text w="semibold" className="text-base text-foreground">
						{expense.referenceNumber}
					</Text>

					{/* Spacer to keep title centered */}
					<View className="w-10" />
				</View>

				{/* List of actions */}
				<View className="w-full pt-2">
					{actions.map((item, index) => (
						<Pressable
							key={item.id}
							onPress={item.onPress}
							className={cn(
								"flex-row items-center justify-between py-3.5",
								index < actions.length - 1 && "border-b border-gray-100",
							)}
						>
							<View className="flex-row items-center gap-3">
								<View
									className={cn(
										"size-10 items-center justify-center rounded-xl",
										item.iconBg,
									)}
								>
									<Feather
										name={item.icon}
										size={18}
										color={item.iconColor}
									/>
								</View>
								<View>
									<Text w="medium" className={cn("text-sm", item.textColor)}>
										{item.title}
									</Text>
									<Text className="text-xs text-zinc-400">
										{item.subtitle}
									</Text>
								</View>
							</View>

							<Feather
								name="chevron-right"
								size={18}
								color={Colors.zinc[400]}
							/>
						</Pressable>
					))}
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}
