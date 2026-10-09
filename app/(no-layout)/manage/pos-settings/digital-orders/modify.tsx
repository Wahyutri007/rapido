import { router, useLocalSearchParams } from "expo-router";
import ChannelModifyScreen from "@/components/feature/manage/digital-orders/ChannelModifyScreen";
import ManageFormNotFound from "@/components/feature/manage/settings/ManageFormNotFound";
import { route } from "@/lib/utils";
import { useDigitalOrderChannelStore } from "@/store/digitalOrderChannelStore";

export default function ChannelModifyRoute() {
	const { id } = useLocalSearchParams<{ id?: string | string[] }>();
	const item = useDigitalOrderChannelStore((state) =>
		typeof id === "string" && id
			? state.items.find((entry) => entry.id === id)
			: undefined,
	);
	if (id !== undefined && !item)
		return (
			<ManageFormNotFound
				entity="Kanal Pemesanan"
				onBack={() =>
					router.dismissTo(route("/manage/pos-settings/digital-orders"))
				}
			/>
		);
	return (
		<ChannelModifyScreen
			key={id === undefined ? "create" : `edit:${id}`}
			item={item}
		/>
	);
}
