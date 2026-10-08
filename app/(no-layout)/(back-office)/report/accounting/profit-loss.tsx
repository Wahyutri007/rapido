import React, { useMemo, useState } from "react";
import { View } from "react-native";
import AnimatedWrapper from "@/components/common/AnimatedWrapper";
import Text from "@/components/common/Text";
import { CardListSections } from "@/components/custom/CardList";
import FinancialReportHeaderInfo from "@/components/feature/accounting/FinancialReportHeaderInfo";
import ReportActionButton from "@/components/feature/reports/ReportActionButton";
import {
	FINANCIAL_REPORTS_META,
	getProfitLossSections,
} from "@/constants/data/accounting/financial-reports";
import { tw } from "@/lib/utils";
import Card from "@/components/common/Card"

function ProfitLossBanner({ label, value }: { label: string; value: string }) {
	return (
		<Card className="flex-row items-center justify-between bg-primary-100">
			<Text size="small" w="medium" className="text-primary-600">
				{label}
			</Text>
			<Text size="small" w="bold" className="text-primary-600">
				{value}
			</Text>
		</Card>
	);
}

export default function ProfitLossReportScreen() {
	const [showActions, setShowActions] = useState(false);
	const sections = useMemo(() => getProfitLossSections(), []);
	const meta = FINANCIAL_REPORTS_META.profitLoss;

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

				{/* 1. Penjualan, HPP, Beban Pembelian */}
				<CardListSections
					sections={[
						sections.section1Penjualan,
						sections.section2Hpp,
						sections.section3BebanPembelian,
					]}
				/>

				{/* Laba Kotor Banner */}
				<ProfitLossBanner label="Laba Kotor" value={meta.labaKotor} />

				{/* 2. Beban Administrasi, Pendapatan Lainnya, Beban Non Operasional */}
				<CardListSections
					sections={[
						sections.section4BebanAdmin,
						sections.section5PendapatanLain,
						sections.section6BebanNonOperasional,
					]}
				/>

				{/* Laba Bersih Sebelum Pajak Banner */}
				<ProfitLossBanner
					label="Laba Bersih Sebelum Pajak"
					value={meta.labaBersihSebelumPajak}
				/>

				{/* 3. Beban Pajak */}
				<CardListSections sections={[sections.section7BebanPajak]} />

				{/* Laba Bersih Setelah Pajak Banner */}
				<ProfitLossBanner
					label="Laba Bersih Setelah Pajak"
					value={meta.labaBersihSetelahPajak}
				/>
			</AnimatedWrapper>

			<ReportActionButton isOpen={showActions} onOpenChange={setShowActions} />
		</View>
	);
}
