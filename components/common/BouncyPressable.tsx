import { cssInterop } from "nativewind";
import type React from "react";
import {
	type GestureResponderEvent,
	Pressable,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { haptic } from "@/lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
cssInterop(AnimatedPressable, { className: "style" });

export type BouncyPressableProps = React.ComponentPropsWithoutRef<
	typeof Pressable
> & {
	activeScale?: number;
	hapticType?:
		| "light"
		| "medium"
		| "heavy"
		| "selection"
		| "warning"
		| "none";
	/**
	 * Ripple mode on Android:
	 * - true: bounded ripple strictly confined to container bounds/corners
	 * - "borderless": circular borderless ripple for icon buttons
	 * - false: disable ripple (uses scale animation instead)
	 *
	 * Note: Mutual exclusion is enforced. When ripple is active, scale animation
	 * is disabled so the two effects never conflict.
	 */
	ripple?: boolean | "borderless";
	rippleColor?: string;
};

const SPRING_CONFIG = {
	damping: 18,
	stiffness: 450,
	mass: 0.5,
};

export default function BouncyPressable({
	children,
	style,
	activeScale = 0.98,
	hapticType = "light",
	ripple = false,
	rippleColor,
	disabled,
	onPressIn,
	onPressOut,
	...props
}: BouncyPressableProps) {
	const scale = useSharedValue(1);

	const hasRipple = Boolean(ripple || props.android_ripple);
	const shouldScale =
		!hasRipple && activeScale !== undefined && activeScale !== 1;

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.get() }],
	}));

	const triggerHaptic = () => {
		if (hapticType === "none") return;
		switch (hapticType) {
			case "light":
				haptic.light();
				break;
			case "medium":
				haptic.medium();
				break;
			case "heavy":
				haptic.heavy();
				break;
			case "selection":
				haptic.selection();
				break;
			case "warning":
				haptic.warning();
				break;
		}
	};

	const handlePressIn = (e: GestureResponderEvent) => {
		if (!disabled) {
			if (shouldScale) {
				scale.set(withSpring(activeScale, SPRING_CONFIG));
			}
			triggerHaptic();
		}
		onPressIn?.(e);
	};

	const handlePressOut = (e: GestureResponderEvent) => {
		if (!disabled && shouldScale) {
			scale.set(withSpring(1, SPRING_CONFIG));
		}
		onPressOut?.(e);
	};

	let resolvedRipple = props.android_ripple;
	if (resolvedRipple === undefined && ripple) {
		if (ripple === "borderless") {
			resolvedRipple = {
				color: rippleColor ?? "rgba(0, 0, 0, 0.12)",
				borderless: true,
				radius: 20,
			};
		} else {
			resolvedRipple = {
				color: rippleColor ?? "rgba(0, 0, 0, 0.08)",
				borderless: false,
			};
		}
	}

	return (
		<AnimatedPressable
			android_ripple={resolvedRipple}
			{...props}
			disabled={disabled}
			style={[
				style as StyleProp<ViewStyle>,
				shouldScale && animatedStyle,
			]}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
		>
			{children}
		</AnimatedPressable>
	);
}
