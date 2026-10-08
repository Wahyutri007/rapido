import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import {
	useBundlingDeleteRequest,
	useBundlingQuery,
} from "@/api/hooks/bundlings";
import { useMenusQuery } from "@/api/hooks/menus";
import { useOrderTypesQuery } from "@/api/hooks/order-types";
import { useStoresQuery } from "@/api/hooks/stores";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import DetailBottomActions from "@/components/custom/DetailBottomActions";
import DetailRow from "@/components/custom/DetailRow";
import {
	CatalogDetailHeroCard,
	CatalogDetailSection,
} from "@/components/feature/catalog";
import { Colors } from "@/constants/Colors";
import { MOCK_BUNDLING_DATA } from "@/constants/data/bundling";
import { cn, formatRp, route } from "@/lib/utils";
import type { BundlingData } from "@/types/api/bundling";

function formatDatePeriodDisplay(start?: string, end?: string) {
	if (!start || !end) return "1/1/2024 - 1/6/2024";
	const s = new Date(start);
	const e = new Date(end);
	if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "1/1/2024 - 1/6/2024";
	return `${s.getDate()}/${s.getMonth() + 1}/${s.getFullYear()} - ${e.getDate()}/${e.getMonth() + 1}/${e.getFullYear()}`;
}

export default function BundlingDetailScreen() {
	const params = useLocalSearchParams();
	const bundlingId = params?.id as string | undefined;

	const bundlingQuery = useBundlingQuery(bundlingId);
	const menusQuery = useMenusQuery();
	const storesQuery = useStoresQuery();
	const orderTypesQuery = useOrderTypesQuery();
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useBundlingDeleteRequest(undefined, bundlingId);

	// Fallback to MOCK_BUNDLING_DATA if backend query returns no data
	const data: BundlingData = React.useMemo(() => {
		if (bundlingQuery.data) return bundlingQuery.data;
		return (
			MOCK_BUNDLING_DATA.find((m) => m.id === bundlingId) ??
			MOCK_BUNDLING_DATA[0]
		);
	}, [bundlingQuery.data, bundlingId]);

	function handleEdit() {
		if (!bundlingId) return;
		router.push(route("/catalog/bundling/modify", { id: bundlingId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!bundlingId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["bundlings"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	// Resolve stores list
	const storeList = React.useMemo(() => {
		if (data?.stores && data.stores.length > 0) {
			return data.stores;
		}
		if (storesQuery.data && storesQuery.data.length > 0) {
			return storesQuery.data.slice(0, 4).map((s) => ({
				id: s.id,
				name: s.name,
				address: s.address || "Pekanbaru",
				is_active: true,
			}));
		}
		return MOCK_BUNDLING_DATA[0].stores ?? [];
	}, [data?.stores, storesQuery.data]);

	// Resolve prices list
	const priceList = React.useMemo(() => {
		if (data?.prices && data.prices.length > 0) {
			return data.prices.map((p) => {
				const lower = (p.order_type_name || "").toLowerCase();
				let icon: keyof typeof Feather.glyphMap = "shopping-bag";
				if (lower.includes("dine") || lower.includes("makan")) icon = "coffee";
				else if (lower.includes("online") || lower.includes("delivery") || lower.includes("food")) icon = "truck";
				return {
					...p,
					icon,
				};
			});
		}
		return [
			{ order_type_id: "1", order_type_name: "Take Away", sell_price: data?.sell_price || 40000, icon: "shopping-bag" as const },
			{ order_type_id: "2", order_type_name: "Dine In", sell_price: 44000, icon: "coffee" as const },
			{ order_type_id: "3", order_type_name: "Online Food", sell_price: 54000, icon: "truck" as const },
		];
	}, [data?.prices, data?.sell_price]);

	// Resolve menu names for item details
	const resolvedItems = React.useMemo(() => {
		return data.details.map((detail, idx) => {
			const foundMenu = menusQuery.data?.find((m) => m.id === detail.menu_id);
			return {
				id: detail.id || `item-${idx}`,
				name: detail.menu_name || foundMenu?.name || "Nasi Goreng",
				variant: detail.variant_name || (idx === 0 ? "Pedas" : "Kampung"),
				quantity: detail.quantity || (idx === 0 ? 3 : 2),
			};
		});
	}, [data.details, menusQuery.data]);

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus paket ${data?.name}?`}
				description="Paket akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Paket Berhasil Dihapus!"
				description="Paket berhasil dihapus dari daftar paket."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Paket"
				message="Terjadi kesalahan saat menghapus paket. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{bundlingQuery.isLoading && bundlingId ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4 pb-24">
						{/* TOP HERO CARD */}
						<CatalogDetailHeroCard
							icon={<Feather name="box" size={24} color={Colors.primary} />}
							title={data.name}
							description={`Buat tanggal ${data.created_at || "11 Mei 2026"}`}
						/>

						{/* SECTION 1: INFORMASI BUNDLING */}
						<CatalogDetailSection title="Informasi Bundling">
							<DetailRow
								label="Toko"
								value={`${storeList.length} toko dipilih`}
								icon="shopping-bag"
							/>
							<DetailRow
								label="Periode Paket"
								value={formatDatePeriodDisplay(data.start_period, data.end_period)}
								icon="credit-card"
							/>
							<DetailRow label="Gambar Paket" icon="file-text" isLast>
								{data.image ? (
									<View className="size-11 overflow-hidden rounded-lg border border-zinc-200 bg-white">
										<Image
											source={{ uri: data.image }}
											className="size-full"
											resizeMode="cover"
										/>
									</View>
								) : (
									<View className="h-9 w-14 items-center justify-center rounded-lg bg-emerald-800">
										<Text size="small" w="bold" className="text-white">
											Paket
										</Text>
									</View>
								)}
							</DetailRow>
						</CatalogDetailSection>

						{/* SECTION 2: ITEM BUNDLING */}
						<CatalogDetailSection title="Item Bundling">
							<View className="gap-3">
								{resolvedItems.map((item, idx) => (
									<View
										key={item.id}
										className="overflow-hidden rounded-xl border border-border bg-white"
									>
										{/* Banner Header */}
										<View className="bg-primary-100 px-3.5 py-2">
											<Text w="semibold" size="small" className="text-primary">
												Item {idx + 1}
											</Text>
										</View>

										{/* 3-Column Content */}
										<View className="flex-row items-center divide-x divide-gray-100 p-3">
											<View className="flex-1 pr-2">
												<Text size="small" className="text-muted">
													Pilih Item
												</Text>
												<Text size="normal" w="semibold" className="text-foreground">
													{item.name}
												</Text>
											</View>

											<View className="flex-1 px-3">
												<Text size="small" className="text-muted">
													Varian
												</Text>
												<Text size="normal" w="semibold" className="text-foreground">
													{item.variant}
												</Text>
											</View>

											<View className="w-20 pl-3">
												<Text size="small" className="text-muted">
													Jumlah
												</Text>
												<Text size="normal" w="semibold" className="text-foreground">
													{item.quantity}
												</Text>
											</View>
										</View>
									</View>
								))}
							</View>
						</CatalogDetailSection>

						{/* SECTION 3: PENGATURAN HARGA */}
						<CatalogDetailSection title="Pengaturan Harga">
							{priceList.map((price, idx) => {
								const isLast = idx === priceList.length - 1;
								return (
									<View
										key={price.order_type_id}
										className={cn(
											"flex-row items-center justify-between py-2.5",
											!isLast && "border-b border-gray-100",
										)}
									>
										<View className="flex-row items-center gap-3">
											<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
												<Feather
													name={price.icon}
													size={16}
													color={Colors.primary}
												/>
											</View>
											<Text w="semibold" size="normal" className="text-foreground">
												{price.order_type_name}
											</Text>
										</View>
										<Text size="normal" className="text-muted">
											{formatRp(price.sell_price)}
										</Text>
									</View>
								);
							})}
						</CatalogDetailSection>

						{/* SECTION 4: TOKO YANG MENGGUNAKAN */}
						<CatalogDetailSection title="Toko Yang Menggunakan">
							{storeList.map((store, idx) => {
								const isLast = idx === storeList.length - 1;
								return (
									<View
										key={store.id}
										className={cn(
											"flex-row items-center justify-between py-3",
											!isLast && "border-b border-gray-100",
										)}
									>
										<View className="flex-row items-center gap-3">
											<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
												<Feather
													name="shopping-bag"
													size={16}
													color={Colors.primary}
												/>
											</View>
											<View>
												<Text
													size="normal"
													w="semibold"
													className="text-foreground"
												>
													{store.name}
												</Text>
												<Text size="small" className="text-muted">
													{store.address || "Pekanbaru"}
												</Text>
											</View>
										</View>
										<View className="rounded-md bg-green-50 px-2 py-0.5">
											<Text
												size="small"
												w="semibold"
												className="text-green-600"
											>
												Aktif
											</Text>
										</View>
									</View>
								);
							})}
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
