import { useGlobalSearchParams } from "expo-router";
import { View } from "react-native";
import Header from "@/components/common/Header";
import Text from "@/components/common/Text";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function DiscountLayout() {
	const params = useGlobalSearchParams();

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Diskon" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header back title={`${params?.id ? "Edit" : "Tambah"} Diskon`} />
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<Header
							back
							title="Detail Diskon"
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
