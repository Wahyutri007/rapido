import { useLocalSearchParams } from "expo-router";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Wrapper from "@/components/common/Wrapper";
import SalesTargetForm from "@/components/feature/manage/sales-target/SalesTargetForm";
import { useSalesTargetStore } from "@/store/salesTargetStore";

export default function SalesTargetModifyScreen() {
	const { id } = useLocalSearchParams<{ id?: string }>();
	const target = useSalesTargetStore((state) =>
		state.targets.find((item) => item.id === id),
	);
	if (id && !target)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Target penjualan tidak ditemukan." />
			</Wrapper>
		);
	return <SalesTargetForm key={id ?? "new"} target={target} />;
}
