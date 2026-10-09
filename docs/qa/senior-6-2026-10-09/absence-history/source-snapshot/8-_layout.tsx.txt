import Header from "@/components/common/Header";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";

export default function AbsenceLayout() {
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen name="home" options={{ headerShown: false }} />
			<JSStack.Screen name="history" options={{ headerShown: false }} />
			<JSStack.Screen
				name="record"
				options={({ route }: any) => ({
					header: () => (
						<Header
							title={
								route.params?.type === "out"
									? "Ambil Absensi Keluar"
									: "Ambil Absensi Masuk"
							}
							back
						/>
					),
				})}
			/>
			<JSStack.Screen
				name="camera"
				options={{
					header: () => <Header title="Ambil Absensi" back />,
				}}
			/>
		</JSStack>
	);
}
