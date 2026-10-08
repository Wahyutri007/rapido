import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetHeader,
	ActionsheetHeaderTitle,
	ActionsheetItem,
	ActionsheetItemText,
} from "@/components/ui/actionsheet";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";
import {
	CASHIER_OPTIONS,
	PAYMENT_OPTIONS,
	STATUS_OPTIONS,
} from "./mockData";

export type FilterChipsRowProps = {
	status: string;
	onStatusChange: (status: string) => void;
	cashier: string;
	onCashierChange: (cashier: string) => void;
	payment: string;
	onPaymentChange: (payment: string) => void;
	className?: string;
};

type ActiveSheetType = "status" | "cashier" | "payment" | null;

export default function FilterChipsRow({
	status,
	onStatusChange,
	cashier,
	onCashierChange,
	payment,
	onPaymentChange,
	className,
}: FilterChipsRowProps) {
	const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);

	const isStatusActive = status !== STATUS_OPTIONS[0];
	const isCashierActive = cashier !== CASHIER_OPTIONS[0];
	const isPaymentActive = payment !== PAYMENT_OPTIONS[0];

	const getSheetConfig = () => {
		switch (activeSheet) {
			case "status":
				return {
					title: "Pilih Status Transaksi",
					options: STATUS_OPTIONS,
					selected: status,
					onSelect: (val: string) => onStatusChange(val),
				};
			case "cashier":
				return {
					title: "Pilih Kasir",
					options: CASHIER_OPTIONS,
					selected: cashier,
					onSelect: (val: string) => onCashierChange(val),
				};
			case "payment":
				return {
					title: "Pilih Metode Pembayaran",
					options: PAYMENT_OPTIONS,
					selected: payment,
					onSelect: (val: string) => onPaymentChange(val),
				};
			default:
				return null;
		}
	};

	const sheetConfig = getSheetConfig();

	return (
		<View className={cn("w-full", className)}>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ gap: 8 }}
			>
				{/* Status Chip */}
				<Pressable
					onPress={() => setActiveSheet("status")}
					className={cn(
						"h-9 flex-row items-center gap-1.5 rounded-xl border bg-white px-3 shadow-sm",
						isStatusActive
							? "border-primary-500 bg-primary-500/5"
							: "border-border-muted",
					)}
				>
					<Text
						size="small"
						w={isStatusActive ? "semibold" : "medium"}
						className={isStatusActive ? "text-primary-600" : "text-zinc-600"}
					>
						{status}
					</Text>
					<Entypo
						name="chevron-down"
						size={14}
						color={isStatusActive ? Colors.primary : Colors.zinc[400]}
					/>
				</Pressable>

				{/* Cashier Chip */}
				<Pressable
					onPress={() => setActiveSheet("cashier")}
					className={cn(
						"h-9 flex-row items-center gap-1.5 rounded-xl border bg-white px-3 shadow-sm",
						isCashierActive
							? "border-primary-500 bg-primary-500/5"
							: "border-border-muted",
					)}
				>
					<Text
						size="small"
						w={isCashierActive ? "semibold" : "medium"}
						className={isCashierActive ? "text-primary-600" : "text-zinc-600"}
					>
						{cashier}
					</Text>
					<Entypo
						name="chevron-down"
						size={14}
						color={isCashierActive ? Colors.primary : Colors.zinc[400]}
					/>
				</Pressable>

				{/* Payment Chip */}
				<Pressable
					onPress={() => setActiveSheet("payment")}
					className={cn(
						"h-9 flex-row items-center gap-1.5 rounded-xl border bg-white px-3 shadow-sm",
						isPaymentActive
							? "border-primary-500 bg-primary-500/5"
							: "border-border-muted",
					)}
				>
					<Text
						size="small"
						w={isPaymentActive ? "semibold" : "medium"}
						className={isPaymentActive ? "text-primary-600" : "text-zinc-600"}
					>
						{payment}
					</Text>
					<Entypo
						name="chevron-down"
						size={14}
						color={isPaymentActive ? Colors.primary : Colors.zinc[400]}
					/>
				</Pressable>
			</ScrollView>

			{/* Filter Picker Actionsheet */}
			{sheetConfig && (
				<Actionsheet
					isOpen={activeSheet !== null}
					onClose={() => setActiveSheet(null)}
				>
					<ActionsheetBackdrop />
					<ActionsheetContent className="p-4">
						<ActionsheetDragIndicatorWrapper>
							<ActionsheetDragIndicator />
						</ActionsheetDragIndicatorWrapper>

						<ActionsheetHeader onClose={() => setActiveSheet(null)}>
							<ActionsheetHeaderTitle>
								{sheetConfig.title}
							</ActionsheetHeaderTitle>
						</ActionsheetHeader>

						{sheetConfig.options.map((option) => {
							const isSelected = option === sheetConfig.selected;
							return (
								<ActionsheetItem
									key={option}
									onPress={() => {
										sheetConfig.onSelect(option);
										setActiveSheet(null);
									}}
									className={cn(
										"flex-row items-center justify-between",
										isSelected && "bg-primary-50",
									)}
								>
									<ActionsheetItemText
										className={cn(
											isSelected
												? "font-semibold text-primary-600"
												: "text-zinc-700",
										)}
									>
										{option}
									</ActionsheetItemText>
									{isSelected ? (
										<Feather name="check" size={18} color={Colors.primary} />
									) : null}
								</ActionsheetItem>
							);
						})}
					</ActionsheetContent>
				</Actionsheet>
			)}
		</View>
	);
}
