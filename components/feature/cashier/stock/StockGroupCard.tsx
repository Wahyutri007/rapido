import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { CASHIER_STOCK_EMPTY_LABELS } from "@/constants/data/cashier-stock-preview";
import { formatCashierStock } from "@/lib/cashier/stock";
import { cn } from "@/lib/utils";
import type {
	CashierStockFilter,
	CashierStockGroup,
} from "@/types/ui/cashier/stock";

export default function StockGroupCard({
	group,
	referenceStatus = "all",
}: {
	group: CashierStockGroup;
	referenceStatus?: CashierStockFilter["status"];
}) {
	return (
		<Card
			appearance="figma"
			density="flush"
			className="overflow-hidden"
			style={group.category === "Baju" ? { marginRight: 1 } : undefined}
		>
			<View className="flex-row justify-between gap-4 bg-primary/5 p-4">
				<Text
					size="normal"
					w="semibold"
					className="!text-primary"
					style={{ lineHeight: 18 }}
				>
					{group.category}
				</Text>
				<Text
					size="normal"
					w="semibold"
					className="!text-primary"
					style={{ lineHeight: 18 }}
				>
					Stok
				</Text>
			</View>
			{group.rows.length > 0 && (
				<View className="gap-3 p-3">
					{group.rows.map((row, index) => {
						const displayName =
							referenceStatus === "empty"
								? (CASHIER_STOCK_EMPTY_LABELS[row.id] ?? row.name)
								: row.name;
						return (
							<React.Fragment key={row.id}>
								{index > 0 && (
									<View style={{ height: 0 }}>
										<Image
											source={
												group.category === "Baju"
													? require("@/assets/images/cashier/stock/divider.svg")
													: require("@/assets/images/cashier/stock/divider-wide.svg")
											}
											style={{
												position: "absolute",
												top: -1,
												width: "100%",
												height: 1,
											}}
											contentFit="fill"
										/>
									</View>
								)}
								<View
									className="flex-row items-center justify-between gap-3"
									accessibilityLabel={`${displayName}, ${row.variant ?? ""}, ${formatCashierStock(row)}`}
								>
									<View className="min-w-0 flex-1 gap-1">
										<Text size="small" w="medium">
											{displayName}
										</Text>
										{row.variant && (
											<Text size="small" className="!text-muted">
												{row.variant}
											</Text>
										)}
									</View>
									<Text
										size="small"
										w="medium"
										className={cn(
											"shrink-0",
											row.status === "empty"
												? "!text-destructive"
												: row.status === "low"
													? "!text-muted"
													: row.variant && group.category !== "Titipan"
														? "!text-subtle"
														: "text-foreground",
										)}
									>
										{formatCashierStock(row)}
									</Text>
								</View>
							</React.Fragment>
						);
					})}
				</View>
			)}
		</Card>
	);
}
