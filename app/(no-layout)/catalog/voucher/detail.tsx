import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useVoucherDeleteRequest, useVoucherQuery } from "@/api/hooks/vouchers";
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
import { Colors } from "@/constants/Colors";
import { MOCK_VOUCHER_DATA } from "@/constants/data/voucher";
import { formatDatePeriod, formatRp, route } from "@/lib/utils";

export default function VoucherDetailScreen() {
	const params = useLocalSearchParams();
	const voucherId = params?.id as string | undefined;
	const voucherQuery = useVoucherQuery(voucherId);
	const queryClient = useQueryClient();

	const deleteModal = useAlertModal();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const deleteRequest = useVoucherDeleteRequest(undefined, voucherId);

	function handleEdit() {
		if (!voucherId) return;
		router.push(route("/catalog/voucher/modify", { id: voucherId }));
	}

	function handleDelete() {
		deleteModal.open();
	}

	async function handleConfirmDelete() {
		if (!voucherId) return;
		const [_, error] = await deleteRequest.call();

		if (error) {
			errorModal.open();
			deleteModal.close();
			return;
		}

		deleteModal.close();
		await queryClient.invalidateQueries({ queryKey: ["vouchers"] });
		successModal.open();
	}

	function handleSuccessClose() {
		successModal.close();
		router.back();
	}

	// Fall back to matching item in MOCK_VOUCHER_DATA when backend query is empty or not found
	const data =
		voucherQuery.data ||
		MOCK_VOUCHER_DATA.find((v) => v.id === voucherId) ||
		MOCK_VOUCHER_DATA[0];

	// Resolve type label
	const voucherType = data?.type || data?.value_type;
	const typeLabel =
		voucherType === "percentage" ? "Persentase" : "Nominal / Rupiah";
	const discountValueDisplay =
		voucherType === "percentage"
			? `${data?.amount ?? 0}%`
			: formatRp(data?.amount ?? 0);

	// Mock data for sparse backend features with TODO markers per user instruction
	// TODO: Replace with real order types when backend supports order type restrictions for vouchers
	const mockOrderTypes = ["Dine In", "Take Away", "Grab Food", "Shopee"];

	// TODO: Replace mock reward item with actual backend relation once implemented in backend
	const mockRewardItem = {
		basedOn: "Item",
		catalogName: "Teh Es",
		variantLevel: "XL",
		quantity: 1,
	};

	// TODO: Replace mock active days with actual backend day-of-week configuration once implemented
	const mockActiveDays = ["Senin", "Selasa", "Rabu", "Kamis"];

	// Stores list: use data.stores if present, or fallback mock display
	const stores =
		data?.stores && data.stores.length > 0
			? data.stores
			: [
					{
						id: "s1",
						name: "Warung Jul Panam",
						address: "Panam, Pekanbaru",
					},
					{
						id: "s2",
						name: "Depot Sari Rasa",
						address: "Marpoyan, Pekanbaru",
					},
				];

	// Codes list fallback
	const codes =
		data?.codes && data.codes.length > 0
			? data.codes
			: [
					{
						code: data?.code || "SMK25",
						max_uses: 600,
						uses_count: 0,
					},
				];

	return (
		<>
			<DeleteConfirmModal
				isLoading={deleteRequest.isLoading}
				onConfirm={handleConfirmDelete}
				openState={deleteModal.openState}
				title={`Apakah yakin ingin menghapus voucher ${data?.name}?`}
				description="Voucher akan hilang permanen jika kamu sudah mengkonfirmasi"
			/>

			<SuccessModal
				title="Voucher Berhasil Dihapus!"
				description="Voucher berhasil dihapus dari daftar."
				onClose={handleSuccessClose}
				openState={successModal.openState}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menghapus Voucher"
				message="Terjadi kesalahan saat menghapus voucher. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			<Wrapper className="p-4" hasActionButton>
				{voucherQuery.isLoading && !voucherQuery.data && !data ? (
					<LoadingPlaceholder />
				) : (
					<View className="gap-4 pb-24">
						{/* 1. Informasi Voucher */}
						<CatalogDetailSection title="Informasi Voucher">
							<DetailRow
								label="Nama Voucher"
								value={data?.name ?? "-"}
								icon="tag"
							/>
							<DetailRow
								label="Tipe Voucher"
								value={typeLabel}
								icon={
									<MaterialCommunityIcons
										name="ticket-outline"
										size={18}
										color={Colors.primary}
									/>
								}
							/>
							<DetailRow
								label="Nilai Diskon"
								value={discountValueDisplay}
								icon="percent"
							/>
							<DetailRow
								label="Min. Transaksi"
								value={
									data?.minimum_transaction != null
										? formatRp(data.minimum_transaction)
										: "-"
								}
								icon="shopping-bag"
							/>
							{voucherType === "percentage" && (
								<DetailRow
									label="Max. Diskon"
									value={
										data?.maximum_discount != null
											? formatRp(data.maximum_discount)
											: "-"
									}
									icon="dollar-sign"
								/>
							)}
							<DetailRow
								label="Tipe Penjualan"
								icon={
									<MaterialCommunityIcons
										name="silverware-fork-knife"
										size={18}
										color={Colors.primary}
									/>
								}
								isLast
							>
								<View className="flex-row flex-wrap gap-1.5 justify-end">
									{mockOrderTypes.map((type) => (
										<View
											key={type}
											className="rounded-lg bg-primary-50 px-2.5 py-1"
										>
											<Text size="small" w="medium" className="text-primary">
												{type}
											</Text>
										</View>
									))}
								</View>
							</DetailRow>
						</CatalogDetailSection>

						{/* 2. Hadiah Voucher (Mock with TODO marker per user instruction) */}
						<CatalogDetailSection title="Hadiah Voucher">
							<DetailRow
								label="Voucher Berdasarkan"
								value={mockRewardItem.basedOn}
								icon="box"
							/>
							<DetailRow
								label="Nama Katalog"
								value={mockRewardItem.catalogName}
								icon="shopping-bag"
							/>
							<DetailRow
								label="Level Variant"
								value={mockRewardItem.variantLevel}
								icon="layers"
							/>
							<DetailRow
								label="Jumlah"
								value={mockRewardItem.quantity.toString()}
								icon="hash"
								isLast
							/>
						</CatalogDetailSection>

						{/* 3. Toko Yang Menggunakan */}
						<CatalogDetailSection title="Toko Yang Menggunakan">
							{stores.map((store, idx) => (
								<View
									key={store.id || idx}
									className={`flex-row items-center justify-between py-3 ${
										idx !== stores.length - 1 ? "border-b border-gray-100" : ""
									}`}
								>
									<View className="flex-row items-center gap-3">
										<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
											<MaterialCommunityIcons
												name="store-outline"
												size={18}
												color={Colors.primary}
											/>
										</View>
										<View>
											<Text w="semibold" size="normal">
												{store.name}
											</Text>
											{store.address && (
												<Text size="small" className="text-muted">
													{store.address}
												</Text>
											)}
										</View>
									</View>
									<View className="rounded-lg bg-green-50 px-2.5 py-1">
										<Text size="small" w="semibold" className="text-green-600">
											Aktif
										</Text>
									</View>
								</View>
							))}
						</CatalogDetailSection>

						{/* 4. Periode Voucher */}
						<CatalogDetailSection title="Periode Voucher">
							<DetailRow
								label="Periode Voucher"
								value={
									data?.start_period && data?.end_period
										? formatDatePeriod(data.start_period, data.end_period)
										: "-"
								}
								icon="calendar"
							/>
							<DetailRow label="Hari Berlaku" icon="clock" isLast>
								<View className="flex-row flex-wrap gap-1.5 justify-end">
									{mockActiveDays.map((day) => (
										<View
											key={day}
											className="rounded-lg bg-primary-50 px-2.5 py-1"
										>
											<Text size="small" w="medium" className="text-primary">
												{day}
											</Text>
										</View>
									))}
								</View>
							</DetailRow>
						</CatalogDetailSection>

						{/* 5. Daftar Voucher (Codes with Progress) */}
						<View className="gap-2">
							<Text size="normal" w="medium" className="px-1 text-muted">
								Daftar Voucher
							</Text>

							{codes.map((item, idx) => {
								const maxUses = item.max_uses || 1;
								const used = item.uses_count ?? 0;
								const remaining = Math.max(0, maxUses - used);
								const pct = Math.min(
									100,
									Math.max(0, Math.round((used / maxUses) * 100)),
								);

								return (
									<Card key={item.code || idx} className="gap-3 p-4">
										{/* Code Header */}
										<View className="flex-row items-center justify-between">
											<View className="flex-row items-center gap-3">
												<View className="size-10 items-center justify-center rounded-xl bg-primary-50">
													<MaterialCommunityIcons
														name="ticket-percent-outline"
														size={20}
														color={Colors.primary}
													/>
												</View>
												<View>
													<Text w="bold" size="normal">
														{item.code}
													</Text>
													<Text size="small" className="text-muted">
														Kode Voucher
													</Text>
												</View>
											</View>
											<View
												className={`rounded-lg px-2.5 py-1 ${
													pct > 0 ? "bg-green-50" : "bg-primary-50"
												}`}
											>
												<Text
													size="small"
													w="semibold"
													className={
														pct > 0 ? "text-green-600" : "text-primary"
													}
												>
													{pct}% digunakan
												</Text>
											</View>
										</View>

										{/* 3 Metrics: Max digunakan, Digunakan, Sisa */}
										<View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
											<View className="items-center flex-1">
												<Text size="small" className="text-muted">
													Max digunakan
												</Text>
												<Text w="semibold" size="normal" className="mt-0.5">
													{maxUses}
												</Text>
											</View>
											<View className="h-6 w-px bg-gray-100" />
											<View className="items-center flex-1">
												<Text size="small" className="text-muted">
													Digunakan
												</Text>
												<Text w="semibold" size="normal" className="mt-0.5">
													{used}
												</Text>
											</View>
											<View className="h-6 w-px bg-gray-100" />
											<View className="items-center flex-1">
												<Text size="small" className="text-muted">
													Sisa
												</Text>
												<Text
													w="semibold"
													size="normal"
													className={`mt-0.5 ${remaining > 0 ? "text-green-600" : "text-muted"}`}
												>
													{remaining}
												</Text>
											</View>
										</View>

										{/* Progress Bar */}
										<View className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
											<View
												className="h-full rounded-full bg-green-500"
												style={{ width: `${pct}%` }}
											/>
										</View>

										{/* Progress Caption */}
										<Text size="small" className="text-muted">
											{pct}% dari kuota telah digunakan
										</Text>
									</Card>
								);
							})}
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
