import React from "react";
import {
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	View,
} from "react-native";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import ScrollToTopFab from "./ScrollToTopFab";

type AnimatedWrapperProps = Omit<
	React.ComponentPropsWithoutRef<typeof Animated.ScrollView>,
	"onScroll" | "children"
> & {
	children: React.ReactNode;
	hasBottomBar?: boolean;
	hasActionButton?: boolean;
	avoidKeyboard?: boolean;
	keyboardVerticalOffset?: number;
	keyboardBehavior?: "height" | "position" | "padding";

	// Padding handled separately so scrollview padding is correctly applied
	py?: number;
	pt?: number;
	pb?: number;

	/** Show the scroll-to-top FAB when the content is scrollable. Defaults to true. */
	showScrollToTopFab?: boolean;
	/** Distance from the bottom of the container for the FAB. */
	fabBottomOffset?: number;

	/** Pull to refresh callback. When provided, pull-to-refresh is enabled. */
	onRefresh?: () => void | Promise<void>;
	/** Controlled refreshing state. If omitted, managed internally. */
	refreshing?: boolean;
};

/**
 * Animated counterpart to `Wrapper`: a scroll container that tracks scroll
 * progress and optionally renders a scroll-to-top FAB. The FAB only appears
 * when the content is actually scrollable and the user isn't at the top.
 *
 * Pull-to-refresh is only active when `onRefresh` is explicitly provided.
 */
export default function AnimatedWrapper(props: AnimatedWrapperProps) {
	const {
		children,
		className,
		contentContainerStyle,
		hasBottomBar,
		hasActionButton,
		avoidKeyboard = true,
		keyboardVerticalOffset,
		keyboardBehavior = Platform.OS === "ios" ? "padding" : "height",
		py,
		pt,
		pb,
		showScrollToTopFab = true,
		fabBottomOffset,
		onRefresh,
		refreshing,
		keyboardDismissMode = "on-drag",
		keyboardShouldPersistTaps = "handled",
		...rest
	} = props;

	const { scrollRef, scrollHandler, scrollY, maxScroll, scrollToTop } =
		useScrollProgress();

	const [isInternalRefreshing, setIsInternalRefreshing] = React.useState(false);
	const isRefreshing =
		refreshing !== undefined ? refreshing : isInternalRefreshing;

	const handleRefresh = React.useCallback(async () => {
		if (!onRefresh) return;
		haptic.light();
		if (refreshing === undefined) {
			setIsInternalRefreshing(true);
		}
		try {
			await onRefresh();
		} finally {
			if (refreshing === undefined) {
				setIsInternalRefreshing(false);
			}
		}
	}, [onRefresh, refreshing]);

	const paddingTop = pt ?? py;
	const paddingBottom = pb ?? py;

	const resolvedFabBottom =
		fabBottomOffset ?? (hasActionButton ? 144 : hasBottomBar ? 96 : 24);

	return (
		<KeyboardAvoidingView
			behavior={keyboardBehavior}
			className="flex-1 bg-background"
			enabled={avoidKeyboard}
			keyboardVerticalOffset={
				keyboardVerticalOffset ?? (Platform.OS === "ios" ? 24 : 0)
			}
		>
			<Animated.ScrollView
				ref={scrollRef}
				className={cn("relative flex-1", className)}
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
				keyboardDismissMode={keyboardDismissMode}
				keyboardShouldPersistTaps={keyboardShouldPersistTaps}
				refreshControl={
					onRefresh ? (
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={handleRefresh}
							colors={[Colors.primary]}
							tintColor={Colors.primary}
						/>
					) : undefined
				}
				{...rest}
			>
				{paddingTop ? <View style={{ height: paddingTop }} /> : null}

				{children}
				{hasBottomBar && <View className="h-20" />}
				{hasActionButton && <View className="h-32" />}

				{paddingBottom ? <View style={{ height: paddingBottom }} /> : null}
			</Animated.ScrollView>

			{showScrollToTopFab && (
				<ScrollToTopFab
					scrollY={scrollY}
					maxScroll={maxScroll}
					onPress={scrollToTop}
					bottomOffset={resolvedFabBottom}
				/>
			)}
		</KeyboardAvoidingView>
	);
}
