import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useCategoriesQuery,
	useCategoryQuery,
	useCategoryRequest,
	useCategoryUpdateRequest,
} from "@/api/hooks/categories";
import { ALERTS_ILLUSTRATIONS } from "@/assets/images/alerts";
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
import { type CategorySchema, categorySchema } from "@/schema/add/category";

export default function ModifyCategoryScreen() {
	const params = useLocalSearchParams();
	const categoryQuery = useCategoryQuery(params?.id as string | undefined);
	const categoryAddRequest = useCategoryRequest();
	const categoryUpdateRequest = useCategoryUpdateRequest(undefined, params?.id);
	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan kategori. Silakan coba lagi.",
	);

	const form = useForm<CategorySchema>({
		resolver: zodResolver(categorySchema),
	});

	async function handleSubmit(data: CategorySchema) {
		let error;
		if (params?.id) {
			[, error] = await categoryUpdateRequest.call(data);
		} else {
			[, error] = await categoryAddRequest.call(data);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan kategori. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["categories"] });

		if (params?.id) {
			await queryClient.invalidateQueries({
				queryKey: ["categories", params.id],
			});
		}

		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (params?.id) {
			if (categoryQuery.data) {
				form.setValue("name", categoryQuery.data.name);
			} else if (categoryQuery.isError) {
				router.back();
			}
		}
	}, [params?.id, categoryQuery.data, form]);

	const isSubmitting =
		categoryAddRequest.isLoading || categoryUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Kategori Berhasil ${params?.id ? "Diubah!" : "Ditambahkan!"}`}
				description="Kamu akan menemukannya pada halaman daftar kategori."
				image={ALERTS_ILLUSTRATIONS.category}
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${params?.id ? "Mengubah" : "Menambahkan"} Kategori`}
				message={errorMsg}
				image={ALERTS_ILLUSTRATIONS.category}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{categoryQuery.isEnabled && categoryQuery.isLoading ? (
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
											<FormLabel required>Nama Kategori</FormLabel>
											<FormControl>
												<FormInput placeholder="Contoh: Makanan" />
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
