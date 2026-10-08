import Feather from "@expo/vector-icons/Feather";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { formatRp } from "@/lib/utils";
import { useAccountingStore } from "@/store/accountingStore";

export default function BuktiPembayaranScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const incomes = useAccountingStore((state) => state.incomes);
	const scrollViewRef = useRef<ScrollView>(null);

	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const alertModal = useAlertModal();
	const [alertMessage, setAlertMessage] = useState("");

	const income = useMemo(() => {
		const found = incomes.find((item) => item.id === params.id);
		if (found?.receipt) return found;

		// Fallback to the first invoice or default mock
		const anyInvoice = incomes.find(
			(item) => item.type === "invoice" && item.receipt,
		);
		return anyInvoice || incomes[1] || incomes[0];
	}, [incomes, params.id]);

	const receipt = income?.receipt;

	const handleScrollToTop = () => {
		scrollViewRef.current?.scrollTo({ y: 0, animated: true });
	};

	const handleActionSelect = (actionName: string) => {
		setIsActionSheetOpen(false);
		setAlertMessage(`${actionName} berhasil diproses.`);
		alertModal.open();
	};

	if (!receipt) {
		return (
			<View className="flex-1 items-center justify-center bg-gray-50 p-4">
				<Text className="text-zinc-500">Bukti pembayaran tidak ditemukan</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-gray-50">
			<ScrollView
				ref={scrollViewRef}
				contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 16 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Receipt Card Container */}
				<Card className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
					{/* Merchant Header */}
					<View className="items-center pb-6 border-b border-gray-100">
						{/* Camera Icon */}
						<View className="mb-3 size-12 items-center justify-center rounded-2xl bg-zinc-100">
							<Feather name="camera" size={24} color={Colors.zinc[700]} />
						</View>

						<Text className="text-xs text-zinc-400">Nama Merchant</Text>
						<Text
							w="semibold"
							className="text-center text-sm mt-0.5 px-4"
						>
							{receipt.merchantName}
						</Text>
						<View className="flex-row items-center mt-1">
							<Text className="text-xs text-zinc-400">• </Text>
							<Text className="text-xs text-zinc-500">
								{receipt.merchantPhone}
							</Text>
						</View>
					</View>

					{/* Metadata Info Rows */}
					<View className="py-4 gap-2.5 border-b border-gray-100">
						<View className="flex-row items-center justify-between">
							<Text className="text-xs text-zinc-500">Waktu Pesanan</Text>
							<Text w="medium" className="text-xs">
								{receipt.orderTime}
							</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-xs text-zinc-500">Nomor Transaksi</Text>
							<Text w="medium" className="text-xs">
								{receipt.transactionNumber}
							</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-xs text-zinc-500">Pelanggan</Text>
							<Text w="medium" className="text-xs">
								{receipt.customer}
							</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-xs text-zinc-500">Kasir</Text>
							<Text w="medium" className="text-xs">
								{receipt.cashier}
							</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-xs text-zinc-500">Status Pesanan</Text>
							<Text w="medium" className="text-xs text-emerald-500">
								{receipt.orderStatus}
							</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-xs text-zinc-500">Status Pembayaran</Text>
							<Text w="medium" className="text-xs text-emerald-500">
								{receipt.paymentStatus}
							</Text>
						</View>
					</View>

					{/* Items Breakdown Groups */}
					<View className="py-4 gap-5 border-b border-gray-100">
						{receipt.groups.map((group, gIdx) => (
							<View key={group.category} className="gap-3">
								<View className="flex-row items-center justify-between">
									<Text w="bold" className="text-sm">
										{group.category}
									</Text>

									{/* Scroll to top button beside second group as seen in mockup */}
									{gIdx === 1 && (
										<Pressable
											onPress={handleScrollToTop}
											className="size-8 items-center justify-center rounded-full border border-primary-500 bg-white"
											hitSlop={8}
										>
											<Feather
												name="arrow-up"
												size={16}
												color={Colors.primary}
											/>
										</Pressable>
									)}
								</View>

								<View className="gap-3">
									{group.items.map((item) => (
										<View
											key={`${group.category}-${item.name}`}
											className="gap-1"
										>
											<View className="flex-row items-center justify-between">
												<Text w="medium" className="text-xs">
													{item.qty}x {item.name}
												</Text>
												<Text w="medium" className="text-xs">
													{formatRp(item.price)}
												</Text>
											</View>

											{/* Modifiers / Addons */}
											{item.modifiers?.map((mod) => (
												<View
													key={`${item.name}-${mod.name}`}
													className="flex-row items-center justify-between pl-4"
												>
													<Text className="text-xs text-zinc-400">
														{mod.qty}x {mod.name}
													</Text>
													<Text className="text-xs text-zinc-400">
														{formatRp(mod.price)}
													</Text>
												</View>
											))}
										</View>
									))}
								</View>
							</View>
						))}
					</View>

					{/* Summary Breakdown */}
					<View className="pt-4 gap-2">
						<View className="flex-row items-center justify-between">
							<Text className="text-xs text-zinc-600">Subtotal</Text>
							<Text w="medium" className="text-xs">
								{formatRp(receipt.subtotal)}
							</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-xs text-zinc-600">Pajak</Text>
							<Text w="medium" className="text-xs">
								{formatRp(receipt.tax)}
							</Text>
						</View>

						<View className="flex-row items-center justify-between pt-1">
							<Text w="bold" className="text-sm">
								Total
							</Text>
							<Text w="bold" className="text-sm">
								{formatRp(receipt.total)}
							</Text>
						</View>
					</View>
				</Card>
			</ScrollView>

			{/* Sticky Bottom "Aksi" Button */}
			<View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
				<Button
					size="xl"
					variant="outline"
					className="h-12 rounded-full border-primary-500 bg-white"
					onPress={() => setIsActionSheetOpen(true)}
				>
					<ButtonText className="text-base font-semibold text-primary-500">
						Aksi
					</ButtonText>
				</Button>
			</View>

			{/* Action Sheet */}
			<Actionsheet
				isOpen={isActionSheetOpen}
				onClose={() => setIsActionSheetOpen(false)}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent className="pb-8 pt-2">
					<ActionsheetDragIndicatorWrapper>
						<ActionsheetDragIndicator />
					</ActionsheetDragIndicatorWrapper>

					<View className="w-full border-b border-gray-100 px-4 py-3">
						<Text
							w="semibold"
							className="text-base text-foreground text-center"
						>
							Aksi Bukti Pembayaran
						</Text>
					</View>

					<View className="w-full px-2 pt-2">
						<Pressable
							onPress={() => handleActionSelect("Cetak Struk")}
							className="flex-row items-center gap-3 px-4 py-3.5 border-b border-gray-100 active:bg-zinc-50"
						>
							<Feather name="printer" size={18} color={Colors.primary} />
							<Text w="medium" className="text-sm text-foreground">
								Cetak Struk
							</Text>
						</Pressable>

						<Pressable
							onPress={() => handleActionSelect("Bagikan Bukti Pembayaran")}
							className="flex-row items-center gap-3 px-4 py-3.5 border-b border-gray-100 active:bg-zinc-50"
						>
							<Feather name="share-2" size={18} color={Colors.primary} />
							<Text w="medium" className="text-sm text-foreground">
								Bagikan Struk
							</Text>
						</Pressable>

						<Pressable
							onPress={() => handleActionSelect("Salin Nomor Transaksi")}
							className="flex-row items-center gap-3 px-4 py-3.5 active:bg-zinc-50"
						>
							<Feather name="copy" size={18} color={Colors.primary} />
							<Text w="medium" className="text-sm text-foreground">
								Salin Nomor Transaksi
							</Text>
						</Pressable>
					</View>
				</ActionsheetContent>
			</Actionsheet>

			{/* Action feedback modal */}
			<AlertModal
				openState={alertModal.openState}
				onClose={alertModal.close}
				title="Informasi"
				message={alertMessage}
				confirmText="OK"
				hideCancelButton
			/>
		</View>
	);
}
