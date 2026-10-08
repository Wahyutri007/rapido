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
import type { Account } from "@/types/ui/accounting/account";

type AccountActionSheetProps = {
	account: Account | null;
	isOpen: boolean;
	onClose: () => void;
	onFillBalance?: (account: Account) => void;
	onResetBalance?: (account: Account) => void;
	onViewDetail?: (account: Account) => void;
	onEditAccount?: (account: Account) => void;
	onDeleteAccount?: (account: Account) => void;
};

type AccountActionItemProps = {
	icon: React.ComponentProps<typeof Feather>["name"];
	title: string;
	subtitle: string;
	onPress?: () => void;
	variant?: "default" | "destructive";
	isLast?: boolean;
};

function AccountActionItem({
	icon,
	title,
	subtitle,
	onPress,
	variant = "default",
	isLast = false,
}: AccountActionItemProps) {
	const isDestructive = variant === "destructive";

	return (
		<Pressable
			onPress={onPress}
			className={cn(
				"flex-row items-center justify-between py-3.5",
				!isLast && "border-b border-gray-100",
			)}
		>
			<View className="flex-row items-center gap-3">
				<View
					className={cn(
						"size-10 items-center justify-center rounded-xl",
						isDestructive ? "bg-red-50" : "bg-blue-50",
					)}
				>
					<Feather
						name={icon}
						size={18}
						color={isDestructive ? Colors.red[500] : Colors.primary}
					/>
				</View>
				<View>
					<Text
						w="medium"
						className={cn(
							"text-sm",
							isDestructive ? "text-red-500" : "text-foreground",
						)}
					>
						{title}
					</Text>
					<Text className="text-xs text-zinc-400">{subtitle}</Text>
				</View>
			</View>

			<Feather name="chevron-right" size={18} color={Colors.zinc[400]} />
		</Pressable>
	);
}

export default function AccountActionSheet({
	account,
	isOpen,
	onClose,
	onFillBalance,
	onResetBalance,
	onViewDetail,
	onEditAccount,
	onDeleteAccount,
}: AccountActionSheetProps) {
	if (!account) return null;

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="pb-8 pt-2">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				{/* Header with Batal on left and centered title */}
				<View className="w-full flex-row items-center justify-between border-b border-gray-100 py-3">
					<Pressable onPress={onClose} hitSlop={8}>
						<Text className="text-sm font-medium text-primary-500">Batal</Text>
					</Pressable>

					<Text w="semibold" className="text-base text-foreground">
						{account.name}
					</Text>

					{/* Spacer to keep title centered */}
					<View className="w-10" />
				</View>

				{/* List of actions */}
				<View className="w-full pt-2">
					<AccountActionItem
						icon="edit-3"
						title="Isi Saldo Akun"
						subtitle="Isi saldo akun"
						onPress={() => {
							onClose();
							onFillBalance?.(account);
						}}
					/>

					<AccountActionItem
						icon="edit-3"
						title="Reset Akun"
						subtitle="Reset saldo akun"
						onPress={() => {
							onClose();
							onResetBalance?.(account);
						}}
					/>

					<AccountActionItem
						icon="eye"
						title="Detail Akun"
						subtitle="Info lebih lanjut tentang akun"
						onPress={() => {
							onClose();
							onViewDetail?.(account);
						}}
					/>

					<AccountActionItem
						icon="edit-3"
						title="Edit Akun"
						subtitle="Ubah nama, urutan, atau pengaturan lainnya"
						onPress={() => {
							onClose();
							onEditAccount?.(account);
						}}
					/>

					<AccountActionItem
						icon="trash-2"
						title="Hapus Akun"
						subtitle="Akun akan dihapus permanen"
						variant="destructive"
						isLast
						onPress={() => {
							onClose();
							onDeleteAccount?.(account);
						}}
					/>
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}
