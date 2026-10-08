import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import React from "react";

export default function ExpensesLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => <Header back title="Laporan Pengeluaran" />,
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => <Header back title="Pengeluaran" />,
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Pengeluaran" />,
				}}
			/>
		</JSStack>
	);
}
