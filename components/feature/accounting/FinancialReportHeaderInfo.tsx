import React from "react";
import { View } from "react-native";
import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";

export type FinancialReportHeaderInfoProps = {
	businessName?: string;
	reportTitle: string;
	period: string;
	className?: string;
};

export default function FinancialReportHeaderInfo({
	businessName = "Recinto Portuario",
	reportTitle,
	period,
	className,
}: FinancialReportHeaderInfoProps) {
	return (
		<View className={cn("items-center justify-center py-2 gap-1", className)}>
			<Text size="normal" w="bold" className=" text-center">
				{businessName}
			</Text>
			<Text size="small" className="text-zinc-600 text-center">
				{reportTitle}
			</Text>
			<Text size="small" className="text-zinc-400 text-center">
				{period}
			</Text>
		</View>
	);
}
