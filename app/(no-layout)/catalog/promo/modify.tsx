import { Entypo, Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Modal, Platform, Pressable, View } from "react-native";
import { useCategoriesQuery } from "@/api/hooks/categories";
import { useMenusQuery } from "@/api/hooks/menus";
import { useOrderTypesQuery } from "@/api/hooks/order-types";
import { usePromoQuery } from "@/api/hooks/promos";
import { useStoresQuery } from "@/api/hooks/stores";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import {
	Form,
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import { MultiSelect } from "@/components/common/MultiSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import { Button, ButtonText } from "@/components/ui/button";
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
import { cn, formatDatePeriod, formatRp } from "@/lib/utils";
import { type PromoSchema, promoSchema } from "@/schema/add/promo";

const DAYS_OF_WEEK = [
	{ label: "Senin", value: "Senin" },
	{ label: "Selasa", value: "Selasa" },
	{ label: "Rabu", value: "Rabu" },
	{ label: "Kamis", value: "Kamis" },
	{ label: "Jumat", value: "Jumat" },
	{ label: "Sabtu", value: "Sabtu" },
	{ label: "Minggu", value: "Minggu" },
];

function SectionHeader({
	icon,
	title,
	subtitle,
}: {
	icon: keyof typeof Feather.glyphMap;
	title: string;
	subtitle: string;
}) {
	return (
		<View className="flex-row items-center gap-3">
			<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
				<Feather name={icon} size={18} color={Colors.primary} />
			</View>
			<View className="flex-1">
				<Text size="normal" w="bold" className="text-foreground">
					{title}
				</Text>
				<Text size="small" className="text-muted">
					{subtitle}
				</Text>
			</View>
		</View>
	);
}

export default function ModifyPromoScreen() {
	const params = useLocalSearchParams();
	const promoId = params?.id as string | undefined;
	const promoQuery = usePromoQuery(promoId);

	const menusQuery = useMenusQuery();
	const categoriesQuery = useCategoriesQuery();
	const orderTypesQuery = useOrderTypesQuery();
	const storesQuery = useStoresQuery();

	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMessage, setErrorMessage] = React.useState("Terjadi kesalahan.");

	// Date Range Modal State
	const [isDateModalOpen, setIsDateModalOpen] = React.useState(false);

	const form = useForm<PromoSchema>({
		resolver: zodResolver(promoSchema),
		defaultValues: {
			name: "",
			type: "discount",
			promo_requirement: "item",
			order_type_id: "",
			store_ids: [],
			start_period: new Date(),
			end_period: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			days: DAYS_OF_WEEK.map((d) => d.value),
			requirements: [{ applicable_id: "", minimum_quantity: 1 }],
			combination_requirements: [
				{
					items: [
						{ applicable_id: "", minimum_quantity: 1 },
						{ applicable_id: "", minimum_quantity: 1 },
					],
				},
			],
			discount: {
				type: "fixed",
				amount: 10000,
			},
			free_item: {
				menu_entry_id: "",
				quantity: 1,
			},
		},
	});

	// Field Arrays
	const {
		fields: reqFields,
		append: reqAppend,
		remove: reqRemove,
	} = useFieldArray({
		control: form.control,
		name: "requirements",
	});

	const {
		fields: comboGroups,
		append: comboGroupAppend,
		remove: comboGroupRemove,
	} = useFieldArray({
		control: form.control,
		name: "combination_requirements",
	});

	// Watchers
	const promoType = useWatch({ control: form.control, name: "type" });
	const reqType = useWatch({
		control: form.control,
		name: "promo_requirement",
	});
	const discountType = useWatch({
		control: form.control,
		name: "discount.type",
	});
	const startPeriod = useWatch({
		control: form.control,
		name: "start_period",
	});
	const endPeriod = useWatch({ control: form.control, name: "end_period" });

	// Prefill if editing
	React.useEffect(() => {
		if (promoId && promoQuery.data) {
			const d = promoQuery.data;
			const initialReqs = d.requirements || (d.promo_requirements as any) || [];

			let reqList: any[] = [];
			let comboList: any[] = [];

			if (d.promo_requirement === "combination") {
				// Group by group_id if available, or 2D array
				if (Array.isArray(initialReqs) && initialReqs.length > 0) {
					if (Array.isArray(initialReqs[0])) {
						comboList = (initialReqs as any).map((g: any) => ({
							items: g.map((item: any) => ({
								applicable_id: item.applicable_id,
								minimum_quantity: item.minimum_quantity,
							})),
						}));
					} else {
						// Group by group_id
						const groups: Record<string, any[]> = {};
						initialReqs.forEach((r: any) => {
							const gid = r.group_id || "group_default";
							if (!groups[gid]) groups[gid] = [];
							groups[gid].push({
								applicable_id: r.applicable_id,
								minimum_quantity: r.minimum_quantity,
							});
						});
						comboList = Object.values(groups).map((items) => ({ items }));
					}
				}
			} else {
				if (Array.isArray(initialReqs)) {
					reqList = initialReqs.map((r: any) => ({
						applicable_id: r.applicable_id,
						minimum_quantity: r.minimum_quantity,
					}));
				}
			}

			form.reset({
				name: d.name,
				type: d.type,
				promo_requirement: d.promo_requirement,
				order_type_id: d.order_type_id,
				store_ids: d.store_ids || d.stores?.map((s) => s.id) || [],
				start_period: new Date(d.start_period),
				end_period: new Date(d.end_period),
				days: d.days || DAYS_OF_WEEK.map((d) => d.value),
				requirements:
					reqList.length > 0
						? reqList
						: [{ applicable_id: "", minimum_quantity: 1 }],
				combination_requirements:
					comboList.length > 0
						? comboList
						: [
								{
									items: [
										{ applicable_id: "", minimum_quantity: 1 },
										{ applicable_id: "", minimum_quantity: 1 },
									],
								},
							],
				discount: d.discount || { type: "fixed", amount: 10000 },
				free_item: d.free_item || { menu_entry_id: "", quantity: 1 },
			});
		}
	}, [promoId, promoQuery.data, form]);

	// Auto-select first order type if available and empty
	React.useEffect(() => {
		if (
			!form.getValues("order_type_id") &&
			orderTypesQuery.data &&
			orderTypesQuery.data.length > 0
		) {
			form.setValue("order_type_id", orderTypesQuery.data[0].id);
		}
	}, [orderTypesQuery.data, form]);

	// When requirement type changes, ensure valid default arrays
	function handleRequirementTypeChange(
		newType: "item" | "category" | "combination",
	) {
		form.setValue("promo_requirement", newType);
		if (newType === "combination") {
			if (
				!form.getValues("combination_requirements") ||
				form.getValues("combination_requirements")?.length === 0
			) {
				form.setValue("combination_requirements", [
					{
						items: [
							{ applicable_id: "", minimum_quantity: 1 },
							{ applicable_id: "", minimum_quantity: 1 },
						],
					},
				]);
			}
		} else {
			if (
				!form.getValues("requirements") ||
				form.getValues("requirements")?.length === 0
			) {
				form.setValue("requirements", [
					{ applicable_id: "", minimum_quantity: 1 },
				]);
			}
		}
	}

	async function handleSubmit(_data: PromoSchema) {
		// Mock local save for UI sprint
		await queryClient.invalidateQueries({ queryKey: ["promos"] });
		finishModal.open();
	}

	function handleModalClose() {
		finishModal.close();
		delayedBack();
	}

	// Helper to lookup menu variants
	function getMenuVariants(menuId?: string) {
		if (!menuId || !menusQuery.data) return [];
		const menu = menusQuery.data.find((m) => m.id === menuId);
		return menu?.entries || [];
	}

	// Store Options for MultiSelect
	const storeOptions = React.useMemo(() => {
		return (
			storesQuery.data?.map((s) => ({
				label: s.name,
				value: s.id,
				description: s.address,
			})) || []
		);
	}, [storesQuery.data]);

	return (
		<>
			<SuccessModal
				title={`Promo Berhasil ${promoId ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menemukannya pada halaman daftar promo."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menyimpan Promo"
				message={errorMessage}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			{/* Date Range Modal */}
			<Modal
				visible={isDateModalOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsDateModalOpen(false)}
			>
				<View className="flex-1 items-center justify-center bg-black/50 p-4">
					<Card className="w-full max-w-sm gap-4 p-5">
						<Text size="body" w="bold">
							Atur Periode Promo
						</Text>
						<View className="gap-3">
							<View>
								<Text size="small" w="medium" className="mb-1 text-muted">
									Tanggal Mulai (YYYY-MM-DD)
								</Text>
								<FormInput
									fieldProps={{
										value: startPeriod?.toISOString().split("T")[0] || "",
										onChangeText: (text: string) => {
											const d = new Date(text);
											if (!isNaN(d.getTime())) form.setValue("start_period", d);
										},
									}}
									placeholder="2026-01-01"
								/>
							</View>
							<View>
								<Text size="small" w="medium" className="mb-1 text-muted">
									Tanggal Selesai (YYYY-MM-DD)
								</Text>
								<FormInput
									fieldProps={{
										value: endPeriod?.toISOString().split("T")[0] || "",
										onChangeText: (text: string) => {
											const d = new Date(text);
											if (!isNaN(d.getTime())) form.setValue("end_period", d);
										},
									}}
									placeholder="2026-06-30"
								/>
							</View>
						</View>
						<Button
							size="lg"
							className="mt-2 rounded-xl bg-primary"
							onPress={() => setIsDateModalOpen(false)}
						>
							<ButtonText>Selesai</ButtonText>
						</Button>
					</Card>
				</View>
			</Modal>

			<Wrapper className="p-4" hasActionButton>
				{promoQuery.isLoading && promoId ? (
					<LoadingPlaceholder />
				) : (
					<Form {...form}>
						<View className="gap-4">
							{/* CARD 1: INFORMASI PROMO */}
							<Card className="gap-4 p-4">
								<SectionHeader
									icon="file-text"
									title="Informasi Promo"
									subtitle="Lengkapi Informasi dasar promo anda"
								/>

								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Nama Promo</FormLabel>
											<FormControl>
												<FormInput
													placeholder="Diskon Akhir Tahun 30%"
													fieldProps={{
														value: field.value,
														onChangeText: field.onChange,
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Jenis Promo</FormLabel>
											<Select
												selectedValue={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger className="justify-between bg-zinc-100">
													<SelectInput placeholder="Pilih Jenis Promo" />
													<SelectIcon
														as={() => <Entypo name="chevron-down" size={16} />}
													/>
												</SelectTrigger>
												<SelectPortal>
													<SelectBackdrop />
													<SelectContent>
														<SelectDragIndicatorWrapper>
															<SelectDragIndicator />
														</SelectDragIndicatorWrapper>
														<SelectItem
															label="Potongan Harga"
															value="discount"
														/>
														<SelectItem
															label="Gratis Item"
															value="free_item"
														/>
													</SelectContent>
												</SelectPortal>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="order_type_id"
									render={({ field }) => (
										<FormItem>
											<View className="flex-row items-center gap-1.5">
												<FormLabel required>Tipe Pesanan</FormLabel>
												<Feather
													name="info"
													size={14}
													color={Colors.zinc[400]}
												/>
											</View>
											<Select
												selectedValue={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger className="justify-between bg-zinc-100">
													<SelectInput placeholder="Pilih Tipe Pesanan" />
													<SelectIcon
														as={() => <Entypo name="chevron-down" size={16} />}
													/>
												</SelectTrigger>
												<SelectPortal>
													<SelectBackdrop />
													<SelectContent>
														<SelectDragIndicatorWrapper>
															<SelectDragIndicator />
														</SelectDragIndicatorWrapper>
														{orderTypesQuery.data?.map((ot) => (
															<SelectItem
																key={ot.id}
																label={ot.name}
																value={ot.id}
															/>
														))}
													</SelectContent>
												</SelectPortal>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</Card>

							{/* CARD 2: TARGET TOKO */}
							<Card className="gap-4 p-4">
								<SectionHeader
									icon="shopping-bag"
									title="Target Toko"
									subtitle="Pilih toko yang akan mengikuti promo"
								/>

								<FormField
									control={form.control}
									name="store_ids"
									render={({ field }) => (
										<FormItem>
											<View className="flex-row items-center gap-1.5">
												<FormLabel required>Toko</FormLabel>
												<Feather
													name="info"
													size={14}
													color={Colors.zinc[400]}
												/>
											</View>
											<MultiSelect
												items={storeOptions}
												selectedValues={field.value || []}
												onValueChange={field.onChange}
												placeholder="Pilih toko untuk ditambahkan"
												label="Pilih Toko"
												searchPlaceholder="Cari toko..."
												itemUnit="toko"
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
							</Card>

							{/* CARD 3: SYARAT PROMO */}
							<Card className="gap-4 p-4">
								<SectionHeader
									icon="filter"
									title="Syarat Promo"
									subtitle="Pilih cara promo akan diterapkan"
								/>

								<View className="flex-row gap-2.5">
									{/* Option 1: Per Item */}
									<Pressable
										onPress={() => handleRequirementTypeChange("item")}
										className={cn(
											"flex-1 items-center justify-center rounded-xl p-3 border",
											reqType === "item"
												? "border-primary bg-blue-50/20"
												: "border-border bg-white",
										)}
									>
										<Feather
											name="package"
											size={22}
											color={
												reqType === "item" ? Colors.primary : Colors.zinc[400]
											}
										/>
										<Text
											size="small"
											w="bold"
											className={cn(
												"mt-2 text-center",
												reqType === "item" ? "text-primary" : "text-foreground",
											)}
										>
											Per Item
										</Text>
										<Text
											size="small"
											className={cn(
												"mt-0.5 text-center leading-tight",
												reqType === "item" ? "text-primary/80" : "text-muted",
											)}
										>
											Berdasarkan item tertentu
										</Text>
									</Pressable>

									{/* Option 2: Kategori */}
									<Pressable
										onPress={() => handleRequirementTypeChange("category")}
										className={cn(
											"flex-1 items-center justify-center rounded-xl p-3 border",
											reqType === "category"
												? "border-primary bg-blue-50/20"
												: "border-border bg-white",
										)}
									>
										<Feather
											name="grid"
											size={22}
											color={
												reqType === "category"
													? Colors.primary
													: Colors.zinc[400]
											}
										/>
										<Text
											size="small"
											w="bold"
											className={cn(
												"mt-2 text-center",
												reqType === "category"
													? "text-primary"
													: "text-foreground",
											)}
										>
											Kategori
										</Text>
										<Text
											size="small"
											className={cn(
												"mt-0.5 text-center leading-tight",
												reqType === "category"
													? "text-primary/80"
													: "text-muted",
											)}
										>
											Berdasarkan kategori
										</Text>
									</Pressable>

									{/* Option 3: Kombinasi */}
									<Pressable
										onPress={() => handleRequirementTypeChange("combination")}
										className={cn(
											"flex-1 items-center justify-center rounded-xl p-3 border",
											reqType === "combination"
												? "border-primary bg-blue-50/20"
												: "border-border bg-white",
										)}
									>
										<Feather
											name="link-2"
											size={22}
											color={
												reqType === "combination"
													? Colors.primary
													: Colors.zinc[400]
											}
										/>
										<Text
											size="small"
											w="bold"
											className={cn(
												"mt-2 text-center",
												reqType === "combination"
													? "text-primary"
													: "text-foreground",
											)}
										>
											Kombinasi
										</Text>
										<Text
											size="small"
											className={cn(
												"mt-0.5 text-center leading-tight",
												reqType === "combination"
													? "text-primary/80"
													: "text-muted",
											)}
										>
											Gabungan aturan
										</Text>
									</Pressable>
								</View>
							</Card>

							{/* CARD 4: DETAIL SYARAT */}
							<Card className="gap-4 p-4">
								<SectionHeader
									icon="check-square"
									title="Detail Syarat"
									subtitle="Tambahkan item dan jumlah yang menjadi syarat"
								/>

								{/* Case A: PER ITEM */}
								{reqType === "item" && (
									<View className="gap-3">
										<View className="flex-row items-center px-1">
											<Text
												size="small"
												w="medium"
												className="flex-1 text-muted"
											>
												Item
											</Text>
											<Text size="small" w="medium" className="w-24 text-muted">
												Varian
											</Text>
											<Text size="small" w="medium" className="w-16 text-muted">
												Jumlah
											</Text>
											<View className="w-10" />
										</View>

										{reqFields.map((field, index) => {
											const selectedMenuId = form.watch(
												`requirements.${index}.applicable_id`,
											);
											const variants = getMenuVariants(selectedMenuId);

											return (
												<View
													key={field.id}
													className="flex-row items-center gap-2"
												>
													{/* Item Dropdown */}
													<View className="flex-1">
														<Select
															selectedValue={selectedMenuId}
															onValueChange={(val) => {
																form.setValue(
																	`requirements.${index}.applicable_id`,
																	val,
																);
																const entries = getMenuVariants(val);
																if (entries.length > 0) {
																	form.setValue(
																		`requirements.${index}.variant_id`,
																		entries[0].id,
																	);
																}
															}}
														>
															<SelectTrigger className="h-11 justify-between bg-zinc-100">
																<SelectInput placeholder="Pilih..." />
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
																	{menusQuery.data?.map((m) => (
																		<SelectItem
																			key={m.id}
																			label={m.name}
																			value={m.id}
																		/>
																	))}
																</SelectContent>
															</SelectPortal>
														</Select>
													</View>

													{/* Variant Dropdown */}
													<View className="w-24">
														<Select
															selectedValue={form.watch(
																`requirements.${index}.variant_id`,
															)}
															onValueChange={(val) =>
																form.setValue(
																	`requirements.${index}.variant_id`,
																	val,
																)
															}
														>
															<SelectTrigger className="h-11 justify-between bg-zinc-100">
																<SelectInput placeholder="-" />
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
																	<SelectItem label="Semua Varian" value="" />
																	{variants.map((v) => (
																		<SelectItem
																			key={v.id}
																			label={v.variant_name || "Reg"}
																			value={v.id}
																		/>
																	))}
																</SelectContent>
															</SelectPortal>
														</Select>
													</View>

													{/* Jumlah Input */}
													<View className="w-16">
														<FormInput
															type="number"
															className="h-11 bg-zinc-100 text-center"
															fieldProps={{
																value: String(
																	form.watch(
																		`requirements.${index}.minimum_quantity`,
																	) ?? "",
																),
																onChangeText: (text: string) =>
																	form.setValue(
																		`requirements.${index}.minimum_quantity`,
																		Number(text) || 1,
																	),
															}}
														/>
													</View>

													{/* Delete Button */}
													<Pressable
														onPress={() => {
															if (reqFields.length > 1) reqRemove(index);
														}}
														className="size-11 items-center justify-center rounded-xl bg-red-50 active:bg-red-100"
													>
														<Feather
															name="trash-2"
															size={16}
															color={Colors.red[500]}
														/>
													</Pressable>
												</View>
											);
										})}

										<Button
											variant="outline"
											size="lg"
											className="mt-2 rounded-xl border-dashed border-primary bg-blue-50/10"
											onPress={() =>
												reqAppend({ applicable_id: "", minimum_quantity: 1 })
											}
										>
											<Feather
												name="plus"
												size={16}
												color={Colors.primary}
												style={{ marginRight: 6 }}
											/>
											<ButtonText className="text-primary font-semibold">
												Tambah Item
											</ButtonText>
										</Button>
									</View>
								)}

								{/* Case B: KATEGORI */}
								{reqType === "category" && (
									<View className="gap-3">
										<View className="flex-row items-center px-1">
											<Text
												size="small"
												w="medium"
												className="flex-1 text-muted"
											>
												Kategori
											</Text>
											<Text size="small" w="medium" className="w-20 text-muted">
												Jumlah
											</Text>
											<View className="w-10" />
										</View>

										{reqFields.map((field, index) => (
											<View
												key={field.id}
												className="flex-row items-center gap-2"
											>
												{/* Category Dropdown */}
												<View className="flex-1">
													<Select
														selectedValue={form.watch(
															`requirements.${index}.applicable_id`,
														)}
														onValueChange={(val) =>
															form.setValue(
																`requirements.${index}.applicable_id`,
																val,
															)
														}
													>
														<SelectTrigger className="h-11 justify-between bg-zinc-100">
															<SelectInput placeholder="Pilih Kategori..." />
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
																{categoriesQuery.data?.map((c) => (
																	<SelectItem
																		key={c.id}
																		label={c.name}
																		value={c.id}
																	/>
																))}
															</SelectContent>
														</SelectPortal>
													</Select>
												</View>

												{/* Jumlah Input */}
												<View className="w-20">
													<FormInput
														type="number"
														className="h-11 bg-zinc-100 text-center"
														fieldProps={{
															value: String(
																form.watch(
																	`requirements.${index}.minimum_quantity`,
																) ?? "",
															),
															onChangeText: (text: string) =>
																form.setValue(
																	`requirements.${index}.minimum_quantity`,
																	Number(text) || 1,
																),
														}}
													/>
												</View>

												{/* Delete Button */}
												<Pressable
													onPress={() => {
														if (reqFields.length > 1) reqRemove(index);
													}}
													className="size-11 items-center justify-center rounded-xl bg-red-50 active:bg-red-100"
												>
													<Feather
														name="trash-2"
														size={16}
														color={Colors.red[500]}
													/>
												</Pressable>
											</View>
										))}

										<Button
											variant="outline"
											size="lg"
											className="mt-2 rounded-xl border-dashed border-primary bg-blue-50/10"
											onPress={() =>
												reqAppend({ applicable_id: "", minimum_quantity: 1 })
											}
										>
											<Feather
												name="plus"
												size={16}
												color={Colors.primary}
												style={{ marginRight: 6 }}
											/>
											<ButtonText className="text-primary font-semibold">
												Tambah Kategori
											</ButtonText>
										</Button>
									</View>
								)}

								{/* Case C: KOMBINASI */}
								{reqType === "combination" && (
									<View className="gap-3">
										{comboGroups.map((group, groupIdx) => {
											const groupItems =
												form.watch(
													`combination_requirements.${groupIdx}.items`,
												) || [];

											return (
												<View
													key={group.id}
													className="rounded-xl border border-border bg-blue-50/30 p-3.5"
												>
													<View className="mb-2 flex-row items-center justify-between">
														<Text
															size="normal"
															w="bold"
															className="text-primary"
														>
															Kombinasi {groupIdx + 1}
														</Text>
														{comboGroups.length > 1 && (
															<Pressable
																onPress={() => comboGroupRemove(groupIdx)}
																className="size-8 items-center justify-center rounded-lg bg-red-50"
															>
																<Feather
																	name="trash-2"
																	size={14}
																	color={Colors.red[500]}
																/>
															</Pressable>
														)}
													</View>

													<View className="mb-1 flex-row items-center px-1">
														<Text
															size="small"
															w="medium"
															className="flex-1 text-muted"
														>
															Item
														</Text>
														<Text
															size="small"
															w="medium"
															className="w-20 text-muted"
														>
															Jumlah
														</Text>
														<View className="w-8" />
													</View>

													<View className="gap-2">
														{groupItems.map((_, itemIdx) => (
															<View
																key={itemIdx}
																className="flex-row items-center gap-2"
															>
																<View className="flex-1">
																	<Select
																		selectedValue={form.watch(
																			`combination_requirements.${groupIdx}.items.${itemIdx}.applicable_id`,
																		)}
																		onValueChange={(val) =>
																			form.setValue(
																				`combination_requirements.${groupIdx}.items.${itemIdx}.applicable_id`,
																				val,
																			)
																		}
																	>
																		<SelectTrigger className="h-10 justify-between bg-white">
																			<SelectInput placeholder="Pilih Menu" />
																			<SelectIcon
																				as={() => (
																					<Entypo
																						name="chevron-down"
																						size={14}
																					/>
																				)}
																			/>
																		</SelectTrigger>
																		<SelectPortal>
																			<SelectBackdrop />
																			<SelectContent>
																				<SelectDragIndicatorWrapper>
																					<SelectDragIndicator />
																				</SelectDragIndicatorWrapper>
																				{menusQuery.data?.map((m) => (
																					<SelectItem
																						key={m.id}
																						label={m.name}
																						value={m.id}
																					/>
																				))}
																			</SelectContent>
																		</SelectPortal>
																	</Select>
																</View>

																<View className="w-20">
																	<FormInput
																		type="number"
																		className="h-10 bg-white text-center"
																		fieldProps={{
																			value: String(
																				form.watch(
																					`combination_requirements.${groupIdx}.items.${itemIdx}.minimum_quantity`,
																				) ?? "",
																			),
																			onChangeText: (text: string) =>
																				form.setValue(
																					`combination_requirements.${groupIdx}.items.${itemIdx}.minimum_quantity`,
																					Number(text) || 1,
																				),
																		}}
																	/>
																</View>

																{groupItems.length > 1 && (
																	<Pressable
																		onPress={() => {
																			const updated = [...groupItems];
																			updated.splice(itemIdx, 1);
																			form.setValue(
												`combination_requirements.${groupIdx}.items`,
												updated,
																			);
																		}}
																		className="size-8 items-center justify-center rounded-lg bg-red-50"
																	>
																		<Feather
																			name="minus"
																			size={14}
																			color={Colors.red[500]}
																		/>
																	</Pressable>
																)}
															</View>
														))}

														<Button
															variant="outline"
															size="sm"
															className="mt-1 h-9 rounded-lg border-dashed border-primary bg-white"
															onPress={() => {
																form.setValue(
																	`combination_requirements.${groupIdx}.items`,
																	[
																		...groupItems,
																		{
																			applicable_id: "",
																			minimum_quantity: 1,
																		},
																	],
																);
															}}
														>
															<ButtonText className="text-xs text-primary font-semibold">
																+ Tambah Item ke Kombinasi
															</ButtonText>
														</Button>
													</View>
												</View>
											);
										})}

										<Button
											variant="outline"
											size="lg"
											className="mt-1 rounded-xl border-dashed border-primary bg-blue-50/10"
											onPress={() =>
												comboGroupAppend({
													items: [
														{ applicable_id: "", minimum_quantity: 1 },
														{ applicable_id: "", minimum_quantity: 1 },
													],
												})
											}
										>
											<Feather
												name="plus"
												size={16}
												color={Colors.primary}
												style={{ marginRight: 6 }}
											/>
											<ButtonText className="text-primary font-semibold">
												Tambah Kombinasi
											</ButtonText>
										</Button>
									</View>
								)}
							</Card>

							{/* CARD 5: BENEFIT PROMO */}
							<Card className="gap-4 p-4">
								<SectionHeader
									icon="gift"
									title="Benefit Promo"
									subtitle="Tentukan yang akan diberikan"
								/>

								{promoType === "discount" ? (
									<View className="gap-4">
										<FormField
											control={form.control}
											name="discount.type"
											render={({ field }) => (
												<FormItem>
													<FormLabel required>Jenis Potongan Harga</FormLabel>
													<Select
														selectedValue={field.value}
														onValueChange={field.onChange}
													>
														<SelectTrigger className="justify-between bg-zinc-100">
															<SelectInput placeholder="Pilih Jenis Potongan" />
															<SelectIcon
																as={() => (
																	<Entypo name="chevron-down" size={16} />
																)}
															/>
														</SelectTrigger>
														<SelectPortal>
															<SelectBackdrop />
															<SelectContent>
																<SelectDragIndicatorWrapper>
																	<SelectDragIndicator />
																</SelectDragIndicatorWrapper>
																<SelectItem
																	label="Nominal Rupiah (Rp)"
																	value="fixed"
																/>
																<SelectItem
																	label="Diskon Persen (%)"
																	value="percentage"
																/>
															</SelectContent>
														</SelectPortal>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="discount.amount"
											render={({ field }) => (
												<FormItem>
													<FormLabel required>
														Jumlah Diskon (
														{discountType === "percentage" ? "%" : "Rp"})
													</FormLabel>
													<FormControl>
														<FormInput
															type="number"
															placeholder={
																discountType === "percentage"
																	? "10"
																	: "Rp 10.000"
															}
															fieldProps={{
																value: field.value ? String(field.value) : "",
																onChangeText: (text: string) =>
																	field.onChange(Number(text) || 0),
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</View>
								) : (
									<View className="gap-3">
										<View className="flex-row items-center px-1">
											<Text
												size="small"
												w="medium"
												className="flex-1 text-muted"
											>
												Item
											</Text>
											<Text size="small" w="medium" className="w-20 text-muted">
												Jumlah
											</Text>
											<View className="w-10" />
										</View>

										<View className="flex-row items-center gap-2">
											<View className="flex-1">
												<Select
													selectedValue={
														menusQuery.data?.find((m) =>
															m.entries.some(
																(e) =>
																	e.id ===
																	form.watch("free_item.menu_entry_id"),
															),
														)?.id
													}
													onValueChange={(menuId) => {
														const menu = menusQuery.data?.find(
															(m) => m.id === menuId,
														);
														if (menu && menu.entries.length > 0) {
															form.setValue(
																"free_item.menu_entry_id",
																menu.entries[0].id,
															);
														}
													}}
												>
													<SelectTrigger className="h-11 justify-between bg-zinc-100">
														<SelectInput placeholder="Pilih Menu Gratis" />
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
															{menusQuery.data?.map((m) => (
																<SelectItem
																	key={m.id}
																	label={m.name}
																	value={m.id}
																/>
															))}
														</SelectContent>
													</SelectPortal>
												</Select>
											</View>

											<View className="w-20">
												<FormInput
													type="number"
													className="h-11 bg-zinc-100 text-center"
													fieldProps={{
														value: String(
															form.watch("free_item.quantity") ?? "",
														),
														onChangeText: (text: string) =>
															form.setValue(
																"free_item.quantity",
																Number(text) || 1,
															),
													}}
												/>
											</View>

											<Pressable
												onPress={() =>
													form.setValue("free_item", {
														menu_entry_id: "",
														quantity: 1,
													})
												}
												className="size-11 items-center justify-center rounded-xl bg-red-50 active:bg-red-100"
											>
												<Feather
													name="trash-2"
													size={16}
													color={Colors.red[500]}
												/>
											</Pressable>
										</View>
									</View>
								)}
							</Card>

							{/* CARD 6: PERIODE PROMO */}
							<Card className="gap-4 p-4">
								<SectionHeader
									icon="calendar"
									title="Periode Promo"
									subtitle="Periode berlangsungnya promo"
								/>

								<View>
									<FormLabel required>Periode Diskon</FormLabel>
									<Pressable
										onPress={() => setIsDateModalOpen(true)}
										className="mt-1 h-11 flex-row items-center justify-between rounded-lg bg-zinc-100 px-3"
									>
										<Text size="normal" className="text-foreground">
											{formatDatePeriod(
												startPeriod.toISOString(),
												endPeriod.toISOString(),
											)}
										</Text>
										<Feather
											name="calendar"
											size={18}
											color={Colors.primary}
										/>
									</Pressable>
								</View>

								<FormField
									control={form.control}
									name="days"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Hari Berlaku</FormLabel>
											<MultiSelect
												items={DAYS_OF_WEEK}
												selectedValues={field.value || []}
												onValueChange={field.onChange}
												placeholder="Pilih hari berlaku"
												label="Pilih Hari"
												searchPlaceholder="Cari hari..."
												itemUnit="hari"
											/>
										</FormItem>
									)}
								/>
							</Card>

							{/* Bottom Action Button */}
							<Button
								size="xl"
								className="mt-2 h-12 rounded-xl bg-primary"
								onPress={form.handleSubmit(handleSubmit)}
							>
								<ButtonText className="text-base font-semibold text-white">
									Simpan
								</ButtonText>
							</Button>
						</View>
					</Form>
				)}
			</Wrapper>
		</>
	);
}
