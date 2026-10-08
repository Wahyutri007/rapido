import { useLocalSearchParams } from "expo-router";
import WorkerModifyScreen from "@/components/feature/manage/workers/WorkerModifyScreen";

export default function ModifyWorkerScreen() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	return <WorkerModifyScreen id={Array.isArray(id) ? id[0] : id} />;
}
