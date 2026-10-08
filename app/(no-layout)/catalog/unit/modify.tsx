import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { handleFormError } from "@/api/common";
import {
	useUnitQuery,
	useUnitRequest,
	useUnitUpdateRequest,
} from "@/api/hooks/units";
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
import { type UnitSchema, unitSchema } from "@/schema/add/unit";

export default function ModifyUnitScreen() {
	const params = useLocalSearchParams();
	const unitQuery = useUnitQuery(params?.id as string | undefined);
	const unitAddRequest = useUnitRequest();
	const unitUpdateRequest = useUnitUpdateRequest(undefined, params?.id);
	const queryClient = useQueryClient();
	const finishModal = useAlertModal();
	const errorModal = useAlertModal();
	const [errorMsg, setErrorMsg] = React.useState(
		"Terjadi kesalahan saat menyimpan satuan. Silakan coba lagi.",
	);

	const form = useForm<UnitSchema>({
		resolver: zodResolver(unitSchema),
	});

	async function handleSubmit(data: UnitSchema) {
		let error;
		if (params?.id) {
			[, error] = await unitUpdateRequest.call(data);
		} else {
			[, error] = await unitAddRequest.call(data);
		}

		if (error) {
			if (handleFormError(error, form)) {
				setErrorMsg("Mohon periksa kembali form anda.");
			} else {
				setErrorMsg(
					"Terjadi kesalahan saat menyimpan satuan. Silakan coba lagi.",
				);
			}
			errorModal.open();
			return;
		}

		finishModal.open();
	}

	async function handleModalClose() {
		await queryClient.invalidateQueries({ queryKey: ["units"] });

		if (params?.id) {
			await queryClient.invalidateQueries({
				queryKey: ["units", params.id],
			});
		}

		finishModal.close();
		delayedBack();
	}

	React.useEffect(() => {
		if (params?.id) {
			if (unitQuery.data) {
				form.setValue("name", unitQuery.data.name);
				form.setValue("code", unitQuery.data.code);
			} else if (unitQuery.isError) {
				router.back();
			}
		}
	}, [params?.id, unitQuery.data, form]);

	const isSubmitting =
		unitAddRequest.isLoading || unitUpdateRequest.isLoading;

	return (
		<>
			<SuccessModal
				title={`Satuan Berhasil ${params?.id ? "Diubah" : "Ditambahkan"}!`}
				description="Kamu akan menemukannya pada halaman daftar satuan."
				openState={finishModal.openState}
				onClose={handleModalClose}
				buttonText="Tutup"
			/>

			<AlertModal
				title={`Gagal ${params?.id ? "Mengubah" : "Menambahkan"} Satuan`}
				message={errorMsg}
				openState={errorModal.openState}
				onClose={errorModal.close}
				hideCancelButton
				confirmText="Mengerti"
			/>

			<Wrapper className="p-4" hasActionButton>
				{unitQuery.isEnabled && unitQuery.isLoading ? (
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
											<FormLabel required>Nama Satuan</FormLabel>
											<FormControl>
												<FormInput placeholder="Piece" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="code"
									render={() => (
										<FormItem>
											<FormLabel required>Kode Satuan</FormLabel>
											<FormControl>
												<FormInput placeholder="Pcs" />
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
