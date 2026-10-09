import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Pressable, View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Text from "@/components/common/Text";
import CartItem from "@/components/feature/cart/CartItem";
import OrderTypeAction from "@/components/feature/cart/OrderTypeAction";
import PaymentMethodAction from "@/components/feature/cart/PaymentMethodAction";
import { CardIcon, DiscountIcon } from "@/components/icons";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import Separator from "@/components/ui/Separator";
import { Colors } from "@/constants/Colors";
import { CART } from "@/constants/data/cart";
import { OFFER_ITEMS } from "@/constants/data/offer";
import useCustomRouter from "@/hooks/useCustomRouter";
import useSearchParamState from "@/hooks/useSearchParamState";
import { getCartSubtotal } from "@/lib/cashier-cart-pricing";
import { cn, formatRp, wait } from "@/lib/utils";
import type { Cart } from "@/types/api/cart";

function ExtraButtons(
	props: React.PropsWithChildren & {
		icon?: React.ReactNode;
		onPress?: () => void;
	},
) {
	const { children, icon, onPress } = props;

	return (
		<Pressable onPress={onPress}>
			{({ pressed }) => (
				<View
					className={cn(
						"flex-row items-center justify-between bg-white px-6 py-2.5",
						{
							"bg-gray-200": pressed,
						},
					)}
				>
					<View className="flex-row items-center gap-3">
						<View className="size-6 items-center justify-center">{icon}</View>
						<Text className="text-xs">{children}</Text>
					</View>
					<Entypo name="chevron-small-right" size={20} color="black" />
				</View>
			)}
		</Pressable>
	);
}

function PaymentMethodTrigger() {
	const action = useAlertModal();

	const [paymentMethod] = useSearchParamState<string | undefined>(
		"paymentMethod",
	);

	return (
		<>
			<PaymentMethodAction openState={action.openState} />

			<ExtraButtons
				onPress={action.open}
				icon={<CardIcon size={22} color={Colors.neutral} />}
			>
				Metode Pembayaran - {paymentMethod}
			</ExtraButtons>
		</>
	);
}

function OfferTrigger() {
	const { pushWithParams, params } = useCustomRouter();

	// * Get from api
	const selectedOffer = params?.selectedOffer
		? OFFER_ITEMS.find((item) => item.id === params.selectedOffer)
		: null;

	return (
		<ExtraButtons
			onPress={() => pushWithParams("/cart/offer")}
			icon={<DiscountIcon size={22} color={Colors.neutral} />}
		>
			Diskon {selectedOffer && `- ${selectedOffer.name}`}
		</ExtraButtons>
	);
}

function OrderTypeTrigger() {
	const action = useAlertModal();

	const [orderType] = useSearchParamState<string | undefined>("orderType");

	return (
		<>
			<OrderTypeAction openState={action.openState} />

			<ExtraButtons
				onPress={action.open}
				icon={
					<MaterialIcons name="storefront" size={20} color={Colors.neutral} />
				}
			>
				Tipe Pesanan - {orderType}
			</ExtraButtons>
		</>
	);
}

function CartDetails(props: { cart: Cart | null }) {
	const { cart } = props;

	return (
		<View className="mt-4">
			{cart?.details.map((detail) => (
				<View key={detail.id} className="px-4 bg-white py-3">
					<View className="pb-3">
						<Text w="medium">{detail.orderType.name}</Text>
					</View>
					<Separator />
					<View>
						{detail.items.map((item) => (
							<CartItem data={item} key={item.id} />
						))}
					</View>
				</View>
			))}
		</View>
	);
}

export default function CartScreen() {
	const { replaceWithParams } = useCustomRouter();

	// * Get from api
	const [cart] = React.useState(CART);
	const subtotal = getCartSubtotal(cart);

	const orderAlert = useAlertModal();

	async function handlePayLater() {
		// * Mock API request

		await wait(1000);
		orderAlert.open();
	}

	function handleCloseAlert() {
		orderAlert.close();
		replaceWithParams("/cart/confirm");
	}

	return (
		<>
			<AlertModal
				title="🚀 Pesanan Berhasil Dibuat"
				message="Ringkasan pesanan akan dialihkan ke halaman keranjang!"
				openState={orderAlert.openState}
				onClose={handleCloseAlert}
				hideCancelButton
				hideConfirmButton
			/>

			<View className="grow bg-zinc-50">
				<CartDetails cart={cart} />
				<View className="mt-3 gap-3 bg-white px-5 py-3">
					<View className="flex-row items-center justify-between">
						<Text size="small">Subtotal</Text>
						<Text size="small">
							{subtotal === null ? "Tidak tersedia" : formatRp(subtotal)}
						</Text>
					</View>
					<View className="flex-row items-center justify-between">
						<Text size="small">Pajak</Text>
						<Text size="small">-</Text>
					</View>
					<View className="flex-row items-center justify-between">
						<Text size="small">Lainnya</Text>
						<Text size="small">-</Text>
					</View>
					<View className="flex-row items-center justify-between">
						<Text size="small" w="semibold">
							Total
						</Text>
						<Text size="small" w="semibold">
							-
						</Text>
					</View>
				</View>
				<View className="mt-3">
					<View className="gap-2">
						<OrderTypeTrigger />
						<OfferTrigger />
						<PaymentMethodTrigger />
					</View>
				</View>
				<View className="mt-auto bg-white p-5">
					<View className="flex-row items-center justify-between">
						<Text size="normal" w="medium">
							Total
						</Text>
						<Text size="normal" w="semibold">
							-
						</Text>
					</View>
					<Text size="small" className="mt-2 text-muted">
						Total pembayaran belum tersedia.
					</Text>
					<View className="mt-5 flex-row items-center gap-4">
						<ButtonGroup className="flex-1">
							<Button size="xl" variant="outline" onPress={handlePayLater}>
								<ButtonText size="md">Bayar Nanti</ButtonText>
							</Button>
						</ButtonGroup>
						<ButtonGroup className="flex-1">
							<Button size="xl" onPress={() => {}}>
								<ButtonText size="md">Bayar Sekarang</ButtonText>
							</Button>
						</ButtonGroup>
					</View>
				</View>
			</View>
		</>
	);
}
