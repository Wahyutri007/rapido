import { useGlobalSearchParams } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function PaymentMethodLayout() {
	const params = useGlobalSearchParams();

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Metode Pembayaran" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Detail Metode Pembayaran" />,
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header
							back
							title={`${params?.id ? "Edit" : "Tambah"} Metode Pembayaran`}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
