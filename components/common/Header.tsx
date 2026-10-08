import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Text from "@/components/common/Text";
import { Constants } from "@/constants";
import { Colors } from "@/constants/Colors";
import { cn, tw } from "@/lib/utils";
import { StatusBar } from "expo-status-bar";

type HeaderProps = {
	title: string;
	back?: boolean | (() => void);
	right?: React.ReactNode;
	className?: string;
};

export default function Header(props: HeaderProps) {
	const { title, back, right, className } = props;

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
		<View className="bg-white">
			<StatusBar style="dark" />
			<View style={{ height: Constants.statusBarHeight }} />
			<View
				className={cn(
					"h-16 flex-row items-center justify-center px-4",
					className,
				)}
			>
				{back && (
					<BouncyPressable
						className="absolute left-4 size-10 items-center justify-center rounded-full"
						onPress={handleBackPress}
						ripple="borderless"
						hapticType="light"
						hitSlop={tw(4)}
					>
						<Entypo name="chevron-left" size={tw(6)} color={Colors.zinc[500]} />
					</BouncyPressable>
				)}

				<Text w="semibold">
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
