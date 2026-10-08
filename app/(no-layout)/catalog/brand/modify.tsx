import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useBrandQuery,
	useBrandRequest,
	useBrandUpdateRequest,
} from "@/api/hooks/brands";
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
import { type BrandSchema, brandSchema } from "@/schema/add/brand";

export default function ModifyBrandScreen() {
	const params = useLocalSearchParams();
	const brandQuery = useBrandQuery(params?.id as string | undefined);
	const brandAddRequest = useBrandRequest();
	const brandUpdateRequest = useBrandUpdateRequest(undefined, params?.id);
	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan merek. Silakan coba lagi.",
	);

	const form = useForm<BrandSchema>({
		resolver: zodResolver(brandSchema),
	});

	async function handleSubmit(data: BrandSchema) {
		let error;
		if (params?.id) {
			[, error] = await brandUpdateRequest.call(data);
		} else {
			[, error] = await brandAddRequest.call(data);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan merek. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["brands"] });

		if (params?.id) {
			await queryClient.invalidateQueries({
				queryKey: ["brands", params.id],
			});
		}

		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (params?.id) {
			if (brandQuery.data) {
				form.setValue("name", brandQuery.data.name);
			} else if (brandQuery.isError) {
				router.back();
			}
		}
	}, [params?.id, brandQuery.data, form]);

	const isSubmitting =
		brandAddRequest.isLoading || brandUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Merek Berhasil ${params?.id ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menemukannya pada halaman daftar merek."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${params?.id ? "Mengubah" : "Menambahkan"} Merek`}
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{brandQuery.isEnabled && brandQuery.isLoading ? (
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
											<FormLabel required>Nama Merek</FormLabel>
											<FormControl>
												<FormInput placeholder="Contoh: Nike" />
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
