import { Image, Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { CardListSeparator } from "@/components/custom/CardList";
import type { InventoryRanking } from "@/constants/data/inventory-summary";
import { formatRp } from "@/lib/utils";

type RankingProps = {
	title: string;
	description?: string;
	rows: InventoryRanking[];
	variant?: "bar" | "money" | "loss" | "restock" | "image";
	onViewAll?: () => void;
};

export function InventoryRankingRows({
	rows,
	variant = "bar",
}: Pick<RankingProps, "rows" | "variant">) {
	const max = Math.max(...rows.map((row) => row.value), 1);
	return (
		<View className="gap-2">
			{rows.map((row, index) => (
				<View key={row.name} className="gap-2">
					<View className="flex-row items-center gap-2">
						<View className="w-6 items-center gap-1">
							<Text size="small">{index + 1}</Text>
							<View
								className={
									index < 3
										? "h-1 w-2 rounded-full bg-success"
										: "h-1 w-2 rounded-full bg-destructive"
								}
							/>
						</View>
						{row.image && (
							<Image
								source={row.image}
								className="h-10 w-12 rounded-lg"
								style={{ width: 48, height: 40 }}
								resizeMode="cover"
							/>
						)}
						<View className="flex-1 gap-1">
							<Text size="small" w="medium">
								{row.name}
							</Text>
							{row.description && (
								<Text size="small" className="text-muted">
									{row.description}
								</Text>
							)}
						</View>
						{variant === "bar" && (
							<View className="flex-1">
								<View
									className="h-1 rounded-full bg-primary"
									style={{ width: `${(row.value / max) * 100}%` }}
								/>
							</View>
						)}
						{variant !== "image" && (
							<View
								className={
									variant === "loss"
										? "rounded-lg bg-error-bg px-2 py-1"
										: variant === "restock"
											? "rounded-lg bg-warning-bg px-2 py-1"
											: ""
								}
							>
								<Text
									size="small"
									className={
										variant === "loss"
											? "text-destructive"
											: variant === "restock"
												? "text-warning"
												: "text-foreground"
									}
								>
									{variant === "money"
										? formatRp(row.value)
										: `${row.value}${row.unit ? ` ${row.unit}` : ""}`}
								</Text>
							</View>
						)}
					</View>
					{variant !== "bar" && index < rows.length - 1 && (
						<CardListSeparator />
					)}
				</View>
			))}
		</View>
	);
}

export default function InventoryRankingCard({
	title,
	description,
	rows,
	variant,
	onViewAll,
}: RankingProps) {
	return (
		<Card className="gap-3">
			<View className="flex-row items-start justify-between gap-3">
				<View className="flex-1 gap-1">
					<Text size="normal" w="semibold">
						{title}
					</Text>
					{description && (
						<Text size="small" className="text-muted">
							{description}
						</Text>
					)}
				</View>
				{onViewAll && (
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`Lihat semua ${title.toLowerCase()}`}
						onPress={onViewAll}
						hitSlop={8}
					>
						<Text size="small" className="text-primary">
							Lihat Semua
						</Text>
					</Pressable>
				)}
			</View>
			<InventoryRankingRows rows={rows} variant={variant} />
		</Card>
	);
}
