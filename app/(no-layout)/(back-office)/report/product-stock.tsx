import React from "react";
import { View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import {
	CardListFilterSheet,
	CardListSections,
	useCardListFilter,
} from "@/components/custom/CardList";
import {
	FilterRow,
	ReportActionButton,
	getProductStockReportSections,
} from "@/components/feature/reports";
import { tw } from "@/lib/utils";

export default function ProductStockReportScreen() {
	const [showActions, setShowActions] = React.useState(false);
	const sections = React.useMemo(() => getProductStockReportSections(), []);

	const {
		open: openSectionFilter,
		filterSections,
		filterSheetProps,
	} = useCardListFilter(sections);

	const visibleSections = React.useMemo(
		() => filterSections(sections),
		[filterSections, sections],
	);

	return (
		<View className="flex-1">
			<AnimatedWrapper
				hasBottomBar
				fabBottomOffset={tw(24)}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				<FilterRow onFilterPress={openSectionFilter} />
				<CardListSections sections={visibleSections} />
			</AnimatedWrapper>

			<ReportActionButton isOpen={showActions} onOpenChange={setShowActions} />

			<CardListFilterSheet {...filterSheetProps} />
		</View>
	);
}
