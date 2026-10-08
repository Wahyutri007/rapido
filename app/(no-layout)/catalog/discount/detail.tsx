import Feather from "@expo/vector-icons/Feather";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { TextInput, View } from "react-native";
import {
	useDiscountDeleteRequest,
	useDiscountQuery,
} from "@/api/hooks/discounts";
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
	CatalogRelatedItemRow,
	CatalogRelatedListCard,
} from "@/components/feature/catalog";
import { DiscountIcon } from "@/components/icons";
import { Colors } from "@/constants/Colors";
import { MOCK_DISCOUNT_DATA } from "@/constants/data/discount";
import { formatRp, route } from "@/lib/utils";

// TODO: Replace with real invoice usage data type when backend endpoint GET /contents/discounts/{id}/usages is implemented
type MockDiscountUsage = {
	id: string;
	invoiceNo: string;
	amount: number;
	date: string;
	cashier: string;
	customer: string;
	storeName: string;
};

// TODO: Mock usage data placeholder matching design specification
const MOCK_USAGES: MockDiscountUsage[] = [
	{
		id: "1",
		invoiceNo: "INV-11795649",
		amount: 230000,
		date: "06 Nov 2025-11:33",
		cashier: "Afgan",
		customer: "John Doe",
		storeName: "Innovation Center HCS IDN",
	},
	{
		id: "2",
		invoiceNo: "INV-11795640",
		amount: 1000000,
		date: "06 Nov 2025-11:33",
		cashier: "Taufiq Qurrahman",
		customer: "John Doe",
		storeName: "Toko Sushiro",
	},
	{
		id: "3",
		invoiceNo: "INV-11795649",
		amount: 230000,
		date: "06 Nov 2025-11:33",
		cashier: "Taufiq Qurrahman",
		customer: "John Doe",
		storeName: "Toko Baju",
	},
	{
		id: "4",
		invoiceNo: "INV-11795649",
		amount: 230000,
		date: "06 Nov 2025-11:33",
		cashier: "Taufiq Qurrahman",
		customer: "John Doe",
		storeName: "Toko Jam",
	},
	{
		id: "5",
		invoiceNo: "INV-11795649",
		amount: 230000,
		date: "06 Nov 2025-11:33",
		cashier: "Taufiq Qurrahman",
		customer: "John Doe",
		storeName: "Toko Gambar",
	},
];

export default function DiscountDetailScreen() {
	const params = useLocalSearchParams();
	const discountId = params?.id as string | undefined;
	const discountQuery = useDiscountQuery(discountId);
	const queryClient = useQueryClient();

	const [usageSearch, setUsageSearch] = React.useState("");
	const [pageSize] = React.useState(10);

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useDiscountDeleteRequest(undefined, discountId);

	function handleEdit() {
		if (!discountId) return;
		router.push(route("/catalog/discount/modify", { id: discountId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!discountId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["discounts"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	// TODO: Currently falls back to MOCK_DISCOUNT_DATA when backend discountQuery is empty.
	// Replace with `discountQuery.data` once backend GET /contents/discounts/{id} returns production data.
	const data =
		discountQuery.data ??
		MOCK_DISCOUNT_DATA.find((d) => d.id === discountId) ??
		MOCK_DISCOUNT_DATA[0];
	const rawAmount = data?.amount ?? data?.fixed_discount?.amount ?? 0;
	const valueDisplay =
		data?.type === "fixed"
			? data?.value_type === "percentage"
				? `${rawAmount}%`
				: formatRp(rawAmount)
			: "Kustom";

	// Filter mock usage items
	const filteredUsages = React.useMemo(() => {
		if (!usageSearch.trim()) return MOCK_USAGES.slice(0, pageSize);
		const q = usageSearch.toLowerCase();
		return MOCK_USAGES.filter(
			(u) =>
				u.invoiceNo.toLowerCase().includes(q) ||
				u.cashier.toLowerCase().includes(q) ||
				u.customer.toLowerCase().includes(q) ||
				u.storeName.toLowerCase().includes(q),
		).slice(0, pageSize);
	}, [usageSearch, pageSize]);

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus diskon ${data?.name}?`}
				description="Diskon akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Diskon Berhasil Dihapus!"
				description="Diskon berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Diskon"
				message="Terjadi kesalahan saat menghapus diskon. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{discountQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4">
						{/* Hero Card */}
						<CatalogDetailHeroCard
							icon={<DiscountIcon size={26} color={Colors.primary} />}
							title={data?.name ?? "-"}
							badge={valueDisplay}
							description={
								data?.type === "fixed"
									? `Diskon tetap sebesar ${valueDisplay} untuk setiap transaksi yang memenuhi syarat.`
									: "Diskon fleksibel dengan nominal yang dapat ditentukan saat transaksi di kasir."
							}
						/>

						{/* Section 1: Informasi Diskon */}
						<CatalogDetailSection title="Informasi Diskon">
							<DetailRow
								label="Nama Diskon"
								value={data?.name ?? "-"}
								icon="tag"
							/>
							<DetailRow
								label="Tipe Diskon"
								value={data?.type === "fixed" ? "Fixed (Tetap)" : "Custom"}
								icon="percent"
							/>
							<DetailRow
								label="Jenis Nilai"
								value={
									data?.value_type === "percentage"
										? "Persentase (%)"
										: "Nominal (Rp)"
								}
								icon="dollar-sign"
							/>
							{data?.type === "fixed" && (
								<DetailRow
									label="Nilai Diskon"
									value={valueDisplay}
									icon="hash"
								/>
							)}
							<DetailRow
								label="Toko"
								value={`${data?.stores?.length ?? 0} toko dipilih`}
								icon="shopping-bag"
								isLast
							/>
						</CatalogDetailSection>

						{/* Section 2: Toko Yang Menggunakan */}
						<CatalogRelatedListCard
							title="Toko Yang Menggunakan"
							items={data?.stores ?? []}
							renderItem={(store, _idx, isLast) => (
								<CatalogRelatedItemRow
									key={store.id}
									icon="shopping-bag"
									title={store.name}
									subtitle="Semua Area"
									badgeText="Aktif"
									isLast={isLast}
								/>
							)}
							emptyText="Belum ada toko yang menggunakan diskon ini"
						/>

						{/* Section 3: Penggunaan Diskon (TODO: Connect to real backend usage data) */}
						<View className="gap-2">
							<Text w="semibold" size="normal" className="text-foreground">
								Penggunaan Diskon
							</Text>

							<Card className="rounded-2xl p-4 gap-3">
								{/* Controls: Page size selector & Search */}
								<View className="flex-row items-center justify-between gap-3">
									<View className="flex-row items-center gap-2">
										<Text size="small" className="text-muted">
											Tampilkan
										</Text>
										<View className="flex-row items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1">
											<Text size="small" w="medium" className="text-foreground">
												{pageSize}
											</Text>
											<Feather
												name="chevron-down"
												size={14}
												color={Colors.zinc[500]}
											/>
										</View>
									</View>

									<View className="flex-1 max-w-[180px] flex-row items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1">
										<Feather name="search" size={13} color={Colors.zinc[400]} />
										<TextInput
											placeholder="Pencarian...."
											placeholderTextColor={Colors.zinc[400]}
											value={usageSearch}
											onChangeText={setUsageSearch}
											className="flex-1 p-0 text-xs text-foreground"
										/>
									</View>
								</View>

								{/* Usages List */}
								<View className="gap-2.5 pt-1">
									{filteredUsages.map((usage) => (
										<View
											key={usage.id}
											className="rounded-xl border border-zinc-100 bg-white p-3 shadow-xs gap-1.5"
										>
											{/* Header row: Invoice & Total */}
											<View className="flex-row items-center justify-between">
												<Text
													size="small"
													w="semibold"
													className="text-primary-500"
												>
													{usage.invoiceNo}
												</Text>
												<Text
													size="small"
													w="bold"
													className="text-primary-500"
												>
													{formatRp(usage.amount)}
												</Text>
											</View>

											{/* Row 2: Date & Cashier */}
											<View className="flex-row items-center gap-3">
												<View className="flex-row items-center gap-1">
													<Feather
														name="calendar"
														size={12}
														color={Colors.zinc[400]}
													/>
													<Text size="small" className="text-muted text-xs">
														{usage.date}
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
													<Text size="small" className="text-muted text-xs">
														{usage.cashier}
													</Text>
												</View>
											</View>

											{/* Row 3: Customer & Store */}
											<View className="flex-row items-center gap-3">
												<View className="flex-row items-center gap-1">
													<Feather
														name="shopping-bag"
														size={12}
														color={Colors.zinc[400]}
													/>
													<Text size="small" className="text-muted text-xs">
														{usage.customer}
													</Text>
												</View>
												<Text size="small" className="text-zinc-300">
													|
												</Text>
												<View className="flex-1 flex-row items-center gap-1">
													<Feather
														name="home"
														size={12}
														color={Colors.zinc[400]}
													/>
													<Text
														size="small"
														className="text-muted text-xs flex-1"
														numberOfLines={1}
													>
														{usage.storeName}
													</Text>
												</View>
											</View>
										</View>
									))}
								</View>
							</Card>
						</View>
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
