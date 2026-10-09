import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Boundary for legacy screens whose bottom controls sit outside Wrapper. */
export default function ScreenSafeArea({ children }: PropsWithChildren) {
	const insets = useSafeAreaInsets();
	return (
		<View
			style={{
				flex: 1,
				paddingBottom: insets.bottom,
				paddingLeft: insets.left,
				paddingRight: insets.right,
			}}
		>
			{children}
		</View>
	);
}
