import { router, useLocalSearchParams } from "expo-router";
import IntegrationModifyScreen from "@/components/feature/manage/integrations/IntegrationModifyScreen";
import ManageFormNotFound from "@/components/feature/manage/settings/ManageFormNotFound";
import { route } from "@/lib/utils";
import { useManageIntegrationStore } from "@/store/manageIntegrationStore";

export default function IntegrationModifyRoute() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	const item = useManageIntegrationStore((state) =>
		state.items.find((entry) => entry.id === id),
	);
	if (id !== undefined && !item) {
		return (
			<ManageFormNotFound
				entity="Integrasi"
				onBack={() => router.replace(route("/manage/integrations"))}
			/>
		);
	}
	return (
		<IntegrationModifyScreen
			key={id === undefined ? "create" : `edit:${id}`}
			item={item}
		/>
	);
}
