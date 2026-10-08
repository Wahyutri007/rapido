import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from "react-native";
import { useAlertModal } from "@/components/common/AlertModal";
import SuccessModal from "@/components/common/SuccessModal";
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
import Text from "@/components/common/Text";
import { Button, ButtonText } from "@/components/ui/button";
import {
	ACCOUNT_CLASSIFICATIONS,
	ACCOUNT_CURRENCIES,
	ACCOUNT_SUB_CLASSIFICATIONS,
} from "@/constants/data/accounting/accounts";
import { type AccountSchema, accountSchema } from "@/schema/accounting/account";
import { useAccountingStore } from "@/store/accountingStore";
import type { Account } from "@/types/ui/accounting/account";

export default function AccountModifyScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const isEdit = Boolean(params.id);

	const accounts = useAccountingStore((state) => state.accounts);
	const addAccount = useAccountingStore((state) => state.addAccount);
	const updateAccount = useAccountingStore((state) => state.updateAccount);

	const finishModal = useAlertModal();
	const [existingAccount, setExistingAccount] = useState<Account | null>(null);

	const form = useForm<AccountSchema>({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			classification: "Harta",
			subClassification: "Harta Lancar",
			code: "11001",
			name: "",
			currency: "IDR",
			debit: 0,
			credit: 0,
			description: "",
		},
	});

	const watchedClassification = form.watch("classification");

	// Available subclassifications based on chosen classification
	const subClassificationOptions = useMemo(() => {
		return (
			ACCOUNT_SUB_CLASSIFICATIONS[watchedClassification] || [
				{ label: "Harta Lancar", value: "Harta Lancar" },
			]
		);
	}, [watchedClassification]);

	// Auto-adjust subclassification when classification changes if current subclassification doesn't belong
	useEffect(() => {
		const valid = subClassificationOptions.some(
			(opt) => opt.value === form.getValues("subClassification"),
		);
		if (!valid && subClassificationOptions.length > 0) {
			form.setValue("subClassification", subClassificationOptions[0].value);
		}
	}, [subClassificationOptions, form]);

	// Prepopulate if editing
	useEffect(() => {
		if (params.id) {
			const found = accounts.find((acc) => acc.id === params.id);
			if (found) {
				setExistingAccount(found);
				form.reset({
					classification: found.classification,
					subClassification: found.subClassification,
					code: found.code,
					name: found.name,
					currency: found.currency,
					debit: found.debit,
					credit: found.credit,
					description: found.description || "",
				});
			} else {
				router.back();
			}
		}
	}, [params.id, accounts, form]);

	const onSubmit = (data: AccountSchema) => {
		if (isEdit && params.id) {
			updateAccount(params.id, data);
		} else {
			addAccount(data);
		}
		finishModal.open();
	};

	const handleFinishClose = () => {
		finishModal.close();
		router.back();
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-gray-50"
		>
			<SuccessModal
				openState={finishModal.openState}
				onClose={handleFinishClose}
				title={`Akun Berhasil ${isEdit ? "Diubah!" : "Ditambahkan!"}`}
				description={`Akun ${form.getValues("name")} berhasil ${
					isEdit ? "diperbarui" : "disimpan ke daftar saldo awal akun"
				}.`}
				buttonText="Tutup"
			/>

			<ScrollView
				contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
				showsVerticalScrollIndicator={false}
			>
				<Card className="rounded-2xl ">
					<Form {...form}>
						<View className="gap-4">
							{/* Klasifikasi */}
							<FormField
								control={form.control}
								name="classification"
								render={() => (
									<FormItem>
										<FormLabel required>Klasifikasi</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih Klasifikasi"
												data={ACCOUNT_CLASSIFICATIONS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Subklasifikasi */}
							<FormField
								control={form.control}
								name="subClassification"
								render={() => (
									<FormItem>
										<FormLabel required>Subklasifikasi</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih Subklasifikasi"
												data={subClassificationOptions}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Kode */}
							<FormField
								control={form.control}
								name="code"
								render={() => (
									<FormItem>
										<FormLabel>Kode</FormLabel>
										<FormControl>
											<FormInput
												placeholder="Contoh: 11001"
												className="bg-zinc-100"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Nama */}
							<FormField
								control={form.control}
								name="name"
								render={() => (
									<FormItem>
										<FormLabel required>Nama</FormLabel>
										<FormControl>
											<FormInput placeholder="Contoh: Kas Kecil" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Mata Uang */}
							<FormField
								control={form.control}
								name="currency"
								render={() => (
									<FormItem>
										<FormLabel required>Mata Uang</FormLabel>
										<FormControl>
											<FormSelect
												placeholder="Pilih Mata Uang"
												data={ACCOUNT_CURRENCIES}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Debit */}
							<FormField
								control={form.control}
								name="debit"
								render={() => (
									<FormItem>
										<FormLabel>Debit</FormLabel>
										<FormControl>
											<FormInput
												type="number"
												placeholder="0"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Kredit */}
							<FormField
								control={form.control}
								name="credit"
								render={() => (
									<FormItem>
										<FormLabel>Kredit</FormLabel>
										<FormControl>
											<FormInput
												type="number"
												placeholder="0"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</View>
					</Form>
				</Card>
			</ScrollView>

			{/* Sticky Bottom Simpan Button */}
			<View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
				<Button
					onPress={form.handleSubmit(onSubmit)}
					size="xl"
					className="h-12 w-full rounded-2xl bg-primary-500"
				>
					<ButtonText className="font-semibold text-base text-white">
						Simpan
					</ButtonText>
				</Button>
			</View>
		</KeyboardAvoidingView>
	);
}
