import { useGlobalSearchParams } from "expo-router";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import Header from "@/components/common/Header";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { useAuth } from "@/context/AuthContext";

export const unstable_settings = { initialRouteName: "index" };

export default function WorkerLayout() {
	const { id } = useGlobalSearchParams();
	const { isLoading, hasRole } = useAuth();
	if (isLoading || !hasRole("owner"))
		return (
			<>
				<Header back title="Karyawan" />
				<Wrapper contentContainerStyle={{ padding: 16 }}>
					{isLoading ? (
						<LoadingPlaceholder />
					) : (
						<Text size="normal" className="text-muted">
							Hanya pemilik akun yang dapat mengelola karyawan.
						</Text>
					)}
				</Wrapper>
			</>
		);
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Karyawan" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Karyawan" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header back title={id ? "Edit Karyawan" : "Tambah Karyawan"} />
					),
				}}
			/>
		</JSStack>
	);
}
