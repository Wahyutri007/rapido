import { useGlobalSearchParams } from "expo-router";
import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { useAppModeStore } from "@/store/appModeStore";

export default function PrinterLayout() {
	const params = useGlobalSearchParams();
	const isCashier = useAppModeStore((state) => state.mode === "cashier");

	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{
					header: () => (
						<Header
							appearance={isCashier ? "cashier" : "default"}
							back
							title="Printer"
						/>
					),
				}}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header
							appearance={isCashier ? "cashier" : "default"}
							back
							title={`${params?.id ? "Edit" : "Tambah"} Printer`}
						/>
					),
				}}
			/>
		</JSStack>
	);
}
