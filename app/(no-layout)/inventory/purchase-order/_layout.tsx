import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
export default function PurchaseOrderLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Pembelian Barang" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{ header: () => <Header back title="Pembelian Barang" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Detail Pesanan Pembelian" />,
				}}
			/>
		</JSStack>
	);
}
