import { useLocalSearchParams } from "expo-router";
import RoleDetailScreen from "@/components/feature/manage/roles/RoleDetailScreen";

export default function DetailRoleScreen() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	return <RoleDetailScreen id={Array.isArray(id) ? id[0] : id} />;
}
