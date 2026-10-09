import Entypo from "@expo/vector-icons/Entypo";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Text from "@/components/common/Text";
import { Constants } from "@/constants";
import { Colors } from "@/constants/Colors";
import { figmaStockTheme } from "@/lib/ui/figma-stock";
import { cn, tw } from "@/lib/utils";

type HeaderProps = {
	title: string;
	back?: boolean | (() => void);
	right?: React.ReactNode;
	className?: string;
	appearance?: "default" | "figma";
};

export default function Header(props: HeaderProps) {
	const { title, back, right, className, appearance = "default" } = props;
	const isFigma = appearance === "figma";

	function handleBackPress() {
		if (typeof back === "function") {
			back();
			return;
		}

		if (router.canGoBack()) {
			router.back();
		}
	}

	return (
		<View
			className="bg-white"
			style={
				isFigma
					? [
							figmaStockTheme,
							{
								paddingTop: Math.max(Constants.statusBarHeight, 32),
								height: Math.max(Constants.statusBarHeight, 32) + 40,
							},
						]
					: undefined
			}
		>
			<StatusBar style="dark" />
			{!isFigma && <View style={{ height: Constants.statusBarHeight }} />}
			<View
				className={cn(
					"flex-row items-center justify-center px-4",
					isFigma ? "h-6" : "h-16",
					className,
				)}
			>
				{back && (
					<BouncyPressable
						className={cn(
							"absolute left-4 items-center justify-center rounded-full",
							isFigma ? "size-6" : "size-10",
						)}
						onPress={handleBackPress}
						ripple="borderless"
						hapticType="light"
						hitSlop={tw(4)}
					>
						{isFigma ? (
							<Image
								source={require("@/assets/images/figma/back-office/back.svg")}
								style={{ width: 24, height: 24 }}
							/>
						) : (
							<Entypo
								name="chevron-left"
								size={tw(6)}
								color={Colors.zinc[500]}
							/>
						)}
					</BouncyPressable>
				)}

				<Text w="semibold" style={isFigma ? { lineHeight: 21 } : undefined}>
					{title}
				</Text>

				{right && (
					<View className="absolute right-4 items-center justify-center">
						{right}
					</View>
				)}
			</View>
		</View>
	);
}
