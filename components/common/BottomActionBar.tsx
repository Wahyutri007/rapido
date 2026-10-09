import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

/** Fixed footer with its original content gap above the system navigation area. */
export default function BottomActionBar({
	children,
	className,
	bottomPadding = 16,
	topPadding = 16,
}: PropsWithChildren<{
	className?: string;
	bottomPadding?: number;
	topPadding?: number;
}>) {
	const insets = useSafeAreaInsets();
	return (
		<View
			className={cn(
				"absolute bottom-0 left-0 right-0 border-t border-border-muted bg-white p-4",
				className,
			)}
			style={{
				paddingTop: topPadding,
				paddingBottom: bottomPadding + insets.bottom,
				paddingLeft: 16 + insets.left,
				paddingRight: 16 + insets.right,
			}}
		>
			{children}
		</View>
	);
}

/** Extra scroll clearance matching the inset added to the fixed action bar. */
export function BottomActionInset() {
	const insets = useSafeAreaInsets();
	return <View pointerEvents="none" style={{ height: insets.bottom }} />;
}
