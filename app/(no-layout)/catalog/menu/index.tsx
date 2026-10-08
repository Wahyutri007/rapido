import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, Image, RefreshControl, View } from "react-native";
import { useMenuDeleteRequest, useMenusQuery } from "@/api/hooks/menus";
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
import { MOCK_MENU_DATA } from "@/constants/data/menu";
import useRefreshControl from "@/hooks/useRefreshControl";
import useSearch, { type SortOption } from "@/hooks/useSearch";
import { formatRp, route, tw } from "@/lib/utils";
import type { MenuData } from "@/types/api/menu";

export default function MenuScreen() {
	const menuDataQuery = useMenusQuery();
	const menuRefresh = useRefreshControl(menuDataQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");

	// Fallback to MOCK_MENU_DATA if backend query returns empty or errors out
	// TODO: Rely exclusively on menuDataQuery.data once backend menus endpoint is updated
	const menuList = React.useMemo(() => {
		if (menuDataQuery.data && menuDataQuery.data.length > 0) {
			return menuDataQuery.data;
		}
		return MOCK_MENU_DATA;
	}, [menuDataQuery.data]);

	const { results: filteredMenus } = useSearch(
		menuList,
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedMenu, setSelectedMenu] = React.useState<MenuData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useMenuDeleteRequest(undefined, selectedMenu?.id);

	function handleActionPress(menu: MenuData) {
		setSelectedMenu(menu);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedMenu) return;
		router.push(route("/catalog/menu/detail", { id: selectedMenu.id }));
	}

	function handleEdit() {
		if (!selectedMenu) return;
		router.push(route("/catalog/menu/modify", { id: selectedMenu.id }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedMenu) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["menus"] });
		deleteConfirmModal.open();
	}

	function getPriceDisplay(item: MenuData) {
		const { variants, entries } = item;
		if (variants && entries && entries.length > 0) {
			const prices = entries
				.map((e) => e.sell_price || 0)
				.filter((p) => p > 0);
			if (prices.length === 0) return "Harga bervariasi";
			const min = Math.min(...prices);
			const max = Math.max(...prices);
			return min === max
				? formatRp(min)
				: `${formatRp(min)} - ${formatRp(max)}`;
		} else if (entries && entries.length > 0) {
			return entries[0].sell_price
				? formatRp(entries[0].sell_price)
				: "Harga belum diatur";
		}
		return "Harga belum diatur";
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus menu ${selectedMenu?.name}?`}
				description="Menu akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Menu Berhasil Dihapus!"
				description="Menu berhasil dihapus dari daftar menu."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Menu"
				message="Terjadi kesalahan saat menghapus menu. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedMenu?.name}
				entityName="Menu"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari menu..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{menuDataQuery.isLoading && !menuList.length ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredMenus}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<CatalogItemCard
									title={item.name}
									subtitle={getPriceDisplay(item)}
									icon={
										item.image ? (
											<Image
												source={{ uri: item.image }}
												className="size-full rounded-xl"
												resizeMode="cover"
											/>
										) : (
											<Feather name="coffee" size={20} color={Colors.primary} />
										)
									}
									onPress={() =>
										router.push(route("/catalog/menu/detail", { id: item.id }))
									}
									onActionPress={() => handleActionPress(item)}
								/>
							)}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...menuRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada menu yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/menu/modify"))}
			>
				Tambah Menu
			</BottomActionButton>
		</>
	);
}

