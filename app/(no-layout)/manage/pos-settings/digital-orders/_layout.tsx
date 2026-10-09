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
function ChannelHeader(props: ComponentProps<typeof Header>) {
	const focused = useIsFocused();
	return (
		<View style={focused ? styles.active : styles.inactive}>
			<Header {...props} />
		</View>
	);
}
function goBack(fallback: string) {
	if (router.canGoBack()) router.back();
	else router.replace(route(fallback));
}
export default function ChannelLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<ChannelHeader
							title="Pesanan Digital"
							back={() => goBack("/manage/pos-settings")}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={({ route: activeRoute }) => ({
					header: () => (
						<ChannelHeader
							title={
								activeRoute.params &&
								"id" in activeRoute.params &&
								activeRoute.params.id !== undefined
									? "Edit Kanal Pemesanan"
									: "Tambah Kanal Pemesanan"
							}
							back={() => goBack("/manage/pos-settings/digital-orders")}
						/>
					),
				})}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<ChannelHeader
							title="Detail Kanal Pemesanan"
							back={() => goBack("/manage/pos-settings/digital-orders")}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
