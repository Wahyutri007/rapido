import React from "react";
import Header from "@/components/common/Header";
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
			<JSStack.Screen name="scanner" options={{ headerShown: false }} />
		</JSStack>
	);
}
