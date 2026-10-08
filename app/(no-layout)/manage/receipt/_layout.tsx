import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function ReceiptLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Daftar Struk Toko" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{ header: () => <Header back title="Tampilan Struk" /> }}
			/>
			<JSStack.Screen
				name="preview"
				options={{ header: () => <Header back title="Preview Struk" /> }}
			/>
		</JSStack>
	);
}
