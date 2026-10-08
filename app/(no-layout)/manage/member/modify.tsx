import { useLocalSearchParams } from "expo-router";
import MemberModifyScreen from "@/components/feature/manage/member/MemberModifyScreen";

export default function MemberModify() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	return <MemberModifyScreen id={Array.isArray(id) ? id[0] : id} />;
}
