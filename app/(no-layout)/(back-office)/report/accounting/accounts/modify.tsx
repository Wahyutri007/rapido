import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAlertModal } from "@/components/common/AlertModal";
import BottomActionBar, {
	BottomActionInset,
} from "@/components/common/BottomActionBar";
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
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	const accounts = useAccountingStore((state) => state.accounts);
	const account = accounts.find((item) => item.id === id);

	if (id !== undefined && !account) {
		return (
			<Wrapper contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Text w="semibold">Akun tidak ditemukan</Text>
					<Text size="normal" className="text-muted">
						Buka kembali akun dari daftar untuk melanjutkan.
					</Text>
					<Button
						size="xl"
						onPress={() => router.replace("/report/accounting/accounts")}
					>
						<ButtonText>Kembali ke daftar</ButtonText>
					</Button>
				</Card>
			</Wrapper>
		);
	}

	return (
		<AccountForm
			key={id === undefined ? "create" : `edit:${id}`}
			id={id}
			initialAccount={account}
		/>
	);
}

function AccountForm({
	id,
	initialAccount,
}: {
	id?: string;
	initialAccount?: Account;
}) {
	const isEdit = id !== undefined;
	const addAccount = useAccountingStore((state) => state.addAccount);
	const updateAccount = useAccountingStore((state) => state.updateAccount);

	const finishModal = useAlertModal();
	const active = useRef(false);
	const saved = useRef(false);
	const didNavigate = useRef(false);
	const [isSaved, setIsSaved] = useState(false);

	useEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);

	const form = useForm<AccountSchema>({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			classification: initialAccount?.classification ?? "Harta",
			subClassification: initialAccount?.subClassification ?? "Harta Lancar",
			code: initialAccount?.code ?? "11001",
			name: initialAccount?.name ?? "",
			currency: initialAccount?.currency ?? "IDR",
			debit: initialAccount?.debit ?? 0,
			credit: initialAccount?.credit ?? 0,
			description: initialAccount?.description ?? "",
		},
	});

	const watchedClassification = useWatch({
		control: form.control,
		name: "classification",
	});

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

	const onSubmit = (data: AccountSchema) => {
		if (!active.current || saved.current) return;
		if (
			id !== undefined &&
			!useAccountingStore
				.getState()
				.accounts.some((account) => account.id === id)
		)
			return;
		saved.current = true;
		setIsSaved(true);
		if (id !== undefined) {
			updateAccount(id, data);
		} else {
			addAccount(data);
		}
		finishModal.open();
	};

	const handleFinishClose = () => {
		if (!active.current || !saved.current || didNavigate.current) return;
		didNavigate.current = true;
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
											<FormInput type="number" placeholder="0" />
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
											<FormInput type="number" placeholder="0" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</View>
					</Form>
				</Card>
				<BottomActionInset />
			</ScrollView>

			{/* Sticky Bottom Simpan Button */}
			<BottomActionBar>
				<Button
					onPress={() => form.handleSubmit(onSubmit)()}
					disabled={isSaved}
					size="xl"
					className="h-12 w-full rounded-2xl bg-primary-500"
				>
					<ButtonText className="font-semibold text-base text-white">
						Simpan
					</ButtonText>
				</Button>
			</BottomActionBar>
		</KeyboardAvoidingView>
	);
}
