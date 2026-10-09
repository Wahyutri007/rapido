import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
export default function ExportLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Ekspor Data" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{ header: () => <Header back title="Ekspor Data" /> }}
			/>
		</JSStack>
	);
}
