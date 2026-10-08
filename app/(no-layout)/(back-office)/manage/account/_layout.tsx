import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function ManageAccountLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Akun" /> }}
			/>
			<JSStack.Screen
				name="modify-owner"
				options={{
					header: () => <Header back title="Informasi Pemilik" />,
				}}
			/>
			<JSStack.Screen
				name="modify-business"
				options={{
					header: () => <Header back title="Informasi Bisnis" />,
				}}
			/>
		</JSStack>
	);
}
