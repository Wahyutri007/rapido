import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
export default function StockTransferLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Transfer Stok" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{ header: () => <Header back title="Tambah Transfer Stok" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Transfer Stok" /> }}
			/>
		</JSStack>
	);
}
