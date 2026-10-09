import { useLocalSearchParams } from "expo-router";
import ChannelDetailScreen from "@/components/feature/manage/digital-orders/ChannelDetailScreen";

export default function ChannelDetailRoute() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	return (
		<ChannelDetailScreen id={typeof id === "string" && id ? id : undefined} />
	);
}
