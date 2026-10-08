import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useUnitDeleteRequest, useUnitsQuery } from "@/api/hooks/units";
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
import type { UnitData } from "@/types/api/unit";

export default function UnitScreen() {
	const unitDataQuery = useUnitsQuery();
	const unitRefresh = useRefreshControl(unitDataQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");
	const { results: filteredUnits } = useSearch(
		unitDataQuery.data || [],
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedUnit, setSelectedUnit] = React.useState<UnitData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useUnitDeleteRequest(undefined, selectedUnit?.id);

	function handleActionPress(unit: UnitData) {
		setSelectedUnit(unit);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedUnit) return;
		router.push(route("/catalog/unit/detail", { id: selectedUnit.id }));
	}

	function handleEdit() {
		if (!selectedUnit) return;
		router.push(route("/catalog/unit/modify", { id: selectedUnit.id }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedUnit) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["units"] });
		deleteConfirmModal.open();
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus satuan ${selectedUnit?.name}?`}
				description="Satuan akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Satuan Berhasil Dihapus!"
				description="Satuan berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Satuan"
				message="Terjadi kesalahan saat menghapus satuan. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedUnit?.name}
				entityName="Satuan"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari satuan..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{unitDataQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredUnits}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<CatalogItemCard
									title={item.name}
									subtitle={`Kode: ${item.code}`}
									icon={<Feather name="box" size={20} color={Colors.primary} />}
									onPress={() =>
										router.push(route("/catalog/unit/detail", { id: item.id }))
									}
									onActionPress={() => handleActionPress(item)}
								/>
							)}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...unitRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada satuan yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/unit/modify"))}
			>
				Tambah Satuan
			</BottomActionButton>
		</>
	);
}
