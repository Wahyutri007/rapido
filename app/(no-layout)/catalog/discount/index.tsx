import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
	useDiscountDeleteRequest,
	useDiscountsQuery,
} from "@/api/hooks/discounts";
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
import ItemActionSheet, {
	ItemActionSheetDeleteItem,
	ItemActionSheetDetailItem,
	ItemActionSheetEditItem,
	ItemActionSheetRow,
	ItemActionSheetToggleRow,
} from "@/components/custom/ItemActionSheet";
import { DiscountIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { MOCK_DISCOUNT_DATA } from "@/constants/data/discount";
import useRefreshControl from "@/hooks/useRefreshControl";
import useSearch, { type SortOption } from "@/hooks/useSearch";
import { cn, formatRp, route, tw } from "@/lib/utils";
import type { DiscountData } from "@/types/api/discount";

export default function DiscountScreen() {
	const discountQuery = useDiscountsQuery();
	const refreshControl = useRefreshControl(discountQuery.refetch);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");
	// TODO: Currently falls back to MOCK_DISCOUNT_DATA when backend discountQuery is empty.
	// Replace with `discountQuery.data || []` once backend GET /contents/discounts returns production data.
	const discounts =
		discountQuery.data && discountQuery.data.length > 0
			? discountQuery.data
			: MOCK_DISCOUNT_DATA;

	const { results: filteredDiscounts } = useSearch(
		discounts,
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedDiscount, setSelectedDiscount] =
		React.useState<DiscountData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);
	// Mock local status map for toggleable status (backend does not have is_active)
	const [activeMap, setActiveMap] = React.useState<Record<string, boolean>>({});

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = useDiscountDeleteRequest(
		undefined,
		selectedDiscount?.id,
	);

	function handleActionPress(discount: DiscountData) {
		setSelectedDiscount(discount);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedDiscount) return;
		setActionSheetOpen(false);
		router.push(route("/catalog/discount/detail", { id: selectedDiscount.id }));
	}

	function handleEdit() {
		if (!selectedDiscount) return;
		setActionSheetOpen(false);
		router.push(route("/catalog/discount/modify", { id: selectedDiscount.id }));
	}

	function handleDelete() {
		setActionSheetOpen(false);
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedDiscount) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["discounts"] });
		deleteConfirmModal.open();
	}

	const isCurrentActive = selectedDiscount
		? (activeMap[selectedDiscount.id] ?? true)
		: true;

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus diskon ${selectedDiscount?.name}?`}
				description="Diskon akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Diskon Berhasil Dihapus!"
				description="Diskon berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Diskon"
				message="Terjadi kesalahan saat menghapus diskon. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedDiscount?.name}
			>
				{/* Composable Action Items */}
				<ItemActionSheetToggleRow
					title="Status Diskon"
					isChecked={isCurrentActive}
					onToggle={(val) => {
						if (selectedDiscount) {
							// TODO: Connect to backend status toggle API when available
							setActiveMap((prev) => ({ ...prev, [selectedDiscount.id]: val }));
						}
					}}
					activeLabel="Aktif"
					inactiveLabel="Tidak Aktif"
				/>

				<ItemActionSheetDetailItem
					entityName="Diskon"
					onPress={handleViewDetail}
				/>

				<ItemActionSheetRow
					title="Download PDF"
					subtitle="Unduh rincian diskon"
					icon="download"
					iconBg="bg-primary-50"
					iconColor={Colors.primary}
					onPress={() => {
						setActionSheetOpen(false);
						// TODO: Connect to backend PDF export endpoint when available
					}}
				/>

				<ItemActionSheetEditItem entityName="Diskon" onPress={handleEdit} />

				<ItemActionSheetDeleteItem
					entityName="Diskon"
					onPress={handleDelete}
					isLast
				/>
			</ItemActionSheet>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari diskon..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{discountQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredDiscounts}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => {
								const isActive = activeMap[item.id] ?? true;
								const rawAmount =
									item.amount ?? item.fixed_discount?.amount ?? 0;
								const valueDisplay =
									item.type === "fixed"
										? item.value_type === "percentage"
											? `${rawAmount}%`
											: formatRp(rawAmount)
										: "Kustom";

								return (
									<CatalogItemCard
										title={item.name}
										badge={
											<View className="rounded-lg bg-primary-50 px-2 py-0.5">
												<Text
													size="small"
													w="semibold"
													className="text-primary"
												>
													{valueDisplay}
												</Text>
											</View>
										}
										description={
											<View className="flex-row items-center gap-1.5 mt-1">
												<View
													className={cn(
														"size-2 rounded-full",
														isActive ? "bg-green-500" : "bg-zinc-400",
													)}
												/>
												<Text
													size="small"
													className={cn(
														"font-medium",
														isActive ? "text-green-600" : "text-muted",
													)}
												>
													{isActive ? "Sedang Aktif" : "Tidak Aktif"}
												</Text>
											</View>
										}
										icon={<DiscountIcon size={20} color={Colors.primary} />}
										onPress={() =>
											router.push(
												route("/catalog/discount/detail", { id: item.id }),
											)
										}
										onActionPress={() => handleActionPress(item)}
									/>
								);
							}}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...refreshControl} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada diskon yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/discount/modify"))}
			>
				Tambah Diskon
			</BottomActionButton>
		</>
	);
}
