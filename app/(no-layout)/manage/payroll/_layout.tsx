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

function PayrollHeader(props: ComponentProps<typeof Header>) {
	const focused = useIsFocused();
	// Registered styles restore web pointer handling after the stack regains focus.
	return (
		<View style={focused ? headerStyles.active : headerStyles.inactive}>
			<Header {...props} />
		</View>
	);
}

function goBack(
	fallback: "/(back-office)/manage" | "/(no-layout)/manage/payroll",
) {
	if (router.canGoBack()) router.back();
	else router.replace(fallback);
}

function backToList() {
	goBack("/(no-layout)/manage/payroll");
}

export default function FeatureLayout() {
	return (
		<JSStack screenOptions={ScaleBackTransition}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<PayrollHeader
							back={() => goBack("/(back-office)/manage")}
							title="Penggajian"
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<PayrollHeader back={backToList} title="Rincian Penggajian" />
					),
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => <PayrollHeader back={backToList} title="Atur Gaji" />,
				}}
			/>
			<JSStack.Screen
				name="payment"
				options={{
					header: () => (
						<PayrollHeader back={backToList} title="Catat Pembayaran" />
					),
				}}
			/>
			<JSStack.Screen
				name="history"
				options={{
					header: () => (
						<PayrollHeader back={backToList} title="Riwayat Penghasilan" />
					),
				}}
			/>
			<JSStack.Screen
				name="slip"
				options={{
					header: () => <PayrollHeader back={backToList} title="Slip Gaji" />,
				}}
			/>
		</JSStack>
	);
}
