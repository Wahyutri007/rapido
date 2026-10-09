import { router } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { route } from "@/lib/utils";

function goBack(fallback: string) {
	if (router.canGoBack()) router.back();
	else router.replace(route(fallback));
}

export default function StockMovementLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<Header
							title="Riwayat Mutasi Stok"
							back={() => goBack("/inventory")}
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="detail"
				options={{
					header: () => (
						<Header
							title="Detail Mutasi Stok"
							back={() => goBack("/inventory/stock-movement")}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
