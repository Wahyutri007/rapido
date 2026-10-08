import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function FeatureLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Penggajian" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Rincian Penggajian" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{ header: () => <Header back title="Atur Gaji" /> }}
			/>
			<JSStack.Screen
				name="payment"
				options={{ header: () => <Header back title="Catat Pembayaran" /> }}
			/>
			<JSStack.Screen
				name="history"
				options={{ header: () => <Header back title="Riwayat Penghasilan" /> }}
			/>
			<JSStack.Screen
				name="slip"
				options={{ header: () => <Header back title="Slip Gaji" /> }}
			/>
		</JSStack>
	);
}
