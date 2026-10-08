import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn, formatRp } from "@/lib/utils";
import type { Expense, GroupedExpenses } from "@/types/ui/accounting/expense";

type ExpenseCardProps = {
	group: GroupedExpenses;
	onSelectExpense: (expense: Expense) => void;
	onPressInfo?: (date: string) => void;
};

export default function ExpenseCard({
	group,
	onSelectExpense,
	onPressInfo,
}: ExpenseCardProps) {
	return (
		<View className="gap-2.5">
			{/* Date Header */}
			<View className="flex-row items-center justify-between px-1">
				<Text size="normal" w="medium" className="text-muted">
					{group.displayDate}
				</Text>
				<Pressable
					onPress={() => onPressInfo?.(group.displayDate)}
					hitSlop={8}
				>
					<Feather name="info" size={18} color={Colors.primary} />
				</Pressable>
			</View>

			{/* Transactions Card */}
			<Card className="gap-4">
				{group.items.map((item, index) => {
					const isExpense = item.type === "expense";
					const formattedAmount = `${isExpense ? "-" : "+"}${formatRp(item.amount).replace(/\s/g, "")}`;

					return (
						<React.Fragment key={item.id}>
							{index > 0 && <View className="h-px w-full bg-border-muted" />}

							<Pressable
								onPress={() => onSelectExpense(item)}
								className="active:opacity-70"
							>
								{/* Item Content */}
								<View className="gap-2">
									{/* Reference Code Badge */}
									<View className="self-start rounded-lg bg-primary-50 px-2.5 py-1">
										<Text
											size="small"
											w="medium"
											className="text-primary"
										>
											{item.referenceNumber}
										</Text>
									</View>

									{/* Details Row: Metadata on Left, Amount on Right */}
									<View className="flex-row items-start justify-between">
										{/* Aligned Key-Values */}
										<View className="gap-1">
											<View className="flex-row items-center">
												<Text size="small" className="w-24 text-muted">
													Sumber Dana
												</Text>
												<Text size="small" className="mr-2 text-muted">:</Text>
												<Text size="small" w="medium">
													{item.fundingSource}
												</Text>
											</View>

											<View className="flex-row items-center">
												<Text size="small" className="w-24 text-muted">
													Dibuat oleh
												</Text>
												<Text size="small" className="mr-2 text-muted">:</Text>
												<Text size="small" w="medium">
													{item.createdBy}
												</Text>
											</View>

											<View className="flex-row items-center">
												<Text size="small" className="w-24 text-muted">
													Jam
												</Text>
												<Text size="small" className="mr-2 text-muted">:</Text>
												<Text size="small" w="medium">
													{item.time}
												</Text>
											</View>
										</View>

										{/* Amount */}
										<Text
											size="normal"
											w="bold"
											className={cn(
												"pt-0.5",
												isExpense ? "text-destructive" : "text-success",
											)}
										>
											{formattedAmount}
										</Text>
									</View>
								</View>
							</Pressable>
						</React.Fragment>
					);
				})}
			</Card>
		</View>
	);
}
