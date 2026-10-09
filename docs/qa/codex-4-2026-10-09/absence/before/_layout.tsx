import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function FeatureLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Absensi" /> }}
			/>
		</JSStack>
	);
}
