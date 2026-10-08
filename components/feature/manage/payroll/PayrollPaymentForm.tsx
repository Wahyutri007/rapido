import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { Form } from "@/components/common/Form";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import { PAYROLL_PAYMENT_METHODS } from "@/constants/data/manage/payroll";
import { payrollTotals, recordPayrollPayment } from "@/lib/manage/payroll";
import { formatRp, route } from "@/lib/utils";
import {
	type PayrollPaymentValues,
	payrollPaymentSchema,
} from "@/schema/manage/payroll";
import type { PayrollRecord } from "@/types/ui/manage/payroll";
import {
	PayrollField,
	PayrollHero,
	PayrollPreviewNotice,
	PayrollSelectField,
} from "./PayrollCommon";

export default function PayrollPaymentForm({
	record,
}: {
	record: PayrollRecord;
}) {
	const [success, setSuccess] = React.useState(false);
	const [savedId, setSavedId] = React.useState<string>();
	const form = useForm<PayrollPaymentValues>({
		resolver: zodResolver(payrollPaymentSchema),
		defaultValues: {
			kind: "full",
			amount: payrollTotals(record).remaining,
			...record.adjustments,
			method: "cash",
			source: "",
			destination: "",
			date: "",
			reference: "",
			note: "",
		},
	});
	const values = useWatch({ control: form.control });
	const totals = payrollTotals(record, {
		bonus: values.bonus ?? 0,
		deduction: values.deduction ?? 0,
		advance: values.advance ?? 0,
	});
	React.useEffect(() => {
		if (values.kind === "full" && !savedId)
			form.setValue("amount", Math.max(0, totals.remaining));
	}, [form, savedId, values.kind, totals.remaining]);
	const locked = record.payments.length > 0;
	const submit = (data: PayrollPaymentValues) => {
		form.clearErrors("root");
		const result = recordPayrollPayment(record.id, data, savedId);
		if ("error" in result) form.setError("root", { message: result.error });
		else {
			setSavedId(result.id);
			setSuccess(true);
		}
	};
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<PayrollPreviewNotice />
				<PayrollHero record={record} />
				<Card className="gap-4">
					<Form {...form}>
						<PayrollSelectField
							name="kind"
							label="Jenis Pembayaran"
							disabled={!!savedId}
							items={[
								{ value: "full", label: "Bayar Penuh" },
								{ value: "partial", label: "Bayar Sebagian" },
							]}
						/>
						<PayrollField
							name="bonus"
							label="Bonus"
							number
							readOnly={locked || !!savedId}
						/>
						<PayrollField
							name="deduction"
							label="Potongan"
							number
							readOnly={locked || !!savedId}
						/>
						<PayrollField
							name="advance"
							label="Kasbon"
							number
							readOnly={locked || !!savedId}
						/>
						{locked && (
							<Text size="small" className="text-muted">
								Penyesuaian dikunci setelah pembayaran pertama.
							</Text>
						)}
						<Text size="normal" w="medium">
							Sisa Pembayaran: {formatRp(Math.max(0, totals.remaining))}
						</Text>
						<PayrollField
							name="amount"
							label="Nominal Dibayar"
							number
							readOnly={values.kind === "full" || !!savedId}
						/>
						<PayrollSelectField
							name="method"
							label="Metode Pembayaran"
							disabled={!!savedId}
							items={PAYROLL_PAYMENT_METHODS}
						/>
						<PayrollField
							name="source"
							label={
								values.method === "transfer" ? "Rekening Asal" : "Kas Asal"
							}
							readOnly={!!savedId}
						/>
						{values.method === "transfer" && (
							<PayrollField
								name="destination"
								label="Rekening Tujuan"
								readOnly={!!savedId}
							/>
						)}
						<PayrollField
							name="date"
							label="Tanggal Pembayaran"
							maxLength={10}
							readOnly={!!savedId}
						/>
						<Text size="small" className="text-muted">
							Format YYYY-MM-DD.
						</Text>
						<PayrollField
							name="reference"
							label="No. Referensi"
							readOnly={!!savedId}
						/>
						<PayrollField
							name="note"
							label="Catatan"
							multiline
							maxLength={1000}
							readOnly={!!savedId}
						/>
						{!!form.formState.errors.root?.message && (
							<Text size="small" className="!text-destructive">
								{form.formState.errors.root.message}
							</Text>
						)}
					</Form>
				</Card>
				<Card density="compact" className="gap-2">
					<Text size="small" className="text-muted">
						Total Pembayaran
					</Text>
					<Text size="body" w="bold">
						{formatRp(values.amount ?? 0)}
					</Text>
					<Text size="small" className="text-muted">
						Mencatat pembayaran pada pratinjau, tanpa transfer bank atau
						perubahan saldo nyata.
					</Text>
				</Card>
			</Wrapper>
			<BottomActionButton
				onPress={
					savedId
						? () =>
								router.push(route("/manage/payroll/slip", { id: record.id }))
						: form.handleSubmit(submit)
				}
			>
				{savedId ? "Lihat Slip Gaji" : "Catat Pembayaran"}
			</BottomActionButton>
			<SuccessModal
				isOpen={success}
				onClose={() => setSuccess(false)}
				title="Pembayaran Dicatat"
				description="Riwayat, sisa, dan status pratinjau telah diperbarui. Tidak ada uang yang dikirim."
				buttonText="Mengerti"
			/>
		</>
	);
}
