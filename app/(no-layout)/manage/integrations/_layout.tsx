import { useGlobalSearchParams } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function IntegrationLayout() {
	const params = useGlobalSearchParams();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Integrasi Eksternal" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Detail Draf Integrasi" />,
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header
							back
							title={`${id === undefined ? "Tambah" : "Edit"} Draf Integrasi`}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
