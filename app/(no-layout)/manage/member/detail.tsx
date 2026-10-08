import { useLocalSearchParams } from "expo-router";
import MemberDetailScreen from "@/components/feature/manage/member/MemberDetailScreen";

export default function MemberDetail() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	return <MemberDetailScreen id={Array.isArray(id) ? id[0] : id} />;
}
