import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function InventoryLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header title="Persediaan" /> }}
			/>
			<JSStack.Screen
				name="summary"
				options={{ header: () => <Header back title="Ringkasan Inventory" /> }}
			/>
		</JSStack>
	);
}
