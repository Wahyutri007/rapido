import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function GeneralLedgerLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => <Header back title="Buku Besar" />,
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => <Header back title="Detail Buku Besar" />,
				}}
			/>
		</JSStack>
	);
}
