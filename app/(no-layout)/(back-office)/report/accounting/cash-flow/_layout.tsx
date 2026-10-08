import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function CashFlowLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => <Header back title="Laporan Arus Kas" />,
				}}
			/>
			<JSStack.Screen
				name="operasi"
				options={{
					header: () => <Header back title="Detail Arus Kas Operasi" />,
				}}
			/>
			<JSStack.Screen
				name="investasi"
				options={{
					header: () => <Header back title="Detail Arus Kas Investasi" />,
				}}
			/>
			<JSStack.Screen
				name="pendanaan"
				options={{
					header: () => <Header back title="Detail Arus Pendanaan" />,
				}}
			/>
		</JSStack>
	);
}
