import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
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
import {
	EXPENSE_ACCOUNTS,
	EXPENSE_FUNDING_SOURCES,
	EXPENSE_STORES,
} from "@/constants/data/accounting/expenses";
import {
	INCOME_ACCOUNTS,
	INCOME_FUNDING_SOURCES,
	INCOME_STORES,
} from "@/constants/data/accounting/incomes";
import { saveManagedExpense } from "@/lib/manage/expenses";
import { saveManagedIncome } from "@/lib/manage/incomes";
import { formatRp } from "@/lib/utils";
import type { CashEntryValues } from "@/schema/accounting/cash-entry";
import { manageExpenseSchema } from "@/schema/manage/expense";
import { manageIncomeSchema } from "@/schema/manage/income";

export default function CashEntryForm({
	kind,
	initialValues,
	id,
}: {
	kind: "expense" | "income";
	initialValues: CashEntryValues;
	id?: string;
}) {
	const isExpense = kind === "expense";
	const noun = isExpense ? "Pengeluaran" : "Penerimaan";
	const accounts = isExpense ? EXPENSE_ACCOUNTS : INCOME_ACCOUNTS;
	const fundingSources = isExpense
		? EXPENSE_FUNDING_SOURCES
		: INCOME_FUNDING_SOURCES;
	const stores = isExpense ? EXPENSE_STORES : INCOME_STORES;
	const save = isExpense ? saveManagedExpense : saveManagedIncome;
	const savedId = React.useRef(id);
	const mounted = React.useRef(true);
	const pending = React.useRef(false);
	const [success, setSuccess] = React.useState(false);
	const form = useForm<CashEntryValues>({
		resolver: zodResolver(isExpense ? manageExpenseSchema : manageIncomeSchema),
		defaultValues: initialValues,
	});
	React.useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const accountName = useWatch({ control: form.control, name: "accountName" });
	const amount = useWatch({ control: form.control, name: "amount" });
	const selectedStore = useWatch({ control: form.control, name: "store" });
	const previousStore = React.useRef(selectedStore);
	React.useEffect(() => {
		if (previousStore.current === selectedStore) return;
		previousStore.current = selectedStore;
		if (form.getFieldState("referenceNumber").error?.type === "duplicate") {
			form.clearErrors("referenceNumber");
		}
	}, [selectedStore, form]);
	React.useEffect(() => {
		form.setValue(
			"accountCode",
			accounts.find((account) => account.value === accountName)?.code ?? "",
		);
	}, [accountName, accounts, form]);
	const submit = (values: CashEntryValues) => {
		if (!mounted.current) return;
		form.clearErrors("root");
		const result = save(values, savedId.current);
		if ("error" in result) {
			if (result.error === "duplicate")
				form.setError("referenceNumber", {
					type: "duplicate",
					message: "Nomor referensi sudah digunakan di toko ini.",
				});
			else
				form.setError("root", {
					message:
						result.error === "missing"
							? `${noun} sudah tidak tersedia. Kembali ke daftar untuk melanjutkan.`
							: result.error === "readonly"
								? "Penerimaan penjualan hanya dapat dilihat."
								: `Periksa kembali data ${noun.toLowerCase()}.`,
				});
			return;
		}
		savedId.current = result.id;
		setSuccess(true);
	};
	async function handleSubmit() {
		if (!mounted.current || pending.current) return;
		pending.current = true;
		try {
			await form.handleSubmit(submit)();
		} finally {
			pending.current = false;
		}
	}
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<Card className="gap-4">
					<Form {...form}>
						<FormField
							control={form.control}
							name="accountName"
							render={() => (
								<FormItem>
									<FormLabel required>Nama Akun</FormLabel>
									<FormControl>
										<FormSelect
											placeholder="Pilih nama akun"
											data={accounts.map(({ value, label }) => ({
												value,
												label,
											}))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="accountCode"
							render={() => (
								<FormItem>
									<FormLabel>Kode Akun</FormLabel>
									<FormControl>
										<FormInput
											placeholder="Otomatis mengikuti akun"
											fieldProps={{
												editable: false,
												"aria-label": "Kode Akun",
												style: { minWidth: 0 },
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="referenceNumber"
							render={() => (
								<FormItem>
									<FormLabel required>No. Referensi</FormLabel>
									<FormControl>
										<FormInput
											placeholder={
												isExpense ? "KK/A001/2610/001" : "KM/A001/2610/001"
											}
											fieldProps={{
												"aria-label": "No. Referensi",
												maxLength: 80,
												autoCapitalize: "characters",
												style: { minWidth: 0 },
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="fundingSource"
							render={() => (
								<FormItem>
									<FormLabel required>Sumber Dana</FormLabel>
									<FormControl>
										<FormSelect
											placeholder="Pilih sumber dana"
											data={fundingSources}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="store"
							render={() => (
								<FormItem>
									<FormLabel required>Toko</FormLabel>
									<FormControl>
										<FormSelect placeholder="Pilih toko" data={stores} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="date"
							render={() => (
								<FormItem>
									<FormLabel required>Tanggal</FormLabel>
									<FormControl>
										<FormInput
											placeholder="YYYY-MM-DD"
											fieldProps={{
												"aria-label": "Tanggal",
												maxLength: 10,
												style: { minWidth: 0 },
											}}
										/>
									</FormControl>
									<Text size="small" className="text-muted">
										Contoh: 2026-10-08
									</Text>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amount"
							render={() => (
								<FormItem>
									<FormLabel required>Nominal</FormLabel>
									<FormControl>
										<FormInput
											type="number"
											placeholder="Nominal dalam Rupiah"
											fieldProps={{
												"aria-label": "Nominal",
												maxLength: 13,
												style: { minWidth: 0 },
											}}
										/>
									</FormControl>
									<Text size="small" className="text-muted">
										{formatRp(amount)} · Rupiah bulat
									</Text>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={() => (
								<FormItem>
									<FormLabel required>Deskripsi</FormLabel>
									<FormControl>
										<FormInput
											multiline
											placeholder={
												isExpense
													? "Tuliskan keperluan pengeluaran"
													: "Tuliskan sumber dan keperluan penerimaan"
											}
											fieldProps={{
												"aria-label": "Deskripsi",
												maxLength: 1000,
												style: { minWidth: 0 },
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{!!form.formState.errors.root?.message && (
							<Text size="small" className="!text-destructive">
								{form.formState.errors.root.message}
							</Text>
						)}
					</Form>
				</Card>
			</Wrapper>
			<BottomActionButton onPress={handleSubmit}>
				Simpan {noun}
			</BottomActionButton>
			<SuccessModal
				isOpen={success}
				onClose={() => setSuccess(false)}
				title={`${noun} Disimpan`}
				description={`Data pratinjau telah diperbarui pada daftar dan laporan ${noun.toLowerCase()}.`}
				buttonText="Mengerti"
			/>
		</>
	);
}
