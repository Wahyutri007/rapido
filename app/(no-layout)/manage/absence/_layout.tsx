import { router } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export const unstable_settings = { initialRouteName: "index" };

const headerStyles = StyleSheet.create({
	active: { pointerEvents: "auto" },
	inactive: { pointerEvents: "none" },
});

function AbsenceHeader(props: ComponentProps<typeof Header>) {
	const focused = useIsFocused();
	return (
		<View style={focused ? headerStyles.active : headerStyles.inactive}>
			<Header {...props} />
		</View>
	);
}

function goBack(
	fallback: "/(back-office)/manage" | "/(no-layout)/manage/absence",
) {
	if (router.canGoBack()) router.back();
	else router.replace(fallback);
}

export default function FeatureLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<AbsenceHeader
							back={() => goBack("/(back-office)/manage")}
							title="Absensi"
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<AbsenceHeader
							back={() => goBack("/(no-layout)/manage/absence")}
							title="Detail Absensi"
						/>
					),
				}}
			/>
		</JSStack>
	);
}
