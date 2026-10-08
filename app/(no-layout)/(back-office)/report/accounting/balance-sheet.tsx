import React, { useMemo, useState } from "react";
import { View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Text from "@/components/common/Text";
import { CardListSections } from "@/components/custom/CardList";
import FinancialReportHeaderInfo from "@/components/feature/accounting/FinancialReportHeaderInfo";
import ReportActionButton from "@/components/feature/reports/ReportActionButton";
import {
	FINANCIAL_REPORTS_META,
	getBalanceSheetSections,
} from "@/constants/data/accounting/financial-reports";
import { tw } from "@/lib/utils";

export default function BalanceSheetReportScreen() {
	const [showActions, setShowActions] = useState(false);
	const sections = useMemo(() => getBalanceSheetSections(), []);
	const meta = FINANCIAL_REPORTS_META.balanceSheet;

	return (
		<View className="flex-1">
			<AnimatedWrapper
				hasBottomBar
				showScrollToTopFab
				fabBottomOffset={tw(24)}
				contentContainerStyle={{ padding: 16, gap: 16 }}
			>
				<FinancialReportHeaderInfo
					reportTitle={meta.title}
					period={meta.period}
				/>

				<CardListSections sections={sections} />

				{/* Total Kewajiban & Ekuitas Banner */}
				<View className="flex-row items-center justify-between rounded-xl border border-primary-500/20 bg-primary-500/10 px-4 py-3.5">
					<Text size="small" w="medium" className="text-primary-600">
						Total Kewajiban & Ekuitas
					</Text>
					<Text size="small" w="bold" className="text-primary-600">
						{meta.totalKewajibanEkuitas}
					</Text>
				</View>

				{/* Selisih Laporan Posisi Keuangan Alert Banner */}
				<View className="flex-row items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
					<Text size="small" w="medium" className="text-red-500">
						Selisih Laporan Posisi Keuangan
					</Text>
					<Text size="small" w="medium" className="text-red-500">
						{meta.selisih}
					</Text>
				</View>
			</AnimatedWrapper>

			<ReportActionButton isOpen={showActions} onOpenChange={setShowActions} />
		</View>
	);
}
