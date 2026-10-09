import { router, useLocalSearchParams } from "expo-router";
import ManageFormNotFound from "@/components/feature/manage/settings/ManageFormNotFound";
import TaxModifyScreen from "@/components/feature/manage/settings/TaxModifyScreen";
import { TAXES_ITEMS } from "@/constants/data/manage/tax";

export default function TaxModifyScreenRoute() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	const item = TAXES_ITEMS.find((entry) => entry.id === id);
	if (id !== undefined && !item) {
		return (
			<ManageFormNotFound
				entity="Pajak"
				onBack={() => router.replace("/manage/tax")}
			/>
		);
	}
	return (
		<TaxModifyScreen
			key={id === undefined ? "create" : `edit:${id}`}
			item={item}
		/>
	);
}
