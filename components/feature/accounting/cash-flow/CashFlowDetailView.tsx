import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Text from "@/components/common/Text";
import { CardListCollapsible } from "@/components/custom/CardList";
import { Colors } from "@/constants/Colors";
import {
	CASH_FLOW_DETAIL_DATA,
	type CashFlowTab,
} from "@/constants/data/accounting/cash-flow";
import { cn, tw } from "@/lib/utils";

type CashFlowDetailViewProps = {
	type: CashFlowTab;
};

export default function CashFlowDetailView({ type }: CashFlowDetailViewProps) {
	const sections = CASH_FLOW_DETAIL_DATA[type] || [];

	return (
		<View className="flex-1 bg-gray-50">
			<AnimatedWrapper
				showScrollToTopFab
				fabBottomOffset={tw(6)}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				{sections.map((section) => (
					<CardListCollapsible
						key={section.id}
						title={section.title}
						subtitle={section.subtitle}
						defaultExpanded={true}
						icon={
							<View className="size-8 items-center justify-center rounded-lg bg-primary-200">
								<Feather
									name={section.icon}
									size={tw(4)}
									color={Colors.primary}
								/>
							</View>
						}
					>
						{section.rows.map((row, idx) => (
							<View
								key={row.id}
								className={cn(
									"flex-row items-center justify-between pb-3 pt-1",
									idx < section.rows.length - 1 &&
										"border-b border-zinc-100",
								)}
							>
								{/* Col 1: Account Code */}
								<Text size="small" className="w-[96px] shrink-0 text-zinc-400">
									{row.code}
								</Text>

								{/* Col 2: Account Name with spacing on left and right */}
								<View className="flex-1 px-3.5">
									<Text size="small" className="text-zinc-800">
										{row.name}
									</Text>
								</View>

								{/* Col 3: Amount */}
								<View className="shrink-0 min-w-[95px] items-end justify-center">
									<Text
										size="small"
										w="medium"
										className={cn(
											"text-right",
											row.variant === "positive"
												? "text-success"
												: row.variant === "negative"
													? "text-red-500"
													: "text-zinc-600",
										)}
									>
										{row.amount}
									</Text>
								</View>
							</View>
						))}
					</CardListCollapsible>
				))}
			</AnimatedWrapper>
		</View>
	);
}
