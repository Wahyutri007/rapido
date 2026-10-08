import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useBundlingDeleteRequest, useBundlingsQuery } from "@/api/hooks/bundlings";
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
import { MOCK_BUNDLING_DATA } from "@/constants/data/bundling";
import useRefreshControl from "@/hooks/useRefreshControl";
import useSearch, { type SortOption } from "@/hooks/useSearch";
import { route, tw } from "@/lib/utils";
import type { BundlingData } from "@/types/api/bundling";

export default function BundlingScreen() {
	const bundlingDataQuery = useBundlingsQuery();
	const bundlingRefresh = useRefreshControl(bundlingDataQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");

	// Fallback to MOCK_BUNDLING_DATA if backend query returns empty or errors out
	const bundlingList = React.useMemo(() => {
		if (bundlingDataQuery.data && bundlingDataQuery.data.length > 0) {
			return bundlingDataQuery.data;
		}
		return MOCK_BUNDLING_DATA;
	}, [bundlingDataQuery.data]);

	const { results: filteredBundlings } = useSearch(
		bundlingList,
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedBundling, setSelectedBundling] = React.useState<BundlingData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useBundlingDeleteRequest(undefined, selectedBundling?.id);

	function handleActionPress(bundling: BundlingData) {
		setSelectedBundling(bundling);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedBundling) return;
		router.push(route("/catalog/bundling/detail", { id: selectedBundling.id }));
	}

	function handleEdit() {
		if (!selectedBundling) return;
		router.push(route("/catalog/bundling/modify", { id: selectedBundling.id }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedBundling) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["bundlings"] });
		deleteConfirmModal.open();
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus paket ${selectedBundling?.name}?`}
				description="Paket akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Paket Berhasil Dihapus!"
				description="Paket berhasil dihapus dari daftar paket."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Paket"
				message="Terjadi kesalahan saat menghapus paket. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedBundling?.name}
				entityName="Paket"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari paket..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{bundlingDataQuery.isLoading && !bundlingList.length ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredBundlings}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<CatalogItemCard
									title={item.name}
									icon={
										<Feather name="box" size={20} color={Colors.primary} />
									}
									onPress={() =>
										router.push(route("/catalog/bundling/detail", { id: item.id }))
									}
									onActionPress={() => handleActionPress(item)}
								/>
							)}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...bundlingRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada paket yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/bundling/modify"))}
			>
				Tambah Bundling
			</BottomActionButton>
		</>
	);
}
