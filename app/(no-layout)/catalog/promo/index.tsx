import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { usePromoDeleteRequest, usePromosQuery } from "@/api/hooks/promos";
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
import { formatDatePeriod, formatRp, route, tw } from "@/lib/utils";
import type { PromoData } from "@/types/api/promo";

export default function PromoScreen() {
	const promoQuery = usePromosQuery();
	const promoRefresh = useRefreshControl(promoQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");
	const { results: filteredPromos } = useSearch(
		promoQuery.data || [],
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedPromo, setSelectedPromo] = React.useState<PromoData | null>(
		null,
	);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = usePromoDeleteRequest(undefined, selectedPromo?.id);

	function handleActionPress(promo: PromoData) {
		setSelectedPromo(promo);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedPromo) return;
		router.push(route("/catalog/promo/detail", { id: selectedPromo.id }));
	}

	function handleEdit() {
		if (!selectedPromo) return;
		router.push(route("/catalog/promo/modify", { id: selectedPromo.id }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedPromo) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["promos"] });
		deleteConfirmModal.open();
	}

	function getRewardText(promo: PromoData) {
		if (promo.type === "discount" && promo.discount) {
			return promo.discount.type === "percentage"
				? `Diskon ${promo.discount.amount}%`
				: `Potongan ${formatRp(promo.discount.amount)}`;
		}
		if (promo.type === "free_item") {
			return "Gratis Item";
		}
		return "Promo";
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus promo ${selectedPromo?.name}?`}
				description="Promo akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Promo Berhasil Dihapus!"
				description="Promo berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Promo"
				message="Terjadi kesalahan saat menghapus promo. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedPromo?.name}
				entityName="Promo"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari promo..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{promoQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredPromos}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => {
								const reward = getRewardText(item);
								const period = formatDatePeriod(
									item.start_period,
									item.end_period,
								);
								return (
									<CatalogItemCard
										title={item.name}
										subtitle={`${reward} • ${period}`}
										icon={
											<Feather
												name={item.type === "free_item" ? "gift" : "percent"}
												size={19}
												color={Colors.primary}
											/>
										}
										onPress={() =>
											router.push(
												route("/catalog/promo/detail", { id: item.id }),
											)
										}
										onActionPress={() => handleActionPress(item)}
									/>
								);
							}}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...promoRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada promo yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/promo/modify"))}
			>
				Tambah Promo
			</BottomActionButton>
		</>
	);
}
