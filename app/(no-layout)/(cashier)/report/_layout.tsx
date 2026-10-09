import React from "react";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function CashierReportNoLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen name="index" options={{ headerShown: false }} />
			<JSStack.Screen
				name="expense-input"
				options={{
					header: () => (
						<Header appearance="cashier" back title="Pengeluaran" />
					),
				}}
			/>
		</JSStack>
	);
}
