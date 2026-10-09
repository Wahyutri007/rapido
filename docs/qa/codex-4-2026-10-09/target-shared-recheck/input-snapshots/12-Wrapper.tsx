import React from "react";
import {
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	ScrollView,
	View,
} from "react-native";
import { BottomActionInset } from "@/components/common/BottomActionBar";
import { Colors } from "@/constants/Colors";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

export default function Wrapper(
	props: React.ComponentPropsWithoutRef<typeof ScrollView> & {
		hasBottomBar?: boolean;
		hasActionButton?: boolean;
		isNotScrollable?: boolean;
		avoidKeyboard?: boolean;
		keyboardVerticalOffset?: number;
		keyboardBehavior?: "height" | "position" | "padding";

		// Padding handled separately so scrollview padding is correctly applied
		py?: number;
		pt?: number;
		pb?: number;

		/** Pull to refresh callback. When provided, pull-to-refresh is enabled. */
		onRefresh?: () => void | Promise<void>;
		/** Controlled refreshing state. If omitted, managed internally. */
		refreshing?: boolean;
	},
) {
	const {
		children,
		hasBottomBar,
		className,
		py,
		pt,
		pb,
		isNotScrollable = false,
		hasActionButton,
		avoidKeyboard = true,
		keyboardVerticalOffset,
		keyboardBehavior = Platform.OS === "ios" ? "padding" : "height",
		onRefresh,
		refreshing,
		// Web also emits scroll events when the browser reveals a focused input.
		keyboardDismissMode = Platform.OS === "web" ? "none" : "on-drag",
		keyboardShouldPersistTaps = "handled",
		contentContainerStyle,
		...rest
	} = props;

	const paddingTop = pt ?? py;
	const paddingBottom = pb ?? py;

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

	const Slot = isNotScrollable ? View : ScrollView;

	const scrollProps = !isNotScrollable
		? {
				keyboardDismissMode,
				keyboardShouldPersistTaps,
				contentContainerStyle: [{ flexGrow: 1 }, contentContainerStyle],
				refreshControl: onRefresh ? (
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						colors={[Colors.primary]}
						tintColor={Colors.primary}
					/>
				) : undefined,
			}
		: {};

	return (
		<KeyboardAvoidingView
			behavior={keyboardBehavior}
			className="flex-1 bg-background"
			enabled={avoidKeyboard}
			keyboardVerticalOffset={
				keyboardVerticalOffset ?? (Platform.OS === "ios" ? 24 : 0)
			}
		>
			<Slot
				className={cn("relative flex-1", className)}
				showsVerticalScrollIndicator={false}
				scrollEnabled={!isNotScrollable}
				{...scrollProps}
				{...rest}
			>
				{paddingTop ? <View style={{ height: paddingTop }} /> : null}

				{children}
				{hasBottomBar && (
					<>
						<View className="h-20" />
						<BottomActionInset />
					</>
				)}
				{hasActionButton && (
					<>
						<View className="h-32" />
						<BottomActionInset />
					</>
				)}

				{paddingBottom ? <View style={{ height: paddingBottom }} /> : null}
			</Slot>
		</KeyboardAvoidingView>
	);
}
