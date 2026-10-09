import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function BillPaymentLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Pembayaran Tagihan" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{ header: () => <Header back title="Pembayaran Tagihan" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Pembayaran" /> }}
			/>
		</JSStack>
	);
}
