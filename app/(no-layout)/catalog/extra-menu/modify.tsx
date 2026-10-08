import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useExtraMenuQuery,
	useExtraMenuRequest,
	useExtraMenuUpdateRequest,
} from "@/api/hooks/extra-menus";
import { useMenusQuery } from "@/api/hooks/menus";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/common/Form";
import { MultiSelect } from "@/components/common/MultiSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import CatalogDetailNotice from "@/components/feature/catalog/CatalogDetailNotice";
import { Input, InputField } from "@/components/ui/input";
import { Colors } from "@/constants/Colors";
import { MOCK_EXTRA_MENU_DATA } from "@/constants/data/extra-menu";
import { formatRp, parseNumber } from "@/lib/utils";
import { type ExtraMenuSchema, extraMenuSchema } from "@/schema/add/extra-menu";

export default function ModifyExtraMenuScreen() {
	const params = useLocalSearchParams();
	const extraMenuId = params?.id as string | undefined;

	const extraMenuQuery = useExtraMenuQuery(extraMenuId);
	const menusQuery = useMenusQuery();
	const extraMenuAddRequest = useExtraMenuRequest();
	const extraMenuUpdateRequest = useExtraMenuUpdateRequest(
		undefined,
		extraMenuId,
	);
	const queryClient = useQueryClient();

	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan menu tambahan. Silakan coba lagi.",
	);

	const form = useForm<ExtraMenuSchema>({
		resolver: zodResolver(extraMenuSchema),
		defaultValues: {
			name: "",
			details: [
				{
					name: "",
					price: 0,
				},
			],
			menu_ids: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "details",
	});

	// Populate form when editing
	React.useEffect(() => {
		if (!extraMenuId) return;

		let data = extraMenuQuery.data;
		if (!data) {
			data = MOCK_EXTRA_MENU_DATA.find((m) => m.id === extraMenuId);
		}

		if (data) {
			form.reset({
				name: data.name,
				details:
					data.details?.length > 0
						? data.details.map((d) => ({
								name: d.name,
								price: d.price,
							}))
						: [{ name: "", price: 0 }],
				menu_ids: data.menus?.map((m) => m.id) ?? data.menu_ids ?? [],
			});
		} else if (extraMenuQuery.isError) {
			router.back();
		}
	}, [extraMenuId, extraMenuQuery.data, extraMenuQuery.isError, form]);

	async function handleSubmit(data: ExtraMenuSchema) {
		let error: any;

		if (extraMenuId) {
			const [_, err] = await extraMenuUpdateRequest.call(data);
			error = err;
		} else {
			const [_, err] = await extraMenuAddRequest.call(data);
			error = err;
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan menu tambahan. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		const invalidations = [
			queryClient.invalidateQueries({ queryKey: ["extra-menus"] }),
		];

		if (extraMenuId) {
			invalidations.push(
				queryClient.invalidateQueries({
					queryKey: ["extra-menus", extraMenuId],
				}),
			);
		}

		await Promise.allSettled(invalidations);
		finishModal.close();
		delayedBack();
	}

	const menuItems = React.useMemo(() => {
		return (
			menusQuery.data?.map((m) => ({
				label: m.name,
				value: m.id,
			})) ?? []
		);
	}, [menusQuery.data]);

	const isSubmitting =
		extraMenuAddRequest.isLoading || extraMenuUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Ekstra Berhasil ${extraMenuId ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menemukannya pada halaman tambahan."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${extraMenuId ? "Mengubah" : "Menambahkan"} Ekstra`}
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{extraMenuQuery.isEnabled && extraMenuQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<Form {...form}>
						<View className="gap-4">
							{/* Card 1: Nama Grup Tambahan */}
							<Card className="p-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel required>Nama Grup Tambahan</FormLabel>
											<FormControl>
												<Input
													variant="outline"
													size="xl"
													className="h-11 rounded-lg border border-zinc-200 bg-white px-3"
												>
													<InputField
														placeholder="Topping"
														placeholderTextColor={Colors.zinc[400]}
														value={field.value}
														onChangeText={field.onChange}
													/>
												</Input>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</Card>

							{/* Card 2: Pilihan & Harga */}
							<View className="gap-2">
								<Text
									size="normal"
									w="semibold"
									className="px-1 text-foreground"
								>
									Pilihan & Harga <Text className="text-red-500">*</Text>
								</Text>

								<Card className="gap-3 p-4">
									{fields.map((item, index) => (
										<View key={item.id} className="flex-row items-center gap-2">
											{/* Name Input */}
											<View className="flex-1">
												<FormField
													control={form.control}
													name={`details.${index}.name`}
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<Input
																	variant="outline"
																	size="xl"
																	className="h-11 rounded-lg border border-zinc-200 bg-white px-3"
																>
																	<InputField
																		placeholder="Dadar"
																		placeholderTextColor={Colors.zinc[400]}
																		value={field.value}
																		onChangeText={field.onChange}
																	/>
																</Input>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</View>

											{/* Price Input */}
											<View className="flex-1">
												<FormField
													control={form.control}
													name={`details.${index}.price`}
													render={({ field }) => (
														<FormItem>
															<FormControl>
																<Input
																	variant="outline"
																	size="xl"
																	className="h-11 rounded-lg border border-zinc-200 bg-white px-3"
																>
																	<InputField
																		placeholder="Rp0"
																		placeholderTextColor={Colors.zinc[400]}
																		keyboardType="numeric"
																		value={
																			field.value !== undefined &&
																			field.value !== null &&
																			field.value !== 0
																				? formatRp(field.value)
																				: ""
																		}
																		onChangeText={(text) => {
																			const num = parseNumber(text);
																			field.onChange(num);
																		}}
																	/>
																</Input>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</View>

											{/* Delete button */}
											<Pressable
												onPress={() => {
													if (fields.length > 1) {
														remove(index);
													}
												}}
												className="size-11 items-center justify-center rounded-lg bg-red-50 active:bg-red-100"
											>
												<Feather name="trash-2" size={18} color="#ef4444" />
											</Pressable>
										</View>
									))}

									{/* Tambah Ekstra Button */}
									<Pressable
										onPress={() => append({ name: "", price: 0 })}
										className="mt-1 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-primary bg-primary-50/50 py-3.5 active:bg-primary-100/50"
									>
										<Feather name="plus" size={16} color={Colors.primary} />
										<Text w="semibold" size="normal" className="text-primary">
											Tambah Ekstra
										</Text>
									</Pressable>

									<FormField
										control={form.control}
										name="details"
										render={() => <FormMessage />}
									/>
								</Card>
							</View>

							{/* Card 3: Pilih Item */}
							<Card className="gap-3 p-4">
								<FormField
									control={form.control}
									name="menu_ids"
									render={({ field }) => (
										<FormItem className="gap-2">
											<FormLabel>Pilih Item</FormLabel>
											<FormControl>
												<MultiSelect
													variant="outline"
													className="bg-white"
													items={menuItems}
													selectedValues={field.value ?? []}
													onValueChange={field.onChange}
													placeholder="Pilih item untuk ditambahkan"
													label="Pilih Item"
													searchPlaceholder="Cari item..."
													itemUnit="item"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<CatalogDetailNotice message="Pilih satu atau lebih item yang termasuk di kategori ini" />
							</Card>
						</View>
					</Form>
				)}
			</Wrapper>

			<BottomActionButton
				onPress={form.handleSubmit(handleSubmit)}
				isDisabled={isSubmitting}
			>
				Simpan
			</BottomActionButton>
		</>
	);
}
