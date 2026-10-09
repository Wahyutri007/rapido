import Feather from "@expo/vector-icons/Feather";
import type React from "react";
import { Pressable, Switch, View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
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

export type ItemActionSheetAction = {
	id: string;
	title: string;
	subtitle?: string;
	icon: React.ComponentProps<typeof Feather>["name"];
	iconBg?: string;
	iconColor?: string;
	textColor?: string;
	right?: React.ReactNode;
	onPress: () => void;
};

export type ItemActionSheetRowProps = {
	title: string;
	subtitle?: string;
	icon: React.ComponentProps<typeof Feather>["name"];
	iconBg?: string;
	iconColor?: string;
	textColor?: string;
	right?: React.ReactNode;
	onPress?: () => void;
	isLast?: boolean;
	hapticType?: "light" | "medium" | "heavy" | "warning";
};

export function ItemActionSheetRow({
	title,
	subtitle,
	icon,
	iconBg = "bg-primary-50",
	iconColor = Colors.primary,
	textColor = "text-foreground",
	right,
	onPress,
	isLast = false,
	hapticType = "light",
}: ItemActionSheetRowProps) {
	const content = (
		<View className="flex-1 flex-row items-center gap-3">
			<View
				className={cn("size-10 items-center justify-center rounded-xl", iconBg)}
			>
				<Feather name={icon} size={18} color={iconColor} />
			</View>
			<View className="flex-1 gap-1">
				<Text w="medium" size="normal" className={textColor}>
					{title}
				</Text>
				{subtitle && (
					<Text size="small" className="text-muted">
						{subtitle}
					</Text>
				)}
			</View>
		</View>
	);

	const rightNode = right ?? (
		<Feather name="chevron-right" size={18} color={Colors.zinc[400]} />
	);

	if (onPress) {
		return (
			<BouncyPressable
				onPress={onPress}
				hapticType={hapticType}
				activeScale={0.98}
				ripple={true}
				className={cn(
					"flex-row items-center justify-between overflow-hidden rounded-xl p-4",
					!isLast && "border-b border-outline-100",
				)}
			>
				{content}
				{rightNode}
			</BouncyPressable>
		);
	}

	return (
		<View
			className={cn(
				"flex-row items-center justify-between overflow-hidden rounded-xl p-4",
				!isLast && "border-b border-outline-100",
			)}
		>
			{content}
			{rightNode}
		</View>
	);
}

export type ItemActionSheetToggleRowProps = {
	title: string;
	subtitle?: string;
	icon?: React.ComponentProps<typeof Feather>["name"];
	iconBg?: string;
	iconColor?: string;
	isChecked: boolean;
	onToggle: (value: boolean) => void;
	activeLabel?: string;
	inactiveLabel?: string;
	isLast?: boolean;
};

export function ItemActionSheetToggleRow({
	title,
	subtitle,
	icon = "package",
	iconBg = "bg-primary-50",
	iconColor = Colors.primary,
	isChecked,
	onToggle,
	activeLabel = "Aktif",
	inactiveLabel = "Tidak Aktif",
	isLast = false,
}: ItemActionSheetToggleRowProps) {
	return (
		<ItemActionSheetRow
			title={title}
			subtitle={
				subtitle ??
				(isChecked
					? `Status ${activeLabel.toLowerCase()}`
					: `Status ${inactiveLabel.toLowerCase()}`)
			}
			icon={icon}
			iconBg={iconBg}
			iconColor={iconColor}
			isLast={isLast}
			right={
				<View className="flex-row items-center gap-2">
					<Text
						size="small"
						w="medium"
						className={isChecked ? "text-primary" : "text-muted"}
					>
						{isChecked ? activeLabel : inactiveLabel}
					</Text>
					<Switch
						value={isChecked}
						onValueChange={onToggle}
						trackColor={{ false: "#e4e4e7", true: Colors.primary }}
						thumbColor="#ffffff"
					/>
				</View>
			}
		/>
	);
}

export type ItemActionSheetDetailItemProps = {
	entityName?: string;
	title?: string;
	subtitle?: string;
	onPress: () => void;
	isLast?: boolean;
};

export function ItemActionSheetDetailItem({
	entityName,
	title,
	subtitle,
	onPress,
	isLast = false,
}: ItemActionSheetDetailItemProps) {
	const resolvedTitle =
		title ?? (entityName ? `Detail ${entityName}` : "Detail");
	const resolvedSubtitle =
		subtitle ??
		(entityName
			? `Info lebih lanjut tentang ${entityName.toLowerCase()}`
			: "Info lebih lanjut");

	return (
		<ItemActionSheetRow
			title={resolvedTitle}
			subtitle={resolvedSubtitle}
			icon="eye"
			iconBg="bg-primary-50"
			iconColor={Colors.primary}
			textColor="text-foreground"
			onPress={onPress}
			isLast={isLast}
		/>
	);
}

export type ItemActionSheetEditItemProps = {
	entityName?: string;
	title?: string;
	subtitle?: string;
	onPress: () => void;
	isLast?: boolean;
};

export function ItemActionSheetEditItem({
	entityName,
	title,
	subtitle,
	onPress,
	isLast = false,
}: ItemActionSheetEditItemProps) {
	const resolvedTitle = title ?? (entityName ? `Edit ${entityName}` : "Edit");
	const resolvedSubtitle = subtitle ?? "Ubah data atau pengaturan lainnya";

	return (
		<ItemActionSheetRow
			title={resolvedTitle}
			subtitle={resolvedSubtitle}
			icon="edit-3"
			iconBg="bg-primary-50"
			iconColor={Colors.primary}
			textColor="text-foreground"
			onPress={onPress}
			isLast={isLast}
		/>
	);
}

export type ItemActionSheetDeleteItemProps = {
	entityName?: string;
	title?: string;
	subtitle?: string;
	onPress: () => void;
	isLast?: boolean;
};

export function ItemActionSheetDeleteItem({
	entityName,
	title,
	subtitle,
	onPress,
	isLast = true,
}: ItemActionSheetDeleteItemProps) {
	const resolvedTitle = title ?? (entityName ? `Hapus ${entityName}` : "Hapus");
	const resolvedSubtitle =
		subtitle ??
		(entityName
			? `${entityName} akan dihapus permanen`
			: "Data akan dihapus permanen");

	return (
		<ItemActionSheetRow
			title={resolvedTitle}
			subtitle={resolvedSubtitle}
			icon="trash-2"
			iconBg="bg-error-50"
			iconColor={Colors.red[500]}
			textColor="text-destructive"
			hapticType="warning"
			onPress={onPress}
			isLast={isLast}
		/>
	);
}

export type ItemActionSheetProps = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	entityName?: string;
	onViewDetail?: () => void;
	detailTitle?: string;
	detailSubtitle?: string;
	onEdit?: () => void;
	editTitle?: string;
	editSubtitle?: string;
	onDelete?: () => void;
	deleteTitle?: string;
	deleteSubtitle?: string;
	actions?: ItemActionSheetAction[];
	children?: React.ReactNode;
};

export default function ItemActionSheet({
	isOpen,
	onClose,
	title,
	entityName,
	onViewDetail,
	detailTitle,
	detailSubtitle,
	onEdit,
	editTitle,
	editSubtitle,
	onDelete,
	deleteTitle,
	deleteSubtitle,
	actions,
	children,
}: ItemActionSheetProps) {
	const defaultActions: ItemActionSheetAction[] = [];

	if (onViewDetail) {
		defaultActions.push({
			id: "detail",
			title: detailTitle ?? (entityName ? `Detail ${entityName}` : "Detail"),
			subtitle:
				detailSubtitle ??
				(entityName
					? `Info lebih lanjut tentang ${entityName.toLowerCase()}`
					: "Info lebih lanjut"),
			icon: "eye",
			iconBg: "bg-primary-50",
			iconColor: Colors.primary,
			textColor: "text-foreground",
			onPress: () => {
				onClose();
				onViewDetail();
			},
		});
	}

	if (onEdit) {
		defaultActions.push({
			id: "edit",
			title: editTitle ?? (entityName ? `Edit ${entityName}` : "Edit"),
			subtitle: editSubtitle ?? "Ubah data atau pengaturan lainnya",
			icon: "edit-3",
			iconBg: "bg-primary-50",
			iconColor: Colors.primary,
			textColor: "text-foreground",
			onPress: () => {
				onClose();
				onEdit();
			},
		});
	}

	if (onDelete) {
		defaultActions.push({
			id: "delete",
			title: deleteTitle ?? (entityName ? `Hapus ${entityName}` : "Hapus"),
			subtitle:
				deleteSubtitle ??
				(entityName
					? `${entityName} akan dihapus permanen`
					: "Data akan dihapus permanen"),
			icon: "trash-2",
			iconBg: "bg-error-50",
			iconColor: Colors.red[500],
			textColor: "text-destructive",
			onPress: () => {
				onClose();
				onDelete();
			},
		});
	}

	const displayActions = actions ?? defaultActions;

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="bg-surface pb-8 pt-2 px-0">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				{/* Header with Batal on left and centered title */}
				<View className="w-full flex-row items-center justify-between border-b border-outline-100 px-4 py-3">
					<Pressable onPress={onClose} hitSlop={8}>
						<Text w="medium" size="normal" className="text-primary-500">
							Batal
						</Text>
					</Pressable>

					{title ? (
						<Text w="semibold" numberOfLines={1} className="max-w-[70%]">
							{title}
						</Text>
					) : (
						<View />
					)}

					{/* Spacer to keep title centered */}
					<View className="w-10" />
				</View>

				{/* List of actions */}
				<View className="w-full pt-2">
					{children
						? children
						: displayActions.map((item, index) => (
								<ItemActionSheetRow
									key={item.id}
									title={item.title}
									subtitle={item.subtitle}
									icon={item.icon}
									iconBg={item.iconBg}
									iconColor={item.iconColor}
									textColor={item.textColor}
									right={item.right}
									hapticType={item.id === "delete" ? "warning" : "light"}
									onPress={item.onPress}
									isLast={index === displayActions.length - 1}
								/>
							))}
				</View>
			</ActionsheetContent>
		</Actionsheet>
	);
}
