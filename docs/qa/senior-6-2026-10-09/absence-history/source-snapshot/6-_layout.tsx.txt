import { router } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { route } from "@/lib/utils";

export const unstable_settings = { initialRouteName: "index" };

const styles = StyleSheet.create({
	active: { pointerEvents: "auto" },
	inactive: { pointerEvents: "none" },
});

function HistoryHeader(props: ComponentProps<typeof Header>) {
	const focused = useIsFocused();
	return (
		<View style={focused ? styles.active : styles.inactive}>
			<Header {...props} />
		</View>
	);
}

function goBack(fallback: "/(absence)/home" | "/(absence)/history") {
	if (router.canGoBack()) router.back();
	else router.replace(route(fallback));
}

export default function HistoryLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<HistoryHeader
							title="Riwayat Absensi"
							back={() => goBack("/(absence)/home")}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<HistoryHeader
							title="Detail Riwayat Absensi"
							back={() => goBack("/(absence)/history")}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
