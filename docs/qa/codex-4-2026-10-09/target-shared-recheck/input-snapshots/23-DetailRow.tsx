import Feather from "@expo/vector-icons/Feather";
import type React from "react";
import { View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

export type DetailRowProps = {
	label: string;
	value?: string | number | null;
	icon?: keyof typeof Feather.glyphMap | React.ReactNode;
	isLast?: boolean;
	children?: React.ReactNode;
	className?: string;
};

export default function DetailRow({
	label,
	value,
	icon,
	isLast = false,
	children,
	className,
}: DetailRowProps) {
	return (
		<View
			className={cn(
				"flex-row items-center justify-between py-3",
				!isLast && "border-b border-gray-100",
				className,
			)}
		>
			<View className="flex-row items-center gap-3">
				{icon && (
					<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
						{typeof icon === "string" ? (
							<Feather name={icon as any} size={16} color={Colors.primary} />
						) : (
							icon
						)}
					</View>
				)}
				<Text w="medium" className="text-sm text-foreground">
					{label}
				</Text>
			</View>

			{children ? (
				children
			) : (
				<Text className="max-w-[50%] text-right text-sm text-muted">
					{value ?? "-"}
				</Text>
			)}
		</View>
	);
}
