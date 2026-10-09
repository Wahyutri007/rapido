import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function CompositionLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Komposisi Produk" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{ header: () => <Header back title="Atur Resep" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Komposisi" /> }}
			/>
		</JSStack>
	);
}
