import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";

export type CatalogDetailSectionProps = {
	title: string;
	children: React.ReactNode;
	className?: string;
	cardClassName?: string;
	noCard?: boolean;
};

export default function CatalogDetailSection({
	title,
	children,
	className,
	cardClassName,
	noCard = false,
}: CatalogDetailSectionProps) {
	return (
		<View className={cn("gap-2", className)}>
			<Text size="normal" w="medium" className="px-1 text-muted">
				{title}
			</Text>
			{noCard ? (
				children
			) : (
				<Card className={cn("rounded-2xl px-4 py-1", cardClassName)}>
					{children}
				</Card>
			)}
		</View>
	);
}
