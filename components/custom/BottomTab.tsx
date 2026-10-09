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

// Original assets from Cashier 29:26627, shared by its five navigation tabs.
const CASHIER_ICONS: Record<string, ImageSource> = {
	"home/index": require("@/assets/images/cashier/navigation/home.svg"),
	report: require("@/assets/images/cashier/navigation/report.svg"),
	catalog: require("@/assets/images/cashier/navigation/catalog.svg"),
	"location/index": require("@/assets/images/cashier/navigation/location.svg"),
	biling: require("@/assets/images/cashier/navigation/bills.svg"),
};

type TabAppearance = "default" | "figma" | "cashier";

export function BottomTabPadding() {
	const insets = useSafeAreaInsets();
	const bottomPadding = Math.max(insets.bottom, 10);
	return <View style={{ height: 60 + bottomPadding }} />;
}

type TabItemButtonProps = {
	appearance?: TabAppearance;
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
	const isFigma = appearance !== "default";
	const isCashier = appearance === "cashier";
	const scale = useSharedValue(1);

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.get() }],
	}));

	React.useEffect(() => {
		if (isFigma) {
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
	}, [isFocused, scale, isFigma]);

	const handlePressIn = () => {
		scale.set(withSpring(0.94, { damping: 18, stiffness: 450 }));
	};

	const handlePressOut = () => {
		scale.set(withSpring(1, { damping: 18, stiffness: 450 }));
	};

	return (
		<Pressable
			accessibilityRole={isCashier ? "tab" : undefined}
			accessibilityLabel={isCashier ? label : undefined}
			accessibilityState={isCashier ? { selected: isFocused } : undefined}
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			className={
				isCashier
					? "items-center justify-center"
					: isFigma
						? "flex-1 items-center justify-center"
						: "flex-1 items-center justify-center py-1"
			}
			style={isCashier ? { width: 48, flexShrink: 1 } : undefined}
		>
			<Animated.View
				style={animatedIconStyle}
				className={
					isFigma
						? "size-6 items-center justify-center"
						: "size-7 items-center justify-center"
				}
			>
				{isFigma && figmaIcon ? (
					<Image
						source={figmaIcon}
						style={{ width: 24, height: 24 }}
						tintColor={isCashier ? itemColor : undefined}
					/>
				) : (
					tabBarIcon?.({
						focused: isFocused,
						color: itemColor,
						size: 22,
					})
				)}
			</Animated.View>
			<Text
				size={isFigma ? "small" : "body"}
				style={{
					color: itemColor,
					...(isFigma ? { lineHeight: 16 } : {}),
				}}
				className={isFigma ? "mt-2" : "mt-1 text-[11px]"}
				w={isFigma ? "regular" : isFocused ? "semibold" : "regular"}
				numberOfLines={1}
			>
				{label}
			</Text>
		</Pressable>
	);
}

export default function BottomTab(
	props: BottomTabBarProps & { appearance?: TabAppearance },
) {
	const { state, navigation, descriptors, appearance = "default" } = props;
	const isFigma = appearance !== "default";
	const isCashier = appearance === "cashier";
	const { width } = useWindowDimensions();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const bottomPadding = Math.max(insets.bottom, isFigma ? 32 : 10);
	// Cashier: 16 top + 24 icon + 8 gap + 16 label, then the safe area.
	const barHeight = (isCashier ? 64 : isFigma ? 61 : 58) + bottomPadding;

	return (
		<View className="absolute bottom-0 w-full" style={{ height: barHeight }}>
			<View
				className={
					isCashier
						? "size-full flex-row items-center justify-between overflow-hidden rounded-t-[20px] bg-white px-4"
						: isFigma
							? "size-full flex-row items-center justify-center gap-[14px] overflow-hidden rounded-t-[20px] bg-white px-4"
							: "size-full flex-row items-center justify-between gap-2 overflow-hidden rounded-t-[20px] border border-zinc-100 bg-white px-4 shadow-main"
				}
				style={[
					{
						paddingBottom: bottomPadding,
						paddingTop: isFigma ? 16 : 24,
					},
					isCashier && { boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)" },
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
					const itemColor = isFocused
						? Colors.primary
						: isCashier
							? "#2c2c2c"
							: Colors.neutral;

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
							figmaIcon={(isCashier ? CASHIER_ICONS : FIGMA_ICONS)[route.name]}
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
