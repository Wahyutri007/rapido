import { router } from "expo-router";
import { Pressable, View } from "react-native";
import Text from "@/components/common/Text";
import { Badge, BadgeText } from "@/components/ui/badge";
import { getCartItemPricing } from "@/lib/cashier-cart-pricing";
import { formatRp } from "@/lib/utils";
import type { State } from "@/types";
import type { CartDetailItem } from "@/types/api/cart";

export default function CartItem(props: {
	data: CartDetailItem;
	cartState?: State<CartDetailItem[]>;
}) {
	const { data } = props;
	const pricing = getCartItemPricing(data);

	return (
		<View className="flex-row items-center justify-between gap-3 py-3">
			<View className="flex-1 flex-row gap-3">
				<View className="flex-1">
					<Text size="small" w="semibold">
						{data.menu.name}
					</Text>
					<View className="mt-1 gap-1">
						{data.variants.map((variant) => (
							<Text key={variant.name} size="small" className="text-muted">
								{variant.name}
							</Text>
						))}
					</View>
					{pricing && (
						<Text size="small" className="mt-2 text-muted">
							{data.amount} × {formatRp(pricing.unitPrice)}
						</Text>
					)}
					<Text size="normal" className="mt-1" w="medium">
						{pricing ? formatRp(pricing.lineTotal) : "Harga tidak tersedia"}
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
						<Text size="small" className="text-primary">
							Edit
						</Text>
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
