import { View } from "react-native";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { cashInputHeaderTheme } from "@/lib/cashier/cash-input-theme";

export default function CartLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Detail Pesanan" /> }}
			/>
			<JSStack.Screen
				name="offer"
				options={{ header: () => <Header back title="Penawaran" /> }}
			/>
			<JSStack.Screen
				name="confirm"
				options={{
					header: () => <Header back title="Konfirmasi" />,
				}}
			/>
			<JSStack.Screen
				name="input-money"
				options={{
					header: () => (
						<View style={cashInputHeaderTheme}>
							<Header back title="Uang Diterima" appearance="figma" />
							<View className="absolute bottom-0 left-0 right-0 h-px bg-border-muted" />
						</View>
					),
				}}
			/>
			<JSStack.Screen
				name="input-money-confirm"
				options={{
					header: () => <Header back title="Transaksi Tunai" />,
				}}
			/>
		</JSStack>
	);
}
