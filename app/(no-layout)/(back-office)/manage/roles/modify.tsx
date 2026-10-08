import { useLocalSearchParams } from "expo-router";
import RoleModifyScreen from "@/components/feature/manage/roles/RoleModifyScreen";

export default function ModifyRoleScreen() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	return <RoleModifyScreen id={Array.isArray(id) ? id[0] : id} />;
}
