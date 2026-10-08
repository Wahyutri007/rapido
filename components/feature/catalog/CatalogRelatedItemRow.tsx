import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

export type CatalogRelatedItemRowProps = {
	icon: React.ReactNode | keyof typeof Feather.glyphMap;
	title: string;
	subtitle?: string;
	badgeText?: string;
	isLast?: boolean;
	onPress?: () => void;
	className?: string;
};

export default function CatalogRelatedItemRow({
	icon,
	title,
	subtitle,
	badgeText = "Aktif",
	isLast = false,
	onPress,
	className,
}: CatalogRelatedItemRowProps) {
	const content = (
		<View
			className={cn(
				"flex-row items-center justify-between py-3.5",
				!isLast && "border-b border-gray-100",
				className,
			)}
		>
			<View className="flex-1 flex-row items-center gap-3 pr-2">
				<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
					{typeof icon === "string" ? (
						<Feather
							name={icon as keyof typeof Feather.glyphMap}
							size={17}
							color={Colors.primary}
						/>
					) : (
						icon
					)}
				</View>
				<View className="flex-1 justify-center">
					<Text w="medium" className="text-sm text-foreground" numberOfLines={1}>
						{title}
					</Text>
					{subtitle ? (
						<Text size="small" className="text-muted mt-0.5" numberOfLines={1}>
							{subtitle}
						</Text>
					) : null}
				</View>
			</View>

			{badgeText ? (
				<View className="rounded-lg bg-green-50 px-2.5 py-1">
					<Text className="text-xs font-semibold text-green-600">
						{badgeText}
					</Text>
				</View>
			) : null}
		</View>
	);

	if (onPress) {
		return <Pressable onPress={onPress}>{content}</Pressable>;
	}

	return content;
}
