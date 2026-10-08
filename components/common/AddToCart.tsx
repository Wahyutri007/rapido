import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import type React from "react";
import { Dimensions } from "react-native";
import BouncyPressable, {
	type BouncyPressableProps,
} from "@/components/common/BouncyPressable";
import { cn } from "@/lib/utils";

export default function AddToCart(
	props: BouncyPressableProps & {
		aboveBottomTab?: boolean;
	},
) {
	const { className, aboveBottomTab, ...rest } = props;

	const deviceWidth = Dimensions.get("screen").width;

	function handleAddToCartPress() {
		router.push("/order");
	}

	return (
		<BouncyPressable
			onPress={handleAddToCartPress}
			activeScale={0.96}
			hapticType="light"
			className={cn(
				"size-[50px] items-center justify-center overflow-hidden rounded-full bg-primary-400 shadow-main",
				className,
			)}
			style={{
				bottom: 60 + (aboveBottomTab ? 96 : 0),
				left: deviceWidth - 72,
				position: "fixed",
			}}
			{...rest}
		>
			<MaterialCommunityIcons name="cart-plus" size={24} color="white" />
		</BouncyPressable>
	);
}
