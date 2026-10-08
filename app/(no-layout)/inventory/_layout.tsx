import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function InventoryFlowLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen name="stock-transfer" options={{ headerShown: false }} />
			<JSStack.Screen
				name="stock-adjustment"
				options={{ headerShown: false }}
			/>
			<JSStack.Screen name="purchase-order" options={{ headerShown: false }} />
		</JSStack>
	);
}
