import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useDiscountQuery,
	useDiscountRequest,
	useDiscountUpdateRequest,
} from "@/api/hooks/discounts";
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
	FormSelect,
} from "@/components/common/Form";
import { MultiSelect } from "@/components/common/MultiSelect";
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import { Colors } from "@/constants/Colors";
import { MOCK_DISCOUNT_DATA } from "@/constants/data/discount";
import { type DiscountSchema, discountSchema } from "@/schema/add/discount";

const DISCOUNT_TYPES = [
	{
		label: "Fixed (Tetap)",
		value: "fixed",
		description: "Potongan harga bernilai tetap",
	},
	{
		label: "Custom (Kustom)",
		value: "custom",
		description: "Nominal potongan diinput saat transaksi",
	},
];

const VALUE_TYPES = [
	{
		label: "Persentase (%)",
		value: "percentage",
		description: "Potongan berupa persentase harga",
	},
	{
		label: "Nominal (Rp)",
		value: "fixed",
		description: "Potongan berupa nominal rupiah",
	},
];

export default function ModifyDiscountScreen() {
	const params = useLocalSearchParams();
	const discountId = params?.id as string | undefined;
	const discountQuery = useDiscountQuery(discountId);
	const discountAddRequest = useDiscountRequest();
	const discountUpdateRequest = useDiscountUpdateRequest(undefined, discountId);
	const storesQuery = useStoresQuery();
	const queryClient = useQueryClient();

	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan diskon. Silakan coba lagi.",
	);

	const form = useForm<DiscountSchema>({
		resolver: zodResolver(discountSchema),
		defaultValues: {
			name: "",
			type: "fixed",
			value_type: "percentage",
			store_ids: [],
		},
	});

	const type = useWatch({ control: form.control, name: "type" });
	const valueType = useWatch({ control: form.control, name: "value_type" });

	async function handleSubmit(data: DiscountSchema) {
		let error: unknown;
		// TODO: Ensure backend endpoint handles updated payload once backend readjustment is ready
		if (discountId) {
			[, error] = await discountUpdateRequest.call(data);
		} else {
			[, error] = await discountAddRequest.call(data);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan diskon. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["discounts"] });
		if (discountId) {
			await queryClient.invalidateQueries({
				queryKey: ["discounts", discountId],
			});
		}

		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (discountId) {
			// TODO: Currently falls back to MOCK_DISCOUNT_DATA when backend discountQuery is empty.
			// Remove MOCK_DISCOUNT_DATA fallback once backend GET /contents/discounts/{id} is connected.
			const d =
				discountQuery.data ??
				MOCK_DISCOUNT_DATA.find((item) => item.id === discountId);
			if (d) {
				const amount = d.amount ?? d.fixed_discount?.amount;
				form.reset({
					name: d.name,
					type: d.type,
					value_type: d.value_type,
					store_ids: d.stores?.map((s) => s.id) || [],
					fixed_discount:
						amount !== undefined ? { amount: Number(amount) } : undefined,
				});
			} else if (discountQuery.isError) {
				router.back();
			}
		}
	}, [discountId, discountQuery.data, discountQuery.isError, form]);

	const isSubmitting =
		discountAddRequest.isLoading || discountUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Diskon Berhasil ${discountId ? "Diubah" : "Ditambahkan"}!`}
				description="Diskon telah tersimpan dan siap digunakan."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${discountId ? "Mengubah" : "Menambahkan"} Diskon`}
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{discountQuery.isEnabled && discountQuery.isLoading ? (
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
											<FormLabel required>Nama Diskon</FormLabel>
											<FormControl>
												<FormInput placeholder="Contoh: Diskon Kemerdekaan" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="type"
									render={() => (
										<FormItem>
											<FormLabel required>Tipe Diskon</FormLabel>
											<FormControl>
												<FormSelect
													data={DISCOUNT_TYPES}
													placeholder="Pilih Tipe Diskon"
													label="Pilih Tipe Diskon"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="value_type"
									render={() => (
										<FormItem>
											<FormLabel required>Jenis Nilai</FormLabel>
											<FormControl>
												<FormSelect
													data={VALUE_TYPES}
													placeholder="Pilih Jenis Nilai"
													label="Pilih Jenis Nilai"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{type === "fixed" && (
									<FormField
										control={form.control}
										name="fixed_discount.amount"
										render={() => (
											<FormItem>
												<FormLabel required>
													Nilai Diskon{" "}
													{valueType === "percentage" ? "(%)" : "(Rp)"}
												</FormLabel>
												<FormControl>
													<FormInput
														placeholder={
															valueType === "percentage"
																? "Contoh: 15"
																: "Contoh: 50000"
														}
														type="number"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
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
