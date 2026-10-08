import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import BottomActionButton from "@/components/common/BottomActionButton";
import Card from "@/components/common/Card";
import { Form } from "@/components/common/Form";
import SuccessModal from "@/components/common/SuccessModal";
import Text from "@/components/common/Text";
import Wrapper from "@/components/common/Wrapper";
import {
	PAYROLL_METHODS,
	PAYROLL_SERVICES,
} from "@/constants/data/manage/payroll";
import { payrollTotals, savePayrollSettings } from "@/lib/manage/payroll";
import { formatRp } from "@/lib/utils";
import {
	payrollMoneySchema,
	payrollSettingsSchema,
} from "@/schema/manage/payroll";
import type { PayrollRecord, PayrollSettings } from "@/types/ui/manage/payroll";
import { PayrollField, PayrollHero, PayrollSelectField } from "./PayrollCommon";

export default function PayrollSettingsForm({
	record,
}: {
	record: PayrollRecord;
}) {
	const [success, setSuccess] = React.useState(false);
	const form = useForm<PayrollSettings>({
		resolver: zodResolver(payrollSettingsSchema),
		defaultValues: record.settings,
	});
	const values = useWatch({ control: form.control });
	const method = values.method ?? record.settings.method;
	const previousMethod = React.useRef(method);
	React.useEffect(() => {
		if (previousMethod.current === method) return;
		previousMethod.current = method;
		form.clearErrors();
		if (method !== "monthly") {
			for (const name of [
				"baseSalary",
				"allowance",
				"meal",
				"transport",
			] as const) {
				if (!payrollMoneySchema.safeParse(form.getValues(name)).success)
					form.setValue(name, record.settings[name]);
			}
		}
		if (
			method !== "service" &&
			form
				.getValues("commissions")
				.some((item) => !payrollMoneySchema.safeParse(item.rate).success)
		)
			form.setValue("commissions", record.settings.commissions);
		if (method === "daily" || method === "hourly") form.setValue("rate", 0);
		else if (!payrollMoneySchema.safeParse(form.getValues("rate")).success)
			form.setValue("rate", record.settings.rate);
	}, [form, method, record.settings]);
	const estimate = payrollTotals(record, record.adjustments, {
		...record.settings,
		...values,
		commissions: (values.commissions ?? record.settings.commissions).map(
			(item) => ({ serviceId: item.serviceId ?? "", rate: item.rate ?? 0 }),
		),
	});
	const submit = (data: PayrollSettings) => {
		form.clearErrors("root");
		const result = savePayrollSettings(record.id, data);
		if ("error" in result) form.setError("root", { message: result.error });
		else setSuccess(true);
	};
	return (
		<>
			<Wrapper hasActionButton contentContainerStyle={{ padding: 16, gap: 16 }}>
				<PayrollHero record={record} />
				<Card className="gap-4">
					<Text size="small" className="text-muted">
						Pilih cara penggajian. Field dan perhitungan mengikuti metode yang
						dipilih.
					</Text>
					<Form {...form}>
						<PayrollSelectField
							name="method"
							label="Metode Penggajian"
							items={[...PAYROLL_METHODS]}
						/>
						<PayrollField
							name="startDate"
							label="Dimulai Dari"
							maxLength={10}
						/>
						<Text size="small" className="text-muted">
							Format YYYY-MM-DD. Periode ini belum menghitung prorata.
						</Text>
						{method === "monthly" ? (
							<>
								<PayrollField
									name="baseSalary"
									label="Gaji Pokok (Bulanan)"
									number
								/>
								<PayrollField name="allowance" label="Tunjangan Tetap" number />
								<PayrollField name="meal" label="Uang Makan Tetap" number />
								<PayrollField
									name="transport"
									label="Uang Transport Tetap"
									number
								/>
							</>
						) : method === "service" ? (
							<>
								{PAYROLL_SERVICES.map((service, index) => (
									<PayrollField
										key={service.id}
										name={`commissions.${index}.rate`}
										label={`Komisi ${service.name}`}
										number
									/>
								))}
								{!!form.formState.errors.commissions?.message && (
									<Text size="small" className="!text-destructive">
										{form.formState.errors.commissions.message}
									</Text>
								)}
							</>
						) : (
							<PayrollField
								name="rate"
								label={method === "daily" ? "Tarif Harian" : "Tarif Per Jam"}
								number
							/>
						)}
						<PayrollField
							name="note"
							label="Catatan"
							multiline
							maxLength={1000}
						/>
						{!!form.formState.errors.root?.message && (
							<Text size="small" className="!text-destructive">
								{form.formState.errors.root.message}
							</Text>
						)}
					</Form>
				</Card>
				<Card density="compact" className="gap-2">
					<Text size="normal" w="medium">
						Perhitungan Gaji
					</Text>
					<Text size="small" className="text-muted">
						{method === "daily"
							? `${record.activity.days} hari kerja contoh`
							: method === "hourly"
								? `${record.activity.hours} jam kerja contoh`
								: method === "service"
									? "Komisi × jumlah layanan contoh"
									: "Gaji pokok + tunjangan, makan, dan transport"}
					</Text>
					<Text size="body" w="bold">
						{formatRp(estimate.gross)}
					</Text>
					<Text size="small" className="text-muted">
						Aktivitas pratinjau belum terhubung dengan absensi atau transaksi.
					</Text>
				</Card>
			</Wrapper>
			<BottomActionButton onPress={form.handleSubmit(submit)}>
				Simpan Pengaturan Gaji
			</BottomActionButton>
			<SuccessModal
				isOpen={success}
				onClose={() => setSuccess(false)}
				title="Pengaturan Gaji Disimpan"
				description="Pengaturan dan rincian pratinjau periode ini telah diperbarui."
				buttonText="Mengerti"
			/>
		</>
	);
}
