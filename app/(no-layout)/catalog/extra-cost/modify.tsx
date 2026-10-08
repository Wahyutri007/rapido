import Entypo from "@expo/vector-icons/Entypo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useExtraCostQuery,
	useExtraCostRequest,
	useExtraCostUpdateRequest,
} from "@/api/hooks/extra-costs";
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
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import { Colors } from "@/constants/Colors";
import {
	type ExtraCostSchema,
	extraCostSchema,
} from "@/schema/add/extra-cost";
import { DiscountValueTypeEnum } from "@/types/enums";

const EXTRA_COST_TYPES = [
	{
		label: "Tetap (Nominal)",
		value: DiscountValueTypeEnum.FIXED,
		description: "Biaya tambahan bernilai nominal tetap",
	},
	{
		label: "Persentase (%)",
		value: DiscountValueTypeEnum.PERCENTAGE,
		description: "Biaya tambahan dihitung dari persentase total",
	},
];

export default function ModifyExtraCostScreen() {
	const params = useLocalSearchParams();
	const extraCostQuery = useExtraCostQuery(params?.id as string | undefined);
	const extraCostAddRequest = useExtraCostRequest();
	const extraCostUpdateRequest = useExtraCostUpdateRequest(
		undefined,
		params?.id,
	);
	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan biaya tambahan. Silakan coba lagi.",
	);

	const form = useForm<ExtraCostSchema>({
		resolver: zodResolver(extraCostSchema),
		defaultValues: {
			type: DiscountValueTypeEnum.FIXED,
		},
	});

	async function handleSubmit(data: ExtraCostSchema) {
		let error;
		if (params?.id) {
			[, error] = await extraCostUpdateRequest.call(data);
		} else {
			[, error] = await extraCostAddRequest.call(data);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan biaya tambahan. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["extra-costs"] });

		if (params?.id) {
			await queryClient.invalidateQueries({
				queryKey: ["extra-costs", params.id],
			});
		}

		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (params?.id) {
			if (extraCostQuery.data) {
				form.setValue("name", extraCostQuery.data.name);
				form.setValue("amount", extraCostQuery.data.amount);
				form.setValue("type", extraCostQuery.data.type);
			} else if (extraCostQuery.isError) {
				router.back();
			}
		}
	}, [params?.id, extraCostQuery.data, form]);

	const isSubmitting =
		extraCostAddRequest.isLoading || extraCostUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Biaya Tambahan Berhasil ${params?.id ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menemukannya pada halaman biaya tambahan."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${params?.id ? "Mengubah" : "Menambahkan"} Biaya Tambahan`}
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{extraCostQuery.isEnabled && extraCostQuery.isLoading ? (
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
											<FormLabel required>Nama Biaya</FormLabel>
											<FormControl>
												<FormInput placeholder="Masukkan nama biaya tambahan" />
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
											<FormLabel required>Tipe Perhitungan</FormLabel>
											<FormControl>
												<FormSelect
													data={EXTRA_COST_TYPES}
													placeholder="Pilih Tipe Perhitungan"
													label="Pilih Tipe Perhitungan"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="amount"
									render={() => (
										<FormItem>
											<FormLabel required>
												{form.watch("type") === DiscountValueTypeEnum.PERCENTAGE
													? "Persentase Biaya (%)"
													: "Nominal Biaya (Rp)"}
											</FormLabel>
											<FormControl>
												<FormInput
													placeholder={
														form.watch("type") ===
														DiscountValueTypeEnum.PERCENTAGE
															? "Contoh: 10"
															: "Contoh: 5000"
													}
													type="number"
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
