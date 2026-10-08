import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

export type CatalogDetailNoticeProps = {
	title?: string;
	message: string;
	icon?: keyof typeof Feather.glyphMap;
	className?: string;
};

export default function CatalogDetailNotice({
	title,
	message,
	icon = "info",
	className,
}: CatalogDetailNoticeProps) {
	return (
		<View className={cn("gap-2", className)}>
			{title && (
				<Text size="normal" w="medium" className="px-1 text-muted">
					{title}
				</Text>
			)}
			<View className="flex-row items-center gap-2.5 rounded-xl bg-primary-100 p-3.5">
				<Feather name={icon} size={18} color={Colors.primary} />
				<Text size="small" className="flex-1 text-primary">
					{message}
				</Text>
			</View>
		</View>
	);
}
