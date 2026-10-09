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

function TargetHeader(props: ComponentProps<typeof Header>) {
	const focused = useIsFocused();
	return (
		<View style={focused ? headerStyles.active : headerStyles.inactive}>
			<Header {...props} />
		</View>
	);
}

function goBack(
	fallback: "/(back-office)/manage" | "/(no-layout)/manage/sales-target",
) {
	if (router.canGoBack()) router.back();
	else router.replace(fallback);
}

function backToList() {
	goBack("/(no-layout)/manage/sales-target");
}

export default function FeatureLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<TargetHeader
							back={() => goBack("/(back-office)/manage")}
							title="Target Penjualan"
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: ({ route: screenRoute }) => (
						<TargetHeader
							back={backToList}
							title={
								(screenRoute.params as { id?: string } | undefined)?.id
									? "Edit Target"
									: "Tambah Target"
							}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<TargetHeader back={backToList} title="Detail Target" />
					),
				}}
			/>
		</JSStack>
	);
}
