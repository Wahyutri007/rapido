import Feather from "@expo/vector-icons/Feather";
import type React from "react";
import { Pressable, View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

export type CatalogItemCardProps = {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	description?: React.ReactNode;
	icon?: React.ReactNode;
	iconContainerClassName?: string;
	leading?: React.ReactNode;
	badge?: React.ReactNode;
	right?: React.ReactNode;
	onActionPress?: () => void;
	onPress?: () => void;
	className?: string;
	density?: "default" | "compact";
	children?: React.ReactNode;
};

export default function CatalogItemCard({
	title,
	subtitle,
	description,
	icon,
	iconContainerClassName,
	leading,
	badge,
	right,
	onActionPress,
	onPress,
	className,
	density = "default",
	children,
}: CatalogItemCardProps) {
	const content = (
		<Card
			density={density}
			className={cn(
				"flex-row items-center justify-between",
				density === "default" && "p-3.5",
				className,
			)}
		>
			<View className="flex-1 flex-row items-center gap-3">
				{leading ? (
					leading
				) : icon ? (
					<View
						className={cn(
							"size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50",
							iconContainerClassName,
						)}
					>
						{icon}
					</View>
				) : null}

				<View
					className={cn(
						"flex-1 justify-center",
						density === "compact" ? "gap-1" : "gap-0.5",
					)}
				>
					<View className="flex-row items-center gap-2">
						{typeof title === "string" ? (
							<Text w="semibold" size="normal" className="text-foreground">
								{title}
							</Text>
						) : (
							title
						)}
						{badge}
					</View>

					{subtitle ? (
						typeof subtitle === "string" ? (
							<Text size="small" className="text-muted">
								{subtitle}
							</Text>
						) : (
							subtitle
						)
					) : null}

					{description ? (
						typeof description === "string" ? (
							<Text size="small" className="text-muted">
								{description}
							</Text>
						) : (
							description
						)
					) : null}

					{children}
				</View>
			</View>

			{right ? (
				right
			) : onActionPress ? (
				<Pressable
					onPress={onActionPress}
					hitSlop={12}
					className="size-8 items-center justify-center rounded-lg active:bg-gray-100"
				>
					<Feather name="more-horizontal" size={20} color={Colors.zinc[400]} />
				</Pressable>
			) : null}
		</Card>
	);

	if (onPress) {
		return (
			<BouncyPressable onPress={onPress} activeScale={0.98} hapticType="light">
				{content}
			</BouncyPressable>
		);
	}

	return content;
}
