import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import {
	useOrderTypeDeleteRequest,
	useOrderTypeQuery,
} from "@/api/hooks/order-types";
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

export default function OrderTypeDetailScreen() {
	const params = useLocalSearchParams();
	const orderTypeId = params?.id as string | undefined;
	const orderTypeQuery = useOrderTypeQuery(orderTypeId);
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useOrderTypeDeleteRequest(undefined, orderTypeId);

	function handleEdit() {
		if (!orderTypeId) return;
		router.push(route("/catalog/order-type/modify", { id: orderTypeId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!orderTypeId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["order-types"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	const data = orderTypeQuery.data;
	const taxes = data?.taxes ?? [];

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus tipe pesanan ${data?.name}?`}
				description="Tipe pesanan akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Tipe Pesanan Berhasil Dihapus!"
				description="Tipe pesanan berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Tipe Pesanan"
				message="Terjadi kesalahan saat menghapus tipe pesanan. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{orderTypeQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={<Feather name="shopping-bag" size={26} color={Colors.primary} />}
							title={data?.name ?? "-"}
							badge="Layanan"
							description="Digunakan untuk mengatur jenis layanan pesanan dalam sistem."
						/>

						{/* Info Section */}
						<CatalogDetailSection title="Informasi Tipe Pesanan">
							<DetailRow
								label="Nama Tipe Pesanan"
								value={data?.name ?? "-"}
								icon="tag"
							/>
							<DetailRow
								label="Jumlah Pajak"
								value={`${taxes.length} Pajak`}
								icon="percent"
								isLast
							/>
						</CatalogDetailSection>

						{/* Relations Section: Digunakan Pada */}
						<CatalogRelatedListCard
							title="Digunakan Pada"
							items={taxes}
							renderItem={(tax, idx, isLast) => (
								<CatalogRelatedItemRow
									key={tax.id}
									icon="file-text"
									title={tax.name}
									subtitle={`Pajak (${tax.rate}%)`}
									badgeText="Aktif"
									isLast={isLast}
								/>
							)}
							emptyText="Belum ada pajak yang terhubung"
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
