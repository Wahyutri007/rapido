import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import {
	useCategoryDeleteRequest,
	useCategoryQuery,
} from "@/api/hooks/categories";
import { useMenusQuery } from "@/api/hooks/menus";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import {
	CatalogDetailHeroCard,
	CatalogDetailSection,
	CatalogRelatedItemRow,
	CatalogRelatedListCard,
} from "@/components/feature/catalog";
import { Colors } from "@/constants/Colors";
import { formatRp, route } from "@/lib/utils";

export default function CategoryDetailScreen() {
	const params = useLocalSearchParams();
	const categoryId = params?.id as string | undefined;
	const categoryQuery = useCategoryQuery(categoryId);
	const menusQuery = useMenusQuery();
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useCategoryDeleteRequest(undefined, categoryId);

	function handleEdit() {
		if (!categoryId) return;
		router.push(route("/catalog/category/modify", { id: categoryId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!categoryId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["categories"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	const data = categoryQuery.data;
	const categoryMenus = React.useMemo(() => {
		if (!menusQuery.data || !categoryId) return [];
		return menusQuery.data.filter((menu) => menu.category_id === categoryId);
	}, [menusQuery.data, categoryId]);

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus kategori ${data?.name}?`}
				description="Kategori akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Kategori Berhasil Dihapus!"
				description="Kategori berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Kategori"
				message="Terjadi kesalahan saat menghapus kategori. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{categoryQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={<Feather name="grid" size={26} color={Colors.primary} />}
							title={data?.name ?? "-"}
							badge={`${categoryMenus.length} Item`}
							description="Kategori digunakan untuk mengelompokkan item dalam menu."
						/>

						{/* Info Section */}
						<CatalogDetailSection title="Informasi Kategori">
							<DetailRow
								label="Nama Kategori"
								value={data?.name ?? "-"}
								icon="file-text"
							/>
							<DetailRow
								label="Item"
								value={`${categoryMenus.length} item dipilih`}
								icon="grid"
								isLast
							/>
						</CatalogDetailSection>

						{/* Relations Section: Item Yang Dipilih */}
						<CatalogRelatedListCard
							title="Item Yang Dipilih"
							items={categoryMenus}
							renderItem={(menu, idx, isLast) => (
								<CatalogRelatedItemRow
									key={menu.id}
									icon="grid"
									title={menu.name}
									subtitle={
										menu.entries?.[0]?.sell_price != null
											? formatRp(menu.entries[0].sell_price)
											: undefined
									}
									badgeText="Aktif"
									isLast={isLast}
								/>
							)}
							emptyText="Belum ada item dalam kategori ini"
						/>
					</View>
				)}
			</Wrapper>

			<DetailBottomActions
				onEdit={handleEdit}
				onDelete={handleDelete}
				isDeleting={deleteRequest.isLoading}
			/>
		</>
	);
}
