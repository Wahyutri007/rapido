import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
export default function MaterialLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Bahan Baku" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={({ route }) => ({
					header: () => (
						<Header
							back
							title={
								route.params && "id" in route.params
									? "Edit Bahan Baku"
									: "Tambah Bahan Baku"
							}
						/>
					),
				})}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Bahan Baku" /> }}
			/>
		</JSStack>
	);
}
