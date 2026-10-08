import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { useGlobalSearchParams } from "expo-router";
import React from "react";

export default function AccountsLayout() {
	const params = useGlobalSearchParams();

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => <Header back title="Saldo Awal Akun" />,
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header back title={params?.id ? "Edit Akun" : "Tambah Akun"} />
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Detail Akun" />,
				}}
			/>
		</JSStack>
	);
}
