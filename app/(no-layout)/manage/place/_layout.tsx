import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function PlaceLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Manajemen Tempat" /> }}
			/>
			<JSStack.Screen
				name="store"
				options={{ header: () => <Header back title="Detail Toko / Outlet" /> }}
			/>
			<JSStack.Screen
				name="area"
				options={{ header: () => <Header back title="Atur Tempat" /> }}
			/>
			<JSStack.Screen
				name="areas"
				options={{ header: () => <Header back title="Atur Area" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{ header: () => <Header back title="Pengaturan Tempat" /> }}
			/>
		</JSStack>
	);
}
