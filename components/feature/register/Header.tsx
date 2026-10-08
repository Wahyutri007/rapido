import Entypo from "@expo/vector-icons/Entypo";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

export default function RegistrationHeader({
	headerProps,
	title,
	registrationIndex = -1,
}: {
	headerProps?: any;
	title: string;
	registrationIndex?: number;
}) {
	const router = useRouter();

	function handleBackPress() {
		if (router.canGoBack()) {
			router.back();
		} else {
			console.warn("No previous screen to go back to");
		}
	}

	return (
		<>
			<View
				className="bg-zinc-50"
				style={{ height: Constants.statusBarHeight }}
			/>
			<View className="bg-zinc-50 px-4 pb-4 pt-4">
				<View className="flex-row items-center gap-4">
					<BouncyPressable
						className="size-10 items-center justify-center rounded-full"
						onPress={handleBackPress}
						ripple="borderless"
						hapticType="light"
					>
						<Entypo
							name="chevron-small-left"
							size={24}
							color={Colors.neutral}
						/>
					</BouncyPressable>
					<Text className="text-lg" w="medium">
						{title}
					</Text>
				</View>
			</View>
			{registrationIndex > -1 && (
				<View className="flex-row">
					{Array.from({ length: 3 }, (_, index) => (
						<View
							className={cn(
								"h-1 grow",
								registrationIndex >= index ? "bg-primary-400" : "bg-gray-200",
							)}
							key={index}
						/>
					))}
				</View>
			)}
		</>
	);
}
