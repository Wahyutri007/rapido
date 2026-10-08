import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Pressable, View } from "react-native";
import { handleFormError } from "@/api/common";
import { useStoresQuery } from "@/api/hooks/stores";
import {
	useVoucherQuery,
	useVoucherRequest,
	useVoucherUpdateRequest,
} from "@/api/hooks/vouchers";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { LoadingPlaceholder } from "@/components/common/DataPlaceholder";
import {
	Form,
	FormControl,
	FormDateTimePicker,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
	FormSelect,
} from "@/components/common/Form";
import { MultiSelect } from "@/components/common/MultiSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import { Button, ButtonText } from "@/components/ui/button";
import { Colors } from "@/constants/Colors";
import { MOCK_VOUCHER_DATA } from "@/constants/data/voucher";
import { type VoucherSchema, voucherSchema } from "@/schema/add/voucher";

const VOUCHER_TYPES = [
	{
		label: "Persentase (%)",
		value: "percentage",
		description: "Potongan diskon berupa persentase nilai",
	},
	{
		label: "Rupiah (Rp)",
		value: "fixed",
		description: "Potongan diskon nominal langsung",
	},
];

export default function ModifyVoucherScreen() {
	const params = useLocalSearchParams();
	const voucherId = params?.id as string | undefined;
	const voucherQuery = useVoucherQuery(voucherId);
	const voucherAddRequest = useVoucherRequest();
	const voucherUpdateRequest = useVoucherUpdateRequest(undefined, voucherId);

	const storesQuery = useStoresQuery();
	const queryClient = useQueryClient();

	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const importNoticeModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState("Terjadi kesalahan.");

	const form = useForm<VoucherSchema>({
		resolver: zodResolver(voucherSchema),
		defaultValues: {
			name: "",
			type: "percentage",
			amount: 0,
			minimum_transaction: 0,
			maximum_discount: null,
			store_ids: [],
			codes: [{ code: "", max_uses: 10 }],
			period: {
				start: new Date(),
				end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			},
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "codes",
	});

	const voucherType = useWatch({ control: form.control, name: "type" });

	React.useEffect(() => {
		if (voucherId) {
			const d =
				voucherQuery.data || MOCK_VOUCHER_DATA.find((v) => v.id === voucherId);
			if (d) {
				form.reset({
					name: d.name,
					type: (d.type || d.value_type || "percentage") as
						| "percentage"
						| "fixed",
					amount: Number(d.amount),
					minimum_transaction: Number(d.minimum_transaction),
					maximum_discount:
						d.maximum_discount != null ? Number(d.maximum_discount) : null,
					store_ids: d.store_ids || d.stores?.map((s) => s.id) || [],
					codes: d.codes?.map((c) => ({
						code: c.code,
						max_uses: Number(c.max_uses),
					})) || [{ code: "", max_uses: 10 }],
					period: {
						start: new Date(d.start_period),
						end: new Date(d.end_period),
					},
				});
			}
		}
	}, [voucherId, voucherQuery.data, form]);

	async function handleSubmit(data: VoucherSchema) {
		const payload = {
			name: data.name,
			type: data.type,
			amount: Number(data.amount),
			minimum_transaction: Number(data.minimum_transaction),
			maximum_discount:
				data.type === "percentage" && data.maximum_discount != null
					? Number(data.maximum_discount)
					: null,
			start_period: data.period.start.toISOString(),
			end_period: data.period.end.toISOString(),
			store_ids: data.store_ids,
			codes: data.codes.map((c) => ({
				code: c.code.trim().toUpperCase(),
				max_uses: Number(c.max_uses),
			})),
		};

		let error: unknown;

		if (voucherId) {
			[, error] = await voucherUpdateRequest.call(payload);
		} else {
			[, error] = await voucherAddRequest.call(payload);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan voucher. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		const invalidations = [
			queryClient.invalidateQueries({ queryKey: ["vouchers"] }),
		];

		if (voucherId) {
			invalidations.push(
				queryClient.invalidateQueries({
					queryKey: ["vouchers", voucherId],
				}),
			);
		}

		await Promise.all(invalidations);
		finishModal.close();
		delayedBack();
	}

	return (
		<>
			<SuccessModal
				title={`Voucher Berhasil ${voucherId ? "Diubah" : "Ditambahkan"}!`}
				description="Voucher telah tersimpan."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title="Gagal Menyimpan Voucher"
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<AlertModal
				title="Import Voucher"
				message="Fitur import kode voucher dari file Excel saat ini belum tersedia."
				openState={importNoticeModal.openState}
				onClose={importNoticeModal.close}
				hideCancelButton
				confirmText="Tutup"
			/>

			<Wrapper className="p-4" hasActionButton>
				{voucherQuery.isLoading && voucherId ? (
					<LoadingPlaceholder />
				) : (
					<Form {...form}>
						<View className="gap-4 pb-28">
							{/* Form Card 1: Main Voucher Details */}
							<Card className="gap-4 p-4">
								{/* Nama Voucher */}
								<FormField
									control={form.control}
									name="name"
									render={() => (
										<FormItem>
											<FormLabel required>Nama Voucher</FormLabel>
											<FormControl>
												<FormInput placeholder="Voucher New Member" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Toko with Info Icon */}
								<FormField
									control={form.control}
									name="store_ids"
									render={({ field }) => (
										<FormItem>
											<View className="flex-row items-center gap-1.5">
												<FormLabel required>Toko</FormLabel>
												<Feather
													name="info"
													size={15}
													color={Colors.zinc[400]}
												/>
											</View>
											<FormControl>
												<MultiSelect
													variant="outline"
													className="bg-white"
													items={
														storesQuery.data?.map((store) => ({
															label: store.name,
															value: store.id,
															description: store.address,
														})) ?? []
													}
													selectedValues={field.value ?? []}
													onValueChange={field.onChange}
													placeholder="Pilih toko untuk ditambahkan"
													label="Pilih Toko"
													searchPlaceholder="Cari toko..."
													itemUnit="toko"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Jenis Voucher */}
								<FormField
									control={form.control}
									name="type"
									render={() => (
										<FormItem>
											<FormLabel required>Jenis Voucher</FormLabel>
											<FormControl>
												<FormSelect
													data={VOUCHER_TYPES}
													placeholder="Pilih jenis voucher"
													label="Pilih Jenis Voucher"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Nilai Persentase or Nilai Voucher */}
								<FormField
									control={form.control}
									name="amount"
									render={() => (
										<FormItem>
											<FormLabel required>
												{voucherType === "percentage"
													? "Nilai Persentase"
													: "Nilai Voucher"}
											</FormLabel>
											<FormControl>
												<FormInput
													type="number"
													placeholder={
														voucherType === "percentage" ? "10%" : "Rp 10.000"
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Minimum Transaksi */}
								<FormField
									control={form.control}
									name="minimum_transaction"
									render={() => (
										<FormItem>
											<FormLabel required>Minimum Transaksi</FormLabel>
											<FormControl>
												<FormInput type="number" placeholder="Rp 50.000" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Maksimum Diskon (Only for percentage) */}
								{voucherType === "percentage" && (
									<FormField
										control={form.control}
										name="maximum_discount"
										render={() => (
											<FormItem>
												<FormLabel required>Maksimum Diskon</FormLabel>
												<FormControl>
													<FormInput type="number" placeholder="Rp 100.000" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								{/* Periode Diskon */}
								<FormField
									control={form.control}
									name="period"
									render={() => (
										<FormItem>
											<FormLabel required>Periode Diskon</FormLabel>
											<FormControl>
												<FormDateTimePicker
													asRange
													placeholder="Pilih periode diskon"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</Card>

							{/* Card 2: Import Voucher banner */}
							<Card className="flex-row items-center justify-between p-4 bg-primary-100 border border-border">
								<View className="flex-row items-center gap-3 flex-1 mr-3">
									<View className="size-11 items-center justify-center rounded-xl bg-primary">
										<MaterialCommunityIcons
											name="tray-arrow-down"
											size={22}
											color="#FFFFFF"
										/>
									</View>
									<View className="flex-1">
										<Text w="bold" size="normal">
											Import Voucher
										</Text>
										<Text size="small" className="text-muted">
											Import kode voucher dari file excel
										</Text>
									</View>
								</View>
								<Button
									size="sm"
									className="rounded-lg bg-primary px-4"
									onPress={() => importNoticeModal.open()}
								>
									<ButtonText size="sm" className="text-white font-medium">
										Import
									</ButtonText>
								</Button>
							</Card>

							{/* Card 3: Daftar Kode Voucher */}
							<Card className="gap-3 p-4">
								{/* Header labels */}
								<View className="flex-row items-center gap-2 mb-1">
									<View className="flex-1">
										<Text size="small" w="medium" className="text-foreground">
											Kode Voucher{" "}
											<Text size="small" className="text-red-500 font-medium">
												*
											</Text>
										</Text>
									</View>
									<View className="flex-1">
										<Text size="small" w="medium" className="text-foreground">
											Maksimal Digunakan{" "}
											<Text size="small" className="text-red-500 font-medium">
												*
											</Text>
										</Text>
									</View>
									<View className="w-11" />
								</View>

								{/* Dynamic Code Rows */}
								<View className="gap-2.5">
									{fields.map((field, index) => (
										<View key={field.id} className="flex-row items-start gap-2">
											<View className="flex-1">
												<FormField
													control={form.control}
													name={`codes.${index}.code`}
													render={() => (
														<FormItem>
															<FormControl>
																<FormInput
																	placeholder="M001"
																	fieldProps={{
																		autoCapitalize: "characters",
																	}}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</View>
											<View className="flex-1">
												<FormField
													control={form.control}
													name={`codes.${index}.max_uses`}
													render={() => (
														<FormItem>
															<FormControl>
																<FormInput type="number" placeholder="8" />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</View>
											<Pressable
												onPress={() => remove(index)}
												disabled={fields.length <= 1}
												className={`size-11 items-center justify-center rounded-xl ${
													fields.length <= 1
														? "bg-gray-100 opacity-50"
														: "bg-red-50 active:bg-red-100"
												}`}
											>
												<Feather
													name="trash-2"
													size={18}
													color={fields.length <= 1 ? "#9ca3af" : "#ef4444"}
												/>
											</Pressable>
										</View>
									))}
								</View>

								{/* Dashed Add Code Button */}
								<Pressable
									onPress={() => append({ code: "", max_uses: 10 })}
									className="mt-2 w-full flex-row items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary-300 bg-primary-50 active:bg-primary-100"
								>
									<Feather name="plus" size={16} color={Colors.primary} />
									<Text size="normal" w="medium" className="text-primary">
										Tambah Kode Voucher
									</Text>
								</Pressable>
							</Card>
						</View>
					</Form>
				)}
			</Wrapper>

			<BottomActionButton
				onPress={form.handleSubmit(handleSubmit)}
				isLoading={
					voucherAddRequest.isLoading || voucherUpdateRequest.isLoading
				}
			>
				Simpan
			</BottomActionButton>
		</>
	);
}
