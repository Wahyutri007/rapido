import React from "react";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { useGlobalSearchParams } from "expo-router";

export default function PosSettingsLayout() {
	const params = useGlobalSearchParams<{ id?: string }>();

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Pengaturan POS" /> }}
			/>
			<JSStack.Screen
				name="stock-limit"
				options={{
					header: () => <Header back title="Pengaturan Batas Stok" />,
				}}
			/>
			<JSStack.Screen
				name="stock-limit-detail"
				options={{
					header: () => <Header back title="Detail Batas Stok" />,
				}}
			/>
			<JSStack.Screen
				name="rounding"
				options={{
					header: () => <Header back title="Pengaturan Pembulatan" />,
				}}
			/>
			<JSStack.Screen
				name="rounding-detail"
				options={{
					header: () => <Header back title="Detail Aturan Pembulatan" />,
				}}
			/>
			<JSStack.Screen
				name="notifications"
				options={{
					header: () => <Header back title="Pemberitahuan Otomatis" />,
				}}
			/>
			<JSStack.Screen
				name="notification-modify"
				options={{
					header: () => (
						<Header
							back
							title={params?.id ? "Edit Jadwal" : "Buat Jadwal Baru"}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="notification-detail"
				options={{
					header: () => <Header back title="Detail Jadwal" />,
				}}
			/>
		</JSStack>
	);
}
