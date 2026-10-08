import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function SupplierLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Pemasok" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={({ route }) => ({
					header: () => (
						<Header
							back
							title={
								route.params && "id" in route.params && route.params.id
									? "Edit Pemasok"
									: "Tambah Pemasok"
							}
						/>
					),
				})}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Pemasok" /> }}
			/>
		</JSStack>
	);
}
