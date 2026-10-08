import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { View } from "react-native";
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
import type { TransactionItem } from "./types";

export type TransactionItemActionSheetProps = {
	item: TransactionItem | null;
	isOpen: boolean;
	onClose: () => void;
	onViewDetail?: (item: TransactionItem) => void;
	onPrintReceipt?: (item: TransactionItem) => void;
	onShareReceipt?: (item: TransactionItem) => void;
	onRefund?: (item: TransactionItem) => void;
};

export default function TransactionItemActionSheet({
	item,
	isOpen,
	onClose,
	onViewDetail,
	onPrintReceipt,
	onShareReceipt,
	onRefund,
}: TransactionItemActionSheetProps) {
	if (!item) return null;

	return (
		<Actionsheet isOpen={isOpen} onClose={onClose}>
			<ActionsheetBackdrop />
			<ActionsheetContent className="p-4">
				<ActionsheetDragIndicatorWrapper>
					<ActionsheetDragIndicator />
				</ActionsheetDragIndicatorWrapper>

				<ActionsheetHeader onClose={onClose}>
					<ActionsheetHeaderTitle>
						Transaksi {item.id}
					</ActionsheetHeaderTitle>
				</ActionsheetHeader>

				<ActionsheetItem
					onPress={() => {
						onClose();
						onViewDetail?.(item);
					}}
				>
					<View className="mr-3">
						<Feather name="eye" size={18} color={Colors.zinc[600]} />
					</View>
					<ActionsheetItemText className="text-zinc-800">
						Lihat Rincian Transaksi
					</ActionsheetItemText>
				</ActionsheetItem>

				<ActionsheetItem
					onPress={() => {
						onClose();
						onPrintReceipt?.(item);
					}}
				>
					<View className="mr-3">
						<Feather name="printer" size={18} color={Colors.zinc[600]} />
					</View>
					<ActionsheetItemText className="text-zinc-800">
						Cetak Struk
					</ActionsheetItemText>
				</ActionsheetItem>

				<ActionsheetItem
					onPress={() => {
						onClose();
						onShareReceipt?.(item);
					}}
				>
					<View className="mr-3">
						<Feather name="share-2" size={18} color={Colors.zinc[600]} />
					</View>
					<ActionsheetItemText className="text-zinc-800">
						Kirim Struk (WhatsApp / Email)
					</ActionsheetItemText>
				</ActionsheetItem>

				{item.status !== "refund" && (
					<ActionsheetItem
						onPress={() => {
							onClose();
							onRefund?.(item);
						}}
						className="bg-red-50 data-[active=true]:bg-red-100"
					>
						<View className="mr-3">
							<Feather name="rotate-ccw" size={18} color={Colors.red[500]} />
						</View>
						<ActionsheetItemText className="text-red-500">
							Ajukan Pengembalian Dana (Refund)
						</ActionsheetItemText>
					</ActionsheetItem>
				)}
			</ActionsheetContent>
		</Actionsheet>
	);
}
