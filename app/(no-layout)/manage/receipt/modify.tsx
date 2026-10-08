import { useLocalSearchParams } from "expo-router";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Wrapper from "@/components/common/Wrapper";
import ReceiptSettingsForm from "@/components/feature/manage/receipt/ReceiptSettingsForm";
import { RECEIPT_STORES } from "@/constants/data/manage/receipt";

export default function ReceiptModifyScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const store = RECEIPT_STORES.find((item) => item.id === id);
	if (!store)
		return (
			<Wrapper contentContainerStyle={{ padding: 16 }}>
				<SearchNotFound text="Toko tidak ditemukan. Kembali ke daftar struk untuk memilih toko." />
			</Wrapper>
		);
	return <ReceiptSettingsForm key={store.id} store={store} />;
}
