import { router } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";
import AmountButtons from "@/components/common/AmountButtons";
import Text from "@/components/common/Text";
import { Badge, BadgeText } from "@/components/ui/badge";
import { formatRp } from "@/lib/utils";
import type { State } from "@/types";
import type { CartDetailItem } from "@/types/api/cart";

export default function CartItem(props: {
	data: CartDetailItem;
	cartState?: State<CartDetailItem[]>;
}) {
	const { data, cartState } = props;

	// const [cart, setCart] = cartState;
	// const [currentAmount, setCurrentAmount] = React.useState(data.amount);

	// function handleDecrease() {
	// 	if (currentAmount > 0) {
	// 		setCurrentAmount(currentAmount - 1);

	// 		const newCart = cart.map((item) => {
	// 			if (item.id === data.id) {
	// 				return { ...item, amount: currentAmount - 1 };
	// 			}
	// 			return item;
	// 		});

	// 		setCart(newCart);
	// 	}
	// }

	// function handleIncrease() {
	// 	setCurrentAmount(currentAmount + 1);

	// 	const newCart = cart.map((item) => {
	// 		if (item.id === data.id) {
	// 			return { ...item, amount: currentAmount + 1 };
	// 		}
	// 		return item;
	// 	});

	// 	setCart(newCart);
	// }

	// const totalPrice =
	// 	data.variants.reduce((acc, variant) => {
	// 		return acc + (variant.price ?? 0);
	// 	}, data.menu.price) * currentAmount;

	return (
		<View className="flex-row items-center justify-between gap-2.5 py-2.5">
			<View className="flex-row gap-3">
				<View>
					<Text className="text-xs text-gray-900" w="semibold">
						{data.menu.name}
					</Text>
					<View className="mt-0.5 gap-0.5">
						{data.variants.map((variant, index) => (
							<Text key={variant.name} className="text-xs text-muted">
								{variant.name}
							</Text>
						))}
					</View>
					<Text className="mt-2 text-sm" w="medium">
						{formatRp(-1)}
					</Text>
					<Pressable
						className="mt-2"
						onPress={() =>
							router.push({
								pathname: "/catalog/menu/modify",
								params: { id: data.id },
							})
						}
					>
						<Text className="text-xs text-primary">Edit</Text>
					</Pressable>
				</View>
			</View>
			<View className="gap-4">
				<Badge variant="success">
					<BadgeText>Baru</BadgeText>
				</Badge>
			</View>
		</View>
	);
}
