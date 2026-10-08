import React, { useMemo, useState } from "react";
import { View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import { CardListSections } from "@/components/custom/CardList";
import FinancialReportHeaderInfo from "@/components/feature/accounting/FinancialReportHeaderInfo";
import ReportActionButton from "@/components/feature/reports/ReportActionButton";
import {
	FINANCIAL_REPORTS_META,
	getCapitalChangesSections,
} from "@/constants/data/accounting/financial-reports";

export default function CapitalChangesReportScreen() {
	const [showActions, setShowActions] = useState(false);
	const sections = useMemo(() => getCapitalChangesSections(), []);
	const meta = FINANCIAL_REPORTS_META.capitalChanges;

	return (
		<View className="flex-1">
			<AnimatedWrapper
				hasBottomBar
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				<FinancialReportHeaderInfo
					reportTitle={meta.title}
					period={meta.period}
				/>

				<CardListSections sections={sections} />
			</AnimatedWrapper>

			<ReportActionButton isOpen={showActions} onOpenChange={setShowActions} />
		</View>
	);
}
