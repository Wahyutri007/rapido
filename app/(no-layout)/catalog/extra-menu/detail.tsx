import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import {
	useExtraMenuDeleteRequest,
	useExtraMenuQuery,
} from "@/api/hooks/extra-menus";
import { useMenusQuery } from "@/api/hooks/menus";
import { ICONS } from "@/assets/images/icons";
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
import { MOCK_EXTRA_MENU_DATA } from "@/constants/data/extra-menu";
import { formatRp, route } from "@/lib/utils";

export default function ExtraMenuDetailScreen() {
	const params = useLocalSearchParams();
	const extraMenuId = params?.id as string | undefined;

	const extraMenuQuery = useExtraMenuQuery(extraMenuId);
	const menusQuery = useMenusQuery();
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useExtraMenuDeleteRequest(undefined, extraMenuId);

	function handleEdit() {
		if (!extraMenuId) return;
		router.push(route("/catalog/extra-menu/modify", { id: extraMenuId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!extraMenuId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["extra-menus"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	// Fallback to MOCK_EXTRA_MENU_DATA if backend query returns no data
	const data = React.useMemo(() => {
		if (extraMenuQuery.data) return extraMenuQuery.data;
		return (
			MOCK_EXTRA_MENU_DATA.find((m) => m.id === extraMenuId) ??
			MOCK_EXTRA_MENU_DATA[0]
		);
	}, [extraMenuQuery.data, extraMenuId]);

	const linkedMenus = React.useMemo(() => {
		if (data?.menus && data.menus.length > 0) {
			return data.menus;
		}
		if (!menusQuery.data || !extraMenuId) return [];
		return menusQuery.data.filter(
			(m) =>
				m.extra_menu_ids?.includes(extraMenuId) ||
				data?.menu_ids?.includes(m.id),
		);
	}, [data?.menus, data?.menu_ids, menusQuery.data, extraMenuId]);

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus ekstra ${data?.name}?`}
				description="Ekstra akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Ekstra Berhasil Dihapus!"
				description="Ekstra berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Ekstra"
				message="Terjadi kesalahan saat menghapus ekstra. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{extraMenuQuery.isLoading && extraMenuId ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={
								<Image
									source={ICONS.catalog.extras}
									className="size-8"
									resizeMode="contain"
								/>
							}
							title={data?.name ?? "-"}
							description="Kelompok menu tambahan untuk menentukan pilihan ekstra pada item atau produk."
						/>

						{/* Section 1: Informasi Tambahan */}
						<CatalogDetailSection title="Informasi Tambahan">
							<DetailRow
								label="Nama Grup Tambahan"
								value={data?.name ?? "-"}
								icon={
									<Image
										source={ICONS.catalog.extras}
										className="size-5"
										resizeMode="contain"
									/>
								}
							/>
							<DetailRow
								label="Item"
								value={`${linkedMenus.length} item dipilih`}
								icon={
									<Image
										source={ICONS.catalog.extras}
										className="size-5"
										resizeMode="contain"
									/>
								}
								isLast
							/>
						</CatalogDetailSection>

						{/* Section 2: Pilihan & Harga */}
						<CatalogDetailSection title="Pilihan & Harga">
							{data?.details && data.details.length > 0 ? (
								data.details.map((detail, idx) => (
									<DetailRow
										key={detail.id || detail.name}
										label={detail.name}
										value={formatRp(detail.price)}
										icon={
											<Image
												source={ICONS.catalog.extras}
												className="size-5"
												resizeMode="contain"
											/>
										}
										isLast={idx === data.details.length - 1}
									/>
								))
							) : (
								<DetailRow label="Pilihan Ekstra" value="-" isLast />
							)}
						</CatalogDetailSection>

						{/* Section 3: Item yang dipilih */}
						<CatalogRelatedListCard
							title="Item yang dipilih"
							items={linkedMenus}
							renderItem={(menu: any, _, isLast: boolean) => (
								<CatalogRelatedItemRow
									key={menu.id}
									icon={
										<Image
											source={ICONS.catalog.extras}
											className="size-5"
											resizeMode="contain"
										/>
									}
									title={menu.name}
									badgeText=""
									isLast={isLast}
								/>
							)}
							emptyText="Belum ada item yang menggunakan ekstra ini"
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
