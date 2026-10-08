import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import {
	usePaymentMethodDeleteRequest,
	usePaymentMethodQuery,
} from "@/api/hooks/payment-methods";
import { useReferenceDataQuery } from "@/api/hooks/references";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import {
	CatalogDetailHeroCard,
	CatalogDetailNotice,
	CatalogDetailSection,
	CatalogRelatedItemRow,
	CatalogRelatedListCard,
} from "@/components/feature/catalog";
import { WalletIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { paymentMethodItems } from "@/constants/enums/payment-method";
import { route } from "@/lib/utils";
import { PaymentMethodType } from "@/types/enums";

function getPaymentMethodHeroIcon(type?: string, name = "") {
	const lower = name.toLowerCase();
	if (
		lower.includes("tunai") ||
		lower.includes("cash") ||
		type === PaymentMethodType.CASH
	) {
		return (
			<FontAwesome5 name="money-bill-wave" size={26} color={Colors.primary} />
		);
	}
	if (
		lower.includes("dana") ||
		lower.includes("wallet") ||
		lower.includes("ovo") ||
		lower.includes("gopay")
	) {
		return <WalletIcon size={28} color={Colors.primary} />;
	}
	if (lower.includes("qris") || type === PaymentMethodType.QRIS) {
		return (
			<MaterialIcons name="qr-code-scanner" size={28} color={Colors.primary} />
		);
	}
	return <FontAwesome5 name="university" size={24} color={Colors.primary} />;
}

export default function PaymentMethodDetailScreen() {
	const params = useLocalSearchParams();
	const paymentMethodId = params?.id as string | undefined;
	const paymentMethodQuery = usePaymentMethodQuery(paymentMethodId);
	const banksQuery = useReferenceDataQuery("bank_account");
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = usePaymentMethodDeleteRequest(
		undefined,
		paymentMethodId,
	);

	function handleEdit() {
		if (!paymentMethodId) return;
		router.push(
			route("/catalog/payment-method/modify", { id: paymentMethodId }),
		);
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!paymentMethodId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	const data = paymentMethodQuery.data;
	const typeLabel =
		paymentMethodItems.find((item) => item.value === data?.type)?.label ??
		data?.type ??
		"-";

	const bankName =
		banksQuery.data?.find(
			(b) => b.id === data?.bank_details?.bank_account_id,
		)?.name ??
		data?.bank_details?.bank_account_id ??
		"-";

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus metode pembayaran ${data?.name}?`}
				description="Metode pembayaran akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Metode Pembayaran Berhasil Dihapus!"
				description="Metode pembayaran berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Metode Pembayaran"
				message="Terjadi kesalahan saat menghapus metode pembayaran. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{paymentMethodQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={getPaymentMethodHeroIcon(data?.type, data?.name)}
							title={data?.name ?? "-"}
							badge={typeLabel}
							description={
								data?.type === PaymentMethodType.CASH
									? "Metode pembayaran menggunakan uang tunai."
									: data?.type === PaymentMethodType.QRIS
										? "Metode pembayaran digital menggunakan barcode QRIS."
										: data?.type === PaymentMethodType.BANK_TRANSFER
											? "Metode pembayaran melalui transfer rekening bank."
											: "Metode pembayaran yang digunakan untuk transaksi."
							}
						/>

						{/* Info Section */}
						<CatalogDetailSection title="Informasi Metode Pembayaran">
							<DetailRow
								label="Nama Metode Pembayaran"
								value={data?.name ?? "-"}
								icon="file-text"
							/>
							<DetailRow
								label="Jenis Pembayaran"
								value={typeLabel}
								icon="credit-card"
							/>
							<DetailRow
								label="Toko"
								value={`${data?.stores?.length ?? 0} toko dipilih`}
								icon="shopping-bag"
								isLast={!data?.bank_details}
							/>
							{data?.bank_details ? (
								<>
									<DetailRow
										label="Nama Bank"
										value={bankName}
										icon="home"
									/>
									<DetailRow
										label="Nomor Rekening"
										value={data.bank_details.account_number ?? "-"}
										icon="hash"
									/>
									<DetailRow
										label="Nama Pemilik Rekening"
										value={data.bank_details.account_holder_name ?? "-"}
										icon="user"
										isLast
									/>
								</>
							) : null}
						</CatalogDetailSection>

						{/* Notice Section */}
						<CatalogDetailNotice
							title="Tentang Metode Pembayaran Ini"
							message="Metode pembayaran ini akan tersedia di semua toko yang dipilih"
						/>

						{/* QRIS Barcode (if any) */}
						{data?.type === PaymentMethodType.QRIS && data?.barcode_image && (
							<CatalogDetailSection title="Barcode QRIS">
								<View className="items-center justify-center py-4">
									<View className="size-48 overflow-hidden rounded-xl border border-zinc-200 bg-white">
										<Image
											source={{ uri: data.barcode_image }}
											className="size-full"
											resizeMode="contain"
										/>
									</View>
								</View>
							</CatalogDetailSection>
						)}

						{/* Relations Section: Toko Yang Menggunakan */}
						<CatalogRelatedListCard
							title="Toko Yang Menggunakan"
							items={data?.stores ?? []}
							renderItem={(store, idx, isLast) => (
								<CatalogRelatedItemRow
									key={store.id}
									icon="shopping-bag"
									title={store.name}
									subtitle={store.address || "Semua Area"}
									badgeText="Aktif"
									isLast={isLast}
								/>
							)}
							emptyText="Belum ada toko yang menggunakan metode pembayaran ini"
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
