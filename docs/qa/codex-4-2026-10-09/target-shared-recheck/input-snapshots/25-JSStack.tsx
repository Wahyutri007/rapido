import type {
	ParamListBase,
	StackNavigationState,
} from "expo-router/react-navigation";
import {
	createStackNavigator,
	type StackCardInterpolationProps,
	type StackNavigationEventMap,
	type StackNavigationOptions,
} from "expo-router/js-stack";
import { router, withLayoutContext } from "expo-router";
import { Easing, Platform } from "react-native";

const { Navigator } = createStackNavigator();

export const JSStack = withLayoutContext<
	StackNavigationOptions,
	typeof Navigator,
	StackNavigationState<ParamListBase>,
	StackNavigationEventMap
>(Navigator);

// Exaggerated overdamped deceleration curve with a relaxed glide
const openTransition = {
	animation: "timing" as const,
	config: {
		duration: 650,
		easing: Easing.bezier(0.2, 0.4, 0.1, 1.0),
	},
};

const closeTransition = {
	animation: "timing" as const,
	config: {
		duration: 520,
		easing: Easing.bezier(0.2, 0.4, 0.1, 1.0),
	},
};

export const ScaleBackTransition: StackNavigationOptions = {
	// Expo locks body scrolling; keep web cards bounded so screen ScrollViews can scroll.
	cardStyle:
		Platform.OS === "web"
			? { flex: 1, minHeight: 0, overflow: "hidden" }
			: undefined,
	gestureDirection: "horizontal",
	presentation: "card",
	transitionSpec: {
		open: openTransition,
		close: closeTransition,
	},
	cardStyleInterpolator: ({
		current,
		next,
		layouts,
	}: StackCardInterpolationProps) => {
		// 1. INCOMING SCREEN TRANSLATION
		// Brings the screen in from the right
		const translateX = current.progress.interpolate({
			inputRange: [0, 1],
			outputRange: [layouts.screen.width, 0],
		});

		return {
			cardStyle: {
				transform: [
					// If a new screen opens, this current screen gets pushed left
					{
						translateX: next
							? next.progress.interpolate({
									inputRange: [0, 1],
									outputRange: [0, -(layouts.screen.width * 0.3)], // Slide left 30%
								})
							: translateX, // Otherwise, slide in from the right normally
					},
				],
				// Lightweight shadow on iOS; avoid native elevation on Android during translation
				// as Android 3D shadow tessellation drops frames at 120Hz and causes prop warnings.
				...(Platform.OS === "ios"
					? {
							shadowColor: "#000",
							shadowOffset: {
								width: -3,
								height: 0,
							},
							shadowOpacity: 0.12,
							shadowRadius: 8,
						}
					: {}),
			},
			overlayStyle: {
				// Light dimming overlay on the outgoing screen
				opacity: current.progress.interpolate({
					inputRange: [0, 1],
					outputRange: [0, 0.25],
				}),
				backgroundColor: "#000",
			},
		};
	},
};

export function delayedBack(delay: number = 250) {
	setTimeout(() => {
		router.back();
	}, delay);
}
