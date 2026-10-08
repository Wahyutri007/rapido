import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import type React from "react";
import { View } from "react-native";
import Text from "@/components/common/Text";
import {
	CalculatorIcon,
	ChartIcon,
	DownloadIcon,
	DownTrendIcon,
	ListIcon,
	WalletIcon,
} from "@/components/icons";
import {
	Select,
	SelectBackdrop,
	SelectContent,
	SelectDragIndicator,
	SelectDragIndicatorWrapper,
	SelectIcon,
	SelectInput,
	SelectItem,
	SelectPortal,
	SelectTrigger,
} from "@/components/ui/select";
import { Colors } from "@/constants/Colors";
import { cn, formatRp } from "@/lib/utils";

function TrendText(props: { value: number }) {
	const { value } = props;

	return (
		<View className="flex-row items-center gap-1">
			<AntDesign
				name={value >= 0 ? "arrow-up" : "arrow-down"}
				size={12}
				color={value >= 0 ? Colors.green[500] : Colors.red[500]}
			/>
			<Text
				className={cn(value >= 0 ? "text-green-600" : "text-red-600")}
				w="medium"
				size="small"
			>
				{Math.abs(value)}%{" "}
				<Text className="text-muted" size="small">
					vs kemarin
				</Text>
			</Text>
		</View>
	);
}

type ReportItemProps = {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	trend?: number;
	iconBgClassName?: string;
};

function ReportItem({
	title,
	value,
	icon,
	trend = 12,
	iconBgClassName = "bg-blue-50",
}: ReportItemProps) {
	return (
		<View className="flex-1 rounded-2xl bg-white p-4">
			<View className="flex-row gap-2">
				{icon && (
					<View
						className={cn(
							"size-8 items-center justify-center rounded-full",
							iconBgClassName,
						)}
					>
						{icon}
					</View>
				)}
				<View className="flex-1">
					<Text className="text-xs text-muted">{title}</Text>
					<Text className="mt-2" w="bold" size="normal">
						{value}
					</Text>
				</View>
			</View>
			<View className="mt-2 flex-row items-center gap-2">
				<TrendText value={trend} />
			</View>
		</View>
	);
}

export default function ReportSummary({ title }: { title: string }) {
	return (
		<View className="rounded-[20px]">
			<View className="flex-row items-center justify-between">
				<Text className="text-gray-900" w="semibold">
					{title}
				</Text>
			</View>

			<View className="mt-4 gap-4">
				<View className="flex-row gap-4">
					<ReportItem
						title="Penjualan Kotor"
						value={formatRp(1234000)}
						trend={12.5}
						icon={<ChartIcon className="size-4 text-blue-500" />}
						iconBgClassName="bg-blue-50"
					/>
					<ReportItem
						title="Penjualan Bersih"
						value={formatRp(1000000)}
						trend={8.2}
						icon={<WalletIcon className="size-4 text-green-500" />}
						iconBgClassName="bg-green-50"
					/>
				</View>
				<View className="flex-row gap-4">
					<ReportItem
						title="Pengeluaran"
						value={formatRp(112200)}
						trend={-5.1}
						icon={<DownloadIcon className="size-4 text-orange-500" />}
						iconBgClassName="bg-orange-50"
					/>
					<ReportItem
						title="Pengeluaran"
						value={formatRp(400000)}
						trend={15.3}
						icon={<DownTrendIcon className="size-4 text-red-500" />}
						iconBgClassName="bg-red-50"
					/>
				</View>
				<View className="flex-row gap-4">
					<ReportItem
						title="Jumlah Transaksi"
						value={68}
						trend={10}
						icon={<ListIcon className="size-4 text-purple-500" />}
						iconBgClassName="bg-purple-50"
					/>
					<ReportItem
						title="Rata-rata Transaksi"
						value={formatRp(112200)}
						trend={4.7}
						icon={<CalculatorIcon className="size-4 text-blue-500" />}
						iconBgClassName="bg-blue-50"
					/>
				</View>
			</View>
		</View>
	);
}
