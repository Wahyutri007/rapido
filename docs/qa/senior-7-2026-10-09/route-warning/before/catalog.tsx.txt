import React from "react";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

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
		</JSStack>
	);
}
