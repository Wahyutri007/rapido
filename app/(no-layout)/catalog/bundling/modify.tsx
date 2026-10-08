import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Modal, Pressable, Switch, View } from "react-native";
import {
	useBundlingQuery,
	useBundlingRequest,
	useBundlingUpdateRequest,
} from "@/api/hooks/bundlings";
import { useMenusQuery } from "@/api/hooks/menus";
import { useOrderTypesQuery } from "@/api/hooks/order-types";
import { useStoresQuery } from "@/api/hooks/stores";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import {
	Form,
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import ImageUploader from "@/components/common/ImageUploader";
import { MultiSelect } from "@/components/common/MultiSelect";
import SingleSelect from "@/components/common/SingleSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import CatalogDetailNotice from "@/components/feature/catalog/CatalogDetailNotice";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { MOCK_BUNDLING_DATA } from "@/constants/data/bundling";
import {
	type BundlingFormInput,
	type BundlingSchema,
	bundlingSchema,
} from "@/schema/add/bundling";

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

const DEFAULT_ORDER_TYPES = [
	{
		id: "ot-takeaway",
		name: "Take Away",
		icon: "shopping-bag" as const,
		defaultPrice: 40000,
	},
	{
		id: "ot-dinein",
		name: "Dine In",
		icon: "coffee" as const,
		defaultPrice: 44000,
	},
	{
		id: "ot-online",
		name: "Online Food",
		icon: "truck" as const,
		defaultPrice: 54000,
	},
];

const DEFAULT_MENUS = [
	{ id: "m-1", name: "Nasi Goreng", variants: ["Pedas", "Kampung", "Biasa"] },
	{ id: "m-2", name: "Ayam Bakar", variants: ["Manis", "Pedas"] },
	{ id: "m-3", name: "Es Teh Manis", variants: ["Dingin", "Hangat"] },
	{ id: "m-4", name: "Kopi Susu", variants: ["Reguler", "Less Sugar"] },
];

function formatDateDisplay(start?: Date | string, end?: Date | string) {
	if (!start || !end) return "Pilih periode paket";
	const s = new Date(start);
	const e = new Date(end);
	if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()))
		return "Pilih periode paket";
	return `${s.getDate()}/${s.getMonth() + 1}/${s.getFullYear()} - ${e.getDate()}/${e.getMonth() + 1}/${e.getFullYear()}`;
}

export default function ModifyBundlingScreen() {
	const params = useLocalSearchParams();
	const bundlingId = params?.id as string | undefined;

	const bundlingQuery = useBundlingQuery(bundlingId);
	const bundlingAddRequest = useBundlingRequest();
	const bundlingUpdateRequest = useBundlingUpdateRequest(undefined, bundlingId);

	const storesQuery = useStoresQuery();
	const menusQuery = useMenusQuery();
	const orderTypesQuery = useOrderTypesQuery();
	const queryClient = useQueryClient();

	const [isDateModalOpen, setIsDateModalOpen] = React.useState(false);

	const finishModal = useAlertModal();
	const errorModal = useAlertModal();

	const form = useForm<BundlingFormInput, unknown, BundlingSchema>({
		resolver: zodResolver(bundlingSchema),
		defaultValues: {
			name: "",
			store_ids: [],
			image: null,
			start_period: new Date(2024, 0, 1),
			end_period: new Date(2024, 5, 1),
			has_price_variation: true,
			sell_price: 40000,
			prices: DEFAULT_ORDER_TYPES.map((ot) => ({
				order_type_id: ot.id,
				sell_price: ot.defaultPrice,
			})),
			details: [
				{
					menu_id: "m-1",
					variant_name: "Pedas",
					quantity: 3,
				},
				{
					menu_id: "m-1",
					variant_name: "Kampung",
					quantity: 2,
				},
			],
		},
	});

	const {
		fields: detailFields,
		append: appendDetail,
		remove: removeDetail,
	} = useFieldArray({
		control: form.control,
		name: "details",
	});

	const hasPriceVariation = useWatch({
		control: form.control,
		name: "has_price_variation",
	});

	const startPeriod = useWatch({
		control: form.control,
		name: "start_period",
	});

	const endPeriod = useWatch({
		control: form.control,
		name: "end_period",
	});

	// Populate form when editing
	React.useEffect(() => {
		if (bundlingId) {
			const data =
				bundlingQuery.data ??
				MOCK_BUNDLING_DATA.find((item) => item.id === bundlingId);

			if (data) {
				form.reset({
					name: data.name,
					store_ids: data.store_ids || (data.stores?.map((s) => s.id) ?? []),
					image: data.image || null,
					start_period: data.start_period
						? new Date(data.start_period)
						: new Date(),
					end_period: data.end_period ? new Date(data.end_period) : new Date(),
					has_price_variation: data.has_price_variation ?? true,
					sell_price: data.sell_price ?? 40000,
					prices:
						data.prices && data.prices.length > 0
							? data.prices.map((p) => ({
									order_type_id: p.order_type_id,
									sell_price: p.sell_price,
								}))
							: DEFAULT_ORDER_TYPES.map((ot) => ({
									order_type_id: ot.id,
									sell_price: ot.defaultPrice,
								})),
					details:
						data.details && data.details.length > 0
							? data.details.map((d) => ({
									menu_id: d.menu_id,
									variant_name: d.variant_name || "Biasa",
									quantity: d.quantity || 1,
								}))
							: [
									{
										menu_id: "m-1",
										variant_name: "Pedas",
										quantity: 3,
									},
								],
				});
			}
		}
	}, [bundlingId, bundlingQuery.data, form.reset]);

	// Resolved Options
	const storeOptions = React.useMemo(() => {
		if (storesQuery.data && storesQuery.data.length > 0) {
			return storesQuery.data.map((s) => ({
				label: s.name,
				value: s.id,
			}));
		}
		return [
			{ label: "Warung Jul Panam", value: "store-1" },
			{ label: "Depot Sari Rasa", value: "store-2" },
			{ label: "Kopi Luwak Express", value: "store-3" },
			{ label: "Nasi Goreng Pak Didi", value: "store-4" },
		];
	}, [storesQuery.data]);

	const availableMenus = React.useMemo(() => {
		if (menusQuery.data && menusQuery.data.length > 0) {
			return menusQuery.data.map((m) => {
				const variants =
					m.entries && m.entries.length > 0
						? m.entries.map((e) => e.variant_name).filter(Boolean)
						: ["Reguler"];
				return {
					id: m.id,
					name: m.name,
					variants: variants.length > 0 ? variants : ["Reguler"],
				};
			});
		}
		return DEFAULT_MENUS;
	}, [menusQuery.data]);

	const resolvedOrderTypes = React.useMemo(() => {
		if (orderTypesQuery.data && orderTypesQuery.data.length > 0) {
			return orderTypesQuery.data.map((ot) => {
				const lower = ot.name.toLowerCase();
				let icon: keyof typeof Feather.glyphMap = "shopping-bag";
				if (lower.includes("dine") || lower.includes("makan")) icon = "coffee";
				else if (lower.includes("online") || lower.includes("delivery"))
					icon = "truck";
				return {
					id: ot.id,
					name: ot.name,
					icon,
					defaultPrice: 40000,
				};
			});
		}
		return DEFAULT_ORDER_TYPES;
	}, [orderTypesQuery.data]);

	async function handleSubmit(data: BundlingSchema) {
		let error = null;

		if (bundlingId) {
			[, error] = await bundlingUpdateRequest.call(data);
		} else {
			[, error] = await bundlingAddRequest.call(data);
		}

		if (error) {
			errorModal.open();
			return;
		}

		await queryClient.invalidateQueries({ queryKey: ["bundlings"] });
		if (bundlingId) {
			await queryClient.invalidateQueries({
				queryKey: ["bundlings", bundlingId],
			});
		}

		finishModal.open();
	}

	function handleModalClose() {
		finishModal.close();
		delayedBack();
	}

	const isSubmitting =
		bundlingAddRequest.isLoading || bundlingUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Paket Berhasil ${bundlingId ? "Diubah!" : "Ditambahkan!"}`}
				description="Kamu akan menemukannya pada halaman daftar paket."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${bundlingId ? "Mengubah" : "Menambahkan"} Paket`}
				message="Terjadi kesalahan saat menyimpan data paket. Silakan coba lagi."
				hideCancelButton
				confirmText="Tutup"
				onClose={errorModal.close}
				openState={errorModal.openState}
			/>

			{/* Date Period Edit Modal */}
			<Modal
				visible={isDateModalOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsDateModalOpen(false)}
			>
				<View className="flex-1 items-center justify-center bg-black/50 px-4">
					<Card className="w-full max-w-sm gap-4 p-5">
						<Text size="body" w="bold" className="text-foreground">
							Atur Periode Paket
						</Text>
						<View className="gap-3">
							<View>
								<Text size="small" w="medium" className="mb-1 text-muted">
									Tanggal Mulai (YYYY-MM-DD)
								</Text>
								<FormInput
									fieldProps={{
										value:
											startPeriod instanceof Date
												? startPeriod.toISOString().split("T")[0]
												: "",
										onChangeText: (text: string) => {
											const d = new Date(text);
											if (!Number.isNaN(d.getTime()))
												form.setValue("start_period", d);
										},
									}}
									placeholder="2024-01-01"
								/>
							</View>
							<View>
								<Text size="small" w="medium" className="mb-1 text-muted">
									Tanggal Selesai (YYYY-MM-DD)
								</Text>
								<FormInput
									fieldProps={{
										value:
											endPeriod instanceof Date
												? endPeriod.toISOString().split("T")[0]
												: "",
										onChangeText: (text: string) => {
											const d = new Date(text);
											if (!Number.isNaN(d.getTime()))
												form.setValue("end_period", d);
										},
									}}
									placeholder="2024-06-01"
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
				<Form {...form}>
					<View className="gap-4 pb-24">
						{/* CARD 1: INFORMASI BUNDLING */}
						<Card className="gap-4 p-4">
							<SectionHeader
								icon="file-text"
								title="Informasi Bundling"
								subtitle="Lengkapi Informasi dasar bundling anda"
							/>

							{/* Toko MultiSelect */}
							<FormField
								control={form.control}
								name="store_ids"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Toko</FormLabel>
										<FormControl>
											<MultiSelect
												items={storeOptions}
												selectedValues={field.value || []}
												onValueChange={field.onChange}
												placeholder="Pilih toko"
												label="Pilih Toko"
												itemUnit="toko"
												variant="outline"
												className="bg-white"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Blue info notice */}
							<CatalogDetailNotice
								message="Pilih satu atau lebih toko yang termasuk di kategori ini"
								icon="info"
							/>

							{/* Gambar Paket */}
							<FormField
								control={form.control}
								name="image"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Gambar Paket</FormLabel>
										<FormControl>
											<ImageUploader
												value={field.value}
												onChange={field.onChange}
												title="Klik untuk upload gambar"
												subtitle="PNG, JPG maks. 2MB"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Nama Paket */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel required>Nama Paket</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Paket Ramadhan"
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

							{/* Periode Paket */}
							<FormItem>
								<FormLabel required>Periode Paket</FormLabel>
								<Pressable
									onPress={() => setIsDateModalOpen(true)}
									className="h-11 flex-row items-center justify-between rounded-lg border border-zinc-200 bg-white px-3"
								>
									<Text size="normal" className="text-foreground">
										{formatDateDisplay(startPeriod, endPeriod)}
									</Text>
									<Feather name="calendar" size={18} color={Colors.primary} />
								</Pressable>
							</FormItem>
						</Card>

						{/* CARD 2: ITEM BUNDLING */}
						<Card className="gap-4 p-4">
							<SectionHeader
								icon="box"
								title="Item Bundling"
								subtitle="Tambahkan item yang termasuk dalam paket ini"
							/>

							<View className="gap-3">
								{detailFields.map((fieldItem, index) => {
									const selectedMenuId = form.watch(`details.${index}.menu_id`);
									const currentMenu = availableMenus.find(
										(m) => m.id === selectedMenuId,
									);
									const variantOptions = (
										currentMenu?.variants || ["Biasa"]
									).map((v) => ({
										label: v,
										value: v,
									}));

									return (
										<View
											key={fieldItem.id}
											className="overflow-hidden rounded-xl border border-border bg-white"
										>
											{/* Sub-card header */}
											<View className="flex-row items-center justify-between bg-primary-100 px-3.5 py-2.5">
												<Text
													w="semibold"
													size="normal"
													className="text-primary"
												>
													Item {index + 1}
												</Text>
												{detailFields.length > 1 && (
													<Pressable
														onPress={() => removeDetail(index)}
														hitSlop={8}
														className="size-7 items-center justify-center rounded-lg bg-red-50 active:bg-red-100"
													>
														<Feather
															name="trash-2"
															size={14}
															className="text-destructive"
														/>
													</Pressable>
												)}
											</View>

											{/* Sub-card fields */}
											<View className="gap-3 p-3">
												{/* Pilih Item */}
												<FormField
													control={form.control}
													name={`details.${index}.menu_id`}
													render={({ field }) => (
														<FormItem>
															<FormLabel required>Pilih Item</FormLabel>
															<FormControl>
																<SingleSelect
																	items={availableMenus.map((m) => ({
																		label: m.name,
																		value: m.id,
																	}))}
																	value={field.value}
																	onValueChange={(val) => {
																		field.onChange(val);
																		const menuObj = availableMenus.find(
																			(m) => m.id === val,
																		);
																		if (menuObj?.variants?.[0]) {
																			form.setValue(
																				`details.${index}.variant_name`,
																				menuObj.variants[0],
																			);
																		}
																	}}
																	placeholder="Pilih item menu"
																	label="Pilih Menu"
																	variant="outline"
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												{/* Row: Varian & Jumlah */}
												<View className="flex-row gap-3">
													<View className="flex-1">
														<FormField
															control={form.control}
															name={`details.${index}.variant_name`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Varian</FormLabel>
																	<FormControl>
																		<SingleSelect
																			items={variantOptions}
																			value={field.value}
																			onValueChange={field.onChange}
																			placeholder="Pilih varian"
																			label="Pilih Varian"
																			variant="outline"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</View>

													<View className="w-28">
														<FormField
															control={form.control}
															name={`details.${index}.quantity`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel required>Jumlah</FormLabel>
																	<FormControl>
																		<FormInput
																			placeholder="1"
																			fieldProps={{
																				keyboardType: "numeric",
																				value: field.value?.toString() || "",
																				onChangeText: (text: string) =>
																					field.onChange(
																						Number.parseInt(text, 10) || 1,
																					),
																			}}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</View>
												</View>
											</View>
										</View>
									);
								})}

								{/* Tambah Item button */}
								<Pressable
									onPress={() =>
										appendDetail({
											menu_id: availableMenus[0]?.id || "m-1",
											variant_name: availableMenus[0]?.variants?.[0] || "Biasa",
											quantity: 1,
										})
									}
									className="flex-row items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary bg-primary-50/40 py-3 active:bg-primary-50"
								>
									<Feather name="plus" size={16} color={Colors.primary} />
									<Text w="semibold" size="normal" className="text-primary">
										Tambah Item
									</Text>
								</Pressable>
							</View>
						</Card>

						{/* CARD 3: PENGATURAN HARGA */}
						<Card className="gap-4 p-4">
							<SectionHeader
								icon="tag"
								title="Pengaturan Harga"
								subtitle="Atur harga bundling dan opsi multi price"
							/>

							{/* Switch Variasi Harga */}
							<View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
								<View className="flex-1 pr-4">
									<Text w="semibold" size="normal" className="text-foreground">
										Variasi Harga
									</Text>
									<Text size="small" className="text-muted">
										Aktifkan untuk pengaturan harga berbeda di setiap tipe
										pesanan
									</Text>
								</View>
								<Switch
									value={hasPriceVariation}
									onValueChange={(val) =>
										form.setValue("has_price_variation", val)
									}
									trackColor={{ false: "#d1d5db", true: Colors.primary }}
								/>
							</View>

							{/* Prices per Order Type */}
							{hasPriceVariation ? (
								<View className="gap-3">
									{resolvedOrderTypes.map((ot, idx) => {
										return (
											<View
												key={ot.id}
												className="flex-row items-center justify-between gap-3"
											>
												<View className="flex-1 flex-row items-center gap-2.5">
													<View className="size-9 items-center justify-center rounded-xl bg-primary-50">
														<Feather
															name={ot.icon}
															size={16}
															color={Colors.primary}
														/>
													</View>
													<Text
														w="medium"
														size="normal"
														className="text-foreground"
													>
														{ot.name}
													</Text>
												</View>

												<View className="w-40">
													<FormInput
														placeholder="Rp0"
														fieldProps={{
															keyboardType: "numeric",
															value:
																form.watch(`prices.${idx}.sell_price`) !==
																undefined
																	? `Rp${(
																			form.watch(`prices.${idx}.sell_price`) ||
																				0
																		).toLocaleString("id-ID")}`
																	: "",
															onChangeText: (text: string) => {
																const rawNum =
																	Number.parseInt(
																		text.replace(/[^0-9]/g, ""),
																		10,
																	) || 0;
																form.setValue(
																	`prices.${idx}.order_type_id`,
																	ot.id,
																);
																form.setValue(
																	`prices.${idx}.sell_price`,
																	rawNum,
																);
															},
														}}
													/>
												</View>
											</View>
										);
									})}
								</View>
							) : (
								<FormField
									control={form.control}
									name="sell_price"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Harga Jual</FormLabel>
											<FormControl>
												<FormInput
													placeholder="Rp0"
													fieldProps={{
														keyboardType: "numeric",
														value:
															field.value !== undefined
																? `Rp${(field.value || 0).toLocaleString("id-ID")}`
																: "",
														onChangeText: (text: string) => {
															const rawNum =
																Number.parseInt(
																	text.replace(/[^0-9]/g, ""),
																	10,
																) || 0;
															field.onChange(rawNum);
														},
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</Card>
					</View>
				</Form>
			</Wrapper>

			<BottomActionButton
				isLoading={isSubmitting}
				onPress={form.handleSubmit(handleSubmit)}
			>
				Simpan
			</BottomActionButton>
		</>
	);
}
