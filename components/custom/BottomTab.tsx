import { Image, type ImageSource } from "expo-image";
import { type Href, useRouter } from "expo-router";
import type {
	BottomTabBarProps,
	BottomTabNavigationOptions,
} from "expo-router/js-tabs";
import React from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
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
import { figmaStockShadows } from "@/lib/ui/figma-stock";

const FIGMA_ICONS: Record<string, ImageSource> = {
	home: require("@/assets/images/figma/back-office/home.svg"),
	report: require("@/assets/images/figma/back-office/report.svg"),
	catalog: require("@/assets/images/figma/back-office/catalog.svg"),
	inventory: require("@/assets/images/figma/back-office/inventory.svg"),
	manage: require("@/assets/images/figma/back-office/manage.svg"),
};

export function BottomTabPadding() {
	const insets = useSafeAreaInsets();
	const bottomPadding = Math.max(insets.bottom, 10);
	return <View style={{ height: 60 + bottomPadding }} />;
}

type TabItemButtonProps = {
	appearance?: "default" | "figma";
	figmaIcon?: ImageSource;
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
	appearance = "default",
	figmaIcon,
	label,
	isFocused,
	itemColor,
	tabBarIcon,
	onPress,
}: TabItemButtonProps) {
	const scale = useSharedValue(1);

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.get() }],
	}));

	React.useEffect(() => {
		if (appearance === "figma") {
			scale.set(1);
			return;
		}
		if (isFocused) {
			scale.set(
				withSequence(
					withSpring(1.08, { damping: 14, stiffness: 450 }),
					withSpring(1, { damping: 16, stiffness: 400 }),
				),
			);
		} else {
			scale.set(withSpring(1, { damping: 16, stiffness: 400 }));
		}
	}, [isFocused, scale, appearance]);

	const handlePressIn = () => {
		scale.set(withSpring(0.94, { damping: 18, stiffness: 450 }));
	};

	const handlePressOut = () => {
		scale.set(withSpring(1, { damping: 18, stiffness: 450 }));
	};

	return (
		<Pressable
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			className={
				appearance === "figma"
					? "flex-1 items-center justify-center"
					: "flex-1 items-center justify-center py-1"
			}
		>
			<Animated.View
				style={animatedIconStyle}
				className={
					appearance === "figma"
						? "size-6 items-center justify-center"
						: "size-7 items-center justify-center"
				}
			>
				{appearance === "figma" && figmaIcon ? (
					<Image source={figmaIcon} style={{ width: 24, height: 24 }} />
				) : (
					tabBarIcon?.({
						focused: isFocused,
						color: itemColor,
						size: 22,
					})
				)}
			</Animated.View>
			<Text
				size={appearance === "figma" ? "small" : "body"}
				style={{
					color: itemColor,
					...(appearance === "figma" ? { lineHeight: 16 } : {}),
				}}
				className={appearance === "figma" ? "mt-2" : "mt-1 text-[11px]"}
				w={
					appearance === "figma"
						? "regular"
						: isFocused
							? "semibold"
							: "regular"
				}
				numberOfLines={1}
			>
				{label}
			</Text>
		</Pressable>
	);
}

export default function BottomTab(
	props: BottomTabBarProps & { appearance?: "default" | "figma" },
) {
	const { state, navigation, descriptors, appearance = "default" } = props;
	const { width } = useWindowDimensions();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const bottomPadding = Math.max(
		insets.bottom,
		appearance === "figma" ? 32 : 10,
	);
	const barHeight = (appearance === "figma" ? 61 : 58) + bottomPadding;

	return (
		<View className="absolute bottom-0 w-full" style={{ height: barHeight }}>
			<View
				className={
					appearance === "figma"
						? "size-full flex-row items-center justify-center gap-[14px] overflow-hidden rounded-t-[20px] bg-white px-4"
						: "size-full flex-row items-center justify-between gap-2 overflow-hidden rounded-t-[20px] border border-zinc-100 bg-white px-4 shadow-main"
				}
				style={[
					{
						paddingBottom: bottomPadding,
						paddingTop: appearance === "figma" ? 16 : 24,
					},
					appearance === "figma" && figmaStockShadows.tab,
					appearance === "figma" && { columnGap: width < 360 ? 8 : 14 },
				]}
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
							appearance={appearance}
							figmaIcon={FIGMA_ICONS[route.name]}
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
