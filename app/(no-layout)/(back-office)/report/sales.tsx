import React from "react";
import { View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Text from "@/components/common/Text";
import {
	CardListFilterSheet,
	CardListSections,
	useCardListFilter,
} from "@/components/custom/CardList";
import {
	FilterRow,
	getSalesDetailSections,
	getSalesSummarySections,
	ReportActionButton,
} from "@/components/feature/reports";
import { tw } from "@/lib/utils";

export default function SalesProfitReportScreen() {
	const [showActions, setShowActions] = React.useState(false);

	const summarySections = getSalesSummarySections();
	const detailSections = getSalesDetailSections();
	const allSections = [...summarySections, ...detailSections];

	const {
		open: openSectionFilter,
		filterSections,
		filterSheetProps,
	} = useCardListFilter(allSections);

	const visibleSummarySections = filterSections(summarySections);
	const visibleDetailSections = filterSections(detailSections);

	return (
		<View className="flex-1">
			<AnimatedWrapper
				hasBottomBar
				fabBottomOffset={tw(24)}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				<FilterRow onFilterPress={openSectionFilter} />

				{visibleSummarySections.length > 0 && (
					<View className="gap-3">
						<Text size="small" w="semibold" className="text-zinc-500">
							Ringkasan Penjualan
						</Text>
						<CardListSections sections={visibleSummarySections} />
					</View>
				)}

				{visibleDetailSections.length > 0 && (
					<View className="gap-3">
						<Text size="small" w="semibold" className="text-zinc-500">
							Rincian Penjualan
						</Text>
						<CardListSections sections={visibleDetailSections} />
					</View>
				)}
			</AnimatedWrapper>

			<ReportActionButton isOpen={showActions} onOpenChange={setShowActions} />

			<CardListFilterSheet {...filterSheetProps} />
		</View>
	);
}
