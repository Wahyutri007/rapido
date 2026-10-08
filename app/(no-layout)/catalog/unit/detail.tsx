import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useMenusQuery } from "@/api/hooks/menus";
import { useUnitDeleteRequest, useUnitQuery } from "@/api/hooks/units";
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

export default function UnitDetailScreen() {
	const params = useLocalSearchParams();
	const unitId = params?.id as string | undefined;
	const unitQuery = useUnitQuery(unitId);
	const menusQuery = useMenusQuery();
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useUnitDeleteRequest(undefined, unitId);

	function handleEdit() {
		if (!unitId) return;
		router.push(route("/catalog/unit/modify", { id: unitId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!unitId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["units"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	const data = unitQuery.data;
	const unitMenus = React.useMemo(() => {
		if (!menusQuery.data || !unitId) return [];
		return menusQuery.data.filter((menu) => menu.unit_id === unitId);
	}, [menusQuery.data, unitId]);

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus satuan ${data?.name}?`}
				description="Satuan akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Satuan Berhasil Dihapus!"
				description="Satuan berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Satuan"
				message="Terjadi kesalahan saat menghapus satuan. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{unitQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={<Feather name="box" size={26} color={Colors.primary} />}
							title={data?.name ?? "-"}
							badge={data?.code}
							description="Digunakan sebagai satuan unit produk dalam inventaris dan penjualan."
						/>

						{/* Info Section */}
						<CatalogDetailSection title="Informasi Satuan">
							<DetailRow
								label="Nama Satuan"
								value={data?.name ?? "-"}
								icon="tag"
							/>
							<DetailRow
								label="Kode Satuan"
								value={data?.code ?? "-"}
								icon="file-text"
								isLast
							/>
						</CatalogDetailSection>

						{/* Relations Section: Item Yang Dipilih */}
						<CatalogRelatedListCard
							title="Item Yang Dipilih"
							items={unitMenus}
							renderItem={(menu, idx, isLast) => (
								<CatalogRelatedItemRow
									key={menu.id}
									icon="box"
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
							emptyText="Belum ada produk yang menggunakan satuan ini"
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
