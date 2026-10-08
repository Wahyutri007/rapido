import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { useGlobalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function ExtraMenuLayout() {
	const params = useGlobalSearchParams();

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Tambahan" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header
							back
							title={`${params?.id ? "Edit" : "Tambah"} Ekstra`}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<Header
							back
							title="Detail Tambahan"
							right={
								<View className="rounded-lg bg-green-50 px-2.5 py-1">
									<Text className="text-xs font-semibold text-green-600">
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
