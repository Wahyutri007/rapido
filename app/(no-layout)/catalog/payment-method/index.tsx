import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, RefreshControl, View } from "react-native";
import {
	usePaymentMethodDeleteRequest,
	usePaymentMethodsQuery,
} from "@/api/hooks/payment-methods";
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
import { WalletIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import useRefreshControl from "@/hooks/useRefreshControl";
import useSearch, { type SortOption } from "@/hooks/useSearch";
import { route, tw } from "@/lib/utils";
import type { PaymentMethodData } from "@/types/api/payment-method";
import { PaymentMethodType } from "@/types/enums";

function getPaymentMethodIcon(type: string, name: string) {
	const lower = name.toLowerCase();
	if (
		lower.includes("tunai") ||
		lower.includes("cash") ||
		type === PaymentMethodType.CASH
	) {
		return (
			<FontAwesome5 name="money-bill-wave" size={20} color={Colors.primary} />
		);
	}
	if (
		lower.includes("dana") ||
		lower.includes("wallet") ||
		lower.includes("ovo") ||
		lower.includes("gopay")
	) {
		return <WalletIcon size={22} color={Colors.primary} />;
	}
	if (lower.includes("qris") || type === PaymentMethodType.QRIS) {
		return (
			<MaterialIcons name="qr-code-scanner" size={22} color={Colors.primary} />
		);
	}
	if (
		lower.includes("bank") ||
		lower.includes("transfer") ||
		type === PaymentMethodType.BANK_TRANSFER
	) {
		return <FontAwesome5 name="university" size={19} color={Colors.primary} />;
	}
	return <FontAwesome5 name="university" size={19} color={Colors.primary} />;
}

export default function PaymentMethodScreen() {
	const paymentMethodDataQuery = usePaymentMethodsQuery();
	const paymentMethodRefresh = useRefreshControl(
		paymentMethodDataQuery.refetch,
	);
	const queryClient = useQueryClient();

	const [search, setSearch] = React.useState("");
	const [sortBy, setSortBy] = React.useState<SortOption>("newest");
	const { results: filteredPaymentMethods } = useSearch(
		paymentMethodDataQuery.data || [],
		search,
		(item) => item.name,
		{ sortBy },
	);

	// Modal & Selection State
	const [selectedPaymentMethod, setSelectedPaymentMethod] =
		React.useState<PaymentMethodData | null>(null);
	const [actionSheetOpen, setActionSheetOpen] = React.useState(false);

	const deleteModal = useAlertModal();
	const deleteConfirmModal = useAlertModal();
	const deleteErrorModal = useAlertModal();

	const deleteRequest = usePaymentMethodDeleteRequest(
		undefined,
		selectedPaymentMethod?.id,
	);

	function handleActionPress(paymentMethod: PaymentMethodData) {
		setSelectedPaymentMethod(paymentMethod);
		setActionSheetOpen(true);
	}

	function handleViewDetail() {
		if (!selectedPaymentMethod) return;
		router.push(
			route("/catalog/payment-method/detail", { id: selectedPaymentMethod.id }),
		);
	}

	function handleEdit() {
		if (!selectedPaymentMethod) return;
		router.push(
			route("/catalog/payment-method/modify", { id: selectedPaymentMethod.id }),
		);
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!selectedPaymentMethod) return;

		const [_, error] = await deleteRequest.call();

		if (error) {
			deleteErrorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
		deleteConfirmModal.open();
	}

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus metode pembayaran ${selectedPaymentMethod?.name}?`}
				description="Metode pembayaran akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Metode Pembayaran Berhasil Dihapus!"
				description="Metode pembayaran berhasil dihapus dari daftar."
				onClose={deleteConfirmModal.close}
				openState={deleteConfirmModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Metode Pembayaran"
				message="Terjadi kesalahan saat menghapus metode pembayaran. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={deleteErrorModal.close}
				openState={deleteErrorModal.openState}
			/>

			<ItemActionSheet
				isOpen={actionSheetOpen}
				onClose={() => setActionSheetOpen(false)}
				title={selectedPaymentMethod?.name}
				entityName="Metode Pembayaran"
				onViewDetail={handleViewDetail}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>

			<Wrapper py={tw(4)} isNotScrollable>
				<View className="relative flex-1 px-4">
					<SearchBar
						search={search}
						setSearch={setSearch}
						placeholder="Cari metode pembayaran..."
						withSort
						sortBy={sortBy}
						onSortChange={setSortBy}
						variant="light"
					/>

					{paymentMethodDataQuery.isLoading ? (
						<LoadingPlaceholder className="mt-4" />
					) : (
						<FlatList
							className="mt-4 flex-1"
							contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
							data={filteredPaymentMethods}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<CatalogItemCard
									title={item.name}
									icon={getPaymentMethodIcon(item.type, item.name)}
									onPress={() =>
										router.push(
											route("/catalog/payment-method/detail", { id: item.id }),
										)
									}
									onActionPress={() => handleActionPress(item)}
								/>
							)}
							showsVerticalScrollIndicator={false}
							refreshControl={<RefreshControl {...paymentMethodRefresh} />}
							ListEmptyComponent={() => (
								<SearchNotFound text="Tidak ada metode pembayaran yang ditemukan" />
							)}
						/>
					)}
				</View>
			</Wrapper>

			<BottomActionButton
				onPress={() => router.push(route("/catalog/payment-method/modify"))}
			>
				Tambah Metode Pembayaran
			</BottomActionButton>
		</>
	);
}
