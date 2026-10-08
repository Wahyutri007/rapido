import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
	useOrderTypeDeleteRequest,
	useOrderTypesQuery,
} from "@/api/hooks/order-types";
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
import type { OrderTypeData } from "@/types/api/order-type";

export default function OrderTypeScreen() {
	const orderTypeDataQuery = useOrderTypesQuery();
	const orderTypeRefresh = useRefreshControl(orderTypeDataQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");
	const { results: filteredOrderTypes } = useSearch(
		orderTypeDataQuery.data || [],
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedOrderType, setSelectedOrderType] =
		React.useState<OrderTypeData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useOrderTypeDeleteRequest(
		undefined,
		selectedOrderType?.id,
	);

	function handleActionPress(orderType: OrderTypeData) {
		setSelectedOrderType(orderType);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedOrderType) return;
		router.push(
			route("/catalog/order-type/detail", { id: selectedOrderType.id }),
		);
	}

	function handleEdit() {
		if (!selectedOrderType) return;
		router.push(
			route("/catalog/order-type/modify", { id: selectedOrderType.id }),
		);
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedOrderType) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["order-types"] });
		deleteConfirmModal.open();
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus tipe pesanan ${selectedOrderType?.name}?`}
				description="Tipe pesanan akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Tipe Pesanan Berhasil Dihapus!"
				description="Tipe pesanan berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Tipe Pesanan"
				message="Terjadi kesalahan saat menghapus tipe pesanan. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedOrderType?.name}
				entityName="Tipe Pesanan"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari tipe pesanan..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{orderTypeDataQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredOrderTypes}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => {
								const taxName =
									item.taxes && item.taxes.length > 0
										? item.taxes.map((tax) => tax.name).join(", ")
										: "Tanpa Pajak";

								return (
									<CatalogItemCard
										title={item.name}
										subtitle={taxName}
										icon={
											<Feather
												name="shopping-bag"
												size={19}
												color={Colors.primary}
											/>
										}
										onPress={() =>
											router.push(
												route("/catalog/order-type/detail", { id: item.id }),
											)
										}
										onActionPress={() => handleActionPress(item)}
									/>
								);
							}}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...orderTypeRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada tipe pesanan yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/order-type/modify"))}
			>
				Tambah Tipe Pesanan
			</BottomActionButton>
		</>
	);
}
