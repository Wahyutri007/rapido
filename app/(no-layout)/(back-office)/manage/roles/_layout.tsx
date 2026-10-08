import { useGlobalSearchParams } from "expo-router";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import Header from "@/components/common/Header";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { useAuth } from "@/context/AuthContext";

export default function RoleLayout() {
	const { id } = useGlobalSearchParams();
	const { isLoading, hasRole } = useAuth();
	if (isLoading || !hasRole("owner"))
		return (
			<>
				<Header back title="Role" />
				<Wrapper contentContainerStyle={{ padding: 16 }}>
					{isLoading ? (
						<LoadingPlaceholder />
					) : (
						<Text size="normal" className="text-muted">
							Hanya pemilik akun yang dapat mengelola role dan hak akses.
						</Text>
					)}
				</Wrapper>
			</>
		);
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Role" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Role" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header back title={id ? "Edit Role" : "Tambah Role"} />
					),
				}}
			/>
		</JSStack>
	);
}
