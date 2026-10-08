import React from "react";
import type Animated from "react-native-reanimated";
import {
	Easing,
	scrollTo,
	useAnimatedReaction,
	useAnimatedRef,
	useAnimatedScrollHandler,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const SCROLL_TO_TOP_DURATION = 500;

/**
 * Scroll plumbing for animated scroll views: ref, animated scroll handler,
 * scroll offset / max offset shared values, a 0..1 `ratio`, and an eased
 * `scrollToTop` helper (cubic in-out).
 */
export function useScrollProgress() {
	const scrollRef =
		useAnimatedRef<React.ComponentRef<typeof Animated.ScrollView>>();

	const scrollY = useSharedValue(0);
	const maxScroll = useSharedValue(0);
	// Drives programmatic scrolling so we can control the easing.
	const animatedOffset = useSharedValue(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollY.set(event.contentOffset.y);
			maxScroll.set(
				Math.max(0, event.contentSize.height - event.layoutMeasurement.height),
			);
		},
	});

	const ratio = useDerivedValue(() => {
		const maxOffset = maxScroll.get();
		if (maxOffset <= 0) return 0;
		return Math.min(1, Math.max(0, scrollY.get() / maxOffset));
	});

	useAnimatedReaction(
		() => animatedOffset.get(),
		(offset) => {
			scrollTo(scrollRef, 0, offset, false);
		},
	);

	const scrollToTop = React.useCallback(() => {
		animatedOffset.set(scrollY.get());
		animatedOffset.set(
			withTiming(0, {
				duration: SCROLL_TO_TOP_DURATION,
				easing: Easing.inOut(Easing.cubic),
			}),
		);
	}, [animatedOffset, scrollY]);

	return { scrollRef, scrollHandler, scrollY, maxScroll, ratio, scrollToTop };
}
