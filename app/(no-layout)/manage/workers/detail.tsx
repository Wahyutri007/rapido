import { useLocalSearchParams } from "expo-router";
import WorkerDetailScreen from "@/components/feature/manage/workers/WorkerDetailScreen";

export default function DetailWorkerScreen() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	return <WorkerDetailScreen id={Array.isArray(id) ? id[0] : id} />;
}
