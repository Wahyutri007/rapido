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
import { expenseFormValues, saveManagedExpense } from "@/lib/manage/expenses";
import { formatRp } from "@/lib/utils";
import {
	type ManageExpenseValues,
	manageExpenseSchema,
} from "@/schema/manage/expense";
import type { Expense } from "@/types/ui/accounting/expense";

export default function ExpenseForm({ expense }: { expense?: Expense }) {
	const [savedId, setSavedId] = React.useState(expense?.id);
	const [success, setSuccess] = React.useState(false);
	const form = useForm<ManageExpenseValues>({
		resolver: zodResolver(manageExpenseSchema),
		defaultValues: expenseFormValues(expense),
	});
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
			EXPENSE_ACCOUNTS.find((account) => account.value === accountName)?.code ??
				"",
		);
	}, [accountName, form]);
	const submit = (values: ManageExpenseValues) => {
		form.clearErrors("root");
		const result = saveManagedExpense(values, savedId);
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
							? "Pengeluaran sudah tidak tersedia. Kembali ke daftar untuk melanjutkan."
							: "Periksa kembali data pengeluaran.",
				});
			return;
		}
		setSavedId(result.id);
		setSuccess(true);
	};
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
											data={EXPENSE_ACCOUNTS.map(({ value, label }) => ({
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
											placeholder="KK/A001/2610/001"
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
											data={EXPENSE_FUNDING_SOURCES}
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
										<FormSelect
											placeholder="Pilih toko"
											data={EXPENSE_STORES}
										/>
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
											placeholder="Tuliskan keperluan pengeluaran"
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
			<BottomActionButton onPress={form.handleSubmit(submit)}>
				Simpan Pengeluaran
			</BottomActionButton>
			<SuccessModal
				isOpen={success}
				onClose={() => setSuccess(false)}
				title="Pengeluaran Disimpan"
				description="Data pratinjau telah diperbarui pada daftar dan laporan pengeluaran."
				buttonText="Mengerti"
			/>
		</>
	);
}
