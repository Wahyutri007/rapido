import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";

export type CatalogDetailHeroCardProps = {
	icon: React.ReactNode;
	title: string;
	badge?: string | React.ReactNode;
	description?: string;
	className?: string;
};

export default function CatalogDetailHeroCard({
	icon,
	title,
	badge,
	description,
	className,
}: CatalogDetailHeroCardProps) {
	return (
		<Card className={cn("flex-row items-center gap-3.5 rounded-xl p-4", className)}>
			<View className="size-14 items-center justify-center rounded-lg bg-primary-100">
				{icon}
			</View>
			<View className="flex-1 justify-center gap-1">
				<View className="flex-row items-center gap-2">
					<Text w="medium" className="text-foreground">
						{title}
					</Text>
					{badge ? (
						typeof badge === "string" ? (
							<View className="rounded-full bg-primary-50 px-2 py-0.5">
								<Text w="semibold" size="small" className="text-primary">
									{badge}
								</Text>
							</View>
						) : (
							badge
						)
					) : null}
				</View>
				{description ? (
					<Text size="small" className="text-muted">
						{description}
					</Text>
				) : null}
			</View>
		</Card>
	);
}
