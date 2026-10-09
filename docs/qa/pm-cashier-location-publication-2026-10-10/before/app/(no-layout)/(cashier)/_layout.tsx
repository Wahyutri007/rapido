import { router } from "expo-router";
import React from "react";
import Header from "@/components/common/Header";
import Text from "@/components/common/Text";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function CashierNoLayout() {
	return (
		<JSStack
			screenOptions={{
				...ScaleBackTransition,
			}}
		>
			<JSStack.Screen name="transaction" options={{ headerShown: false }} />
			<JSStack.Screen
				name="shift-report"
				options={{ header: () => <Header back title="Laporan Shift" /> }}
			/>
			<JSStack.Screen name="report" options={{ headerShown: false }} />
			<JSStack.Screen name="catalog" options={{ headerShown: false }} />
			<JSStack.Screen name="cart" options={{ headerShown: false }} />
			<JSStack.Screen
				name="cash-drawer"
				options={{
					header: () => (
						<Header
							appearance="cashier"
							title="Laci Kasir"
							back={() => {
								if (router.canGoBack()) router.back();
								else router.replace("/(cashier)/home");
							}}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="stock"
				options={{
					header: () => (
						<Header
							appearance="cashier"
							title="Stok Produk"
							right={
								<Text size="small" className="!text-muted">
									Pratinjau
								</Text>
							}
							back={() => {
								if (router.canGoBack()) router.back();
								else router.replace("/(cashier)/home");
							}}
						/>
					),
				}}
			/>
			<JSStack.Screen name="scanner" options={{ headerShown: false }} />
		</JSStack>
	);
}
