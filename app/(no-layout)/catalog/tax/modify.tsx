import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useTaxQuery,
	useTaxRequest,
	useTaxUpdateRequest,
} from "@/api/hooks/taxes";
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
import SuccessModal from "@/components/common/SuccessModal";
import Wrapper from "@/components/common/Wrapper";
import { delayedBack } from "@/components/custom/JSStack";
import { type TaxSchema, taxSchema } from "@/schema/add/tax";

export default function ModifyTaxScreen() {
	const params = useLocalSearchParams();
	const taxQuery = useTaxQuery(params?.id as string | undefined);
	const taxAddRequest = useTaxRequest();
	const taxUpdateRequest = useTaxUpdateRequest(undefined, params?.id);
	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan pajak. Silakan coba lagi.",
	);

	const form = useForm<TaxSchema>({
		resolver: zodResolver(taxSchema),
	});

	async function handleSubmit(data: TaxSchema) {
		let error;
		if (params?.id) {
			[, error] = await taxUpdateRequest.call(data);
		} else {
			[, error] = await taxAddRequest.call(data);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan pajak. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["taxes"] });

		if (params?.id) {
			await queryClient.invalidateQueries({
				queryKey: ["taxes", params.id],
			});
		}

		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (params?.id) {
			if (taxQuery.data) {
				form.setValue("name", taxQuery.data.name);
				form.setValue("rate", taxQuery.data.rate);
			} else if (taxQuery.isError) {
				router.back();
			}
		}
	}, [params?.id, taxQuery.data, form]);

	const isSubmitting =
		taxAddRequest.isLoading || taxUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Pajak Berhasil ${params?.id ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menemukannya pada halaman daftar pajak."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${params?.id ? "Mengubah" : "Menambahkan"} Pajak`}
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{taxQuery.isEnabled && taxQuery.isLoading ? (
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
											<FormLabel required>Nama Pajak</FormLabel>
											<FormControl>
												<FormInput placeholder="Contoh: PPN 11%" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="rate"
									render={() => (
										<FormItem>
											<FormLabel required>Persentase Pajak (%)</FormLabel>
											<FormControl>
												<FormInput
													placeholder="11"
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
