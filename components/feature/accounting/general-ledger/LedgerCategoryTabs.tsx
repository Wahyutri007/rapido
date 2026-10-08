import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Text from "@/components/common/Text";
import { LEDGER_CATEGORIES } from "@/constants/data/accounting/general-ledger";
import { cn } from "@/lib/utils";
import type { LedgerCategory } from "@/types/ui/accounting/ledger";

type LedgerCategoryTabsProps = {
	selectedCategory: LedgerCategory;
	onSelectCategory: (category: LedgerCategory) => void;
};

export default function LedgerCategoryTabs({
	selectedCategory,
	onSelectCategory,
}: LedgerCategoryTabsProps) {
	return (
		<View className="overflow-hidden rounded-lg border border-border-muted bg-white shadow-main">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				{LEDGER_CATEGORIES.map((category, index) => {
					const isActive = selectedCategory === category;
					const isNextActive =
						index + 1 < LEDGER_CATEGORIES.length &&
						LEDGER_CATEGORIES[index + 1] === selectedCategory;

					return (
						<React.Fragment key={category}>
							<Pressable
								onPress={() => onSelectCategory(category)}
								className={cn(
									"items-center justify-center px-5 py-3 transition-all active:opacity-75",
									isActive ? "rounded-lg bg-primary" : "bg-transparent",
								)}
							>
								<Text
									size="normal"
									w={isActive ? "bold" : "medium"}
									className={isActive ? "text-white" : "text-muted"}
								>
									{category}
								</Text>
							</Pressable>

							{/* Vertical divider between inactive items */}
							{!isActive &&
								!isNextActive &&
								index < LEDGER_CATEGORIES.length - 1 && (
									<View className="h-5 w-px self-center bg-border-muted" />
								)}
						</React.Fragment>
					);
				})}
			</ScrollView>
		</View>
	);
}
