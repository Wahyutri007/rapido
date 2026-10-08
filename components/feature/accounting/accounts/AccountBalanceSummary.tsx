import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { View } from "react-native";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { formatRp } from "@/lib/utils";

type AccountBalanceSummaryProps = {
	totalDebit: number;
	totalCredit: number;
	difference: number;
};

export default function AccountBalanceSummary({
	totalDebit,
	totalCredit,
	difference,
}: AccountBalanceSummaryProps) {
	return (
		<Card className="flex-row items-center gap-3.5">
			{/* Calculator Icon */}
			<View className="size-11 items-center justify-center rounded-xl bg-blue-50">
				<Ionicons name="calculator" size={22} color={Colors.primary} />
			</View>

			{/* Info container */}
			<View className="flex-1 gap-1">
				<Text w="semibold" className="text-sm text-primary-500">
					Ringkasan Total
				</Text>

				<View className="flex-row items-center justify-between">
					{/* Total Debit */}
					<View className="flex-1">
						<Text className="text-[11px] text-zinc-600">Total Debit</Text>
						<Text w="semibold" className="text-xs text-primary-500">
							{formatRp(totalDebit).replace(/\s/g, "")}
						</Text>
					</View>

					{/* Total Kredit */}
					<View className="flex-1">
						<Text className="text-[11px] text-zinc-600">Total Kredit</Text>
						<Text w="semibold" className="text-xs text-primary-500">
							{formatRp(totalCredit).replace(/\s/g, "")}
						</Text>
					</View>

					{/* Divider */}
					<View className="h-6 w-[1px] bg-gray-200 mr-2" />

					{/* Selisih */}
					<View className="flex-1">
						<Text className="text-[11px] text-zinc-600">Selisih</Text>
						<Text w="semibold" className="text-xs text-primary-500">
							{formatRp(difference).replace(/\s/g, "")}
						</Text>
					</View>
				</View>
			</View>
		</Card>
	);
}
