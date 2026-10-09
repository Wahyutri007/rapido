import { router } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import { StyleSheet, View } from "react-native";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

const styles = StyleSheet.create({
	active: { pointerEvents: "auto" },
	inactive: { pointerEvents: "none" },
});
function BillHeader() {
	const focused = useIsFocused();
	return (
		<View style={focused ? styles.active : styles.inactive}>
			<Header
				title="Tagihan"
				appearance="figma"
				titleClassName="!text-foreground"
				back={() => router.replace("/(cashier)/home")}
			/>
		</View>
	);
}
export default function BillingLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen name="index" options={{ header: () => <BillHeader /> }} />
		</JSStack>
	);
}
