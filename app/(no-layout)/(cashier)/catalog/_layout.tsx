import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BouncyPressable from "@/components/common/BouncyPressable";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

function CatalogBillsHeader() {
	const insets = useSafeAreaInsets();
	return (
		<View>
			<Header appearance="cashier" title="Tagihan" className="pt-1 pb-3" />
			<BouncyPressable
				className="absolute size-10 items-center justify-center"
				style={{ left: 8 + insets.left, top: insets.top }}
				accessibilityRole="button"
				accessibilityLabel="Kembali"
				ripple="borderless"
				onPress={() => {
					if (router.canGoBack()) router.back();
					else router.replace("/(no-layout)/(cashier)/catalog");
				}}
			>
				<Image
					source={require("@/assets/images/figma/back-office/back.svg")}
					style={{ width: 24, height: 24 }}
					accessible={false}
				/>
			</BouncyPressable>
		</View>
	);
}

export default function MenuLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header title="Katalog" back /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header title="Detail Pesanan" back /> }}
			/>
			<JSStack.Screen
				name="bills"
				options={{ header: () => <CatalogBillsHeader /> }}
			/>
		</JSStack>
	);
}
