import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useLayoutEffect, useRef, useState } from "react";
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
	FormSelect,
} from "@/components/common/Form";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { BANK_OPTIONS } from "@/constants/data/other/bank-types";
import {
	type PaymentMethodSchema,
	paymentMethodSchema,
} from "@/schema/manage/payment-method";
import { useManagePaymentMethodStore } from "@/store/managePaymentMethodStore";
import type { PaymentMethodItemProps } from "@/types/ui/manage/payment-method";

const PAYMENT_TYPES = [{ label: "Transfer Bank", value: "bank_transfer" }];
const ADMIN_TYPES = [
	{ label: "Persentase", value: "percentage" },
	{ label: "Nominal", value: "nominal" },
];

export default function PaymentMethodModifyScreen({
	item,
}: {
	item?: PaymentMethodItemProps;
}) {
	const form = useForm<PaymentMethodSchema>({
		resolver: zodResolver(paymentMethodSchema),
		defaultValues: {
			name: item?.name ?? "",
			type: item?.type ?? "",
			adminType: item?.adminType ?? "",
			value: item?.value ?? 0,
			bank: item?.bank.toLowerCase() ?? "",
			accountNumber: item?.accountNumber ?? "",
			accountName: item?.accountName ?? "",
		},
	});
	const [feeInput, setFeeInput] = useState(String(item?.value ?? 0));
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
	function save(values: PaymentMethodSchema) {
		if (!mounted.current || submitted.current) return;
		submitted.current = true;
		const store = useManagePaymentMethodStore.getState();
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
					<Text size="small" className="text-muted">
						Data tersedia selama aplikasi terbuka dan belum terhubung ke
						transaksi.
					</Text>
					<Form {...form}>
						<View className="gap-4">
							<FormField
								control={form.control}
								name="name"
								render={() => (
									<FormItem>
										<FormLabel required>Nama Metode</FormLabel>
										<FormControl>
											<FormInput placeholder="Contoh: Transfer Bank" />
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
										<FormLabel required>Jenis Pembayaran</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih jenis pembayaran"
												data={PAYMENT_TYPES}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="adminType"
								render={() => (
									<FormItem>
										<FormLabel required>Biaya Admin</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih tipe biaya admin"
												data={ADMIN_TYPES}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="value"
								render={() => (
									<FormItem>
										<FormLabel required>Nilai Biaya Admin</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Masukkan nilai"
												type="number"
												fieldProps={{
													value: feeInput,
													keyboardType: "decimal-pad",
													onChangeText: (text) => {
														setFeeInput(text);
														form.setValue(
															"value",
															text.trim()
																? Number(text.replace(",", "."))
																: Number.NaN,
															{ shouldDirty: true, shouldValidate: true },
														);
													},
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="bank"
								render={() => (
									<FormItem>
										<FormLabel required>Nama Bank</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih bank"
												data={BANK_OPTIONS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="accountNumber"
								render={() => (
									<FormItem>
										<FormLabel required>Nomor Rekening</FormLabel>
										<FormControl>
											<FormInput placeholder="Masukkan nomor rekening" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="accountName"
								render={() => (
									<FormItem>
										<FormLabel required>Nama Pemilik Rekening</FormLabel>
										<FormControl>
											<FormInput placeholder="Masukkan nama pemilik rekening" />
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
				Simpan Sementara
			</BottomActionButton>
			<SuccessModal
				openState={success.openState}
				title={
					item
						? "Metode pembayaran diperbarui"
						: "Metode pembayaran ditambahkan"
				}
				description="Data tersimpan selama aplikasi terbuka dan belum digunakan dalam transaksi."
				onClose={() => {
					if (!mounted.current || !submitted.current || acknowledged.current)
						return;
					acknowledged.current = true;
					success.close();
					router.replace("/manage/payment-method");
				}}
			/>
			<AlertModal
				openState={error.openState}
				title="Data belum tersimpan"
				message="Metode pembayaran sudah tidak tersedia. Kembali ke daftar dan periksa data Anda."
				hideCancelButton
				confirmText="Tutup"
			/>
		</>
	);
}
