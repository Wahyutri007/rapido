import React from "react";
import { View } from "react-native";
import BouncyPressable from "@/components/common/BouncyPressable";
import Animated, {
	type SharedValue,
	useAnimatedProps,
	useAnimatedStyle,
	useDerivedValue,
	withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { ArrowUpIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

const SIZE = 44;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type ScrollToTopFabProps = {
	/** Current vertical scroll offset. */
	scrollY: SharedValue<number>;
	/** Maximum scrollable distance (contentHeight - viewportHeight). */
	maxScroll: SharedValue<number>;
	onPress: () => void;
	/** Distance from the bottom of the container. Defaults to 24. */
	bottomOffset?: number;
	className?: string;
};

/**
 * Floating scroll-to-top button: a circular progress ring that fills according
 * to scroll progression, with an arrow inside. Hidden while at the top, or when
 * the content isn't tall enough to scroll.
 */
export default function ScrollToTopFab(props: ScrollToTopFabProps) {
	const { scrollY, maxScroll, onPress, bottomOffset = 24, className } = props;

	const progress = useDerivedValue(() => {
		if (maxScroll.value <= 0) return 0;
		return Math.min(1, Math.max(0, scrollY.value / maxScroll.value));
	});

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
	}));

	const containerStyle = useAnimatedStyle(() => {
		const visible = maxScroll.value > 80 && scrollY.value > 120;

		return {
			opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
			transform: [{ scale: withTiming(visible ? 1 : 0.75, { duration: 200 }) }],
		};
	});

	return (
		<Animated.View
			style={[containerStyle, { bottom: bottomOffset }]}
			className={cn("absolute right-4", className)}
			pointerEvents="box-none"
		>
			<BouncyPressable
				onPress={onPress}
				activeScale={0.9}
				hapticType="light"
				hitSlop={8}
				style={{ width: SIZE, height: SIZE }}
				className="items-center justify-center"
			>
				<Svg
					width={SIZE}
					height={SIZE}
					pointerEvents="none"
					style={{ position: "absolute" }}
				>
					<Circle
						cx={SIZE / 2}
						cy={SIZE / 2}
						r={RADIUS}
						stroke={Colors.zinc[200]}
						strokeWidth={STROKE}
						fill="none"
					/>
					<AnimatedCircle
						cx={SIZE / 2}
						cy={SIZE / 2}
						r={RADIUS}
						stroke={Colors.primary}
						strokeWidth={STROKE}
						fill="none"
						strokeLinecap="round"
						strokeDasharray={CIRCUMFERENCE}
						animatedProps={animatedProps}
						transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
					/>
				</Svg>
				<View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white shadow-hard-2">
					<ArrowUpIcon size={16} color={Colors.primary} />
				</View>
			</BouncyPressable>
		</Animated.View>
	);
}
