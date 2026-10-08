import Header from "@/components/common/Header";
import Text from "@/components/common/Text";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { useGlobalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function BundlingLayout() {
	const params = useGlobalSearchParams();

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Paket" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header back title={`${params?.id ? "Edit" : "Tambah"} Paket`} />
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<Header
							back
							title="Detail Paket"
							right={
								<View className="rounded-full bg-emerald-50 px-2.5 py-1">
									<Text size="small" w="semibold" className="text-emerald-600">
										Aktif
									</Text>
								</View>
							}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
