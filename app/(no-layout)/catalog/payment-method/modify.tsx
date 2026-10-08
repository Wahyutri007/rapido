import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Store } from "lucide-react-native";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	usePaymentMethodQuery,
	usePaymentMethodRequest,
	usePaymentMethodUpdateRequest,
} from "@/api/hooks/payment-methods";
import { useReferenceDataQuery } from "@/api/hooks/references";
import { useStoresQuery } from "@/api/hooks/stores";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
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
import Wrapper from "@/components/common/Wrapper";
import ImageUploader from "@/components/common/ImageUploader";
import { delayedBack } from "@/components/custom/JSStack";
import SingleSelect from "@/components/common/SingleSelect";
import { Colors } from "@/constants/Colors";
import { paymentMethodItems } from "@/constants/enums/payment-method";
import {
	type PaymentMethodSchema,
	paymentMethodSchema,
} from "@/schema/add/payment-method";
import { PaymentMethodType } from "@/types/enums";

export default function ModifyPaymentMethodScreen() {
	const params = useLocalSearchParams();
	const paymentMethodQuery = usePaymentMethodQuery(
		params?.id as string | undefined,
	);

	const storesQuery = useStoresQuery();
	const banksQuery = useReferenceDataQuery("bank_account");

	const bankItems = React.useMemo(
		() =>
			banksQuery.data?.map((bank) => ({
				label: bank.name,
				value: bank.id,
			})) ?? [],
		[banksQuery.data],
	);

	const paymentMethodAddRequest = usePaymentMethodRequest();
	const paymentMethodUpdateRequest = usePaymentMethodUpdateRequest(
		undefined,
		params?.id,
	);
	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan metode pembayaran. Silakan coba lagi.",
	);

	const form = useForm<PaymentMethodSchema>({
		resolver: zodResolver(paymentMethodSchema),
		defaultValues: {
			name: "",
			type: PaymentMethodType.CASH,
			store_ids: [],
		},
	});

	const selectedType = useWatch({ control: form.control, name: "type" });

	const namePlaceholder = React.useMemo(() => {
		switch (selectedType) {
			case PaymentMethodType.CASH:
				return "Tunai";
			case PaymentMethodType.QRIS:
				return "QRIS";
			case PaymentMethodType.BANK_TRANSFER:
				return "Transfer Bank";
			case PaymentMethodType.CREDIT_CARD:
				return "Kartu Kredit";
			case PaymentMethodType.DEBIT_CARD:
				return "Kartu Debit";
			case PaymentMethodType.OTHER:
				return "Lainnya";
			default:
				return "Tunai";
		}
	}, [selectedType]);

	async function handleSubmit(data: PaymentMethodSchema) {
		let error;
		let responseData;

		if (params?.id) {
			[responseData, error] = await paymentMethodUpdateRequest.call(data);
		} else {
			[responseData, error] = await paymentMethodAddRequest.call(data);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan metode pembayaran. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["payment-methods"] });

		if (params?.id) {
			await queryClient.invalidateQueries({
				queryKey: ["payment-methods", params.id],
			});
		}

		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (params?.id) {
			if (paymentMethodQuery.data) {
				form.setValue("name", paymentMethodQuery.data.name);
				form.setValue("type", paymentMethodQuery.data.type);

				if (paymentMethodQuery.data.barcode_image) {
					form.setValue(
						"barcode_image",
						paymentMethodQuery.data.barcode_image,
					);
				}

				if (paymentMethodQuery.data.stores) {
					form.setValue(
						"store_ids",
						paymentMethodQuery.data.stores.map((s) => s.id),
					);
				}

				if (paymentMethodQuery.data.bank_details) {
					form.setValue(
						"bank_account.bank_account_id",
						paymentMethodQuery.data.bank_details.bank_account_id,
					);
					form.setValue(
						"bank_account.account_number",
						paymentMethodQuery.data.bank_details.account_number,
					);
					form.setValue(
						"bank_account.account_holder_name",
						paymentMethodQuery.data.bank_details.account_holder_name,
					);
				}
			} else if (paymentMethodQuery.isError) {
				router.back();
			}
		}
	}, [params?.id, paymentMethodQuery.data, form]);

	const isSubmitting =
		paymentMethodAddRequest.isLoading || paymentMethodUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Metode Pembayaran Berhasil ${params?.id ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menemukannya pada halaman metode pembayaran."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${params?.id ? "Mengubah" : "Menambahkan"} Metode Pembayaran`}
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{(paymentMethodQuery.isEnabled && paymentMethodQuery.isLoading) ||
				storesQuery.isLoading ? (
					<LoadingPlaceholder />
				) : (
					<Card className="rounded-2xl p-4">
						<Form {...form}>
							<View className="gap-4">
								<FormField
									control={form.control}
									name="name"
									render={() => (
										<FormItem>
											<FormLabel required>Nama Metode Pembayaran</FormLabel>
											<FormControl>
												<FormInput placeholder={namePlaceholder} />
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
											<FormLabel required>Jenis Pembayaran</FormLabel>
											<FormControl>
												<SingleSelect
													items={paymentMethodItems}
													value={field.value}
													onValueChange={(val) => {
														const currentName = form.getValues("name");
														const prevDefault = namePlaceholder;
														field.onChange(val);
														if (!currentName || currentName === prevDefault) {
															let newDefault = "Tunai";
															if (val === PaymentMethodType.QRIS) newDefault = "QRIS";
															else if (val === PaymentMethodType.BANK_TRANSFER) newDefault = "Transfer Bank";
															else if (val === PaymentMethodType.CREDIT_CARD) newDefault = "Kartu Kredit";
															else if (val === PaymentMethodType.DEBIT_CARD) newDefault = "Kartu Debit";
															else if (val === PaymentMethodType.OTHER) newDefault = "Lainnya";
															form.setValue("name", newDefault);
														}
													}}
													placeholder="Pilih jenis pembayaran"
													label="Jenis Pembayaran"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{selectedType === PaymentMethodType.QRIS && (
									<FormField
										control={form.control}
										name="barcode_image"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Upload Gambar Barcode</FormLabel>
												<FormControl>
													<ImageUploader
														value={field.value}
														onChange={field.onChange}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								{selectedType === PaymentMethodType.BANK_TRANSFER && (
									<>
										<FormField
											control={form.control}
											name="bank_account.bank_account_id"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Nama Bank</FormLabel>
													<FormControl>
														<SingleSelect
															items={bankItems}
															value={field.value}
															onValueChange={field.onChange}
															placeholder="Pilih bank"
															label="Pilih Bank"
															searchable={true}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="bank_account.account_number"
											render={() => (
												<FormItem>
													<FormLabel>Nomor Rekening</FormLabel>
													<FormControl>
														<FormInput
															placeholder="147144859925"
															fieldProps={{ keyboardType: "numeric" }}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="bank_account.account_holder_name"
											render={() => (
												<FormItem>
													<FormLabel>Nama Akun Rekening</FormLabel>
													<FormControl>
														<FormInput placeholder="Chelsea Vioreen" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								)}

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
															icon: <Store size={20} color={Colors.primary} />,
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
							</View>
						</Form>
					</Card>
				)}
			</Wrapper>

			<BottomActionButton
				onPress={form.handleSubmit(handleSubmit)}
				isDisabled={isSubmitting}
				isLoading={isSubmitting}
			>
				Simpan
			</BottomActionButton>
		</>
	);
}
