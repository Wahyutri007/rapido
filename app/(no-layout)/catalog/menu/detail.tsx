import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useMenuDeleteRequest, useMenuQuery } from "@/api/hooks/menus";
import { useBrandsQuery } from "@/api/hooks/brands";
import { useCategoriesQuery } from "@/api/hooks/categories";
import { useExtraMenusQuery } from "@/api/hooks/extra-menus";
import { useOrderTypesQuery } from "@/api/hooks/order-types";
import { useUnitsQuery } from "@/api/hooks/units";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import {
	CatalogDetailSection,
} from "@/components/feature/catalog";
import { Colors } from "@/constants/Colors";
import { MOCK_MENU_DATA } from "@/constants/data/menu";
import { formatRp, route } from "@/lib/utils";

export default function MenuDetailScreen() {
	const params = useLocalSearchParams();
	const menuId = params?.id as string | undefined;

	const menuQuery = useMenuQuery(menuId);
	const categoriesQuery = useCategoriesQuery();
	const brandsQuery = useBrandsQuery();
	const unitsQuery = useUnitsQuery();
	const orderTypesQuery = useOrderTypesQuery();
	const extraMenusQuery = useExtraMenusQuery();

	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useMenuDeleteRequest(undefined, menuId);

	// Fallback to MOCK_MENU_DATA if backend query returns no data
	// TODO: Remove MOCK_MENU_DATA fallback once backend menu detail endpoint is fully synchronized
	const data = React.useMemo(() => {
		if (menuQuery.data) return menuQuery.data;
		return MOCK_MENU_DATA.find((m) => m.id === menuId) ?? MOCK_MENU_DATA[0];
	}, [menuQuery.data, menuId]);

	function handleEdit() {
		if (!menuId) return;
		router.push(route("/catalog/menu/modify", { id: menuId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!menuId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["menus"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	// Resolve relation labels
	const categoryName = React.useMemo(() => {
		if (!data?.category_id) return "-";
		const cat = categoriesQuery.data?.find((c) => c.id === data.category_id);
		return cat?.name ?? "Makanan";
	}, [categoriesQuery.data, data]);

	const brandName = React.useMemo(() => {
		if (!data?.brand_id) return "-";
		const brand = brandsQuery.data?.find((b) => b.id === data.brand_id);
		return brand?.name ?? "Pizza Hut";
	}, [brandsQuery.data, data]);

	const unitName = React.useMemo(() => {
		if (!data?.unit_id) return "-";
		const unit = unitsQuery.data?.find((u) => u.id === data.unit_id);
		return unit?.name ?? "pcs";
	}, [unitsQuery.data, data]);

	const selectedOrderTypes = React.useMemo(() => {
		if (!data?.order_type_ids || data.order_type_ids.length === 0) {
			return ["Dine In", "Take Away", "Grab Food", "Shopee"];
		}
		if (!orderTypesQuery.data) return ["Dine In", "Take Away"];
		const matching = orderTypesQuery.data
			.filter((ot) => data.order_type_ids.includes(ot.id))
			.map((ot) => ot.name);
		return matching.length > 0 ? matching : ["Dine In", "Take Away"];
	}, [orderTypesQuery.data, data]);

	const selectedExtras = React.useMemo(() => {
		if (!data?.extra_menu_ids || data.extra_menu_ids.length === 0) {
			return ["Dine In", "Take Away", "Grab Food", "Shopee"];
		}
		if (!extraMenusQuery.data) return ["Topping"];
		const matching = extraMenusQuery.data
			.filter((em) => data.extra_menu_ids.includes(em.id))
			.map((em) => em.name);
		return matching.length > 0 ? matching : ["Topping"];
	}, [extraMenusQuery.data, data]);

	// Format price display
	const priceDisplay = React.useMemo(() => {
		if (!data) return "-";
		if (data.entries && data.entries.length > 0) {
			const entry = data.entries[0];
			if (entry.sell_price) return formatRp(entry.sell_price);
		}
		return "Rp 50.000";
	}, [data]);

	const costPriceDisplay = React.useMemo(() => {
		if (!data) return "-";
		if (data.entries && data.entries.length > 0) {
			const entry = data.entries[0];
			if (entry.cost_price) return formatRp(entry.cost_price);
		}
		return "-";
	}, [data]);

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus menu ${data?.name}?`}
				description="Menu akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Menu Berhasil Dihapus!"
				description="Menu berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Menu"
				message="Terjadi kesalahan saat menghapus menu. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{menuQuery.isLoading && menuId ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Section 1: Informasi Produk */}
						<CatalogDetailSection title="Informasi Produk">
							<DetailRow
								label="Nama Produk"
								value={data?.name ?? "-"}
								icon="tag"
							/>
							<DetailRow
								label="Kategori Produk"
								value={categoryName}
								icon="grid"
							/>
							<DetailRow
								label="Merk"
								value={brandName}
								icon="briefcase"
							/>
							<DetailRow
								label="Deskripsi"
								value={data?.description || "-"}
								icon="file-text"
								isLast
							/>
						</CatalogDetailSection>

						{/* Section 2: Detail Penjualan */}
						<CatalogDetailSection title="Detail Penjualan">
							<DetailRow label="Tipe Pesanan" icon="file-text">
								<View className="flex-1 flex-row flex-wrap justify-end gap-1.5 pl-4">
									{selectedOrderTypes.map((ot, idx) => (
										<View
											key={idx}
											className="rounded-lg bg-blue-50 px-2.5 py-1"
										>
											<Text size="small" w="medium" className="text-primary">
												{ot}
											</Text>
										</View>
									))}
								</View>
							</DetailRow>

							<DetailRow label="Tambahan" icon="file-text">
								<View className="flex-1 flex-row flex-wrap justify-end gap-1.5 pl-4">
									{selectedExtras.map((extra, idx) => (
										<View
											key={idx}
											className="rounded-lg bg-blue-50 px-2.5 py-1"
										>
											<Text size="small" w="medium" className="text-primary">
												{extra}
											</Text>
										</View>
									))}
								</View>
							</DetailRow>

							<DetailRow
								label="Harga Jual"
								value={priceDisplay}
								icon="tag"
							/>
							<DetailRow
								label="Harga Modal"
								value={costPriceDisplay}
								icon="tag"
							/>
							<DetailRow
								label="Satuan"
								value={unitName}
								icon="tag"
								isLast
							/>
						</CatalogDetailSection>

						{/* Section 3: Pengelolaan */}
						<CatalogDetailSection title="Pengelolaan">
							<DetailRow label="Variasi" icon="tag">
								<View
									className={
										data?.variants
											? "rounded-full bg-emerald-50 px-3 py-1"
											: "rounded-full bg-red-50 px-3 py-1"
									}
								>
									<Text
										size="small"
										w="semibold"
										className={data?.variants ? "text-emerald-600" : "text-red-500"}
									>
										{data?.variants ? "Aktif" : "Tidak Aktif"}
									</Text>
								</View>
							</DetailRow>

							<DetailRow
								label="Barcode"
								value="123445"
								icon="grid"
							/>
							<DetailRow
								label="Nama Katalog"
								value={data?.name ?? "Teh Es"}
								icon="box"
							/>
							<DetailRow
								label="Jumlah"
								value="1"
								icon="hash"
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
