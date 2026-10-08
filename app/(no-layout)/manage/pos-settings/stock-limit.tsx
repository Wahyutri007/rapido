import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Switch, View } from "react-native";
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
import { Colors } from "@/constants/Colors";
import { cn } from "@/lib/utils";

type DummyProduct = {
	id: string;
	name: string;
	category: string;
	stock: number;
	image?: string;
};

const DEFAULT_PRODUCTS: DummyProduct[] = [
	{
		id: "prod-1",
		name: "Bakmie",
		category: "Makanan",
		stock: 48,
	},
	{
		id: "prod-2",
		name: "Salad Yumme",
		category: "Makanan",
		stock: 32,
	},
	{
		id: "prod-3",
		name: "Mie Goreng Dumai",
		category: "Makanan",
		stock: 24,
	},
	{
		id: "prod-4",
		name: "Nasi Goreng Seafood",
		category: "Makanan",
		stock: 40,
	},
	{
		id: "prod-5",
		name: "Es Teh Manis",
		category: "Minuman",
		stock: 65,
	},
	{
		id: "prod-6",
		name: "Kopi Susu Gula Aren",
		category: "Minuman",
		stock: 50,
	},
];

export default function StockLimitScreen() {
	const { data: stockData } = useStockSettingQuery();
	const stockMutation = useStockSettingMutation();
	const { data: menusData } = useMenusQuery();
	const successModal = useAlertModal();
	const errorModal = useAlertModal();

	const [enabled, setEnabled] = React.useState(true);
	const [excludedProductIds, setExcludedProductIds] = React.useState<string[]>(
		[],
	);
	const [isPickerOpen, setIsPickerOpen] = React.useState(false);
	const [draftExcluded, setDraftExcluded] = React.useState<string[]>([]);
	const [searchQuery, setSearchQuery] = React.useState("");

	// Sync initial data from backend if present
	React.useEffect(() => {
		if (stockData) {
			setEnabled(stockData.enabled);
			if (stockData.details) {
				setExcludedProductIds(stockData.details.map((d) => d.stockable_id));
			}
		}
	}, [stockData]);

	// Prepare product list
	const productList = React.useMemo<DummyProduct[]>(() => {
		if (menusData && menusData.length > 0) {
			return menusData.map((m) => ({
				id: m.id,
				name: m.name,
				category: "Produk",
				stock: 20,
				image: m.image,
			}));
		}
		return DEFAULT_PRODUCTS;
	}, [menusData]);

	const filteredProducts = React.useMemo(() => {
		if (!searchQuery.trim()) return productList;
		const q = searchQuery.toLowerCase();
		return productList.filter((p) => p.name.toLowerCase().includes(q));
	}, [productList, searchQuery]);

	const handleOpenPicker = () => {
		setDraftExcluded([...excludedProductIds]);
		setSearchQuery("");
		setIsPickerOpen(true);
	};

	const handleClosePicker = () => {
		setIsPickerOpen(false);
		setSearchQuery("");
	};

	const handleSavePicker = () => {
		setExcludedProductIds(draftExcluded);
		setIsPickerOpen(false);
	};

	const toggleDraftProduct = (id: string) => {
		setDraftExcluded((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const handleSave = async () => {
		const [, error] = await stockMutation.call({
			enabled,
			type: excludedProductIds.length > 0 ? "hybrid" : "all",
			content_type: "item",
			stockable_ids: excludedProductIds,
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
				{/* Switch Card */}
				<Card>
					<View className="flex-row items-center justify-between">
						<View className="flex-1 mr-3">
							<Text w="semibold" size="normal" className="text-foreground">
								Aktifkan Batas Stock
							</Text>
							<Text size="small" className="mt-0.5 text-muted leading-relaxed">
								Batasi penjualan produk sesuai jumlah stock yang tersedia.
							</Text>
						</View>
						<Switch
							value={enabled}
							onValueChange={setEnabled}
							trackColor={{ false: "#e4e4e7", true: Colors.primary }}
							thumbColor="#ffffff"
						/>
					</View>

					{/* Cara Kerja Banner */}
					<View className="mt-3.5 rounded-xl border border-primary-200/60 bg-primary-50 p-3.5">
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
					<Card className="p-2">
						<View className="flex-row items-center justify-between border-b border-border-muted p-3">
							<View className="flex-row items-center gap-3">
								<View className="size-10 items-center justify-center rounded-xl bg-primary-50">
									<Feather name="box" size={18} color={Colors.primary} />
								</View>
								<Text w="medium" size="normal" className="text-foreground">
									Terapkan ke
								</Text>
							</View>
							<View className="flex-row items-center gap-1.5">
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
							activeScale={0.98}
							className="flex-row items-center justify-between p-3"
						>
							<View className="flex-row items-center gap-3 flex-1 mr-2">
								<View className="size-10 items-center justify-center rounded-xl bg-primary-50">
									<Feather name="tag" size={18} color={Colors.primary} />
								</View>
								<View className="flex-1">
									<Text w="medium" size="normal" className="text-foreground">
										Kecuali Produk (Opsional)
									</Text>
									<Text size="small" className="mt-0.5 text-muted">
										{excludedProductIds.length > 0
											? `${excludedProductIds.length} produk dikecualikan`
											: "Pilih produk yang dikecualikan"}
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
							<ActionsheetDragIndicator className="h-1 w-10 rounded-full bg-zinc-300" />
						</ActionsheetDragIndicatorWrapper>

						<View className="w-full flex-row items-center justify-between pb-3">
							<Pressable onPress={handleClosePicker} hitSlop={8}>
								<Text size="body" w="medium" className="text-primary">
									Batal
								</Text>
							</Pressable>
							<Text size="body" w="bold">
								Pilih Produk
							</Text>
							<Pressable onPress={handleSavePicker} hitSlop={8}>
								<Text size="body" w="semibold" className="text-primary">
									Selesai
								</Text>
							</Pressable>
						</View>

						<View className="mb-3 h-px w-full bg-zinc-100" />

						<SearchBar
							search={searchQuery}
							setSearch={setSearchQuery}
							placeholder="Cari..."
							className="mb-3 bg-white"
							debounce={false}
						/>

						<ActionsheetScrollView
							className="max-h-[60vh] w-full"
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
						>
							{filteredProducts.map((product) => {
								const isChecked = draftExcluded.includes(product.id);
								return (
									<Pressable
										key={product.id}
										onPress={() => toggleDraftProduct(product.id)}
										className={cn(
											"mb-2.5 flex-row items-center gap-3 rounded-2xl border p-3.5",
											isChecked
												? "border-primary bg-primary/5"
												: "border-zinc-200 bg-white",
										)}
									>
										<View
											className={cn(
												"h-5 w-5 items-center justify-center rounded-md border",
												isChecked
													? "border-primary bg-primary"
													: "border-zinc-300 bg-white",
											)}
										>
											{isChecked && (
												<Feather name="check" size={14} color="#ffffff" />
											)}
										</View>

										<View className="size-11 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
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
											<Text size="small" className="mt-0.5 text-muted">
												{product.category} • Stok: {product.stock}
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
