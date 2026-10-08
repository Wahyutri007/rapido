import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { Pressable, View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn, formatRp } from "@/lib/utils";
import type { GroupedIncomes, Income } from "@/types/ui/accounting/income";

type IncomeCardProps = {
	group: GroupedIncomes;
	onSelectIncome: (income: Income) => void;
	onSelectInvoice: (income: Income) => void;
	onPressInfo?: (date: string) => void;
};

export default function IncomeCard({
	group,
	onSelectIncome,
	onSelectInvoice,
	onPressInfo,
}: IncomeCardProps) {
	return (
		<View className="gap-2.5">
			{/* Date Header */}
			<View className="flex-row items-center justify-between px-1">
				<Text w="medium" className="text-sm text-zinc-600">
					{group.displayDate}
				</Text>
				<Pressable onPress={() => onPressInfo?.(group.displayDate)} hitSlop={8}>
					<Feather name="info" size={18} color={Colors.primary} />
				</Pressable>
			</View>

			{/* Transactions Card */}
			<Card className="rounded-2xl border border-gray-100 bg-white p-4">
				{group.items.map((item, index) => {
					const isInvoice = item.type === "invoice";
					const formattedAmount = `+${formatRp(item.amount).replace(/\s/g, "")}`;

					return (
						<React.Fragment key={item.id}>
							{index > 0 && (
								<View className="w-full py-4" style={{ paddingVertical: 18 }}>
									<View
										className="h-px w-full bg-gray-200"
										style={{ height: 1, backgroundColor: "#E5E7EB" }}
									/>
								</View>
							)}

							<Pressable
								onPress={() => {
									if (isInvoice) {
										onSelectInvoice(item);
									} else {
										onSelectIncome(item);
									}
								}}
								className="active:opacity-70"
							>
								{/* Item Content */}
								<View className="gap-2">
									{/* Reference Code Badge */}
									<View className="self-start rounded-xl bg-blue-50 px-3 py-1">
										<Text w="medium" className="text-xs text-primary-500">
											{item.referenceNumber}
										</Text>
									</View>

									{/* Details Row: Metadata on Left, Amount on Right */}
									<View className="flex-row items-start justify-between">
										{/* Aligned Key-Values */}
										<View className="gap-1">
											{isInvoice ? (
												<View className="flex-row">
													<Text className="w-24 text-xs text-zinc-500">
														Jumlah Item
													</Text>
													<Text className="mr-2 text-xs text-zinc-500">:</Text>
													<Text w="medium" className="text-xs text-zinc-800">
														{item.itemCount ??
															item.receipt?.groups?.reduce(
																(acc, g) => acc + g.items.length,
																0,
															) ??
															1}
													</Text>
												</View>
											) : (
												<View className="flex-row">
													<Text className="w-24 text-xs text-zinc-500">
														Sumber Dana
													</Text>
													<Text className="mr-2 text-xs text-zinc-500">:</Text>
													<Text w="medium" className="text-xs text-zinc-800">
														{item.fundingSource ?? "Kas"}
													</Text>
												</View>
											)}

											<View className="flex-row">
												<Text className="w-24 text-xs text-zinc-500">
													Dibuat oleh
												</Text>
												<Text className="mr-2 text-xs text-zinc-500">:</Text>
												<Text w="medium" className="text-xs text-zinc-800">
													{item.createdBy}
												</Text>
											</View>

											<View className="flex-row">
												<Text className="w-24 text-xs text-zinc-500">Jam</Text>
												<Text className="mr-2 text-xs text-zinc-500">:</Text>
												<Text w="medium" className="text-xs text-zinc-800">
													{item.time}
												</Text>
											</View>
										</View>

										{/* Amount */}
										<Text
											w="bold"
											className={cn("text-sm pt-1", "text-emerald-500")}
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
