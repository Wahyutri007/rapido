import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useTaxDeleteRequest, useTaxQuery } from "@/api/hooks/taxes";
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

export default function TaxDetailScreen() {
	const params = useLocalSearchParams();
	const taxId = params?.id as string | undefined;
	const taxQuery = useTaxQuery(taxId);
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useTaxDeleteRequest(undefined, taxId);

	function handleEdit() {
		if (!taxId) return;
		router.push(route("/catalog/tax/modify", { id: taxId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!taxId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["taxes"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	const data = taxQuery.data;

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus pajak ${data?.name}?`}
				description="Pajak akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Pajak Berhasil Dihapus!"
				description="Pajak berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Pajak"
				message="Terjadi kesalahan saat menghapus pajak. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{taxQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={<Feather name="file-text" size={26} color={Colors.primary} />}
							title={data?.name ?? "-"}
							badge={data?.rate !== undefined ? `${data.rate}%` : undefined}
							description="Pajak yang dihitung berdasarkan persentase."
						/>

						{/* Info Section */}
						<CatalogDetailSection title="Informasi Pajak">
							<DetailRow
								label="Nama Pajak"
								value={data?.name ?? "-"}
								icon="tag"
							/>
							<DetailRow
								label="Angka Persentase"
								value={data?.rate !== undefined ? `${data.rate}%` : "-"}
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
