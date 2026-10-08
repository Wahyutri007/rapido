import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import {
	useExtraCostDeleteRequest,
	useExtraCostQuery,
} from "@/api/hooks/extra-costs";
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
} from "@/components/feature/catalog";
import { Colors } from "@/constants/Colors";
import { route } from "@/lib/utils";
import { DiscountValueTypeEnum } from "@/types/enums";

export default function ExtraCostDetailScreen() {
	const params = useLocalSearchParams();
	const extraCostId = params?.id as string | undefined;
	const extraCostQuery = useExtraCostQuery(extraCostId);
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useExtraCostDeleteRequest(undefined, extraCostId);

	function handleEdit() {
		if (!extraCostId) return;
		router.push(route("/catalog/extra-cost/modify", { id: extraCostId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!extraCostId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["extra-costs"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	const data = extraCostQuery.data;
	const isPercentage = data?.type === DiscountValueTypeEnum.PERCENTAGE;
	const formattedAmount =
		data?.amount !== undefined
			? isPercentage
				? `${data.amount}%`
				: `Rp ${data.amount.toLocaleString("id-ID")}`
			: "-";

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus biaya tambahan ${data?.name}?`}
				description="Biaya tambahan akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Biaya Tambahan Berhasil Dihapus!"
				description="Biaya tambahan berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Biaya Tambahan"
				message="Terjadi kesalahan saat menghapus biaya tambahan. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{extraCostQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={<Feather name="percent" size={26} color={Colors.primary} />}
							title={data?.name ?? "-"}
							badge={isPercentage ? "Persentase" : "Tetap"}
							description="Biaya tambahan yang diterapkan pada pesanan atau transaksi."
						/>

						{/* Info Section */}
						<CatalogDetailSection title="Informasi Biaya Tambahan">
							<DetailRow
								label="Nama Biaya"
								value={data?.name ?? "-"}
								icon="tag"
							/>
							<DetailRow
								label="Tipe Perhitungan"
								value={isPercentage ? "Persentase" : "Tetap (Nominal)"}
								icon="credit-card"
							/>
							<DetailRow
								label={isPercentage ? "Angka Persentase" : "Nominal Biaya"}
								value={formattedAmount}
								icon="percent"
								isLast
							/>
						</CatalogDetailSection>
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
