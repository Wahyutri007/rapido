import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function IncomesLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => <Header back title="Laporan Penerimaan" />,
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => <Header back title="Penerimaan" />,
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Penerimaan" />,
				}}
			/>
			<JSStack.Screen
				name="receipt"
				options={{
					header: () => <Header back title="Bukti Pembayaran" />,
				}}
			/>
		</JSStack>
	);
}
