import { useLocalSearchParams } from "expo-router";
import IntegrationDetailScreen from "@/components/feature/manage/integrations/IntegrationDetailScreen";

export default function IntegrationDetailRoute() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	return <IntegrationDetailScreen id={id} />;
}
