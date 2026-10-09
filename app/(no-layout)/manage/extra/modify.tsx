import { router, useLocalSearchParams } from "expo-router";
import ExtraModifyScreen from "@/components/feature/manage/settings/ExtraModifyScreen";
import ManageFormNotFound from "@/components/feature/manage/settings/ManageFormNotFound";
import { EXTRA_ITEMS } from "@/constants/data/manage/extra";

export default function ExtraModifyScreenRoute() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	const item = EXTRA_ITEMS.find((entry) => entry.id === id);
	if (id !== undefined && !item) {
		return (
			<ManageFormNotFound
				entity="Biaya Tambahan"
				onBack={() => router.replace("/manage/extra")}
			/>
		);
	}
	return (
		<ExtraModifyScreen
			key={id === undefined ? "create" : `edit:${id}`}
			item={item}
		/>
	);
}
