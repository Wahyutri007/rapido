import { useGlobalSearchParams } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function FeatureLayout() {
	const { id } = useGlobalSearchParams<{ id?: string }>();
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => <Header back title="Pendapatan & Penerimaan" />,
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header back title={id ? "Edit Penerimaan" : "Tambah Penerimaan"} />
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Penerimaan" /> }}
			/>
		</JSStack>
	);
}
