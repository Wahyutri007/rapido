import { useLocalSearchParams } from "expo-router";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Wrapper from "@/components/common/Wrapper";
import PlaceForm from "@/components/feature/manage/place/PlaceForm";
import { usePlaceStore } from "@/store/placeStore";

export default function PlaceModifyScreen() {
	const { outletId, areaId, placeId } = useLocalSearchParams<{
		outletId: string;
		areaId: string;
		placeId?: string;
	}>();
	const outlet = usePlaceStore((state) =>
		state.outlets.find((item) => item.id === outletId),
	);
	const area = outlet?.areas.find((item) => item.id === areaId);
	const place = area?.places.find((item) => item.id === placeId);
	if (!outlet || !area || (placeId && !place))
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Toko, area, atau tempat tidak ditemukan." />
			</Wrapper>
		);
	return (
		<PlaceForm
			key={`${areaId}:${placeId ?? "new"}`}
			outlet={outlet}
			areaId={areaId}
			place={place}
		/>
	);
}
