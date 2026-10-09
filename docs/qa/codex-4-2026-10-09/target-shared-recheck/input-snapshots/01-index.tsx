import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import BottomActionButton from "@/components/common/BottomActionButton";
import { SearchNotFound } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchBar from "@/components/common/SearchBar";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { Colors } from "@/constants/Colors";
import { route } from "@/lib/utils";
import { useSalesTargetStore } from "@/store/salesTargetStore";
import type { SalesTarget } from "@/types/ui/manage/sales-target";

export default function SalesTargetListScreen() {
	const targets = useSalesTargetStore((state) => state.targets);
	const remove = useSalesTargetStore((state) => state.remove);
	const [search, setSearch] = React.useState("");
	const [selected, setSelected] = React.useState<SalesTarget | null>(null);
	const [sheetOpen, setSheetOpen] = React.useState(false);
	const [confirm, setConfirm] = React.useState(false);
	const items = targets.filter((target) =>
		target.name
			.toLocaleLowerCase("id-ID")
			.includes(search.trim().toLocaleLowerCase("id-ID")),
	);
	const open = (screen: "detail" | "modify", id: string) =>
		router.push(route(`/manage/sales-target/${screen}`, { id }));
	return (
		<>
			<Wrapper isNotScrollable hasActionButton py={16}>
				<View className="flex-1 gap-4 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari target penjualan..."
					/>
					<FlatList
						data={items}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingBottom: 100, gap: 8 }}
						showsVerticalScrollIndicator={false}
						renderItem={({ item }) => (
							<CatalogItemCard
								density="compact"
								title={
									<Text size="normal" w="medium" className="flex-1 shrink">
										{item.name}
									</Text>
								}
								leading={
									<View className="size-10 items-center justify-center rounded-lg bg-primary-50">
										<Feather name="target" size={24} color={Colors.primary} />
									</View>
								}
								onPress={() => open("detail", item.id)}
								right={
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`Pilihan ${item.name}`}
										className="size-10 items-center justify-center"
										onPress={() => {
											setSelected(item);
											setSheetOpen(true);
										}}
									>
										<Feather
											name="more-horizontal"
											size={20}
											color={Colors.primary}
										/>
									</Pressable>
								}
							/>
						)}
						ListEmptyComponent={
							<SearchNotFound
								text={
									search.trim()
										? "Target penjualan tidak ditemukan."
										: "Belum ada target penjualan."
								}
							/>
						}
					/>
				</View>
			</Wrapper>
			<BottomActionButton
				onPress={() => router.push("/manage/sales-target/modify")}
			>
				Tambah Target
			</BottomActionButton>
			<ItemActionSheet
				isOpen={sheetOpen}
				onClose={() => setSheetOpen(false)}
				title={selected?.name}
				entityName="Target"
				onViewDetail={() => {
					if (selected) open("detail", selected.id);
				}}
				onEdit={() => {
					if (selected) open("modify", selected.id);
				}}
				onDelete={() => setConfirm(true)}
			/>
			<DeleteConfirmModal
				isOpen={confirm}
				onClose={() => setConfirm(false)}
				itemName={selected?.name}
				description="Target ini akan dihapus dari daftar pratinjau."
				onConfirm={() => {
					if (selected) remove(selected.id);
					setSelected(null);
					setConfirm(false);
				}}
			/>
		</>
	);
}
