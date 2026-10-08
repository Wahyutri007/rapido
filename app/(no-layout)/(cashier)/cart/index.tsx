import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
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
import { cn, formatRp, wait } from "@/lib/utils";
import type { Cart } from "@/types/api/cart";

const TAX = 0.1;

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
	const { pushWithParams, replaceWithParams } = useCustomRouter();

	// * Get from api
	const [cart, setCart] = React.useState(CART);

	const orderAlert = useAlertModal();

	// const subtotal = cart.reduce((acc, curr) => {
	// 	const totalVariantPrice = curr.variants.reduce((acc, curr) => {
	// 		return acc + curr.price;
	// 	}, 0);

	// 	return acc + (curr.menu.price + totalVariantPrice) * curr.amount;
	// }, 0);

	// const taxPrice = subtotal * TAX;
	// const totalPrice = subtotal + taxPrice;

	function handleAddMenu() {
		// * Modify ui to add extra menu
		router.push("/(cashier)/catalog" as any);
	}

	async function handlePayLater() {
		// * Mock API request

		await wait(1000);
		orderAlert.open();
	}

	// async function handleOrder() {
	// 	router.push({
	// 		pathname: "/add/cart/input-money",
	// 		params: {
	// 			totalPrice,
	// 		},
	// 	});
	// }

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
				<View className="mt-3 gap-3 bg-white px-5 py-2.5">
					<View className="flex-row items-center justify-between">
						<Text className="text-xs">Subtotal</Text>
						<Text className="text-xs">{formatRp(-1)}</Text>
						{/* <Text className="text-xs">{formatRp(subtotal)}</Text> */}
					</View>
					<View className="flex-row items-center justify-between">
						<Text className="text-xs">Pajak</Text>
						<Text className="text-xs">{formatRp(-1)}</Text>
						{/* <Text className="text-xs">{formatRp(taxPrice)}</Text> */}
					</View>
					<View className="flex-row items-center justify-between">
						<Text className="text-xs">Lainnya</Text>
						<Text className="text-xs">Rp 0</Text>
					</View>
					<View className="flex-row items-center justify-between">
						<Text className="text-xs text-gray-900" w="semibold">
							Total
						</Text>
						<Text className="text-xs text-gray-900" w="semibold">
							{formatRp(-1)}
							{/* {formatRp(totalPrice)} */}
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
						<Text className="text-sm" w="medium">
							Total
						</Text>
						<Text className="text-sm text-gray-900" w="semibold">
							{formatRp(-1)}
							{/* {formatRp(totalPrice)} */}
						</Text>
					</View>
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
