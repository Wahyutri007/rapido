import { useGlobalSearchParams } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function GeneralJournalLayout() {
	const params = useGlobalSearchParams();

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => <Header back title="Jurnal Umum" />,
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header
							back
							title={params?.id ? "Edit Jurnal Umum" : "Buat Jurnal Umum"}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Detail Jurnal Umum" />,
				}}
			/>
		</JSStack>
	);
}
