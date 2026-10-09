import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Switch, View } from "react-native";
import { useCategoriesQuery } from "@/api/hooks/categories";
import { useMenusQuery } from "@/api/hooks/menus";
import {
	useStockSettingMutation,
	useStockSettingQuery,
} from "@/api/hooks/settings";
import AlertModal from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import BouncyPressable from "@/components/common/BouncyPressable";
import Card from "@/components/common/Card";
import SearchBar from "@/components/common/SearchBar";
import SuccessModal, { useAlertModal } from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

type StockOption = {
	id: string;
	name: string;
	image?: string;
};

type StockSelection = {
	contentType: "item" | "category";
	ids: string[];
};

export default function StockLimitScreen() {
	const stockQuery = useStockSettingQuery();
	const { data: stockData } = stockQuery;
	const stockMutation = useStockSettingMutation();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	// Refetches update untouched fields without replacing local changes.
	const [draft, setDraft] = React.useState<{
		enabled?: boolean;
		selection?: StockSelection;
	}>({});
	const enabled = draft.enabled ?? stockData?.enabled ?? true;
	const serverContentType =
		stockData?.content_type ??
		(stockData?.details?.length &&
		stockData.details.every((detail) => detail.stockable_type === "category")
			? "category"
			: "item");
	const contentType = draft.selection?.contentType ?? serverContentType;
	const excludedIds =
		draft.selection?.ids ??
		(stockData?.type === "all"
			? []
			: (stockData?.details?.map((detail) => detail.stockable_id) ?? []));
	const selectionKind = contentType === "category" ? "kategori" : "produk";
	const isSettingsUnavailable =
		stockQuery.isPending || (stockQuery.isError && !stockData);
	const [isPickerOpen, setIsPickerOpen] = React.useState(false);
	const [pickerSelection, setPickerSelection] = React.useState<StockSelection>({
		contentType: "item",
		ids: [],
	});
	const [searchQuery, setSearchQuery] = React.useState("");
	// An open picker keeps the kind and IDs from its opening snapshot together.
	const pickerType = isPickerOpen ? pickerSelection.contentType : contentType;
	const menusQuery = useMenusQuery(undefined, {
		enabled: pickerType === "item",
	});
	const categoriesQuery = useCategoriesQuery(undefined, {
		enabled: pickerType === "category",
	});
	const pickerQuery = pickerType === "category" ? categoriesQuery : menusQuery;
	const pickerKind = pickerType === "category" ? "kategori" : "produk";

	const options = React.useMemo<StockOption[]>(
		() =>
			pickerType === "category"
				? (categoriesQuery.data ?? []).map(({ id, name }) => ({ id, name }))
				: (menusQuery.data ?? []).map(({ id, name, image }) => ({
						id,
						name,
						image,
					})),
		[pickerType, categoriesQuery.data, menusQuery.data],
	);

	const filteredOptions = React.useMemo(() => {
		if (!searchQuery.trim()) return options;
		const q = searchQuery.toLowerCase();
		return options.filter((option) => option.name.toLowerCase().includes(q));
	}, [options, searchQuery]);

	const handleOpenPicker = () => {
		if (isSettingsUnavailable) return;
		setPickerSelection({ contentType, ids: [...excludedIds] });
		setSearchQuery("");
		setIsPickerOpen(true);
	};

	const handleClosePicker = () => {
		setIsPickerOpen(false);
		setSearchQuery("");
	};

	const handleSavePicker = () => {
		setDraft((previous) => ({
			...previous,
			selection: {
				contentType: pickerSelection.contentType,
				ids: [...pickerSelection.ids],
			},
		}));
		setIsPickerOpen(false);
	};

	const toggleDraftProduct = (id: string) => {
		setPickerSelection((previous) => ({
			...previous,
			ids: previous.ids.includes(id)
				? previous.ids.filter((item) => item !== id)
				: [...previous.ids, id],
		}));
	};

	const handleSave = async () => {
		if (isSettingsUnavailable || stockMutation.isLoading) return;
		const [, error] = await stockMutation.call({
			enabled,
			type: excludedIds.length > 0 ? "hybrid" : "all",
			content_type: contentType,
			stockable_ids: excludedIds,
		});
		if (error) {
			errorModal.open();
			return;
		}
		successModal.open();
	};

	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				{stockQuery.isPending && (
					<Text size="small" className="text-muted">
						Memuat pengaturan batas stok...
					</Text>
				)}
				{stockQuery.isError && !stockData && (
					<View className="gap-3">
						<Text size="small" className="text-destructive">
							Pengaturan batas stok belum dapat dimuat.
						</Text>
						<Button variant="outline" onPress={() => stockQuery.refetch()}>
							<ButtonText>Muat Ulang</ButtonText>
						</Button>
					</View>
				)}
				{/* Switch Card */}
				<Card>
					<View className="flex-row items-center justify-between">
						<View className="flex-1 mr-3">
							<Text w="semibold" size="normal" className="text-foreground">
								Aktifkan Batas Stock
							</Text>
							<Text size="small" className="mt-1 text-muted leading-relaxed">
								Batasi penjualan produk sesuai jumlah stock yang tersedia.
							</Text>
						</View>
						<Switch
							value={enabled}
							onValueChange={(value) =>
								setDraft((previous) => ({ ...previous, enabled: value }))
							}
							trackColor={{ false: "#e4e4e7", true: Colors.primary }}
							thumbColor="#ffffff"
						/>
					</View>

					{/* Cara Kerja Banner */}
					<View className="mt-4 rounded-xl border border-primary-200/60 bg-primary-50 p-4">
						<View className="flex-row items-center gap-2">
							<Feather name="info" size={16} color={Colors.primary} />
							<Text w="semibold" size="normal" className="text-primary">
								Cara Kerja
							</Text>
						</View>
						<Text
							size="small"
							className="mt-1 leading-relaxed text-foreground/80"
						>
							Jika diaktifkan, sistem tidak akan mengizinkan transaksi melebihi
							stock yang tersedia (maksimal sampai 0). Jika dinonaktifkan,
							transaksi tetap bisa dilakukan walaupun stock 0 atau minus.
						</Text>
						<Pressable
							onPress={() =>
								router.push("/manage/pos-settings/stock-limit-detail")
							}
							className="mt-2 self-start"
						>
							<Text
								size="small"
								w="semibold"
								className="text-primary underline"
							>
								Baca Selengkapnya
							</Text>
						</Pressable>
					</View>
				</Card>

				{/* Section: Penerapan */}
				<View className="gap-2">
					<Text size="normal" w="medium" className="text-muted">
						Penerapan
					</Text>
					<Card>
						<View className="flex-row items-center justify-between border-b border-border-muted py-3">
							<View className="flex-row items-center gap-3">
								<View className="size-10 items-center justify-center rounded-xl bg-primary-50">
									<Feather name="box" size={18} color={Colors.primary} />
								</View>
								<Text w="medium" size="normal" className="text-foreground">
									Terapkan ke
								</Text>
							</View>
							<View className="flex-row items-center gap-2">
								<Text size="normal" className="text-muted">
									Semua Produk
								</Text>
								<Feather
									name="chevron-right"
									size={18}
									color={Colors.zinc[400]}
								/>
							</View>
						</View>

						<BouncyPressable
							onPress={handleOpenPicker}
							disabled={isSettingsUnavailable}
							activeScale={0.98}
							className="flex-row items-center justify-between py-3"
						>
							<View className="flex-row items-center gap-3 flex-1 mr-2">
								<View className="size-10 items-center justify-center rounded-xl bg-primary-50">
									<Feather name="tag" size={18} color={Colors.primary} />
								</View>
								<View className="flex-1">
									<Text w="medium" size="normal" className="text-foreground">
										{contentType === "category"
											? "Kecuali Kategori (Opsional)"
											: "Kecuali Produk (Opsional)"}
									</Text>
									<Text size="small" className="mt-1 text-muted">
										{excludedIds.length > 0
											? `${excludedIds.length} ${selectionKind} dikecualikan`
											: `Pilih ${selectionKind} yang dikecualikan`}
									</Text>
								</View>
							</View>
							<Feather
								name="chevron-right"
								size={18}
								color={Colors.zinc[400]}
							/>
						</BouncyPressable>
					</Card>
				</View>

				{/* Product Picker Actionsheet (Image 4) */}
				<Actionsheet isOpen={isPickerOpen} onClose={handleClosePicker}>
					<ActionsheetBackdrop />
					<ActionsheetContent className="px-4 pb-6 pt-2">
						<ActionsheetDragIndicatorWrapper className="mb-2">
							<ActionsheetDragIndicator className="h-1 w-10 rounded-full bg-border" />
						</ActionsheetDragIndicatorWrapper>

						<View className="w-full flex-row items-center justify-between pb-3">
							<Pressable onPress={handleClosePicker} hitSlop={8}>
								<Text size="body" w="medium" className="text-primary">
									Batal
								</Text>
							</Pressable>
							<Text size="body" w="bold">
								{pickerType === "category" ? "Pilih Kategori" : "Pilih Produk"}
							</Text>
							<Pressable onPress={handleSavePicker} hitSlop={8}>
								<Text size="body" w="semibold" className="text-primary">
									Selesai
								</Text>
							</Pressable>
						</View>

						<View className="mb-3 h-px w-full bg-border-muted" />

						<SearchBar
							search={searchQuery}
							setSearch={setSearchQuery}
							placeholder="Cari..."
							className="mb-3"
							debounce={false}
						/>

						<ActionsheetScrollView
							className="max-h-[60vh] w-full"
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
						>
							{pickerQuery.isPending && (
								<Text size="normal" className="py-4 text-center text-muted">
									Memuat {pickerKind}...
								</Text>
							)}
							{pickerQuery.isError && (
								<View className="gap-3 py-4">
									<Text size="normal" className="text-center text-destructive">
										Daftar {pickerKind} belum dapat dimuat.
									</Text>
									<Button
										variant="outline"
										onPress={() => pickerQuery.refetch()}
									>
										<ButtonText>Muat Ulang</ButtonText>
									</Button>
								</View>
							)}
							{!pickerQuery.isPending &&
								!pickerQuery.isError &&
								filteredOptions.length === 0 && (
									<Text size="normal" className="py-4 text-center text-muted">
										{searchQuery.trim()
											? pickerType === "category"
												? "Kategori tidak ditemukan."
												: "Produk tidak ditemukan."
											: `Belum ada ${pickerKind}.`}
									</Text>
								)}
							{filteredOptions.map((product) => {
								const isChecked = pickerSelection.ids.includes(product.id);
								return (
									<Pressable
										key={product.id}
										onPress={() => toggleDraftProduct(product.id)}
										className={cn(
											"mb-3 flex-row items-center gap-3 rounded-2xl border p-4",
											isChecked
												? "border-primary bg-primary/5"
												: "border-border bg-white",
										)}
									>
										<View
											className={cn(
												"h-5 w-5 items-center justify-center rounded-md border",
												isChecked
													? "border-primary bg-primary"
													: "border-border bg-white",
											)}
										>
											{isChecked && (
												<Feather name="check" size={14} color="#ffffff" />
											)}
										</View>

										<View className="size-11 items-center justify-center overflow-hidden rounded-xl bg-background">
											{product.image ? (
												<Image
													source={{ uri: product.image }}
													className="size-full"
												/>
											) : (
												<Feather
													name="package"
													size={20}
													color={Colors.zinc[400]}
												/>
											)}
										</View>

										<View className="flex-1 justify-center">
											<Text
												size="normal"
												w="semibold"
												className="text-foreground"
											>
												{product.name}
											</Text>
											<Text size="small" className="mt-1 text-muted">
												{pickerType === "category" ? "Kategori" : "Produk"}
											</Text>
										</View>
									</Pressable>
								);
							})}
						</ActionsheetScrollView>
					</ActionsheetContent>
				</Actionsheet>
			</Wrapper>

			{/* Bottom Action Button */}
			<BottomActionButton
				onPress={handleSave}
				isDisabled={isSettingsUnavailable}
				isLoading={stockMutation.isLoading}
			>
				Simpan
			</BottomActionButton>

			<AlertModal
				openState={errorModal.openState}
				title="Gagal Menyimpan Batas Stok"
				message="Pengaturan belum tersimpan. Periksa koneksi dan coba lagi."
				hideCancelButton
				confirmText="Mengerti"
				onConfirm={errorModal.close}
			/>
			{/* Success Modal */}
			<SuccessModal
				openState={successModal.openState}
				onClose={successModal.close}
				title="Pengaturan Batas Stok Disimpan"
				description="Perubahan batas stok berhasil diperbarui untuk transaksi POS."
				buttonText="Mengerti"
			/>
		</>
	);
}
