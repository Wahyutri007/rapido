import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
export default function StockAdjustmentLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Penyesuaian Stok" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => <Header back title="Tambah Penyesuaian Stok" />,
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Detail Penyesuaian Stok" />,
				}}
			/>
		</JSStack>
	);
}
