import { useLocalSearchParams } from "expo-router";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import ReceiptPreview from "@/components/feature/manage/receipt/ReceiptPreview";
import {
	DEFAULT_RECEIPT_SETTINGS,
	RECEIPT_STORES,
} from "@/constants/data/manage/receipt";
import { useReceiptStore } from "@/store/receiptStore";

export default function ReceiptPreviewScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const store = RECEIPT_STORES.find((item) => item.id === id);
	const settings =
		useReceiptStore(
			(state) => state.previewByStore[id] ?? state.settingsByStore[id],
		) ?? DEFAULT_RECEIPT_SETTINGS;
	return (
		<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
			{store ? (
				<>
					<Text size="small" className="text-muted text-center">
						Contoh tampilan struk
					</Text>
					<ReceiptPreview store={store} settings={settings} />
				</>
			) : (
				<SearchNotFound text="Toko tidak ditemukan. Kembali ke daftar struk untuk memilih toko." />
			)}
		</Wrapper>
	);
}
