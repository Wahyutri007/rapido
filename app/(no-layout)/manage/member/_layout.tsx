import { useGlobalSearchParams } from "expo-router";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import Header from "@/components/common/Header";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { JSStack, ScaleBackTransition } from "@/components/custom/JSStack";
import { Permissions } from "@/constants/Permissions";
import { useAuth } from "@/context/AuthContext";

export const unstable_settings = { initialRouteName: "index" };

export default function MemberLayout() {
	const { id } = useGlobalSearchParams();
	const { isLoading, hasPermission } = useAuth();
	if (isLoading || !hasPermission(Permissions.MANAGE_CUSTOMERS))
		return (
			<>
				<Header back title="Member" />
				<Wrapper contentContainerStyle={{ padding: 16 }}>
					{isLoading ? (
						<LoadingPlaceholder />
					) : (
						<Text size="normal" className="text-muted">
							Anda belum memiliki izin untuk mengelola member.
						</Text>
					)}
				</Wrapper>
			</>
		);
	return (
		<JSStack screenOptions={{ ...ScaleBackTransition }}>
			<JSStack.Screen
				name="index"
				options={{ header: () => <Header back title="Member" /> }}
			/>
			<JSStack.Screen
				name="detail"
				options={{ header: () => <Header back title="Detail Member" /> }}
			/>
			<JSStack.Screen
				name="modify"
				options={{
					header: () => (
						<Header back title={id ? "Edit Member" : "Tambah Member"} />
					),
				}}
			/>
		</JSStack>
	);
}
