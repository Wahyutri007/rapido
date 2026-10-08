import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
	useVoucherDeleteRequest,
	useVouchersQuery,
} from "@/api/hooks/vouchers";
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
import { MOCK_VOUCHER_DATA } from "@/constants/data/voucher";
import useRefreshControl from "@/hooks/useRefreshControl";
import useSearch, { type SortOption } from "@/hooks/useSearch";
import { route, tw } from "@/lib/utils";
import type { VoucherData } from "@/types/api/voucher";

export default function VoucherScreen() {
	const voucherQuery = useVouchersQuery();
	const voucherRefresh = useRefreshControl(voucherQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");

	// Fall back to MOCK_VOUCHER_DATA when backend voucherQuery is empty, matching discount screen behavior
	const vouchers =
		voucherQuery.data && voucherQuery.data.length > 0
			? voucherQuery.data
			: MOCK_VOUCHER_DATA;

	const { results: filteredVouchers } = useSearch(
		vouchers,
		search,
		(item) => item.name + (item.code ?? ""),
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedVoucher, setSelectedVoucher] =
		React.useState<VoucherData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useVoucherDeleteRequest(undefined, selectedVoucher?.id);

	function handleActionPress(voucher: VoucherData) {
		setSelectedVoucher(voucher);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedVoucher) return;
		router.push(route("/catalog/voucher/detail", { id: selectedVoucher.id }));
	}

	function handleEdit() {
		if (!selectedVoucher) return;
		router.push(route("/catalog/voucher/modify", { id: selectedVoucher.id }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedVoucher) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["vouchers"] });
		deleteConfirmModal.open();
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus voucher ${selectedVoucher?.name}?`}
				description="Voucher akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Voucher Berhasil Dihapus!"
				description="Voucher berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Voucher"
				message="Terjadi kesalahan saat menghapus voucher. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedVoucher?.name}
				entityName="Voucher"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari voucher..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{voucherQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredVouchers}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<CatalogItemCard
									title={item.name}
									icon={
										<MaterialCommunityIcons
											name="ticket-percent-outline"
											size={22}
											color={Colors.primary}
										/>
									}
									onPress={() =>
										router.push(
											route("/catalog/voucher/detail", { id: item.id }),
										)
									}
									onActionPress={() => handleActionPress(item)}
								/>
							)}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...voucherRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada voucher yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/voucher/modify"))}
			>
				Tambah Voucher
			</BottomActionButton>
		</>
	);
}
