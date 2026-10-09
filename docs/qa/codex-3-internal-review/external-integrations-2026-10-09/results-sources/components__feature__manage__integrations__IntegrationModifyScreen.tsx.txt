import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useLayoutEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import AlertModal, { useAlertModal } from "@/components/common/AlertModal";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
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
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { route } from "@/lib/utils";
import {
	type IntegrationSchema,
	type IntegrationValues,
	integrationSchema,
} from "@/schema/manage/integration";
import { useManageIntegrationStore } from "@/store/manageIntegrationStore";
import type { IntegrationDraft } from "@/types/ui/manage/integration";

export default function IntegrationModifyScreen({
	item,
}: {
	item?: IntegrationDraft;
}) {
	const form = useForm<IntegrationSchema, unknown, IntegrationValues>({
		resolver: zodResolver(integrationSchema),
		defaultValues: {
			name: item?.name ?? "",
			endpoint: item?.endpoint ?? "",
			notes: item?.notes ?? "",
		},
	});
	const success = useAlertModal();
	const error = useAlertModal();
	const mounted = useRef(false);
	const submitted = useRef(false);
	const acknowledged = useRef(false);
	useLayoutEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	function save(values: IntegrationValues) {
		if (!mounted.current || submitted.current) return;
		submitted.current = true;
		const store = useManageIntegrationStore.getState();
		const saved = item
			? store.update(item.id, values)
			: store.add(values) !== null;
		if (!saved) {
			submitted.current = false;
			error.open();
			return;
		}
		success.open();
	}
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text w="semibold" size="normal">
						Draf tujuan webhook
					</Text>
					<Text size="small" className="text-muted">
						Draf tersedia selama aplikasi terbuka. Integrasi belum aktif dan
						tidak mengirim data.
					</Text>
					<Form {...form}>
						<View className="gap-4">
							<FormField
								control={form.control}
								name="name"
								render={() => (
									<FormItem>
										<FormLabel required>Nama Integrasi</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Contoh: Sistem pemesanan"
												fieldProps={{ maxLength: 80 }}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endpoint"
								render={() => (
									<FormItem>
										<FormLabel required>URL Tujuan Webhook</FormLabel>
										<FormControl>
											<FormInput
												placeholder="https://contoh.com/webhook"
												fieldProps={{
													keyboardType: "url",
													autoCapitalize: "none",
													autoCorrect: false,
													maxLength: 2048,
												}}
											/>
										</FormControl>
										<Text size="small" className="text-muted">
											Gunakan HTTPS tanpa nama pengguna, sandi, atau fragmen.
										</Text>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="notes"
								render={() => (
									<FormItem>
										<FormLabel>Catatan</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Tambahkan catatan (opsional)"
												multiline
												fieldProps={{ maxLength: 1000 }}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</View>
					</Form>
				</Card>
			</Wrapper>
			<BottomActionButton
				onPress={() => form.handleSubmit(save)()}
				isDisabled={form.formState.isSubmitting}
			>
				Simpan Draf
			</BottomActionButton>
			<SuccessModal
				openState={success.openState}
				title={
					item ? "Draf integrasi diperbarui" : "Draf integrasi ditambahkan"
				}
				description="Draf tersimpan selama aplikasi terbuka. Integrasi belum aktif dan tidak mengirim data."
				onClose={() => {
					if (!mounted.current || !submitted.current || acknowledged.current)
						return;
					acknowledged.current = true;
					success.close();
					router.replace(route("/manage/integrations"));
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Draf belum tersimpan"
				message="Draf integrasi sudah tidak tersedia. Kembali ke daftar dan periksa data Anda."
				hideCancelButton
				confirmText="Tutup"
			/>
		</>
	);
}
