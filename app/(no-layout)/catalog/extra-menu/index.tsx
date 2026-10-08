import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, Image, RefreshControl, View } from "react-native";
import {
	useExtraMenuDeleteRequest,
	useExtraMenusQuery,
} from "@/api/hooks/extra-menus";
import { ICONS } from "@/assets/images/icons";
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
import ItemActionSheet, {
	ItemActionSheetDeleteItem,
	ItemActionSheetDetailItem,
	ItemActionSheetEditItem,
} from "@/components/custom/ItemActionSheet";
import { MOCK_EXTRA_MENU_DATA } from "@/constants/data/extra-menu";
import useRefreshControl from "@/hooks/useRefreshControl";
import useSearch, { type SortOption } from "@/hooks/useSearch";
import { route, tw } from "@/lib/utils";
import type { ExtraMenuData } from "@/types/api/extra-menu";

export default function ExtraMenuScreen() {
	const extraMenuDataQuery = useExtraMenusQuery();
	const refreshControl = useRefreshControl(extraMenuDataQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");

	// Fallback to MOCK_EXTRA_MENU_DATA if backend query returns no data
	const extraMenus = React.useMemo(() => {
		if (extraMenuDataQuery.data && extraMenuDataQuery.data.length > 0) {
			return extraMenuDataQuery.data;
		}
		return MOCK_EXTRA_MENU_DATA;
	}, [extraMenuDataQuery.data]);

	const { results: filteredExtraMenus } = useSearch(
		extraMenus,
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedExtraMenu, setSelectedExtraMenu] =
		React.useState<ExtraMenuData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useExtraMenuDeleteRequest(
		undefined,
		selectedExtraMenu?.id,
	);

	function handleActionPress(extraMenu: ExtraMenuData) {
		setSelectedExtraMenu(extraMenu);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedExtraMenu) return;
		setActionSheetOpen(false);
		router.push(route("/catalog/extra-menu/detail", { id: selectedExtraMenu.id }));
	}

	function handleEdit() {
		if (!selectedExtraMenu) return;
		setActionSheetOpen(false);
		router.push(route("/catalog/extra-menu/modify", { id: selectedExtraMenu.id }));
	}

	function handleDelete() {
		setActionSheetOpen(false);
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedExtraMenu) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["extra-menus"] });
		deleteConfirmModal.open();
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus ekstra ${selectedExtraMenu?.name}?`}
				description="Ekstra akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Ekstra Berhasil Dihapus!"
				description="Ekstra berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Ekstra"
				message="Terjadi kesalahan saat menghapus ekstra. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
			>
				<ItemActionSheetDetailItem
					entityName="Ekstra"
					onPress={handleViewDetail}
				/>
				<ItemActionSheetEditItem entityName="Ekstra" onPress={handleEdit} />
				<ItemActionSheetDeleteItem
					entityName="Ekstra"
					onPress={handleDelete}
					isLast
				/>
			</ItemActionSheet>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari tambahan..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{extraMenuDataQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredExtraMenus}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<CatalogItemCard
									title={item.name}
									icon={
										<Image
											source={ICONS.catalog.extras}
											className="size-6"
											resizeMode="contain"
										/>
									}
									onPress={() =>
										router.push(
											route("/catalog/extra-menu/detail", { id: item.id }),
										)
									}
									onActionPress={() => handleActionPress(item)}
								/>
							)}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...refreshControl} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada tambahan yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/extra-menu/modify"))}
			>
				Tambah Ekstra
			</BottomActionButton>
		</>
	);
}
