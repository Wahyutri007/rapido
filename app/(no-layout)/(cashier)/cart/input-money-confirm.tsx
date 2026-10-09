import { router, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlertModal } from "@/components/common/AlertModal";
import Card from "@/components/common/Card";
import ScreenSafeArea from "@/components/common/ScreenSafeArea";
import Text from "@/components/common/Text";
import DetailRow from "@/components/custom/DetailRow";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { formatRp } from "@/lib/utils";
import { parseCashRouteAmount } from "@/schema/cashier/cash-input";

function CashConfirmation({
	totalPrice,
	value,
	focused,
}: {
	totalPrice: number | null;
	value: number | null;
	focused: boolean;
}) {
	const unavailable = useAlertModal();
	const { height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const valid =
		totalPrice !== null && value !== null && value > 0 && value >= totalPrice;

	function handleEdit() {
		if (!focused) return;
		if (totalPrice === null) {
			router.replace("/cart");
			return;
		}
		router.replace({
			pathname: "/cart/input-money",
			params: {
				totalPrice: String(totalPrice),
				...(value !== null ? { value: String(value) } : {}),
			},
		});
	}

	if (!valid) {
		return (
			<ScreenSafeArea>
				<ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
					<Card className="gap-3">
						<Text size="body" w="semibold" accessibilityRole="alert">
							Nominal pembayaran belum valid
						</Text>
						<Text size="normal" className="text-muted">
							{totalPrice === null
								? "Total pembayaran belum tersedia. Kembali ke pesanan."
								: value === null || value <= 0
									? "Periksa nominal uang diterima pada halaman Uang Diterima."
									: `Uang diterima tidak boleh kurang dari ${formatRp(totalPrice)}.`}
						</Text>
						<Text size="small" className="text-muted">
							Pembayaran dan pesanan belum disimpan.
						</Text>
					</Card>
					<Button size="xl" isDisabled={!focused} onPress={handleEdit}>
						<ButtonText>
							{totalPrice === null
								? "Kembali ke Pesanan"
								: "Edit Uang Diterima"}
						</ButtonText>
					</Button>
				</ScrollView>
			</ScreenSafeArea>
		);
	}

	return (
		<>
			<Actionsheet
				isOpen={focused && unavailable.isOpen}
				onClose={unavailable.close}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent
					className="items-stretch"
					style={{ maxHeight: Math.max(0, height - insets.top - 16) }}
				>
					<ActionsheetScrollView
						className="min-h-0"
						contentContainerStyle={{ gap: 16 }}
						keyboardShouldPersistTaps="handled"
					>
						<Text size="body" w="bold">
							Transaksi belum tersedia
						</Text>
						<Text size="normal" className="text-muted">
							Konfirmasi ini belum terhubung ke layanan pembayaran. Tidak ada
							pembayaran, tagihan, atau pesanan yang disimpan.
						</Text>
						<Button onPress={unavailable.close}>
							<ButtonText>Tutup</ButtonText>
						</Button>
					</ActionsheetScrollView>
				</ActionsheetContent>
			</Actionsheet>
			<ScreenSafeArea>
				<ScrollView
					contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 16 }}
					keyboardShouldPersistTaps="handled"
				>
					<View className="gap-1">
						<Text size="normal" w="semibold">
							Pratinjau transaksi tunai
						</Text>
						<Text size="small" className="text-muted">
							Nominal berasal dari halaman Uang Diterima. Pembayaran dan pesanan
							belum disimpan.
						</Text>
					</View>
					<Card>
						<DetailRow
							label="Uang Diterima"
							className="flex-wrap gap-x-3 gap-y-1"
						>
							<Text
								size="normal"
								className="max-w-full shrink text-right text-muted"
							>
								{formatRp(value)}
							</Text>
						</DetailRow>
						<DetailRow
							label="Kembalian"
							isLast
							className="flex-wrap gap-x-3 gap-y-1"
						>
							<Text
								size="normal"
								className="max-w-full shrink text-right text-muted"
							>
								{formatRp(value - totalPrice)}
							</Text>
						</DetailRow>
					</Card>
					<View className="mt-auto flex-row flex-wrap gap-4">
						<ButtonGroup className="min-w-40 flex-1">
							<Button
								size="xl"
								variant="outline"
								isDisabled={!focused}
								onPress={handleEdit}
							>
								<ButtonText size="sm">Edit Uang Diterima</ButtonText>
							</Button>
						</ButtonGroup>
						<ButtonGroup className="min-w-40 flex-1">
							<Button
								size="xl"
								isDisabled={!focused}
								onPress={() => {
									if (focused) unavailable.open();
								}}
							>
								<ButtonText size="md">Transaksi Selesai</ButtonText>
							</Button>
						</ButtonGroup>
					</View>
				</ScrollView>
			</ScreenSafeArea>
		</>
	);
}

export default function InputMoneyConfirm() {
	const params = useLocalSearchParams();
	const focused = useIsFocused();
	return (
		<CashConfirmation
			key={JSON.stringify([
				params.totalPrice ?? null,
				params.value ?? null,
				focused,
			])}
			totalPrice={parseCashRouteAmount(params.totalPrice)}
			value={parseCashRouteAmount(params.value)}
			focused={focused}
		/>
	);
}
