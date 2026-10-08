import { router } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import SearchBar from "@/components/common/SearchBar";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { ReceiptIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { RECEIPT_STORES } from "@/constants/data/manage/receipt";
import { route, tw } from "@/lib/utils";
import { useReceiptStore } from "@/store/receiptStore";
import type { ReceiptStore } from "@/types/ui/manage/receipt";

export default function ReceiptListScreen() {
	const [search, setSearch] = React.useState("");
	const [selected, setSelected] = React.useState<ReceiptStore | null>(null);
	const setPreview = useReceiptStore((state) => state.setPreview);
	const filtered = RECEIPT_STORES.filter((store) =>
		store.name.toLowerCase().includes(search.trim().toLowerCase()),
	);
	return (
		<>
			<Wrapper isNotScrollable py={tw(4)}>
				<View className="flex-1 gap-4 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari struk toko..."
						variant="light"
					/>
					<FlatList
						data={filtered}
						keyExtractor={(store) => store.id}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
						renderItem={({ item }) => (
							<CatalogItemCard
								title={`Struk - ${item.name}`}
								icon={<ReceiptIcon size={24} color={Colors.primary} />}
								onPress={() =>
									router.push(route("/manage/receipt/modify", { id: item.id }))
								}
								onActionPress={() => setSelected(item)}
							/>
						)}
						ListEmptyComponent={
							<SearchNotFound text="Tidak ada struk toko ditemukan" />
						}
					/>
				</View>
			</Wrapper>
			<ItemActionSheet
				isOpen={!!selected}
				onClose={() => setSelected(null)}
				title={selected?.name}
				detailTitle="Preview Struk"
				detailSubtitle="Lihat pengaturan struk yang sudah disimpan"
				onViewDetail={() => {
					if (selected) {
						setPreview(selected.id);
						router.push(route("/manage/receipt/preview", { id: selected.id }));
					}
				}}
				editTitle="Atur Tampilan Struk"
				editSubtitle="Ubah elemen dan catatan footer"
				onEdit={() => {
					if (selected)
						router.push(route("/manage/receipt/modify", { id: selected.id }));
				}}
			/>
		</>
	);
}
