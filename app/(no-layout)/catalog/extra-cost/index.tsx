import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
	useExtraCostDeleteRequest,
	useExtraCostsQuery,
} from "@/api/hooks/extra-costs";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import {
	LoadingPlaceholder,
	SearchNotFound,
} from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchBar from "@/components/common/SearchBar";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import CatalogItemCard from "@/components/custom/CatalogItemCard";
import ItemActionSheet from "@/components/custom/ItemActionSheet";
import { Colors } from "@/constants/Colors";
import useRefreshControl from "@/hooks/useRefreshControl";
import useSearch, { type SortOption } from "@/hooks/useSearch";
import { route, tw } from "@/lib/utils";
import type { ExtraCostData } from "@/types/api/extra-cost";
import { DiscountValueTypeEnum } from "@/types/enums";

export default function ExtraCostScreen() {
	const extraCostDataQuery = useExtraCostsQuery();
	const extraCostRefresh = useRefreshControl(extraCostDataQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");
	const { results: filteredExtraCosts } = useSearch(
		extraCostDataQuery.data || [],
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedExtraCost, setSelectedExtraCost] =
		React.useState<ExtraCostData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useExtraCostDeleteRequest(
		undefined,
		selectedExtraCost?.id,
	);

	function handleActionPress(extraCost: ExtraCostData) {
		setSelectedExtraCost(extraCost);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedExtraCost) return;
		router.push(
			route("/catalog/extra-cost/detail", { id: selectedExtraCost.id }),
		);
	}

	function handleEdit() {
		if (!selectedExtraCost) return;
		router.push(
			route("/catalog/extra-cost/modify", { id: selectedExtraCost.id }),
		);
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedExtraCost) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["extra-costs"] });
		deleteConfirmModal.open();
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus biaya tambahan ${selectedExtraCost?.name}?`}
				description="Biaya tambahan akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Biaya Tambahan Berhasil Dihapus!"
				description="Biaya tambahan berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Biaya Tambahan"
				message="Terjadi kesalahan saat menghapus biaya tambahan. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedExtraCost?.name}
				entityName="Biaya Tambahan"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari biaya tambahan..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{extraCostDataQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredExtraCosts}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => {
								const formattedAmount =
									item.type === DiscountValueTypeEnum.PERCENTAGE
										? `${item.amount}%`
										: `Rp ${item.amount.toLocaleString("id-ID")}`;

								return (
									<CatalogItemCard
										title={item.name}
										subtitle={formattedAmount}
										icon={
											item.type === DiscountValueTypeEnum.PERCENTAGE ? (
												<Feather
													name="percent"
													size={19}
													color={Colors.primary}
												/>
											) : (
												<Text size="normal" w="medium" className="text-primary">
													Rp
												</Text>
											)
										}
										onPress={() =>
											router.push(
												route("/catalog/extra-cost/detail", { id: item.id }),
											)
										}
										onActionPress={() => handleActionPress(item)}
									/>
								);
							}}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...extraCostRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada biaya tambahan yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/extra-cost/modify"))}
			>
				Tambah Biaya Tambahan
			</BottomActionButton>
		</>
	);
}
