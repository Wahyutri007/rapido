import Entypo from "@expo/vector-icons/Entypo";
import React from "react";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn, formatRp } from "@/lib/utils";
import type { TransactionGroup, TransactionItem } from "./types";

export type TransactionGroupCardProps = {
	group: TransactionGroup;
	onItemPress?: (item: TransactionItem) => void;
	onItemActionPress?: (item: TransactionItem) => void;
	className?: string;
};

export default function TransactionGroupCard({
	group,
	onItemPress,
	onItemActionPress,
	className,
}: TransactionGroupCardProps) {
	return (
		<View
			className={cn(
				"overflow-hidden rounded-2xl border border-surface-muted bg-white shadow-main",
				className,
			)}
		>
			{/* Group Header */}
			<View className="flex-row items-center justify-between bg-primary-500/10 px-4 py-3">
				<Text className="text-primary-500" size="normal" w="semibold">
					{group.date}
				</Text>
				<Text className="text-zinc-500" size="small" w="medium">
					{group.totalTransactions} transaksi • {formatRp(group.totalAmount)}
				</Text>
			</View>

			{/* Group Items */}
			<View>
				{group.items.map((item, index) => {
					const isLast = index === group.items.length - 1;
					const isSuccess = item.status === "success";
					const isRefund = item.status === "refund";

					return (
						<Pressable
							key={`${item.id}-${index}`}
							onPress={() => onItemPress?.(item)}
							className={cn(
								"px-4 py-3 active:bg-zinc-50",
								!isLast && "border-b border-border-muted",
							)}
						>
							{/* Row 1: ID & Action Dots */}
							<View className="flex-row items-center justify-between">
								<Text size="normal" w="bold">
									{item.id}
								</Text>
								<Pressable
									hitSlop={8}
									onPress={() => onItemActionPress?.(item)}
									className="size-7 items-center justify-center rounded-full active:bg-zinc-100"
								>
									<Entypo
										name="dots-three-horizontal"
										size={16}
										color={Colors.zinc[400]}
									/>
								</Pressable>
							</View>

							{/* Row 2: Customer/Channel & Amount */}
							<View className="mt-0.5 flex-row items-center justify-between">
								<Text size="small" className="text-zinc-500">
									{item.customer} • {item.channel}
								</Text>
								<Text size="normal" w="bold">
									{formatRp(item.amount)}
								</Text>
							</View>

							{/* Row 3: Time/Cashier & Status Badge */}
							<View className="mt-1 flex-row items-center justify-between">
								<Text size="small" className="text-zinc-400">
									{item.time} • {item.cashier}
								</Text>
								<View
									className={cn(
										"rounded-full px-2.5 py-0.5",
										isSuccess && "bg-emerald-50",
										isRefund && "bg-red-50",
										!isSuccess && !isRefund && "bg-zinc-100",
									)}
								>
									<Text
										size="small"
										w="medium"
										className={cn(
											"text-xs",
											isSuccess && "text-success",
											isRefund && "text-red-500",
											!isSuccess && !isRefund && "text-zinc-500",
										)}
									>
										{item.statusLabel}
									</Text>
								</View>
							</View>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
