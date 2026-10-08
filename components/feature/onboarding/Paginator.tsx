import { Animated, useWindowDimensions, View } from "react-native";
import type { OnboardingItemProps } from "./OnboardingItem";

export default function Paginator({
	data,
	scrollX,
	pageWidth,
}: {
	data: OnboardingItemProps[] | null;
	scrollX: Animated.Value;
	pageWidth?: number;
}) {
	const { width: windowWidth } = useWindowDimensions();
	const width = pageWidth ?? windowWidth;

	return (
		<View className="flex-row gap-1 ">
			{data?.map((item, i) => {
				const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

				const dotWidth = scrollX.interpolate({
					inputRange,
					outputRange: [8, 64, 8],
					extrapolate: "clamp",
				});

				const dotOpacity = scrollX.interpolate({
					inputRange,
					outputRange: [0.3, 1, 0.3],
					extrapolate: "clamp",
				});

				return (
					<Animated.View
						className="bg-primary-400 rounded-full"
						style={{ width: dotWidth, height: 8, opacity: dotOpacity }}
						key={item.id}
					/>
				);
			})}
		</View>
	);
}
