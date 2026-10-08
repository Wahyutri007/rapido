import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useOrderTypeQuery,
	useOrderTypeRequest,
	useOrderTypeUpdateRequest,
} from "@/api/hooks/order-types";
import { useTaxesQuery } from "@/api/hooks/taxes";
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
import { delayedBack } from "@/components/custom/JSStack";
import {
	type OrderTypeSchema,
	orderTypeSchema,
} from "@/schema/add/order-type";

export default function ModifyOrderTypeScreen() {
	const params = useLocalSearchParams();
	const orderTypeQuery = useOrderTypeQuery(params?.id as string | undefined);
	const taxesQuery = useTaxesQuery();

	const orderTypeAddRequest = useOrderTypeRequest();
	const orderTypeUpdateRequest = useOrderTypeUpdateRequest(
		undefined,
		params?.id,
	);
	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan tipe pesanan. Silakan coba lagi.",
	);

	const form = useForm<OrderTypeSchema>({
		resolver: zodResolver(orderTypeSchema),
		defaultValues: {
			tax_ids: [],
		},
	});

	async function handleSubmit(data: OrderTypeSchema) {
		let error;
		if (params?.id) {
			[, error] = await orderTypeUpdateRequest.call(data);
		} else {
			[, error] = await orderTypeAddRequest.call(data);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan tipe pesanan. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["order-types"] });

		if (params?.id) {
			await queryClient.invalidateQueries({
				queryKey: ["order-types", params.id],
			});
		}

		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (params?.id) {
			if (orderTypeQuery.data) {
				form.setValue("name", orderTypeQuery.data.name);

				if (orderTypeQuery.data.taxes) {
					form.setValue(
						"tax_ids",
						orderTypeQuery.data.taxes.map((t) => t.id),
					);
				}
			} else if (orderTypeQuery.isError) {
				router.back();
			}
		}
	}, [params?.id, orderTypeQuery.data, form]);

	const isSubmitting =
		orderTypeAddRequest.isLoading || orderTypeUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Tipe Pesanan Berhasil ${params?.id ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menemukannya pada halaman tipe pesanan."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${params?.id ? "Mengubah" : "Menambahkan"} Tipe Pesanan`}
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{(orderTypeQuery.isEnabled && orderTypeQuery.isLoading) ||
				taxesQuery.isLoading ? (
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
											<FormLabel required>Nama Tipe Pesanan</FormLabel>
											<FormControl>
												<FormInput placeholder="Contoh: Dine In" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="tax_ids"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Pajak</FormLabel>
											<FormControl>
												<MultiSelect
													variant="outline"
													className="bg-white"
													items={
														taxesQuery.data?.map((tax) => ({
															label: `${tax.name} (${tax.rate}%)`,
															value: tax.id,
														})) ?? []
													}
													onValueChange={field.onChange}
													selectedValues={field.value ?? []}
													placeholder="Pilih pajak"
													label="Pilih Pajak"
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
