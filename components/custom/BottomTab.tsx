import type {
	BottomTabBarProps,
	BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { type Href, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/common/Text";
import { Colors } from "@/constants/Colors";
import { haptic } from "@/lib/haptics";

export function BottomTabPadding() {
	const insets = useSafeAreaInsets();
	const bottomPadding = Math.max(insets.bottom, 10);
	return <View style={{ height: 60 + bottomPadding }} />;
}

type TabItemButtonProps = {
	label: string;
	isFocused: boolean;
	itemColor: string;
	tabBarIcon?: (props: {
		focused: boolean;
		color: string;
		size: number;
	}) => React.ReactNode;
	onPress: () => void;
};

function TabItemButton({
	label,
	isFocused,
	itemColor,
	tabBarIcon,
	onPress,
}: TabItemButtonProps) {
	const scale = useSharedValue(1);

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	React.useEffect(() => {
		if (isFocused) {
			scale.value = withSequence(
				withSpring(1.08, { damping: 14, stiffness: 450 }),
				withSpring(1, { damping: 16, stiffness: 400 }),
			);
		} else {
			scale.value = withSpring(1, { damping: 16, stiffness: 400 });
		}
	}, [isFocused, scale]);

	const handlePressIn = () => {
		scale.value = withSpring(0.94, { damping: 18, stiffness: 450 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 18, stiffness: 450 });
	};

	return (
		<Pressable
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			className="flex-1 items-center justify-center py-1"
		>
			<Animated.View
				style={animatedIconStyle}
				className="size-7 items-center justify-center"
			>
				{tabBarIcon?.({
					focused: isFocused,
					color: itemColor,
					size: 22,
				})}
			</Animated.View>
			<Text
				style={{ color: itemColor }}
				className="mt-1 text-[11px]"
				w={isFocused ? "semibold" : "regular"}
				numberOfLines={1}
			>
				{label}
			</Text>
		</Pressable>
	);
}

export default function BottomTab(props: BottomTabBarProps) {
	const { state, navigation, descriptors } = props;
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const bottomPadding = Math.max(insets.bottom, 10);
	const barHeight = 58 + bottomPadding;

	return (
		<View
			className="absolute bottom-0 w-full"
			style={{ height: barHeight }}
		>
			<View
				className="size-full flex-row items-center justify-between gap-2 overflow-hidden rounded-t-[20px] border border-zinc-100 bg-white px-4 shadow-main"
				style={{ paddingBottom: bottomPadding, paddingTop: 24 }}
			>
				{state.routes.map((route, index) => {
					const options = descriptors[route.key]
						.options as BottomTabNavigationOptions & { customHref?: Href };

					const {
						tabBarLabel,
						tabBarIcon,
						title,
						tabBarItemStyle,
						tabBarButton,
					} = options;

					const isHidden =
						options.customHref === null ||
						(tabBarItemStyle as any)?.display === "none" ||
						(tabBarButton && tabBarButton({} as any) === null);

					if (isHidden) return null;

					const label =
						typeof tabBarLabel === "string"
							? String(tabBarLabel)
							: (title ?? route.name);
					const isFocused = state.index === index;
					const itemColor = isFocused ? Colors.primary : Colors.neutral;

					function handlePress() {
						haptic.selection();
						if (options.customHref) {
							router.push(options.customHref);
						} else {
							navigation.navigate(route.name);
						}
					}

					return (
						<TabItemButton
							key={route.key}
							label={label}
							isFocused={isFocused}
							itemColor={itemColor}
							tabBarIcon={tabBarIcon}
							onPress={handlePress}
						/>
					);
				})}
			</View>
		</View>
	);
}
