import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useBrandDeleteRequest, useBrandQuery } from "@/api/hooks/brands";
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
import { route } from "@/lib/utils";

export default function BrandDetailScreen() {
	const params = useLocalSearchParams();
	const brandId = params?.id as string | undefined;
	const brandQuery = useBrandQuery(brandId);
	const menusQuery = useMenusQuery();
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useBrandDeleteRequest(undefined, brandId);

	function handleEdit() {
		if (!brandId) return;
		router.push(route("/catalog/brand/modify", { id: brandId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!brandId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["brands"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	const data = brandQuery.data;
	const brandMenus = React.useMemo(() => {
		if (!menusQuery.data || !brandId) return [];
		return menusQuery.data.filter((menu) => menu.brand_id === brandId);
	}, [menusQuery.data, brandId]);

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus merek ${data?.name}?`}
				description="Merek akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Merek Berhasil Dihapus!"
				description="Merek berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Merek"
				message="Terjadi kesalahan saat menghapus merek. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{brandQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={<Feather name="tag" size={26} color={Colors.primary} />}
							title={data?.name ?? "-"}
							description="Kelompok merk untuk mengelola item berdasarkan brand."
						/>

						{/* Info Section */}
						<CatalogDetailSection title="Informasi Merek">
							<DetailRow
								label="Nama Merk"
								value={data?.name ?? "-"}
								icon="file-text"
							/>
							<DetailRow
								label="Item"
								value={`${brandMenus.length} item dipilih`}
								icon="tag"
								isLast
							/>
						</CatalogDetailSection>

						{/* Relations Section: Item Yang Dipilih */}
						<CatalogRelatedListCard
							title="Item Yang Dipilih"
							items={brandMenus}
							renderItem={(menu: any, idx: number, isLast: boolean) => (
								<CatalogRelatedItemRow
									key={menu.id}
									icon="tag"
									title={menu.name}
									badgeText=""
									isLast={isLast}
								/>
							)}
							emptyText="Belum ada item yang menggunakan merek ini"
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
