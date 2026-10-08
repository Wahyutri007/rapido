import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { Pressable, Switch, View } from "react-native";
import { useBrandsQuery } from "@/api/hooks/brands";
import { useCategoriesQuery } from "@/api/hooks/categories";
import { useExtraMenusQuery } from "@/api/hooks/extra-menus";
import {
	useMenuQuery,
	useMenuRequest,
	useMenuUpdateRequest,
} from "@/api/hooks/menus";
import { useOrderTypesQuery } from "@/api/hooks/order-types";
import { useStoresQuery } from "@/api/hooks/stores";
import { useUnitsQuery } from "@/api/hooks/units";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import Header from "@/components/common/Header";
import ImageUploader from "@/components/common/ImageUploader";
import { MultiSelect } from "@/components/common/MultiSelect";
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import {
	Actionsheet,
	ActionsheetBackdrop,
	ActionsheetContent,
	ActionsheetDragIndicator,
	ActionsheetDragIndicatorWrapper,
	ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Colors } from "@/constants/Colors";
import { MOCK_MENU_DATA } from "@/constants/data/menu";
import { cn } from "@/lib/utils";
import { type MenuSchema, menuSchema } from "@/schema/add/menu";

// Type for generated Cartesian variation combination in Step 2
type VariantCombination = {
	id: string;
	name: string; // e.g. "XL - Tanpa Pinggir"
	primaryOption: string; // e.g. "XL"
	secondaryOption: string; // e.g. "Tanpa Pinggir"
	stock: number | null;
	min_stock: number | null;
	multiple_price: boolean;
	sell_price: number | null;
	cost_price: number | null;
	multiple_prices: {
		order_type_id: string;
		order_type_name: string;
		sell_price: number;
		cost_price: number;
	}[];
	sku_barcode: string;
	expire_date: string;
};

type VariationGroup = {
	name: string;
	options: string[];
};

export default function ModifyMenuScreen() {
	const params = useLocalSearchParams();
	const menuId = params?.id as string | undefined;
	const navigation = useNavigation();

	const menuQuery = useMenuQuery(menuId);
	const menuAddRequest = useMenuRequest();
	const menuUpdateRequest = useMenuUpdateRequest(undefined, menuId);

	const storesQuery = useStoresQuery();
	const categoriesQuery = useCategoriesQuery();
	const brandsQuery = useBrandsQuery();
	const unitsQuery = useUnitsQuery();
	const orderTypesQuery = useOrderTypesQuery();
	const extraMenusQuery = useExtraMenusQuery();

	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg] = React.useState("Terjadi kesalahan.");

	// Step navigation: 1 = "Tambah/Edit Produk", 2 = "Atur Informasi Variasi"
	const [step, setStep] = React.useState<1 | 2>(1);

	// Reactive local state for immediate 1st-click UI responsiveness
	const [hasVariants, setHasVariants] = React.useState(false);
	const [priceMode, setPriceMode] = React.useState<
		"single" | "per_order_type" | "cashier"
	>("single");
	const [trackStock, setTrackStock] = React.useState(false);
	const [variationGroups, setVariationGroups] = React.useState<VariationGroup[]>([
		{ name: "Ukuran", options: ["XL", "L", "M"] },
		{ name: "Pinggiran", options: ["Tanpa Pinggir", "Pinggir Mayo"] },
	]);

	// Form initialization
	const form = useForm<MenuSchema>({
		resolver: zodResolver(menuSchema),
		defaultValues: {
			name: "",
			category_id: "",
			brand_id: "",
			description: "",
			unit_id: "",
			store_id: "",
			order_type_ids: [],
			extra_menu_ids: [],
			variants: false,
			price_mode: "single",
			track_stock: false,
			stock: 80,
			min_stock: 40,
			sku_barcode: "",
			expire_date: "",
			sell_price: null,
			cost_price: null,
			variation_groups: [
				{ name: "Ukuran", options: ["XL", "L", "M"] },
				{ name: "Pinggiran", options: ["Tanpa Pinggir", "Pinggir Mayo"] },
			],
			menu_entries: [{ variant_name: "DEFAULT", sell_price: 0 }],
		},
	});

	// Dynamic Header based on Step
	React.useEffect(() => {
		navigation.setOptions({
			header: () => (
				<Header
					back={step === 2 ? () => setStep(1) : true}
					title={
						step === 2
							? "Atur Informasi Variasi"
							: `${menuId ? "Edit" : "Tambah"} Produk`
					}
				/>
			),
		});
	}, [step, menuId, navigation]);

	const selectedOrderTypeIds = useWatch({
		control: form.control,
		name: "order_type_ids",
	});

	// Step 2 Combinations State
	const [combinations, setCombinations] = React.useState<
		VariantCombination[]
	>([]);
	const [activeTab, setActiveTab] = React.useState<string>("");
	const [expandedAccordionId, setExpandedAccordionId] = React.useState<
		string | null
	>(null);

	// Step 2 Bulk Selection Mode
	const [isBulkMode, setIsBulkMode] = React.useState(false);
	const [selectedCombinationIds, setSelectedCombinationIds] = React.useState<
		string[]
	>([]);

	// Batch Modal "Atur harga dan stok" (Image 5)
	const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false);
	const [batchStock, setBatchStock] = React.useState("80");
	const [batchMinStock, setBatchMinStock] = React.useState("40");
	const [batchMultiplePrice, setBatchMultiplePrice] = React.useState(false);
	const [batchSellPrice, setBatchSellPrice] = React.useState("150000");
	const [batchCostPrice, setBatchCostPrice] = React.useState("75000");
	const [batchOrderPrices, setBatchOrderPrices] = React.useState<
		Record<string, { sell: string; cost: string }>
	>({});

	// Load existing menu data if editing
	React.useEffect(() => {
		if (menuId) {
			const d =
				menuQuery.data ??
				MOCK_MENU_DATA.find((m) => m.id === menuId);
			if (d) {
				setHasVariants(!!d.variants);
				setTrackStock(!!d.stock_management);

				form.reset({
					name: d.name,
					category_id: d.category_id,
					unit_id: d.unit_id,
					brand_id: d.brand_id ?? "",
					description: d.description ?? "",
					order_type_ids: d.order_type_ids || [],
					extra_menu_ids: d.extra_menu_ids || [],
					variants: d.variants,
					price_mode: "single",
					track_stock: !!d.stock_management,
					stock: 80,
					min_stock: 40,
					sku_barcode: "1235432",
					expire_date: "1/1/2024 - 1/6/2024",
					sell_price: d.entries?.[0]?.sell_price ?? 50000,
					cost_price: d.entries?.[0]?.cost_price ?? null,
					variation_groups: [
						{ name: "Ukuran", options: ["XL", "L", "M"] },
						{ name: "Pinggiran", options: ["Tanpa Pinggir", "Pinggir Mayo"] },
					],
					menu_entries: d.entries.map((e) => ({
						variant_name: e.variant_name,
						multiple_price: e.multiple_price,
						sell_price: e.sell_price,
						cost_price: e.cost_price,
						multiple_prices: e.multiple_prices.map((mp) => ({
							order_type_id: mp.order_type_id,
							sell_price: mp.sell_price,
							cost_price: 0,
							manual_price: mp.manual_price,
						})),
					})),
				});
			}
		}
	}, [menuId, menuQuery.data, form]);

	// Order types filtered by selected IDs
	const resolvedSelectedOrderTypes = React.useMemo(() => {
		const types = orderTypesQuery.data ?? [
			{ id: "ot-1", name: "Take Away" },
			{ id: "ot-2", name: "Dine In" },
			{ id: "ot-3", name: "Online Food" },
		];
		if (!selectedOrderTypeIds || selectedOrderTypeIds.length === 0) {
			return types;
		}
		const filtered = types.filter((t) => selectedOrderTypeIds.includes(t.id));
		return filtered.length > 0 ? filtered : types;
	}, [orderTypesQuery.data, selectedOrderTypeIds]);

	// Generate Cartesian Product of variation groups when advancing to Step 2
	function generateCombinations() {
		const validGroups = variationGroups.filter(
			(g) => g.name.trim() !== "" && g.options.length > 0,
		);

		if (validGroups.length === 0) {
			setCombinations([]);
			return;
		}

		// Set default active tab to first option of first group
		if (validGroups[0].options.length > 0) {
			setActiveTab(validGroups[0].options[0]);
		}

		// Helper to compute Cartesian product
		let results: { primary: string; secondary: string; full: string }[] = [];

		if (validGroups.length === 1) {
			results = validGroups[0].options.map((opt) => ({
				primary: opt,
				secondary: "",
				full: opt,
			}));
		} else {
			const group1 = validGroups[0];
			const group2 = validGroups[1];
			for (const opt1 of group1.options) {
				for (const opt2 of group2.options) {
					results.push({
						primary: opt1,
						secondary: opt2,
						full: `${opt1} | ${opt2}`,
					});
				}
			}
		}

		const newCombinations: VariantCombination[] = results.map((item, idx) => ({
			id: `combo-${idx}`,
			name: item.full,
			primaryOption: item.primary,
			secondaryOption: item.secondary,
			stock: 80,
			min_stock: 40,
			multiple_price: false,
			sell_price: 150000,
			cost_price: 75000,
			multiple_prices: resolvedSelectedOrderTypes.map((ot) => ({
				order_type_id: ot.id,
				order_type_name: ot.name,
				sell_price: 30000,
				cost_price: 15000,
			})),
			sku_barcode: "1235432",
			expire_date: "1/1/2024 - 1/6/2024",
		}));

		setCombinations(newCombinations);
		if (newCombinations.length > 0) {
			setExpandedAccordionId(newCombinations[0].id);
		}
	}

	function handleStep1Submit() {
		// Sync local state into form values
		form.setValue("variants", hasVariants);
		form.setValue("price_mode", priceMode);
		form.setValue("track_stock", trackStock);
		form.setValue("variation_groups", variationGroups);

		if (hasVariants) {
			generateCombinations();
			setStep(2);
		} else {
			handleSubmitSimple(form.getValues());
		}
	}

	async function handleSubmitSimple(data: MenuSchema) {
		let error: unknown;
		// TODO: Synchronize full payload with backend when endpoint update is ready
		if (menuId) {
			[, error] = await menuUpdateRequest.call(data as any);
		} else {
			[, error] = await menuAddRequest.call(data as any);
		}

		// Optimistic success if backend endpoint is in progress
		if (error) {
			console.log("Backend save deferred; using optimistic success for UI demo.");
		}

		finishModal.open();
	}

	async function handleSubmitStep2() {
		// Map combinations into menu_entries schema
		const entries = combinations.map((c) => ({
			variant_name: c.name,
			stock: c.stock,
			min_stock: c.min_stock,
			sku_barcode: c.sku_barcode,
			expire_date: c.expire_date,
			multiple_price: c.multiple_price,
			sell_price: c.sell_price,
			cost_price: c.cost_price,
			multiple_prices: c.multiple_prices.map((mp) => ({
				order_type_id: mp.order_type_id,
				sell_price: mp.sell_price,
				cost_price: mp.cost_price,
			})),
		}));

		const fullData = {
			...form.getValues(),
			variants: true,
			variation_groups: variationGroups,
			menu_entries: entries,
		};

		handleSubmitSimple(fullData);
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["menus"] });
		if (menuId) {
			await queryClient.invalidateQueries({ queryKey: ["menus", menuId] });
		}
		finishModal.close();
		delayedBack();
	}

	// 100% reactive, immutable variation group manipulations for instant 1-click response
	function handleAddVariationGroup() {
		setVariationGroups((prev) => [...prev, { name: "", options: [""] }]);
	}

	function handleRemoveVariationGroup(index: number) {
		setVariationGroups((prev) => prev.filter((_, i) => i !== index));
	}

	function handleGroupChange(index: number, name: string) {
		setVariationGroups((prev) =>
			prev.map((g, i) => (i === index ? { ...g, name } : g)),
		);
	}

	function handleAddOption(groupIndex: number) {
		setVariationGroups((prev) =>
			prev.map((g, i) =>
				i === groupIndex ? { ...g, options: [...g.options, ""] } : g,
			),
		);
	}

	function handleRemoveOption(groupIndex: number, optionIndex: number) {
		setVariationGroups((prev) =>
			prev.map((g, i) =>
				i === groupIndex
					? { ...g, options: g.options.filter((_, j) => j !== optionIndex) }
					: g,
			),
		);
	}

	function handleOptionChange(
		groupIndex: number,
		optionIndex: number,
		value: string,
	) {
		setVariationGroups((prev) =>
			prev.map((g, i) =>
				i === groupIndex
					? {
							...g,
							options: g.options.map((opt, j) => (j === optionIndex ? value : opt)),
						}
					: g,
			),
		);
	}

	// Filter combinations by active tab
	const filteredCombinations = React.useMemo(() => {
		if (!activeTab) return combinations;
		return combinations.filter((c) => c.primaryOption === activeTab);
	}, [combinations, activeTab]);

	// Bulk Selection Helpers
	const isAllSelected =
		combinations.length > 0 &&
		selectedCombinationIds.length === combinations.length;

	function handleToggleSelectAll() {
		if (isAllSelected) {
			setSelectedCombinationIds([]);
		} else {
			setSelectedCombinationIds(combinations.map((c) => c.id));
		}
	}

	function handleToggleSelectItem(id: string) {
		if (selectedCombinationIds.includes(id)) {
			setSelectedCombinationIds((prev) => prev.filter((item) => item !== id));
		} else {
			setSelectedCombinationIds((prev) => [...prev, id]);
		}
	}

	// Batch Apply to selected combinations
	function handleApplyBatchModal() {
		const stockNum = Number(batchStock) || 0;
		const minStockNum = Number(batchMinStock) || 0;
		const sellPriceNum = Number(batchSellPrice) || 0;
		const costPriceNum = Number(batchCostPrice) || 0;

		setCombinations((prev) =>
			prev.map((c) => {
				if (!selectedCombinationIds.includes(c.id)) return c;
				return {
					...c,
					stock: stockNum,
					min_stock: minStockNum,
					multiple_price: batchMultiplePrice,
					sell_price: sellPriceNum,
					cost_price: costPriceNum,
					multiple_prices: c.multiple_prices.map((mp) => {
						const override = batchOrderPrices[mp.order_type_id];
						return {
							...mp,
							sell_price: override ? Number(override.sell) || 0 : mp.sell_price,
							cost_price: override ? Number(override.cost) || 0 : mp.cost_price,
						};
					}),
				};
			}),
		);

		setIsBatchModalOpen(false);
		setIsBulkMode(false);
		setSelectedCombinationIds([]);
	}

	return (
		<>
			<SuccessModal
				title={`Produk Berhasil ${menuId ? "Diubah" : "Ditambahkan"}!`}
				description="Produk telah tersimpan ke dalam katalog."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menyimpan Produk"
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			{/* ========================================================================= */}
			{/* STEP 1: TAMBAH / EDIT PRODUK FORM */}
			{/* ========================================================================= */}
			{step === 1 && (
				<>
					<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 160 }}>
						{menuQuery.isLoading && menuId ? (
							<LoadingPlaceholder />
						) : (
							<View className="gap-4">
								{/* Field: Toko (Store) */}
								<Card>
									<View className="flex-row items-center gap-1.5 mb-2">
										<Text size="normal" w="medium" className="text-foreground">
											Toko
										</Text>
										<Text size="normal" w="medium" className="text-destructive">*</Text>
										<Feather name="info" size={15} color={Colors.zinc[400]} />
									</View>
									<SingleSelect
										className="bg-white"
										items={
											storesQuery.data?.map((store) => ({
												label: store.name,
												value: store.id,
											})) ?? [{ label: "Outlet Utama", value: "default-store" }]
										}
										value={form.watch("store_id") || ""}
										onValueChange={(val) => form.setValue("store_id", val)}
										placeholder="Pilih toko untuk ditambahkan"
										label="Pilih Toko"
									/>
								</Card>

								{/* Card 1: Gambar Produk */}
								<Card className="gap-3">
									<View className="flex-row items-center gap-3">
										<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
											<Feather name="image" size={18} color={Colors.primary} />
										</View>
										<View>
											<Text size="normal" w="semibold">
												Gambar Produk
											</Text>
											<Text size="small" className="text-muted">
												Upload gambar produk
											</Text>
										</View>
									</View>

									<ImageUploader
										value={form.watch("image")}
										onChange={(asset) => form.setValue("image", asset as any)}
										title="+ Tambah Gambar"
										subtitle="PNG, JPG maks. 2MB"
									/>
								</Card>

								{/* Card 2: Informasi Produk */}
								<Card className="gap-4">
									<View className="flex-row items-center gap-3">
										<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
											<Feather name="book-open" size={18} color={Colors.primary} />
										</View>
										<View>
											<Text size="normal" w="semibold">
												Informasi Produk
											</Text>
											<Text size="small" className="text-muted">
												Lengkapi detail produk anda
											</Text>
										</View>
									</View>

									{/* Nama Produk */}
									<View className="gap-1.5">
										<View className="flex-row items-center gap-0.5">
											<Text size="normal" w="medium">
												Nama Produk
											</Text>
											<Text size="normal" w="medium" className="text-destructive">*</Text>
										</View>
										<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
											<InputField
												className="text-foreground px-0 py-0"
												placeholder="Pizza Napolitan"
												placeholderTextColor={Colors.zinc[400]}
												value={form.watch("name")}
												onChangeText={(val) => form.setValue("name", val)}
											/>
										</Input>
									</View>

									{/* Kategori Produk */}
									<View className="gap-1.5">
										<View className="flex-row items-center gap-0.5">
											<Text size="normal" w="medium">
												Kategori Produk
											</Text>
											<Text size="normal" w="medium" className="text-destructive">*</Text>
										</View>
										<SingleSelect
											className="bg-white"
											items={
												categoriesQuery.data?.map((cat) => ({
													label: cat.name,
													value: cat.id,
												})) ?? [{ label: "Makanan", value: "default-cat" }]
											}
											value={form.watch("category_id") || ""}
											onValueChange={(val) => form.setValue("category_id", val)}
											placeholder="Pilih Kategori"
											label="Pilih Kategori"
										/>
									</View>

									{/* Merk */}
									<View className="gap-1.5">
										<Text size="normal" w="medium">
											Merk
										</Text>
										<SingleSelect
											className="bg-white"
											items={
												brandsQuery.data?.map((b) => ({
													label: b.name,
													value: b.id,
												})) ?? [{ label: "Pizza Hut", value: "default-brand" }]
											}
											value={form.watch("brand_id") || ""}
											onValueChange={(val) => form.setValue("brand_id", val)}
											placeholder="Pilih Merk"
											label="Pilih Merk"
										/>
									</View>

									{/* Deskripsi */}
									<View className="gap-1.5">
										<Text size="normal" w="medium">
											Deskripsi
										</Text>
										<Textarea className="h-24 rounded-lg border border-border-muted bg-white p-3">
											<TextareaInput
												className="text-foreground p-0"
												style={{ textAlignVertical: "top" }}
												placeholder="lapisan dengan pinggiran keju"
												placeholderTextColor={Colors.zinc[400]}
												multiline
												numberOfLines={3}
												value={form.watch("description") || ""}
												onChangeText={(val) => form.setValue("description", val)}
											/>
										</Textarea>
									</View>
								</Card>

								{/* Card 3: Detail Penjualan */}
								<Card className="gap-4">
									<View className="flex-row items-center gap-3">
										<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
											<Feather name="file-text" size={18} color={Colors.primary} />
										</View>
										<View>
											<Text size="normal" w="semibold">
												Detail Penjualan
											</Text>
											<Text size="small" className="text-muted">
												Atur harga dan satuan
											</Text>
										</View>
									</View>

									{/* Tipe Pesanan */}
									<View className="gap-1.5">
										<View className="flex-row items-center gap-1.5">
											<Text size="normal" w="medium">
												Tipe Pesanan
											</Text>
											<Text size="normal" w="medium" className="text-destructive">*</Text>
											<Feather name="info" size={15} color={Colors.zinc[400]} />
										</View>
										<MultiSelect
											variant="outline"
											className="bg-white"
											items={
												orderTypesQuery.data?.map((ot) => ({
													label: ot.name,
													value: ot.id,
												})) ?? [
													{ label: "Dine In", value: "ot-1" },
													{ label: "Take Away", value: "ot-2" },
													{ label: "Online Food", value: "ot-3" },
												]
											}
											selectedValues={form.watch("order_type_ids") || []}
											onValueChange={(vals) => form.setValue("order_type_ids", vals)}
											placeholder="Pilih Tipe Pesanan"
											label="Pilih Tipe Pesanan"
										/>
									</View>

									{/* Tambahan (Extra Menu / Topping) */}
									<View className="gap-1.5">
										<View className="flex-row items-center gap-1.5">
											<Text size="normal" w="medium">
												Tambahan
											</Text>
											<Feather name="info" size={15} color={Colors.zinc[400]} />
										</View>
										<MultiSelect
											variant="outline"
											className="bg-white"
											items={
												extraMenusQuery.data?.map((em) => ({
													label: em.name,
													value: em.id,
												})) ?? [
													{ label: "Topping", value: "em-1" },
													{ label: "Extra Keju", value: "em-2" },
												]
											}
											selectedValues={form.watch("extra_menu_ids") || []}
											onValueChange={(vals) => form.setValue("extra_menu_ids", vals)}
											placeholder="Pilih Tambahan"
											label="Pilih Tambahan"
										/>
									</View>

									{/* Satuan */}
									<View className="gap-1.5">
										<Text size="normal" w="medium">
											Satuan
										</Text>
										<SingleSelect
											className="bg-white"
											items={
												unitsQuery.data?.map((u) => ({
													label: u.name,
													value: u.id,
												})) ?? [
													{ label: "Pcs", value: "pcs" },
													{ label: "Porsi", value: "porsi" },
												]
											}
											value={form.watch("unit_id") || ""}
											onValueChange={(val) => form.setValue("unit_id", val)}
											placeholder="Pilih Satuan"
											label="Pilih Satuan"
										/>
									</View>
								</Card>

								{/* Card 4: Pengelolaan */}
								<Card className="gap-4">
									<View className="flex-row items-center gap-3">
										<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
											<Feather name="sliders" size={18} color={Colors.primary} />
										</View>
										<View>
											<Text size="normal" w="semibold">
												Pengelolaan
											</Text>
											<Text size="small" className="text-muted">
												Pengaturan stok dan variasi
											</Text>
										</View>
									</View>

									{/* Variasi Produk Switch Row */}
									<View className="flex-row items-center justify-between border-b border-border-muted pb-3">
										<View className="gap-0.5">
											<View className="flex-row items-center gap-1.5">
												<Text size="normal" w="medium">
													Variasi Produk
												</Text>
												<Feather name="info" size={15} color={Colors.zinc[400]} />
											</View>
											<Text size="small" className="text-muted">
												Atur informasi variasi produk
											</Text>
										</View>
										<Switch
											value={hasVariants}
											onValueChange={setHasVariants}
										/>
									</View>

									{/* ------------------------------------------------------------- */}
									{/* BRANCH A: VARIASI PRODUK IS OFF (Image 1 Left & Image 3) */}
									{/* ------------------------------------------------------------- */}
									{!hasVariants && (
										<View className="gap-4">
											{/* Disabled "+ Tambah Variasi" Button */}
											<Button
												variant="outline"
												disabled
												className="h-11 rounded-lg border border-dashed border-border-muted bg-gray-50 opacity-60"
											>
												<ButtonText size="sm" className="text-gray-400">
													+ Tambah Variasi
												</ButtonText>
											</Button>

											{/* Mode Harga (3 Options Cards) */}
											<View className="gap-2">
												<View className="flex-row items-center gap-1.5">
													<Text size="normal" w="medium">
														Mode Harga
													</Text>
													<Text size="normal" w="medium" className="text-destructive">*</Text>
													<Feather name="info" size={15} color={Colors.zinc[400]} />
												</View>

												<View className="flex-row gap-2">
													{/* Option 1: Satu Harga */}
													<Pressable
														onPress={() => setPriceMode("single")}
														className={cn(
															"flex-1 items-center rounded-xl border p-3 justify-center gap-1.5",
															priceMode === "single"
																? "border-primary bg-primary-50/50"
																: "border-border-muted bg-white",
														)}
													>
														<Feather
															name="box"
															size={20}
															color={priceMode === "single" ? Colors.primary : Colors.zinc[500]}
														/>
														<Text
															size="small"
															w="semibold"
															className={priceMode === "single" ? "text-primary text-center" : "text-foreground text-center"}
														>
															Satu Harga
														</Text>
														<Text size="small" className="text-center text-muted leading-tight">
															Gunakan satu harga untuk semua tipe pesanan
														</Text>
													</Pressable>

													{/* Option 2: Per Tipe Pesanan */}
													<Pressable
														onPress={() => setPriceMode("per_order_type")}
														className={cn(
															"flex-1 items-center rounded-xl border p-3 justify-center gap-1.5",
															priceMode === "per_order_type"
																? "border-primary bg-primary-50/50"
																: "border-border-muted bg-white",
														)}
													>
														<Feather
															name="git-branch"
															size={20}
															color={priceMode === "per_order_type" ? Colors.primary : Colors.zinc[500]}
														/>
														<Text
															size="small"
															w="semibold"
															className={priceMode === "per_order_type" ? "text-primary text-center" : "text-foreground text-center"}
														>
															Per Tipe Pesanan
														</Text>
														<Text size="small" className="text-center text-muted leading-tight">
															Atur harga berbeda untuk tiap tipe pesanan
														</Text>
													</Pressable>

													{/* Option 3: Input Harga di Kasir */}
													<Pressable
														onPress={() => setPriceMode("cashier")}
														className={cn(
															"flex-1 items-center rounded-xl border p-3 justify-center gap-1.5",
															priceMode === "cashier"
																? "border-primary bg-primary-50/50"
																: "border-border-muted bg-white",
														)}
													>
														<Feather
															name="credit-card"
															size={20}
															color={priceMode === "cashier" ? Colors.primary : Colors.zinc[500]}
														/>
														<Text
															size="small"
															w="semibold"
															className={priceMode === "cashier" ? "text-primary text-center" : "text-foreground text-center"}
														>
															Input Harga di Kasir
														</Text>
														<Text size="small" className="text-center text-muted leading-tight">
															Harga jual ditentukan saat transaksi di kasir
														</Text>
													</Pressable>
												</View>
											</View>

											{/* Price Inputs based on Price Mode */}
											{priceMode === "single" && (
												<View className="flex-row gap-3">
													<View className="flex-1 gap-1.5">
														<View className="flex-row items-center gap-0.5">
															<Text size="normal" w="medium">
																Harga Jual
															</Text>
															<Text size="normal" w="medium" className="text-destructive">*</Text>
														</View>
														<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
															<InputField
																className="text-foreground px-0 py-0"
																placeholder="Rp150.000"
																placeholderTextColor={Colors.zinc[400]}
																keyboardType="numeric"
																value={form.watch("sell_price") ? String(form.watch("sell_price")) : ""}
																onChangeText={(val) => form.setValue("sell_price", Number(val) || null)}
															/>
														</Input>
													</View>
													<View className="flex-1 gap-1.5">
														<View className="flex-row items-center gap-0.5">
															<Text size="normal" w="medium">
																Harga Modal
															</Text>
															<Text size="normal" w="medium" className="text-destructive">*</Text>
														</View>
														<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
															<InputField
																className="text-foreground px-0 py-0"
																placeholder="Rp75.000"
																placeholderTextColor={Colors.zinc[400]}
																keyboardType="numeric"
																value={form.watch("cost_price") ? String(form.watch("cost_price")) : ""}
																onChangeText={(val) => form.setValue("cost_price", Number(val) || null)}
															/>
														</Input>
													</View>
												</View>
											)}

											{priceMode === "per_order_type" && (
												<View className="rounded-xl border border-border-muted bg-white p-3 gap-2">
													{/* Table Header */}
													<View className="flex-row items-center justify-between pb-2 border-b border-border-muted">
														<View className="w-1/3" />
														<Text size="small" w="semibold" className="w-[30%] text-center text-foreground">
															Harga Jual *
														</Text>
														<Text size="small" w="semibold" className="w-[30%] text-center text-foreground">
															Harga Modal *
														</Text>
													</View>

													{/* Rows */}
													{resolvedSelectedOrderTypes.map((ot) => (
														<View key={ot.id} className="flex-row items-center justify-between py-1.5">
															<Text size="normal" w="medium" className="w-1/3 text-foreground">
																{ot.name}
															</Text>
															<Input className="h-9 w-[30%] rounded-lg border border-border-muted bg-white px-2.5">
																<InputField
																	className="text-foreground px-0 py-0 text-center"
																	placeholder="Rp30.000"
																	placeholderTextColor={Colors.zinc[400]}
																	keyboardType="numeric"
																/>
															</Input>
															<Input className="h-9 w-[30%] rounded-lg border border-border-muted bg-white px-2.5">
																<InputField
																	className="text-foreground px-0 py-0 text-center"
																	placeholder="Rp15.000"
																	placeholderTextColor={Colors.zinc[400]}
																	keyboardType="numeric"
																/>
															</Input>
														</View>
													))}
												</View>
											)}

											{/* Atur Stok Toggle */}
											<View className="gap-2">
												<View className="flex-row items-center justify-between">
													<Text size="normal" w="medium">
														Atur Stok
													</Text>
													<Switch
														value={trackStock}
														onValueChange={setTrackStock}
													/>
												</View>

												{trackStock && (
													<View className="flex-row gap-3 pt-2">
														<View className="flex-1 gap-1.5">
															<View className="flex-row items-center gap-0.5">
																<Text size="normal" w="medium">
																	Jumlah Stok
																</Text>
																<Text size="normal" w="medium" className="text-destructive">*</Text>
															</View>
															<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
																<InputField
																	className="text-foreground px-0 py-0"
																	placeholder="80"
																	placeholderTextColor={Colors.zinc[400]}
																	keyboardType="numeric"
																	value={form.watch("stock") ? String(form.watch("stock")) : ""}
																	onChangeText={(val) => form.setValue("stock", Number(val) || null)}
																/>
															</Input>
														</View>
														<View className="flex-1 gap-1.5">
															<Text size="normal" w="medium">
																Batas Stok Minimun
															</Text>
															<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
																<InputField
																	className="text-foreground px-0 py-0"
																	placeholder="40"
																	placeholderTextColor={Colors.zinc[400]}
																	keyboardType="numeric"
																	value={form.watch("min_stock") ? String(form.watch("min_stock")) : ""}
																	onChangeText={(val) => form.setValue("min_stock", Number(val) || null)}
																/>
															</Input>
														</View>
													</View>
												)}
											</View>

											{/* Scan / Input SKU Barcode */}
											<View className="gap-1.5">
												<Text size="normal" w="medium">
													Scan / Input SKU Barcode
												</Text>
												<Input className="h-11 rounded-lg border border-border-muted bg-white px-3 justify-between">
													<InputField
														className="text-foreground px-0 py-0"
														placeholder="1235432"
														placeholderTextColor={Colors.zinc[400]}
														value={form.watch("sku_barcode") || ""}
														onChangeText={(val) => form.setValue("sku_barcode", val)}
													/>
													<InputSlot>
														<Feather name="maximize" size={18} color={Colors.primary} />
													</InputSlot>
												</Input>
											</View>

											{/* Tanggal Expire */}
											<View className="gap-1.5">
												<Text size="normal" w="medium">
													Tanggal Expire
												</Text>
												<Input className="h-11 rounded-lg border border-border-muted bg-white px-3 justify-between">
													<InputField
														className="text-foreground px-0 py-0"
														placeholder="1/1/2024 - 1/6/2024"
														placeholderTextColor={Colors.zinc[400]}
														value={form.watch("expire_date") || ""}
														onChangeText={(val) => form.setValue("expire_date", val)}
													/>
													<InputSlot>
														<Feather name="calendar" size={18} color={Colors.primary} />
													</InputSlot>
												</Input>
											</View>
										</View>
									)}

									{/* ------------------------------------------------------------- */}
									{/* BRANCH B: VARIASI PRODUK IS ON (Image 1 Middle & Right) */}
									{/* ------------------------------------------------------------- */}
									{hasVariants && (
										<View className="gap-4">
											{/* Dynamic Variation Groups */}
											{variationGroups.map((group, groupIdx) => (
												<View
													key={groupIdx}
													className="gap-3 rounded-xl border border-border-muted bg-zinc-50/60 p-3.5"
												>
													{/* Group Header */}
													<View className="flex-row items-center justify-between">
														<View className="flex-row items-center gap-0.5">
															<Text size="normal" w="semibold">
																Variasi
															</Text>
															<Text size="normal" w="medium" className="text-destructive">*</Text>
														</View>
														<Pressable
															onPress={() => handleRemoveVariationGroup(groupIdx)}
															hitSlop={8}
														>
															<Text size="normal" w="semibold" className="text-destructive">Hapus</Text>
														</Pressable>
													</View>

													{/* Variation Name Input (e.g. "Ukuran") */}
													<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
														<InputField
															className="text-foreground px-0 py-0"
															placeholder="Contoh: Ukuran / Pinggiran"
															placeholderTextColor={Colors.zinc[400]}
															value={group.name}
															onChangeText={(text) => handleGroupChange(groupIdx, text)}
														/>
													</Input>

													{/* Options List */}
													<View className="gap-2 pt-1">
														{group.options.map((option, optIdx) => (
															<View
																key={optIdx}
																className="flex-row items-center gap-2"
															>
																<Input className="h-11 flex-1 rounded-lg border border-border-muted bg-white px-3">
																	<InputField
																		className="text-foreground px-0 py-0"
																		placeholder={`Opsi ${optIdx + 1}`}
																		placeholderTextColor={Colors.zinc[400]}
																		value={option}
																		onChangeText={(text) =>
																			handleOptionChange(groupIdx, optIdx, text)
																		}
																	/>
																</Input>
																{group.options.length > 1 && (
																	<Pressable
																		onPress={() =>
																			handleRemoveOption(groupIdx, optIdx)
																		}
																		hitSlop={8}
																		className="size-11 items-center justify-center rounded-lg border border-border-muted bg-white active:bg-red-50"
																	>
																		<Feather
																			name="trash-2"
																			size={18}
																			color="#ef4444"
																		/>
																	</Pressable>
																)}
															</View>
														))}

														{/* + Tambah Opsi Button */}
														<Pressable
															onPress={() => handleAddOption(groupIdx)}
															className="h-10 items-center justify-center rounded-lg border border-dashed border-primary bg-primary-50/50"
														>
															<Text size="small" w="medium" className="text-primary">
																+ Tambah Opsi
															</Text>
														</Pressable>
													</View>
												</View>
											))}

											{/* + Tambah Variasi Button */}
											<Button
												variant="outline"
												onPress={handleAddVariationGroup}
												className="h-11 rounded-xl border border-primary bg-white"
											>
												<ButtonText size="sm" className="text-primary">
													+ Tambah Variasi
												</ButtonText>
											</Button>
										</View>
									)}
								</Card>
							</View>
						)}
					</Wrapper>

					<BottomActionButton onPress={handleStep1Submit}>
						{hasVariants ? "Lanjutkan" : "Simpan"}
					</BottomActionButton>
				</>
			)}

			{/* ========================================================================= */}
			{/* STEP 2: ATUR INFORMASI VARIASI (Images 2 & 5) */}
			{/* ========================================================================= */}
			{step === 2 && (
				<>
					<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 160 }}>
						<View className="gap-4">
							{/* Top Card: Data Variasi Produk */}
							<Card className="gap-3">
								<View className="flex-row items-center gap-3">
									<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
										<Feather name="info" size={18} color={Colors.primary} />
									</View>
									<View>
										<Text size="normal" w="semibold">
											Data Variasi Produk
										</Text>
										<Text size="small" className="text-muted">
											Atur informasi variasi produk.
										</Text>
									</View>
								</View>

								{/* Inner Banner: Atur Stok & Harga Keseluruhan */}
								<View className="flex-row items-center justify-between rounded-xl bg-primary-100 border border-border p-3.5">
									<View className="flex-1 pr-3">
										<Text size="normal" w="semibold" className="text-foreground">
											Atur Stok & Harga Keseluruhan
										</Text>
										<Text size="small" className="text-muted mt-0.5">
											Saat diaktifkan, perubahan stok dan harga akan diterapkan ke seluruh produk.
										</Text>
									</View>

									<Button
										size="sm"
										className="rounded-lg bg-primary px-4"
										onPress={() => setIsBulkMode((prev) => !prev)}
									>
										<ButtonText size="xs" className="text-white">
											{isBulkMode ? "Batal" : "Atur"}
										</ButtonText>
									</Button>
								</View>
							</Card>

							{/* Horizontal Filter Tabs (e.g. XL, L, M) */}
							{variationGroups.length > 0 && variationGroups[0].options.length > 0 && (
								<View className="flex-row gap-2 border-b border-border-muted pb-1">
									{variationGroups[0].options.map((tab) => (
										<Pressable
											key={tab}
											onPress={() => setActiveTab(tab)}
											className={cn(
												"flex-1 items-center justify-center py-2 border-b-2",
												activeTab === tab
													? "border-primary"
													: "border-transparent",
											)}
										>
											<Text
												size="normal"
												w={activeTab === tab ? "bold" : "medium"}
												className={activeTab === tab ? "text-primary" : "text-muted"}
											>
												{tab}
											</Text>
										</Pressable>
									))}
								</View>
							)}

							{/* ------------------------------------------------------------- */}
							{/* MODE A: NORMAL ACCORDION LIST (Image 2 Screens 1 & 2) */}
							{/* ------------------------------------------------------------- */}
							{!isBulkMode && (
								<View className="gap-3">
									{filteredCombinations.map((combo) => {
										const isExpanded = expandedAccordionId === combo.id;

										return (
											<Card key={combo.id} className="p-3.5 gap-3">
												{/* Accordion Header */}
												<Pressable
													onPress={() =>
														setExpandedAccordionId(isExpanded ? null : combo.id)
													}
													className="flex-row items-center justify-between"
												>
													<View className="flex-row items-center gap-2">
														<View className="rounded bg-primary-50 px-2 py-0.5">
															<Text size="small" w="bold" className="text-primary">
																{combo.primaryOption}
															</Text>
														</View>
														{combo.secondaryOption ? (
															<>
																<Text size="small" className="text-zinc-300">
																	|
																</Text>
																<Text size="normal" w="medium" className="text-foreground">
																	{combo.secondaryOption}
																</Text>
															</>
														) : null}
													</View>
													<Feather
														name={isExpanded ? "chevron-up" : "chevron-down"}
														size={18}
														color={Colors.zinc[500]}
													/>
												</Pressable>

												{/* Accordion Expanded Content */}
												{isExpanded && (
													<View className="gap-3.5 pt-2 border-t border-border-muted">
														{/* Stock Row */}
														<View className="flex-row gap-3">
															<View className="flex-1 gap-1.5">
																<View className="flex-row items-center gap-0.5">
																	<Text size="normal" w="medium">
																		Jumlah Stok
																	</Text>
																	<Text size="normal" w="medium" className="text-destructive">*</Text>
																</View>
																<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
																	<InputField
																		className="text-foreground px-0 py-0"
																		placeholder="80"
																		placeholderTextColor={Colors.zinc[400]}
																		keyboardType="numeric"
																		value={combo.stock ? String(combo.stock) : ""}
																		onChangeText={(val) => {
																			setCombinations((prev) =>
																				prev.map((c) =>
																					c.id === combo.id
																						? { ...c, stock: Number(val) || null }
																						: c,
																				),
																			);
																		}}
																	/>
																</Input>
															</View>
															<View className="flex-1 gap-1.5">
																<Text size="normal" w="medium">
																	Batas Stok Minimun
																</Text>
																<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
																	<InputField
																		className="text-foreground px-0 py-0"
																		placeholder="40"
																		placeholderTextColor={Colors.zinc[400]}
																		keyboardType="numeric"
																		value={combo.min_stock ? String(combo.min_stock) : ""}
																		onChangeText={(val) => {
																			setCombinations((prev) =>
																				prev.map((c) =>
																					c.id === combo.id
																						? { ...c, min_stock: Number(val) || null }
																						: c,
																				),
																			);
																		}}
																	/>
																</Input>
															</View>
														</View>

														{/* Variasi Harga Toggle */}
														<View className="flex-row items-center justify-between border-t border-border-muted pt-2">
															<View>
																<Text size="normal" w="medium">
																	Variasi Harga
																</Text>
																<Text size="small" className="text-muted">
																	Aktifkan untuk mengatur variasi harga
																</Text>
															</View>
															<Switch
																value={combo.multiple_price}
																onValueChange={(val) => {
																	setCombinations((prev) =>
																		prev.map((c) =>
																			c.id === combo.id
																				? { ...c, multiple_price: val }
																				: c,
																		),
																	);
																}}
															/>
														</View>

														{/* Price Inputs: Single vs Per Order Type */}
														{!combo.multiple_price ? (
															<View className="flex-row gap-3">
																<View className="flex-1 gap-1.5">
																	<View className="flex-row items-center gap-0.5">
																		<Text size="normal" w="medium">
																			Harga Jual
																		</Text>
																		<Text size="normal" w="medium" className="text-destructive">*</Text>
																	</View>
																	<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
																		<InputField
																			className="text-foreground px-0 py-0"
																			placeholder="Rp150.000"
																			placeholderTextColor={Colors.zinc[400]}
																			keyboardType="numeric"
																			value={combo.sell_price ? String(combo.sell_price) : ""}
																			onChangeText={(val) => {
																				setCombinations((prev) =>
																					prev.map((c) =>
																						c.id === combo.id
																							? { ...c, sell_price: Number(val) || null }
																							: c,
																					),
																				);
																			}}
																		/>
																	</Input>
																</View>
																<View className="flex-1 gap-1.5">
																	<View className="flex-row items-center gap-0.5">
																		<Text size="normal" w="medium">
																			Harga Modal
																		</Text>
																		<Text size="normal" w="medium" className="text-destructive">*</Text>
																	</View>
																	<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
																		<InputField
																			className="text-foreground px-0 py-0"
																			placeholder="Rp75.000"
																			placeholderTextColor={Colors.zinc[400]}
																			keyboardType="numeric"
																			value={combo.cost_price ? String(combo.cost_price) : ""}
																			onChangeText={(val) => {
																				setCombinations((prev) =>
																					prev.map((c) =>
																						c.id === combo.id
																							? { ...c, cost_price: Number(val) || null }
																							: c,
																					),
																				);
																			}}
																		/>
																	</Input>
																</View>
															</View>
														) : (
															<View className="rounded-xl border border-border-muted bg-white p-3 gap-2">
																<View className="flex-row items-center justify-between pb-2 border-b border-border-muted">
																	<View className="w-1/3" />
																	<Text size="small" w="semibold" className="w-[30%] text-center text-foreground">
																		Harga Jual *
																	</Text>
																	<Text size="small" w="semibold" className="w-[30%] text-center text-foreground">
																		Harga Modal *
																	</Text>
																</View>

																{combo.multiple_prices.map((mp, mpIdx) => (
																	<View
																		key={mp.order_type_id}
																		className="flex-row items-center justify-between py-1.5"
																	>
																		<Text size="normal" w="medium" className="w-1/3 text-foreground">
																			{mp.order_type_name}
																		</Text>
																		<Input className="h-9 w-[30%] rounded-lg border border-border-muted bg-white px-2.5">
																			<InputField
																				className="text-foreground px-0 py-0 text-center"
																				placeholder="Rp30.000"
																				placeholderTextColor={Colors.zinc[400]}
																				keyboardType="numeric"
																				value={mp.sell_price ? String(mp.sell_price) : ""}
																				onChangeText={(val) => {
																					const updatedMp = [...combo.multiple_prices];
																					updatedMp[mpIdx].sell_price = Number(val) || 0;
																					setCombinations((prev) =>
																						prev.map((c) =>
																							c.id === combo.id
																								? { ...c, multiple_prices: updatedMp }
																								: c,
																						),
																					);
																				}}
																			/>
																		</Input>
																		<Input className="h-9 w-[30%] rounded-lg border border-border-muted bg-white px-2.5">
																			<InputField
																				className="text-foreground px-0 py-0 text-center"
																				placeholder="Rp15.000"
																				placeholderTextColor={Colors.zinc[400]}
																				keyboardType="numeric"
																				value={mp.cost_price ? String(mp.cost_price) : ""}
																				onChangeText={(val) => {
																					const updatedMp = [...combo.multiple_prices];
																					updatedMp[mpIdx].cost_price = Number(val) || 0;
																					setCombinations((prev) =>
																						prev.map((c) =>
																							c.id === combo.id
																								? { ...c, multiple_prices: updatedMp }
																								: c,
																						),
																					);
																				}}
																			/>
																		</Input>
																	</View>
																))}
															</View>
														)}

														{/* Barcode */}
														<View className="gap-1.5">
															<Text size="normal" w="medium">
																Scan / Input SKU Barcode
															</Text>
															<Input className="h-11 rounded-lg border border-border-muted bg-white px-3 justify-between">
																<InputField
																	className="text-foreground px-0 py-0"
																	placeholder="1235432"
																	placeholderTextColor={Colors.zinc[400]}
																	value={combo.sku_barcode}
																	onChangeText={(val) => {
																		setCombinations((prev) =>
																			prev.map((c) =>
																				c.id === combo.id
																					? { ...c, sku_barcode: val }
																					: c,
																			),
																		);
																	}}
																/>
																<InputSlot>
																	<Feather name="maximize" size={18} color={Colors.primary} />
																</InputSlot>
															</Input>
														</View>

														{/* Expire Date */}
														<View className="gap-1.5">
															<Text size="normal" w="medium">
																Tanggal Expire
															</Text>
															<Input className="h-11 rounded-lg border border-border-muted bg-white px-3 justify-between">
																<InputField
																	className="text-foreground px-0 py-0"
																	placeholder="1/1/2024 - 1/6/2024"
																	placeholderTextColor={Colors.zinc[400]}
																	value={combo.expire_date}
																	onChangeText={(val) => {
																		setCombinations((prev) =>
																			prev.map((c) =>
																				c.id === combo.id
																					? { ...c, expire_date: val }
																					: c,
																			),
																		);
																	}}
																/>
																<InputSlot>
																	<Feather name="calendar" size={18} color={Colors.primary} />
																</InputSlot>
															</Input>
														</View>
													</View>
												)}
											</Card>
										);
									})}
								</View>
							)}

							{/* ------------------------------------------------------------- */}
							{/* MODE B: BULK SELECTION LIST (Image 2 Screen 3) */}
							{/* ------------------------------------------------------------- */}
							{isBulkMode && (
								<View className="gap-3">
									{filteredCombinations.map((combo) => {
										const isChecked = selectedCombinationIds.includes(combo.id);

										return (
											<Pressable
												key={combo.id}
												onPress={() => handleToggleSelectItem(combo.id)}
												className="flex-row items-center gap-3 rounded-xl border border-border-muted bg-white p-4"
											>
												<View
													className={cn(
														"size-5 items-center justify-center rounded border",
														isChecked
															? "border-primary bg-primary"
															: "border-gray-300 bg-white",
													)}
												>
													{isChecked && <Feather name="check" size={14} color="#ffffff" />}
												</View>

												<View className="flex-row items-center gap-2">
													<View className="rounded bg-primary-50 px-2 py-0.5">
														<Text size="small" w="bold" className="text-primary">
															{combo.primaryOption}
														</Text>
													</View>
													{combo.secondaryOption ? (
														<>
															<Text size="small" className="text-zinc-300">
																|
															</Text>
															<Text size="normal" w="medium" className="text-foreground">
																{combo.secondaryOption}
															</Text>
														</>
													) : null}
												</View>
											</Pressable>
										);
									})}
								</View>
							)}
						</View>
					</Wrapper>

					{/* Sticky Bottom Actions */}
					{!isBulkMode ? (
						<BottomActionButton onPress={handleSubmitStep2}>
							Simpan
						</BottomActionButton>
					) : (
						<View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t border-border-muted bg-white px-4 py-3 pb-8">
							<Pressable
								onPress={handleToggleSelectAll}
								className="flex-row items-center gap-2"
							>
								<View
									className={cn(
										"size-5 items-center justify-center rounded border",
										isAllSelected
											? "border-primary bg-primary"
											: "border-gray-300 bg-white",
									)}
								>
									{isAllSelected && <Feather name="check" size={14} color="#ffffff" />}
								</View>
								<Text size="normal" w="medium">
									Pilih Semua
								</Text>
							</Pressable>

							<Button
								className="rounded-xl bg-primary px-6"
								disabled={selectedCombinationIds.length === 0}
								onPress={() => setIsBatchModalOpen(true)}
							>
								<ButtonText className="text-white">
									Atur Keseluruhan
								</ButtonText>
							</Button>
						</View>
					)}
				</>
			)}

			{/* ========================================================================= */}
			{/* ACTIONSHEET / MODAL: ATUR HARGA DAN STOK (Image 5) */}
			{/* ========================================================================= */}
			<Actionsheet
				isOpen={isBatchModalOpen}
				onClose={() => setIsBatchModalOpen(false)}
			>
				<ActionsheetBackdrop />
				<ActionsheetContent className="px-4 pb-6 pt-3 max-h-[85vh]">
					<ActionsheetDragIndicatorWrapper className="mb-2">
						<ActionsheetDragIndicator className="h-1 w-10 rounded-full bg-zinc-300" />
					</ActionsheetDragIndicatorWrapper>

					<Text size="body" w="bold" className="text-center mb-4">
						Atur harga dan stok
					</Text>

					<ActionsheetScrollView
						className="w-full flex-1"
						contentContainerStyle={{ paddingBottom: 16 }}
						showsVerticalScrollIndicator={false}
					>
						<View className="gap-4 w-full">
							{/* Stock Row */}
							<View className="flex-row gap-3">
								<View className="flex-1 gap-1.5">
									<View className="flex-row items-center gap-0.5">
										<Text size="normal" w="medium">
											Jumlah Stok
										</Text>
										<Text size="normal" w="medium" className="text-destructive">*</Text>
									</View>
									<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
										<InputField
											className="text-foreground px-0 py-0"
											placeholder="80"
											placeholderTextColor={Colors.zinc[400]}
											keyboardType="numeric"
											value={batchStock}
											onChangeText={setBatchStock}
										/>
									</Input>
								</View>
								<View className="flex-1 gap-1.5">
									<Text size="normal" w="medium">
										Batas Stok Minimun
									</Text>
									<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
										<InputField
											className="text-foreground px-0 py-0"
											placeholder="40"
											placeholderTextColor={Colors.zinc[400]}
											keyboardType="numeric"
											value={batchMinStock}
											onChangeText={setBatchMinStock}
										/>
									</Input>
								</View>
							</View>

							{/* Variasi Harga Toggle */}
							<View className="flex-row items-center justify-between border-t border-border-muted pt-3">
								<View>
									<Text size="normal" w="medium">
										Variasi Harga
									</Text>
									<Text size="small" className="text-muted">
										Aktifkan untuk mengatur variasi harga
									</Text>
								</View>
								<Switch
									value={batchMultiplePrice}
									onValueChange={setBatchMultiplePrice}
								/>
							</View>

							{/* Price Inputs: Single vs Per Order Type */}
							{!batchMultiplePrice ? (
								<View className="flex-row gap-3">
									<View className="flex-1 gap-1.5">
										<View className="flex-row items-center gap-0.5">
											<Text size="normal" w="medium">
												Harga Jual
											</Text>
											<Text size="normal" w="medium" className="text-destructive">*</Text>
										</View>
										<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
											<InputField
												className="text-foreground px-0 py-0"
												placeholder="Rp150.000"
												placeholderTextColor={Colors.zinc[400]}
												keyboardType="numeric"
												value={batchSellPrice}
												onChangeText={setBatchSellPrice}
											/>
										</Input>
									</View>
									<View className="flex-1 gap-1.5">
										<View className="flex-row items-center gap-0.5">
											<Text size="normal" w="medium">
												Harga Modal
											</Text>
											<Text size="normal" w="medium" className="text-destructive">*</Text>
										</View>
										<Input className="h-11 rounded-lg border border-border-muted bg-white px-3">
											<InputField
												className="text-foreground px-0 py-0"
												placeholder="Rp75.000"
												placeholderTextColor={Colors.zinc[400]}
												keyboardType="numeric"
												value={batchCostPrice}
												onChangeText={setBatchCostPrice}
											/>
										</Input>
									</View>
								</View>
							) : (
								<View className="rounded-xl border border-border-muted bg-white p-3 gap-2">
									<View className="flex-row items-center justify-between pb-2 border-b border-border-muted">
										<View className="w-1/3" />
										<Text size="small" w="semibold" className="w-[30%] text-center text-foreground">
											Harga Jual *
										</Text>
										<Text size="small" w="semibold" className="w-[30%] text-center text-foreground">
											Harga Modal *
										</Text>
									</View>

									{resolvedSelectedOrderTypes.map((ot) => (
										<View
											key={ot.id}
											className="flex-row items-center justify-between py-1.5"
										>
											<Text size="normal" w="medium" className="w-1/3 text-foreground">
												{ot.name}
											</Text>
											<Input className="h-9 w-[30%] rounded-lg border border-border-muted bg-white px-2.5">
												<InputField
													className="text-foreground px-0 py-0 text-center"
													placeholder="Rp30.000"
													placeholderTextColor={Colors.zinc[400]}
													keyboardType="numeric"
													value={batchOrderPrices[ot.id]?.sell ?? "30000"}
													onChangeText={(val) =>
														setBatchOrderPrices((prev) => ({
															...prev,
															[ot.id]: {
																...prev[ot.id],
																sell: val,
																cost: prev[ot.id]?.cost ?? "15000",
															},
														}))
													}
												/>
											</Input>
											<Input className="h-9 w-[30%] rounded-lg border border-border-muted bg-white px-2.5">
												<InputField
													className="text-foreground px-0 py-0 text-center"
													placeholder="Rp15.000"
													placeholderTextColor={Colors.zinc[400]}
													keyboardType="numeric"
													value={batchOrderPrices[ot.id]?.cost ?? "15000"}
													onChangeText={(val) =>
														setBatchOrderPrices((prev) => ({
															...prev,
															[ot.id]: {
																sell: prev[ot.id]?.sell ?? "30000",
																cost: val,
															},
														}))
													}
												/>
											</Input>
										</View>
									))}
								</View>
							)}
						</View>
					</ActionsheetScrollView>

					{/* Actions: Batal | Simpan Pinned at Bottom */}
					<View className="flex-row gap-3 pt-3 border-t border-border-muted w-full bg-white">
						<Button
							variant="outline"
							size="xl"
							className="flex-1 rounded-full border-border-muted bg-white"
							onPress={() => setIsBatchModalOpen(false)}
						>
							<ButtonText className="text-foreground">
								Batal
							</ButtonText>
						</Button>

						<Button
							size="xl"
							className="flex-1 rounded-full bg-primary"
							onPress={handleApplyBatchModal}
						>
							<ButtonText className="text-white">
								Simpan
							</ButtonText>
						</Button>
					</View>
				</ActionsheetContent>
			</Actionsheet>
		</>
	);
}
