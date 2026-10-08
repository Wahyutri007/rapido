import { Entypo, Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { useCategoriesQuery } from "@/api/hooks/categories";
import { useMenusQuery } from "@/api/hooks/menus";
import { useOrderTypesQuery } from "@/api/hooks/order-types";
import { usePromoDeleteRequest, usePromoQuery } from "@/api/hooks/promos";
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
import { CatalogDetailSection } from "@/components/feature/catalog";
import {
	Select,
	SelectBackdrop,
	SelectContent,
	SelectDragIndicator,
	SelectDragIndicatorWrapper,
	SelectIcon,
	SelectInput,
	SelectItem,
	SelectPortal,
	SelectTrigger,
} from "@/components/ui/select";
import { Colors } from "@/constants/Colors";
import { cn, formatDatePeriod, formatRp, route } from "@/lib/utils";
import type { PromoUsageItem } from "@/types/api/promo";

const MOCK_PROMO_USAGES: PromoUsageItem[] = [
	{
		id: "1",
		invoice_number: "INV-11795649",
		amount: 230000,
		created_at: "06 Nov 2025-11:33",
		cashier_name: "Afgan",
		customer_name: "John Doe",
		store_name: "Innovation Center HCS IDN",
	},
	{
		id: "2",
		invoice_number: "INV-11795640",
		amount: 1000000,
		created_at: "06 Nov 2025-11:33",
		cashier_name: "Taufiq Qurrahman",
		customer_name: "John Doe",
		store_name: "Toko Sushiro",
	},
	{
		id: "3",
		invoice_number: "INV-11795649",
		amount: 230000,
		created_at: "06 Nov 2025-11:33",
		cashier_name: "Taufiq Qurrahman",
		customer_name: "John Doe",
		store_name: "Toko Baju",
	},
	{
		id: "4",
		invoice_number: "INV-11795649",
		amount: 230000,
		created_at: "06 Nov 2025-11:33",
		cashier_name: "Taufiq Qurrahman",
		customer_name: "John Doe",
		store_name: "Toko Jam",
	},
	{
		id: "5",
		invoice_number: "INV-11795649",
		amount: 230000,
		created_at: "06 Nov 2025-11:33",
		cashier_name: "Taufiq Qurrahman",
		customer_name: "John Doe",
		store_name: "Toko Gambar",
	},
];

export default function PromoDetailScreen() {
	const params = useLocalSearchParams();
	const promoId = params?.id as string | undefined;
	const promoQuery = usePromoQuery(promoId);
	const queryClient = useQueryClient();

	const menusQuery = useMenusQuery();
	const categoriesQuery = useCategoriesQuery();
	const orderTypesQuery = useOrderTypesQuery();
	const storesQuery = useStoresQuery();

	// Modals
	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = usePromoDeleteRequest(undefined, promoId);

	// Usage Section State
	const [usageSearch, setUsageSearch] = React.useState("");
	const [limit, setLimit] = React.useState("10");

	function handleEdit() {
		if (!promoId) return;
		router.push(route("/catalog/promo/modify", { id: promoId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!promoId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["promos"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	const data = promoQuery.data;

	// Resolve Order Type
	const orderTypeName = React.useMemo(() => {
		if (data?.order_type?.name) return data.order_type.name;
		const matched = orderTypesQuery.data?.find(
			(ot) => ot.id === data?.order_type_id,
		);
		return matched?.name || "Dine In";
	}, [data, orderTypesQuery.data]);

	// Resolve Stores
	const storeList = React.useMemo(() => {
		if (data?.stores && data.stores.length > 0) return data.stores;
		if (data?.store_ids && data.store_ids.length > 0 && storesQuery.data) {
			return storesQuery.data.filter((s) => data.store_ids?.includes(s.id));
		}
		// Fallback to all available stores or mock stores
		return (
			storesQuery.data?.slice(0, 4) || [
				{
					id: "1",
					name: "Warung Jul Panam",
					address: "Panam, Pekanbaru",
					is_active: true,
				},
				{
					id: "2",
					name: "Depot Sari Rasa",
					address: "Marpoyan, Pekanbaru",
					is_active: true,
				},
				{
					id: "3",
					name: "Kopi Luwak Express",
					address: "Simpang Tiga, Pekanbaru",
					is_active: true,
				},
				{
					id: "4",
					name: "Nasi Goreng Pak Didi",
					address: "Tenayan Raya, Pekanbaru",
					is_active: true,
				},
			]
		);
	}, [data, storesQuery.data]);

	// Resolve Requirement display name
	const reqInfo = React.useMemo(() => {
		const reqType = data?.promo_requirement || "item";
		const reqList =
			data?.requirements || (data?.promo_requirements as any) || [];
		const firstReq = reqList[0];

		let itemName = "Teh Es";
		let qty = firstReq?.minimum_quantity || 1;

		if (reqType === "category") {
			const cat = categoriesQuery.data?.find(
				(c) => c.id === firstReq?.applicable_id,
			);
			if (cat) itemName = cat.name;
		} else {
			const menu = menusQuery.data?.find(
				(m) => m.id === firstReq?.applicable_id,
			);
			if (menu) itemName = menu.name;
		}

		return {
			typeLabel:
				reqType === "category"
					? "Kategori"
					: reqType === "combination"
						? "Kombinasi"
						: "Item",
			itemName,
			qty,
		};
	}, [data, categoriesQuery.data, menusQuery.data]);

	// Resolve Free Item / Benefit display
	const benefitInfo = React.useMemo(() => {
		if (data?.type === "free_item" && data.free_item) {
			const entryId = data.free_item.menu_entry_id;
			let menuName = "Teh Es";
			let variantName = "XL";

			for (const m of menusQuery.data || []) {
				const entry = m.entries?.find((e) => e.id === entryId);
				if (entry) {
					menuName = m.name;
					variantName = entry.variant_name || "Standar";
					break;
				}
			}

			return {
				isFreeItem: true,
				menuName,
				variantName,
				quantity: data.free_item.quantity || 1,
			};
		}

		return {
			isFreeItem: false,
			discountType:
				data?.discount?.type === "percentage" ? "Persentase" : "Nominal",
			discountAmount:
				data?.discount?.type === "percentage"
					? `${data.discount.amount}%`
					: formatRp(data?.discount?.amount || 10000),
		};
	}, [data, menusQuery.data]);

	// Days badges
	const daysList = data?.days || ["Senin", "Selasa", "Rabu", "Kamis"];

	// Filtered Usages
	const filteredUsages = React.useMemo(() => {
		let list = MOCK_PROMO_USAGES;
		if (usageSearch.trim()) {
			const q = usageSearch.toLowerCase();
			list = list.filter(
				(u) =>
					u.invoice_number.toLowerCase().includes(q) ||
					u.cashier_name.toLowerCase().includes(q) ||
					u.customer_name.toLowerCase().includes(q) ||
					u.store_name.toLowerCase().includes(q),
			);
		}
		return list.slice(0, Number(limit) || 10);
	}, [usageSearch, limit]);

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus promo ${data?.name}?`}
				description="Promo akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Promo Berhasil Dihapus!"
				description="Promo berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Promo"
				message="Terjadi kesalahan saat menghapus promo. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{promoQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4 pb-20">
						{/* SECTION 1: INFORMASI PROMO */}
						<CatalogDetailSection title="Informasi Promo">
							<DetailRow
								label="Nama Promo"
								value={data?.name ?? "Diskon Akhir Tahun"}
								icon="tag"
							/>
							<DetailRow
								label="Tipe Promo"
								value={
									data?.type === "free_item" ? "Gratis Item" : "Potongan Harga"
								}
								icon="gift"
							/>
							<DetailRow label="Tipe Penjualan" icon="file-text" isLast>
								<View className="flex-row flex-wrap justify-end gap-1.5 max-w-[60%]">
									{["Dine In", "Take Away", "Grab Food", "Shopee"].map(
										(item) => (
											<View
												key={item}
												className="rounded-md bg-blue-50 px-2.5 py-1"
											>
												<Text size="small" w="medium" className="text-primary">
													{item}
												</Text>
											</View>
										),
									)}
								</View>
							</DetailRow>
						</CatalogDetailSection>

						{/* SECTION 2: TOKO YANG MENGGUNAKAN */}
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

						{/* SECTION 3: SYARAT PROMO */}
						<CatalogDetailSection title="Syarat Promo">
							<DetailRow
								label="Promo Berdasarkan"
								value={reqInfo.typeLabel}
								icon="tag"
							/>
							<DetailRow
								label="Tipe Promo"
								value={
									data?.type === "free_item" ? "Gratis Item" : "Potongan Harga"
								}
								icon="gift"
							/>
							<DetailRow
								label="Nama Katalog"
								value={reqInfo.itemName}
								icon="box"
							/>
							<DetailRow
								label="Jumlah"
								value={String(reqInfo.qty)}
								icon="hash"
								isLast
							/>
						</CatalogDetailSection>

						{/* SECTION 4: PERIODE PROMO */}
						<CatalogDetailSection title="Periode Promo">
							<DetailRow
								label="Periode Promo"
								value={formatDatePeriod(
									data?.start_period || new Date().toISOString(),
									data?.end_period ||
										new Date(Date.now() + 30 * 86400000).toISOString(),
								)}
								icon="calendar"
							/>
							<DetailRow label="Hari Berlaku" icon="calendar" isLast>
								<View className="flex-row flex-wrap justify-end gap-1.5 max-w-[60%]">
									{daysList.map((day) => (
										<View
											key={day}
											className="rounded-md bg-blue-50 px-2 py-1"
										>
											<Text size="small" w="medium" className="text-primary">
												{day}
											</Text>
										</View>
									))}
								</View>
							</DetailRow>
						</CatalogDetailSection>

						{/* SECTION 5: HADIAH PROMO */}
						<CatalogDetailSection title="Hadiah Promo">
							{benefitInfo.isFreeItem ? (
								<>
									<DetailRow
										label="Promo Berdasarkan"
										value="Item"
										icon="calendar"
									/>
									<DetailRow
										label="Nama Katalog"
										value={benefitInfo.menuName}
										icon="box"
									/>
									<DetailRow
										label="Level Variant"
										value={benefitInfo.variantName}
										icon="layers"
									/>
									<DetailRow
										label="Jumlah"
										value={String(benefitInfo.quantity)}
										icon="hash"
										isLast
									/>
								</>
							) : (
								<>
									<DetailRow
										label="Jenis Potongan"
										value={benefitInfo.discountType}
										icon="percent"
									/>
									<DetailRow
										label="Jumlah Diskon"
										value={benefitInfo.discountAmount}
										icon="dollar-sign"
										isLast
									/>
								</>
							)}
						</CatalogDetailSection>

						{/* SECTION 6: PENGGUNAAN PROMO */}
						<CatalogDetailSection title="Penggunaan Promo" noCard>
							<Card className="gap-3 p-4">
								{/* Limit & Search Row */}
								<View className="flex-row items-center gap-2">
									<View className="w-32 flex-row items-center gap-1.5">
										<Text size="small" className="text-muted">
											Tampilkan
										</Text>
										<View className="flex-1">
											<Select selectedValue={limit} onValueChange={setLimit}>
												<SelectTrigger className="h-9 justify-between bg-zinc-100 px-2">
													<SelectInput placeholder="10" />
													<SelectIcon
														as={() => (
															<Entypo name="chevron-down" size={14} />
														)}
													/>
												</SelectTrigger>
												<SelectPortal>
													<SelectBackdrop />
													<SelectContent>
														<SelectDragIndicatorWrapper>
															<SelectDragIndicator />
														</SelectDragIndicatorWrapper>
														<SelectItem label="10" value="10" />
														<SelectItem label="25" value="25" />
														<SelectItem label="50" value="50" />
													</SelectContent>
												</SelectPortal>
											</Select>
										</View>
									</View>

									<View className="h-9 flex-1 flex-row items-center rounded-lg bg-zinc-100 px-2.5">
										<Feather
											name="search"
											size={14}
											color={Colors.zinc[400]}
										/>
										<TextInput
											placeholder="Pencarian..."
											placeholderTextColor={Colors.zinc[400]}
											value={usageSearch}
											onChangeText={setUsageSearch}
											className="ml-2 flex-1 text-xs text-foreground"
										/>
									</View>
								</View>

								{/* Usage Cards List */}
								<View className="gap-2.5">
									{filteredUsages.map((usage) => (
										<View
											key={usage.id}
											className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm"
										>
											<View className="flex-row items-center justify-between pb-1.5">
												<Text size="normal" w="bold" className="text-primary">
													{usage.invoice_number}
												</Text>
												<Text size="normal" w="bold" className="text-primary">
													{formatRp(usage.amount)}
												</Text>
											</View>

											<View className="flex-row items-center gap-2 pt-1 text-muted">
												<View className="flex-row items-center gap-1">
													<Feather
														name="calendar"
														size={12}
														color={Colors.zinc[400]}
													/>
													<Text size="small" className="text-muted">
														{usage.created_at}
													</Text>
												</View>
												<Text size="small" className="text-zinc-300">
													|
												</Text>
												<View className="flex-row items-center gap-1">
													<Feather
														name="user"
														size={12}
														color={Colors.zinc[400]}
													/>
													<Text size="small" className="text-muted">
														{usage.cashier_name}
													</Text>
												</View>
											</View>

											<View className="flex-row items-center gap-2 pt-1 text-muted">
												<View className="flex-row items-center gap-1">
													<Feather
														name="shopping-bag"
														size={12}
														color={Colors.zinc[400]}
													/>
													<Text size="small" className="text-muted">
														{usage.customer_name}
													</Text>
												</View>
												<Text size="small" className="text-zinc-300">
													|
												</Text>
												<View className="flex-row items-center gap-1">
													<Feather
														name="home"
														size={12}
														color={Colors.zinc[400]}
													/>
													<Text size="small" className="text-muted">
														{usage.store_name}
													</Text>
												</View>
											</View>
										</View>
									))}
								</View>
							</Card>
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
