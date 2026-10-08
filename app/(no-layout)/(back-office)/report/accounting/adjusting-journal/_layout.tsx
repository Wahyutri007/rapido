import { useGlobalSearchParams } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function AdjustingJournalLayout() {
	const params = useGlobalSearchParams();

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => <Header back title="Jurnal Penyesuaian" />,
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={({ route }: { route: { params?: { id?: string } } }) => ({
					header: () => (
						<Header
							back
							title={
								route?.params?.id || params?.id
									? "Edit Jurnal Penyesuaian"
									: "Buat Jurnal Penyesuaian"
							}
						/>
					),
				})}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Detail Jurnal Penyesuaian" />,
				}}
			/>
		</JSStack>
	);
}
