import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
	useCategoriesQuery,
	useCategoryDeleteRequest,
} from "@/api/hooks/categories";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import {
	LoadingPlaceholder,
	SearchNotFound,
} from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchBar from "@/components/common/SearchBar";
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { Colors } from "@/constants/Colors";
import useRefreshControl from "@/hooks/useRefreshControl";
import useSearch, { type SortOption } from "@/hooks/useSearch";
import { route, tw } from "@/lib/utils";
import type { CategoryData } from "@/types/api/category";

export default function CategoryScreen() {
	const categoryDataQuery = useCategoriesQuery();
	const categoryRefresh = useRefreshControl(categoryDataQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");
	const { results: filteredCategories } = useSearch(
		categoryDataQuery.data || [],
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedCategory, setSelectedCategory] =
		React.useState<CategoryData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useCategoryDeleteRequest(
		undefined,
		selectedCategory?.id,
	);

	function handleActionPress(category: CategoryData) {
		setSelectedCategory(category);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedCategory) return;
		router.push(route("/catalog/category/detail", { id: selectedCategory.id }));
	}

	function handleEdit() {
		if (!selectedCategory) return;
		router.push(route("/catalog/category/modify", { id: selectedCategory.id }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedCategory) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["categories"] });
		deleteConfirmModal.open();
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus kategori ${selectedCategory?.name}?`}
				description="Kategori akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Kategori Berhasil Dihapus!"
				description="Kategori berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Kategori"
				message="Terjadi kesalahan saat menghapus kategori. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedCategory?.name}
				entityName="Kategori"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari kategori..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{categoryDataQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredCategories}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<CatalogItemCard
									title={item.name}
									icon={
										<Feather name="grid" size={19} color={Colors.primary} />
									}
									onPress={() =>
										router.push(
											route("/catalog/category/detail", { id: item.id }),
										)
									}
									onActionPress={() => handleActionPress(item)}
								/>
							)}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...categoryRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada kategori yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/category/modify"))}
			>
				Tambah Kategori
			</BottomActionButton>
		</>
	);
}
