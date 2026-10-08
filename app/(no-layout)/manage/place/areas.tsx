import { useLocalSearchParams } from "expo-router";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Wrapper from "@/components/common/Wrapper";
import PlaceAreaForm from "@/components/feature/manage/place/PlaceAreaForm";
import { usePlaceStore } from "@/store/placeStore";

export default function PlaceAreasScreen() {
	const { outletId, areaId } = useLocalSearchParams<{
		outletId?: string;
		areaId?: string;
	}>();
	const outlet = usePlaceStore((state) =>
		state.outlets.find((item) => item.id === outletId),
	);
	const area = outlet?.areas.find((item) => item.id === areaId);
	if ((outletId && !outlet) || (areaId && !area))
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Toko atau area tidak ditemukan." />
			</Wrapper>
		);
	return (
		<PlaceAreaForm
			key={`${outletId ?? "all"}:${areaId ?? "new"}`}
			outletId={outletId}
			area={area}
		/>
	);
}
